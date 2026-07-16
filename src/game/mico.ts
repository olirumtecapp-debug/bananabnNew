/**
 * Motor puro do jogo Mico (Old Maid).
 * Funções sem efeitos colaterais — usado tanto no modo IA quanto no multiplayer.
 *
 * Regras:
 *  - Baralho de 52 cartas menos um Valete (fica 1 carta sem par = o "Mico").
 *  - Distribuição igualitária entre os jogadores.
 *  - Cada jogador descarta automaticamente os pares que já tem em mãos.
 *  - Na sua vez, o jogador puxa 1 carta (sem ver) do jogador à sua esquerda.
 *  - Se formar par com uma carta que já tinha, descarta o par na mesa.
 *  - Quem terminar sem cartas sai do jogo (venceu). O último com o Mico perde.
 */

export type Suit = "♠" | "♥" | "♦" | "♣";
export type Rank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";

export interface Card {
  id: string;         // ex: "H-7", "S-K", "MICO"
  rank: Rank | "MICO";
  suit: Suit | null;  // null para o Mico
  isMico: boolean;
}

export interface Player {
  id: string;
  name: string;
  isBot: boolean;
  hand: Card[];       // cartas na mão (viradas para baixo p/ adversários)
  pairs: Card[][];    // pares já descartados na mesa
  finished: boolean;  // saiu do jogo sem o Mico (venceu)
}

export interface GameState {
  players: Player[];
  turnIndex: number;   // quem joga agora (índice em players)
  targetIndex: number; // de quem ele vai puxar (à esquerda do turn)
  status: "playing" | "finished";
  loserId: string | null;    // quem ficou com o Mico
  winnersOrder: string[];    // ids na ordem em que zeraram a mão
  lastEvent: GameEvent | null;
}

export type GameEvent =
  | { kind: "deal" }
  | { kind: "auto-pair"; playerId: string; cards: [Card, Card] }
  | { kind: "draw"; fromId: string; toId: string; card: Card; formedPair: [Card, Card] | null }
  | { kind: "finish"; playerId: string }
  | { kind: "game-over"; loserId: string };

const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
const RANKS: Rank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Q", "K"]; // J excluído; sobra 1 J = Mico

/** Baralho de Mico: 52 cartas - 3 Valetes (removemos J♠, J♥, J♦), sobra J♣ = Mico. */
export function buildDeck(): Card[] {
  const deck: Card[] = [];
  for (const rank of RANKS) {
    for (const suit of SUITS) {
      deck.push({ id: `${suit}-${rank}`, rank, suit, isMico: false });
    }
  }
  // O Mico
  deck.push({ id: "MICO", rank: "MICO", suit: null, isMico: true });
  return deck;
}

/** Fisher–Yates com RNG opcional (para replays determinísticos se preciso). */
export function shuffle<T>(arr: T[], rng: () => number = Math.random): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Cria um estado inicial. Distribui as cartas e descarta os pares iniciais. */
export function createGame(playerSpecs: { id: string; name: string; isBot: boolean }[]): GameState {
  const deck = shuffle(buildDeck());
  const players: Player[] = playerSpecs.map((p) => ({
    id: p.id,
    name: p.name,
    isBot: p.isBot,
    hand: [],
    pairs: [],
    finished: false,
  }));

  // Distribui uma a uma
  for (let i = 0; i < deck.length; i++) {
    players[i % players.length].hand.push(deck[i]);
  }

  // Descarte automático dos pares iniciais
  for (const p of players) {
    const { hand, pairs } = extractPairs(p.hand);
    p.hand = hand;
    p.pairs.push(...pairs);
  }

  const state: GameState = {
    players,
    turnIndex: 0,
    targetIndex: 1 % players.length,
    status: "playing",
    loserId: null,
    winnersOrder: [],
    lastEvent: { kind: "deal" },
  };

  // Se algum jogador já zerou (raro mas possível), avança
  checkFinished(state);
  advanceTurnIfNeeded(state);
  return state;
}

/** Extrai pares de uma mão baseando-se apenas no `rank`. Devolve mão restante + pares. */
export function extractPairs(hand: Card[]): { hand: Card[]; pairs: Card[][] } {
  const byRank = new Map<string, Card[]>();
  for (const c of hand) {
    const k = c.rank;
    if (!byRank.has(k)) byRank.set(k, []);
    byRank.get(k)!.push(c);
  }
  const pairs: Card[][] = [];
  const remaining: Card[] = [];
  for (const [, cards] of byRank) {
    while (cards.length >= 2) {
      pairs.push([cards.shift()!, cards.shift()!]);
    }
    remaining.push(...cards);
  }
  return { hand: remaining, pairs };
}

/** Executa uma jogada: o jogador atual puxa a carta no índice `cardIndex` da mão do alvo. */
export function playTurn(state: GameState, cardIndex: number): GameState {
  if (state.status !== "playing") return state;
  const next: GameState = structuredClone(state);
  const turn = next.players[next.turnIndex];
  const target = next.players[next.targetIndex];

  if (!target.hand.length) return state; // nada a fazer
  const safeIndex = Math.max(0, Math.min(cardIndex, target.hand.length - 1));
  const [taken] = target.hand.splice(safeIndex, 1);
  turn.hand.push(taken);

  // Descarta par (se formou)
  const { hand, pairs } = extractPairs(turn.hand);
  const formedPair = pairs.length > 0 ? (pairs[pairs.length - 1] as [Card, Card]) : null;
  turn.hand = hand;
  turn.pairs.push(...pairs);

  next.lastEvent = {
    kind: "draw",
    fromId: target.id,
    toId: turn.id,
    card: taken,
    formedPair,
  };

  checkFinished(next);
  if (next.status === "playing") {
    advanceTurn(next);
    advanceTurnIfNeeded(next);
  }
  return next;
}

/** Marca jogadores que zeraram como finalizados; se sobra 1 (com o Mico), fim de jogo. */
function checkFinished(state: GameState) {
  for (const p of state.players) {
    if (!p.finished && p.hand.length === 0) {
      p.finished = true;
      state.winnersOrder.push(p.id);
    }
  }
  const remaining = state.players.filter((p) => !p.finished);
  if (remaining.length <= 1) {
    state.status = "finished";
    state.loserId = remaining[0]?.id ?? null;
    state.lastEvent = { kind: "game-over", loserId: state.loserId ?? "" };
  }
}

/** Avança turno para o próximo jogador ativo e recalcula alvo (próximo ativo depois dele). */
function advanceTurn(state: GameState) {
  const n = state.players.length;
  let i = state.turnIndex;
  for (let k = 0; k < n; k++) {
    i = (i + 1) % n;
    if (!state.players[i].finished) {
      state.turnIndex = i;
      break;
    }
  }
  recomputeTarget(state);
}

/** Se o alvo atual acabou ou é o próprio jogador da vez, ajusta. */
function advanceTurnIfNeeded(state: GameState) {
  if (state.status !== "playing") return;
  if (state.players[state.turnIndex].finished) advanceTurn(state);
  recomputeTarget(state);
}

function recomputeTarget(state: GameState) {
  const n = state.players.length;
  let i = state.turnIndex;
  for (let k = 0; k < n; k++) {
    i = (i + 1) % n;
    if (!state.players[i].finished && i !== state.turnIndex) {
      state.targetIndex = i;
      return;
    }
  }
  state.targetIndex = state.turnIndex;
}

/** Escolha da IA: aleatória (o Mico se camufla naturalmente). */
export function aiPick(state: GameState): number {
  const target = state.players[state.targetIndex];
  return Math.floor(Math.random() * Math.max(1, target.hand.length));
}

/** Rótulo bonito da carta em pt-BR (para a UI). */
export function cardLabel(card: Card): string {
  if (card.isMico) return "Mico";
  const map: Record<Rank, string> = {
    A: "Á", "2": "2", "3": "3", "4": "4", "5": "5", "6": "6",
    "7": "7", "8": "8", "9": "9", "10": "10", J: "J", Q: "D", K: "R",
  };
  return map[card.rank as Rank];
}

export function isRedSuit(suit: Suit | null): boolean {
  return suit === "♥" || suit === "♦";
}
