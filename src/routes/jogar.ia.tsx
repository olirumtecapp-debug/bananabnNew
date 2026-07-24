import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TopBar } from "@/components/game/TopBar";
import { Hand } from "@/components/game/Hand";
import { TablePairs } from "@/components/game/TablePairs";
import { aiPick, createGame, playTurn, type GameState } from "@/game/mico";
import { getPrefs, recordResult } from "@/lib/storage";
import { sfx } from "@/lib/sound";
import { RefreshCw, Users, Shuffle } from "lucide-react";

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

  useEffect(() => {
    if (!state || state.status !== "playing") return;
    const cur = state.players[state.turnIndex];
    if (cur.id !== "human") return;
    const target = state.players[state.targetIndex];
    const hasMico = target.hand.some((c) => c.isMico);
    if (!hasMico) return;
    setShufflingTargetId(target.id);
    if (shuffleTimeoutRef.current) clearTimeout(shuffleTimeoutRef.current);
    shuffleTimeoutRef.current = setTimeout(() => setShufflingTargetId(null), 1650);
    return () => {
      if (shuffleTimeoutRef.current) clearTimeout(shuffleTimeoutRef.current);
    };
  }, [state]);

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
      <TopBar title="VS IA" showBack />
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-4 pb-6 flex flex-col gap-4">
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {opponents.map((op) => {
            const isTarget = isHumanTurn && op.id === target.id;
            return (
              <div
                key={op.id}
                className={`hq-panel-sm p-3 transition ${isTarget ? "gold-glow" : ""}`}
                style={isTarget ? { background: "var(--hq-primary)" } : undefined}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="truncate text-sm"
                    style={{ fontFamily: "var(--font-display)", color: "var(--ink)", letterSpacing: "0.04em" }}
                  >
                    {op.name}
                    {op.finished && " 👑"}
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: "var(--ink)", fontFamily: "Comic Neue, sans-serif", fontWeight: 700 }}
                  >
                    {op.hand.length} {op.hand.length === 1 ? "carta" : "cartas"}
                  </span>
                </div>
                {isTarget ? (
                  <>
                    <div
                      className="mb-2 inline-flex items-center gap-1 px-2 py-0.5 text-[10px]"
                      style={{
                        background: "var(--hq-secondary)",
                        color: "#fff",
                        border: "2px solid var(--ink)",
                        boxShadow: "2px 2px 0 var(--ink)",
                        fontFamily: "var(--font-display)",
                        letterSpacing: "0.06em",
                      }}
                    >
                      {shufflingTargetId === op.id ? (
                        <>
                          <Shuffle className="size-3 animate-spin" />
                          SHUFFLE!
                        </>
                      ) : (
                        "PICK!"
                      )}
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

        <section>
          <h2
            className="text-xs mb-2 text-center"
            style={{
              fontFamily: "var(--font-display)",
              letterSpacing: "0.08em",
              color: "var(--ink)",
            }}
          >
            MESA · PARES DESCARTADOS
          </h2>
          <TablePairs players={state.players} />
        </section>

        <TurnBanner state={state} />

        <section className="hq-panel p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2">
            <span
              style={{ fontFamily: "var(--font-display)", color: "var(--ink)", letterSpacing: "0.04em" }}
              className="text-lg"
            >
              {human.name}
            </span>
            <span
              className="text-xs"
              style={{ color: "var(--ink)", fontFamily: "Comic Neue, sans-serif", fontWeight: 700 }}
            >
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
  const message = isHuman
    ? `Sua vez — puxe uma carta de ${state.players[state.targetIndex].name}!`
    : `${cur.name} está jogando…`;
  return (
    <motion.div
      key={cur.id + state.players[state.targetIndex].id}
      initial={{ opacity: 0, y: -6, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="flex justify-center"
    >
      <div className="speech-bubble text-sm sm:text-base max-w-md text-center">
        {message}
      </div>
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
        initial={{ scale: 0.5, rotate: -8, y: 20 }}
        animate={{ scale: 1, rotate: 0, y: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 15 }}
        className="hq-panel max-w-md w-full p-6 text-center relative"
      >
        <div
          className="text-7xl mb-2 inline-block"
          style={{ filter: "drop-shadow(4px 4px 0 var(--ink))" }}
        >
          {won ? "🏆" : "🍌"}
        </div>
        <h2 className="hq-title text-4xl mb-2">
          {won ? "VOCÊ VENCEU!" : "OH NO!"}
        </h2>
        <p
          className="mb-4 text-sm"
          style={{ color: "var(--ink)", fontFamily: "Comic Neue, sans-serif", fontWeight: 700 }}
        >
          {won
            ? "Terminou sem a Banana. Boa jogada!"
            : "Ficou com a Banana. Tente de novo!"}
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={onRestart}
            className="hq-btn hq-btn-primary text-white px-5 py-2 inline-flex items-center gap-2"
          >
            <RefreshCw className="size-4" /> NOVA PARTIDA
          </button>
          <Link to="/" className="hq-btn px-5 py-2 inline-flex items-center">
            MENU
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
      <TopBar title="VS IA" showBack />
      <main className="max-w-md mx-auto px-4 py-10 text-center">
        <div
          className="text-6xl mb-2 inline-block"
          style={{ filter: "drop-shadow(3px 3px 0 var(--ink))" }}
        >
          🍌
        </div>
        <h1 className="hq-title text-4xl mb-2">VS IA</h1>
        <p
          className="mb-6"
          style={{ color: "var(--ink)", fontFamily: "Comic Neue, sans-serif", fontWeight: 700 }}
        >
          Escolha quantos oponentes você quer enfrentar!
        </p>
        <div className="flex justify-center gap-3 mb-8">
          {options.map((n) => (
            <button
              key={n}
              onClick={() => setNumOpponents(n)}
              className="hq-btn px-5 py-2 inline-flex items-center gap-2"
              style={
                numOpponents === n
                  ? { background: "var(--hq-secondary)", color: "#fff" }
                  : undefined
              }
            >
              <Users className="size-4" />
              {n}
            </button>
          ))}
        </div>
        <button onClick={onStart} className="hq-btn hq-btn-primary text-white px-6 py-3 text-lg">
          COMEÇAR!
        </button>
      </main>
    </div>
  );
}
