import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TopBar } from "@/components/game/TopBar";
import { Hand } from "@/components/game/Hand";
import { TablePairs } from "@/components/game/TablePairs";
import { aiPick, createGame, playTurn, type GameState } from "@/game/mico";
import { getPrefs, recordResult } from "@/lib/storage";
import { sfx } from "@/lib/sound";
import { Trophy, Frown, RefreshCw, Users } from "lucide-react";

export const Route = createFileRoute("/jogar/ia")({
  head: () => ({
    meta: [
      { title: "Banana vs IA — Partida" },
      {
        name: "description",
        content: "Jogue Banana contra a inteligência artificial. Escolha manualmente qual carta puxar.",
      },
    ],
  }),
  component: PartidaIA,
});

function PartidaIA() {
  const [numOpponents, setNumOpponents] = useState(1);
  const [state, setState] = useState<GameState | null>(null);
  const [recorded, setRecorded] = useState(false);
  const [shufflingTargetId, setShufflingTargetId] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shuffleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startGame = useCallback(
    (opponents = numOpponents) => {
      const name = getPrefs().name || "Você";
      const pool = ["Zé", "Kiko", "Tuti", "Pipo", "Léo", "Bibi", "Bento", "Nina", "Duda", "Tato", "Cacá", "Nino"];
      const shuffled = pool.slice().sort(() => Math.random() - 0.5);
      const players = [{ id: "human", name, isBot: false }];
      for (let i = 1; i <= opponents; i++) {
        players.push({ id: `bot${i}`, name: shuffled[i - 1] ?? `Amigo ${i}`, isBot: true });
      }
      const g = createGame(players);
      setState(g);
      setRecorded(false);
      sfx.deal();
    },
    [numOpponents],
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (shuffleTimeoutRef.current) clearTimeout(shuffleTimeoutRef.current);
    };
  }, []);

  // Embaralha visualmente a mão do alvo humano quando ela contém o Mico (Banana)
  useEffect(() => {
    if (!state || state.status !== "playing") return;
    const cur = state.players[state.turnIndex];
    if (cur.id !== "human") return;
    const target = state.players[state.targetIndex];
    const hasMico = target.hand.some((c) => c.isMico);
    if (!hasMico) return;
    setShufflingTargetId(target.id);
    if (shuffleTimeoutRef.current) clearTimeout(shuffleTimeoutRef.current);
    shuffleTimeoutRef.current = setTimeout(() => setShufflingTargetId(null), 950);
    return () => {
      if (shuffleTimeoutRef.current) clearTimeout(shuffleTimeoutRef.current);
    };
  }, [state]);

  // Turno da IA: agenda automaticamente
  useEffect(() => {
    if (!state || state.status !== "playing") return;
    const cur = state.players[state.turnIndex];
    if (!cur.isBot) return;
    timeoutRef.current = setTimeout(() => {
      const idx = aiPick(state);
      const next = playTurn(state, idx);
      if (next.lastEvent?.kind === "draw" && next.lastEvent.formedPair) sfx.pair();
      else sfx.pick();
      setState(next);
    }, 900);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [state]);

  // Ao terminar, salvar estatística
  useEffect(() => {
    if (!state || state.status !== "finished" || recorded) return;
    const won = state.loserId !== "human";
    recordResult(won);
    if (won) sfx.win();
    else sfx.lose();
    setRecorded(true);
  }, [state, recorded]);

  if (!state) {
    return <StartScreen numOpponents={numOpponents} setNumOpponents={setNumOpponents} onStart={() => startGame()} />;
  }

  const human = state.players[0];
  const isHumanTurn = state.status === "playing" && state.players[state.turnIndex].id === "human";
  const target = state.players[state.targetIndex];
  const opponents = state.players.slice(1);

  function onPickCard(index: number) {
    if (!isHumanTurn || !state) return;
    const next = playTurn(state, index);
    if (next.lastEvent?.kind === "draw" && next.lastEvent.formedPair) sfx.pair();
    else sfx.pick();
    setState(next);
  }

  return (
    <div className="min-h-screen felt-bg flex flex-col">
      <TopBar title="Vs IA" showBack />
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-4 pb-6 flex flex-col gap-4">
        {/* Adversários */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {opponents.map((op) => {
            const isTarget = isHumanTurn && op.id === target.id;
            return (
              <div
                key={op.id}
                className={`rounded-xl p-3 border transition ${
                  isTarget
                    ? "border-[var(--color-gold)] gold-glow bg-[var(--color-felt-deep)]/80"
                    : "border-[var(--color-gold)]/20 bg-[var(--color-felt-deep)]/50"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm truncate">
                    {op.name}
                    {op.finished && " 👑"}
                  </span>
                  <span className="text-xs text-[var(--color-muted-foreground)]">
                    {op.hand.length} {op.hand.length === 1 ? "carta" : "cartas"}
                  </span>
                </div>
                {isTarget ? (
                  <>
                    <div className="text-[10px] uppercase tracking-widest text-[var(--color-gold)] mb-1">
                      {shufflingTargetId === op.id ? "Embaralhando…" : "Toque em uma carta para puxar"}
                    </div>
                    <Hand
                      cards={op.hand}
                      faceDown
                      selectable
                      onPick={onPickCard}
                      shuffling={shufflingTargetId === op.id}
                    />
                  </>
                ) : (
                  <Hand cards={op.hand} faceDown />
                )}
              </div>
            );
          })}
        </section>

        {/* Mesa: pares de todos */}
        <section>
          <h2 className="text-xs uppercase tracking-widest text-[var(--color-muted-foreground)] mb-2 text-center">
            Mesa · pares descartados
          </h2>
          <TablePairs players={state.players} />
        </section>

        {/* Aviso do turno */}
        <TurnBanner state={state} />

        {/* Mão do jogador */}
        <section className="rounded-2xl bg-[var(--color-felt-deep)]/70 border border-[var(--color-gold)]/25 p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">{human.name}</span>
            <span className="text-xs text-[var(--color-muted-foreground)]">
              {human.hand.length} {human.hand.length === 1 ? "carta" : "cartas"}
            </span>
          </div>
          <Hand cards={human.hand} />
        </section>
      </main>

      <AnimatePresence>
        {state.status === "finished" && <EndModal state={state} onRestart={() => startGame()} />}
      </AnimatePresence>
    </div>
  );
}

function TurnBanner({ state }: { state: GameState }) {
  if (state.status !== "playing") return null;
  const cur = state.players[state.turnIndex];
  const isHuman = cur.id === "human";
  return (
    <motion.div
      key={cur.id + state.players[state.targetIndex].id}
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center text-sm text-[var(--color-gold)] font-semibold"
    >
      {isHuman
        ? `Sua vez — puxe uma carta de ${state.players[state.targetIndex].name}`
        : `${cur.name} está jogando…`}
    </motion.div>
  );
}

function EndModal({ state, onRestart }: { state: GameState; onRestart: () => void }) {
  const won = state.loserId !== "human";
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.85, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="max-w-md w-full rounded-2xl bg-[var(--color-felt-deep)] border border-[var(--color-gold)]/50 p-6 text-center"
      >
        <div className="text-6xl mb-2">{won ? "🏆" : "🍌"}</div>
        <h2 className="font-display text-3xl gold-text mb-1">
          {won ? "Você venceu!" : "Você pegou a Banana!"}
        </h2>
        <p className="text-sm text-[var(--color-muted-foreground)] mb-4">
          {won ? (
            <>
              <Trophy className="inline size-4 mr-1" />
              Terminou sem a Banana. Boa jogada!
            </>
          ) : (
            <>
              <Frown className="inline size-4 mr-1" />
              Ficou com a carta sem par. Tente de novo!
            </>
          )}
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={onRestart}
            className="rounded-full bg-[var(--color-gold)] text-[var(--color-primary-foreground)] font-bold px-5 py-2 inline-flex items-center gap-2"
          >
            <RefreshCw className="size-4" /> Nova partida
          </button>
          <Link
            to="/"
            className="rounded-full border border-[var(--color-gold)]/50 px-5 py-2 font-medium"
          >
            Menu
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}

function StartScreen({
  numOpponents,
  setNumOpponents,
  onStart,
}: {
  numOpponents: number;
  setNumOpponents: (n: number) => void;
  onStart: () => void;
}) {
  const options = useMemo(() => [1, 2, 3], []);
  return (
    <div className="min-h-screen felt-bg">
      <TopBar title="Vs IA" showBack />
      <main className="max-w-md mx-auto px-4 py-10 text-center">
        <div className="text-6xl mb-2">🍌</div>
        <h1 className="font-display text-3xl gold-text mb-2">Partida contra a IA</h1>
        <p className="text-sm text-[var(--color-muted-foreground)] mb-6">
          Escolha quantos oponentes você quer enfrentar.
        </p>
        <div className="flex justify-center gap-2 mb-6">
          {options.map((n) => (
            <button
              key={n}
              onClick={() => setNumOpponents(n)}
              className={`rounded-full px-5 py-2 border transition inline-flex items-center gap-2 ${
                numOpponents === n
                  ? "border-[var(--color-gold)] bg-[var(--color-gold)]/20 gold-text font-bold"
                  : "border-[var(--color-gold)]/30 hover:border-[var(--color-gold)]/60"
              }`}
            >
              <Users className="size-4" />
              {n}
            </button>
          ))}
        </div>
        <button
          onClick={onStart}
          className="rounded-full bg-[var(--color-gold)] text-[var(--color-primary-foreground)] font-bold px-6 py-3 hover:brightness-110 transition"
        >
          Começar partida
        </button>
      </main>
    </div>
  );
}
