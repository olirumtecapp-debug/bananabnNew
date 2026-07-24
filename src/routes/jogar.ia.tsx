import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TopBar } from "@/components/game/TopBar";
import { Hand } from "@/components/game/Hand";
import { TablePairs } from "@/components/game/TablePairs";
import { PlayerSeat } from "@/components/game/PlayerSeat";
import { AvatarPicker } from "@/components/game/AvatarPicker";
import { aiPick, createGame, playTurn, type GameState } from "@/game/mico";
import { getPrefs, recordResult, setPrefs } from "@/lib/storage";
import { sfx } from "@/lib/sound";
import { AVATARES, getAvatar, pickBots, type Avatar } from "@/data/avatares";
import { chance, fala } from "@/data/dialogos";
import { RefreshCw, Users, Shuffle } from "lucide-react";

export const Route = createFileRoute("/jogar/ia")({
  head: () => ({
    meta: [
      { title: "Banana vs IA — Partida" },
      {
        name: "description",
        content: "Jogue Banana contra a inteligência artificial. Escolha seu personagem e provoque os oponentes.",
      },
    ],
  }),
  component: PartidaIA,
});

function PartidaIA() {
  const [numOpponents, setNumOpponents] = useState(1);
  const [avatarId, setAvatarId] = useState<string>(() => {
    if (typeof window === "undefined") return "vovo";
    return getPrefs().avatarId || "vovo";
  });
  const [state, setState] = useState<GameState | null>(null);
  const [recorded, setRecorded] = useState(false);
  const [shufflingTargetId, setShufflingTargetId] = useState<string | null>(null);
  const [botAvatars, setBotAvatars] = useState<Record<string, Avatar>>({});
  const [speeches, setSpeeches] = useState<Record<string, string>>({});
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shuffleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speechTimeouts = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const humanAvatar = getAvatar(avatarId);

  const say = useCallback((playerId: string, text: string | null) => {
    if (!text) return;
    setSpeeches((prev) => ({ ...prev, [playerId]: text }));
    if (speechTimeouts.current[playerId]) clearTimeout(speechTimeouts.current[playerId]);
    speechTimeouts.current[playerId] = setTimeout(() => {
      setSpeeches((prev) => {
        const next = { ...prev };
        delete next[playerId];
        return next;
      });
    }, 2600);
  }, []);

  const startGame = useCallback(
    (opponents = numOpponents) => {
      const prefs = getPrefs();
      const name = prefs.name || "Você";
      const bots = pickBots(avatarId, opponents);
      const avMap: Record<string, Avatar> = { human: humanAvatar };
      const players = [{ id: "human", name, isBot: false }];
      bots.forEach((b, i) => {
        const pid = `bot${i + 1}`;
        players.push({ id: pid, name: b.nome, isBot: true });
        avMap[pid] = b;
      });
      setBotAvatars(avMap);
      const g = createGame(players);
      setState(g);
      setRecorded(false);
      setSpeeches({});
      sfx.deal();
      // Falas de abertura
      setTimeout(() => {
        bots.forEach((b, i) => {
          if (chance(0.6)) {
            setTimeout(() => say(`bot${i + 1}`, fala("inicio", b.personalidade)), i * 400);
          }
        });
      }, 600);
    },
    [numOpponents, avatarId, humanAvatar, say],
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (shuffleTimeoutRef.current) clearTimeout(shuffleTimeoutRef.current);
      Object.values(speechTimeouts.current).forEach(clearTimeout);
    };
  }, []);

  // Shuffle quando humano vai puxar de alvo com Banana
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
    // provocação do alvo
    const av = botAvatars[target.id];
    if (av && chance(0.55)) say(target.id, fala("vaoMePuxar", av.personalidade));
    return () => {
      if (shuffleTimeoutRef.current) clearTimeout(shuffleTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.turnIndex, state?.targetIndex, state?.status]);

  // Turno da IA
  useEffect(() => {
    if (!state || state.status !== "playing") return;
    const cur = state.players[state.turnIndex];
    if (!cur.isBot) return;
    // fala "minha vez"
    const av = botAvatars[cur.id];
    if (av && chance(0.35)) say(cur.id, fala("meuTurno", av.personalidade));
    timeoutRef.current = setTimeout(() => {
      const idx = aiPick(state);
      const next = playTurn(state, idx);
      if (next.lastEvent?.kind === "draw" && next.lastEvent.formedPair) sfx.pair();
      else sfx.pick();
      // reações pós-jogada
      if (next.lastEvent?.kind === "draw") {
        const { fromId, toId, card, formedPair } = next.lastEvent;
        const bAv = botAvatars[toId];
        if (formedPair && bAv && chance(0.5)) say(toId, fala("formeiPar", bAv.personalidade));
        if (card.isMico && !formedPair) {
          const fromAv = botAvatars[fromId];
          if (fromAv && chance(0.7)) say(fromId, fala("passei_mico", fromAv.personalidade));
        }
      }
      setState(next);
    }, 900);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.turnIndex, state?.status]);

  useEffect(() => {
    if (!state || state.status !== "finished" || recorded) return;
    const won = state.loserId !== "human";
    recordResult(won);
    if (won) sfx.win();
    else sfx.lose();
    // fala final do bot vencedor/perdedor
    if (state.loserId && state.loserId !== "human") {
      const av = botAvatars[state.loserId];
      if (av) say(state.loserId, fala("peguei_mico", av.personalidade));
    }
    const winnerBotId = Object.keys(botAvatars).find((id) => id !== "human" && id !== state.loserId);
    if (winnerBotId && !won) {
      const av = botAvatars[winnerBotId];
      if (av) setTimeout(() => say(winnerBotId, fala("vitoria_bot", av.personalidade)), 400);
    }
    setRecorded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.status, recorded]);

  if (!state) {
    return (
      <StartScreen
        numOpponents={numOpponents}
        setNumOpponents={setNumOpponents}
        avatarId={avatarId}
        setAvatarId={(id) => {
          setAvatarId(id);
          setPrefs({ avatarId: id });
        }}
        onStart={() => startGame()}
      />
    );
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
    // reação: humano passou banana pro bot
    if (next.lastEvent?.kind === "draw") {
      const { toId, card, formedPair } = next.lastEvent;
      const av = botAvatars[toId];
      if (av && card.isMico && !formedPair && chance(0.75)) {
        setTimeout(() => say(toId, fala("peguei_mico", av.personalidade)), 300);
      }
    }
    setState(next);
  }

  return (
    <div className="min-h-screen felt-bg flex flex-col">
      <TopBar title="VS IA" showBack />
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-4 pb-6 flex flex-col gap-4">
        {/* Faixa de oponentes com avatares */}
        <section className="flex flex-wrap items-start justify-center gap-4 sm:gap-6 pt-2">
          {opponents.map((op) => {
            const av = botAvatars[op.id] ?? AVATARES[1];
            const isTarget = isHumanTurn && op.id === target.id;
            const isTheirTurn = state.status === "playing" && state.players[state.turnIndex].id === op.id;
            return (
              <PlayerSeat
                key={op.id}
                avatar={av}
                name={op.name}
                cardsCount={op.hand.length}
                isTurn={isTheirTurn}
                isTarget={isTarget}
                finished={op.finished}
                speech={speeches[op.id] ?? null}
              />
            );
          })}
        </section>

        {/* Mãos dos oponentes (para o humano escolher) */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {opponents.map((op) => {
            const isTarget = isHumanTurn && op.id === target.id;
            return (
              <div
                key={op.id}
                className={`hq-panel-sm p-3 transition ${isTarget ? "gold-glow" : ""}`}
                style={isTarget ? { background: "var(--hq-primary)" } : undefined}
              >
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

        {/* Área do humano */}
        <section className="hq-panel p-3 sm:p-4">
          <div className="flex items-center gap-4 mb-2">
            <PlayerSeat
              avatar={humanAvatar}
              name={human.name}
              cardsCount={human.hand.length}
              isTurn={isHumanTurn}
              finished={human.finished}
              size="sm"
            />
            <div className="flex-1" />
          </div>
          <Hand cards={human.hand} />
        </section>
      </main>

      <AnimatePresence>
        {state.status === "finished" && (
          <EndModal state={state} humanAvatar={humanAvatar} onRestart={() => startGame()} />
        )}
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

function EndModal({
  state,
  humanAvatar,
  onRestart,
}: {
  state: GameState;
  humanAvatar: Avatar;
  onRestart: () => void;
}) {
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
        <div className="flex justify-center mb-3">
          <div
            className="rounded-full overflow-hidden"
            style={{
              width: 96,
              height: 96,
              background: humanAvatar.cor,
              border: "3px solid var(--ink)",
              boxShadow: "5px 5px 0 var(--ink)",
            }}
          >
            <img src={humanAvatar.url} alt={humanAvatar.nome} className="w-full h-full object-cover" />
          </div>
        </div>
        <div
          className="text-6xl mb-2 inline-block"
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
  avatarId,
  setAvatarId,
  onStart,
}: {
  numOpponents: number;
  setNumOpponents: (n: number) => void;
  avatarId: string;
  setAvatarId: (id: string) => void;
  onStart: () => void;
}) {
  const options = useMemo(() => [1, 2, 3], []);
  return (
    <div className="min-h-screen felt-bg">
      <TopBar title="VS IA" showBack />
      <main className="max-w-lg mx-auto px-4 py-8 text-center">
        <div
          className="text-5xl mb-2 inline-block"
          style={{ filter: "drop-shadow(3px 3px 0 var(--ink))" }}
        >
          🍌
        </div>
        <h1 className="hq-title text-4xl mb-2">VS IA</h1>

        <section className="hq-panel p-4 mb-4 text-left">
          <h2
            className="text-sm mb-3 text-center"
            style={{ fontFamily: "var(--font-display)", letterSpacing: "0.06em", color: "var(--ink)" }}
          >
            ESCOLHA SEU PERSONAGEM
          </h2>
          <AvatarPicker value={avatarId} onChange={setAvatarId} />
        </section>

        <p
          className="mb-3"
          style={{ color: "var(--ink)", fontFamily: "Comic Neue, sans-serif", fontWeight: 700 }}
        >
          Quantos oponentes?
        </p>
        <div className="flex justify-center gap-3 mb-6">
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
