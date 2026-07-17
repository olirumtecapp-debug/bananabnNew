/**
 * Motor puro do jogo Mico (versão tradicional infantil).
 * Funções sem efeitos colaterais — usado tanto no modo IA quanto no multiplayer.
 *
 * Regras:
 *  - Baralho de 13 animais em pares (26 cartas) menos uma carta = 25 no total.
 *    Sobra 1 carta sem par: o "Mico" (macaquinho solitário).
 *  - Distribuição igualitária entre os jogadores (o resto fica com o primeiro).
 *  - Cada jogador descarta automaticamente os pares que já tem em mãos.
 *  - Na sua vez, o jogador puxa 1 carta (sem ver) do próximo jogador.
 *  - Se formar par, descarta o par na mesa.
 *  - Quem terminar sem cartas sai do jogo (venceu). Quem ficar com o Mico perde.
 */

export interface Animal {
  id: string;      // ex: "gato", "cachorro", "mico"
  name: string;    // rótulo em pt-BR
  emoji: string;   // ilustração
  color: string;   // cor de fundo da carta (var CSS)
}

export const ANIMALS: Animal[] = [
  { id: "gato",       name: "Gato",       emoji: "🐱", color: "var(--pastel-pink)" },
  { id: "cachorro",   name: "Cachorro",   emoji: "🐶", color: "var(--pastel-peach)" },
  { id: "coelho",     name: "Coelho",     emoji: "🐰", color: "var(--pastel-rose)" },
  { id: "urso",       name: "Urso",       emoji: "🐻", color: "var(--pastel-caramel)" },
  { id: "panda",      name: "Panda",      emoji: "🐼", color: "var(--pastel-cloud)" },
  { id: "raposa",     name: "Raposa",     emoji: "🦊", color: "var(--pastel-orange)" },
  { id: "leao",       name: "Leão",       emoji: "🦁", color: "var(--pastel-yellow)" },
  { id: "tigre",      name: "Tigre",      emoji: "🐯", color: "var(--pastel-tangerine)" },
  { id: "sapo",       name: "Sapo",       emoji: "🐸", color: "var(--pastel-lime)" },
  { id: "pinguim",    name: "Pinguim",    emoji: "🐧", color: "var(--pastel-sky)" },
  { id: "unicornio",  name: "Unicórnio",  emoji: "🦄", color: "var(--pastel-lavender)" },
  { id: "polvo",      name: "Polvo",      emoji: "🐙", color: "var(--pastel-berry)" },
  { id: "elefante",   name: "Elefante",   emoji: "🐘", color: "var(--pastel-mint)" },
];

export const MICO_ANIMAL: Animal = {
  id: "mico",
  name: "Mico",
  emoji: "🐒",
  color: "var(--pastel-banana)",
};

export interface Card {
  id: string;       // único: "gato-1", "gato-2", "mico"
  animalId: string; // usado para formar pares
  animal: Animal;
  isMico: boolean;
}

export interface Player {
  id: string;
  name: string;
  isBot: boolean;
  hand: Card[];
  pairs: Card[][];
  finished: boolean;
}

export interface GameState {
  players: Player[];
  turnIndex: number;
  targetIndex: number;
  status: "playing" | "finished";
  loserId: string | null;
  winnersOrder: string[];
  lastEvent: GameEvent | null;
}

export type GameEvent =
  | { kind: "deal" }
  | { kind: "auto-pair"; playerId: string; cards: [Card, Card] }
  | { kind: "draw"; fromId: string; toId: string; card: Card; formedPair: [Card, Card] | null }
  | { kind: "finish"; playerId: string }
  | { kind: "game-over"; loserId: string };

/** Baralho: 13 animais × 2 = 26 cartas, menos 1 par (fica 1 solo) + 1 Mico = 25 no total. */
export function buildDeck(): Card[] {
  const deck: Card[] = [];
  for (const a of ANIMALS) {
    deck.push({ id: `${a.id}-1`, animalId: a.id, animal: a, isMico: false });
    deck.push({ id: `${a.id}-2`, animalId: a.id, animal: a, isMico: false });
  }
  // O Mico entra como carta ímpar (sem par possível)
  deck.push({ id: "mico", animalId: "mico", animal: MICO_ANIMAL, isMico: true });
  return deck;
}

/** Fisher–Yates com RNG opcional. */
export function shuffle<T>(arr: T[], rng: () => number = Math.random): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

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

  for (let i = 0; i < deck.length; i++) {
    players[i % players.length].hand.push(deck[i]);
  }

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

  checkFinished(state);
  advanceTurnIfNeeded(state);
  return state;
}

/** Agrupa por animalId. O Mico nunca casa (é único). */
export function extractPairs(hand: Card[]): { hand: Card[]; pairs: Card[][] } {
  const byAnimal = new Map<string, Card[]>();
  for (const c of hand) {
    if (c.isMico) continue; // mico jamais forma par
    const k = c.animalId;
    if (!byAnimal.has(k)) byAnimal.set(k, []);
    byAnimal.get(k)!.push(c);
  }
  const pairs: Card[][] = [];
  const remaining: Card[] = hand.filter((c) => c.isMico);
  for (const [, cards] of byAnimal) {
    while (cards.length >= 2) {
      pairs.push([cards.shift()!, cards.shift()!]);
    }
    remaining.push(...cards);
  }
  return { hand: remaining, pairs };
}

export function playTurn(state: GameState, cardIndex: number): GameState {
  if (state.status !== "playing") return state;
  const next: GameState = structuredClone(state);
  const turn = next.players[next.turnIndex];
  const target = next.players[next.targetIndex];

  if (!target.hand.length) return state;
  const safeIndex = Math.max(0, Math.min(cardIndex, target.hand.length - 1));
  const [taken] = target.hand.splice(safeIndex, 1);
  turn.hand.push(taken);

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

export function aiPick(state: GameState): number {
  const target = state.players[state.targetIndex];
  return Math.floor(Math.random() * Math.max(1, target.hand.length));
}

export function cardLabel(card: Card): string {
  return card.animal.name;
}
