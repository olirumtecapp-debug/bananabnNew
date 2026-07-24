import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TopBar } from "@/components/game/TopBar";
import { Hand } from "@/components/game/Hand";
import { TablePairs } from "@/components/game/TablePairs";
import { getPlayerId, getPrefs, recordResult } from "@/lib/storage";
import { sfx } from "@/lib/sound";
import {
  getRoomStateFn,
  joinRoomFn,
  playCardFn,
  resetGameFn,
  startGameFn,
  type RoomStateJSON,
} from "@/lib/mico.functions";
import { Copy, RefreshCw, Play } from "lucide-react";
import { toast, Toaster } from "sonner";

export const Route = createFileRoute("/sala/$codigo")({
  head: ({ params }) => ({
    meta: [
      { title: `Sala ${params.codigo} — Banana online` },
      {
        name: "description",
        content: "Sala multiplayer da Banana. Convide amigos com o código e joguem juntos online.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Sala,
});

function Sala() {
  const { codigo } = Route.useParams();
  const [state, setState] = useState<RoomStateJSON | null>(null);
  const [playerId, setPlayerId] = useState<string>("");
  const [recorded, setRecorded] = useState(false);

  useEffect(() => {
    const pid = getPlayerId();
    setPlayerId(pid);
    const name = getPrefs().name || "Jogador";
    joinRoomFn({ data: { code: codigo, name, playerId: pid } }).catch((e) => {
      toast.error(e instanceof Error ? e.message : "Não foi possível entrar na sala.");
    });
  }, [codigo]);

  useEffect(() => {
    let mounted = true;
    let timer: ReturnType<typeof setTimeout> | null = null;

    async function tick() {
      try {
        const res = await getRoomStateFn({ data: { code: codigo } });
        if (mounted && res) setState(res.state);
      } catch {
        // ignora falhas transitórias
      }
      if (mounted) timer = setTimeout(tick, 1500);
    }
    tick();

    return () => {
      mounted = false;
      if (timer) clearTimeout(timer);
    };
  }, [codigo]);

  useEffect(() => {
    if (!state?.game || state.game.status !== "finished" || recorded || !playerId) return;
    const won = state.game.loserId !== playerId;
    recordResult(won);
    if (won) sfx.win();
    else sfx.lose();
    setRecorded(true);
  }, [state, recorded, playerId]);

  useEffect(() => {
    const ev = state?.game?.lastEvent;
    if (!ev) return;
    if (ev.kind === "draw") ev.formedPair ? sfx.pair() : sfx.pick();
    if (ev.kind === "deal") sfx.deal();
  }, [state?.game?.lastEvent]);

  if (!state) {
    return (
      <div className="min-h-screen felt-bg">
        <TopBar title={`SALA ${codigo}`} showBack />
        <div
          className="text-center py-16"
          style={{ color: "var(--ink)", fontFamily: "var(--font-display)", letterSpacing: "0.06em" }}
        >
          CARREGANDO SALA…
        </div>
      </div>
    );
  }

  const isHost = state.hostId === playerId;
  return (
    <div className="min-h-screen felt-bg flex flex-col">
      <Toaster position="top-center" />
      <TopBar title={`SALA ${codigo}`} showBack />
      {state.phase === "lobby" ? (
        <Lobby state={state} code={codigo} isHost={isHost} playerId={playerId} />
      ) : (
        <Playing state={state} code={codigo} playerId={playerId} isHost={isHost} onReset={() => setRecorded(false)} />
      )}
    </div>
  );
}

function Lobby({
  state,
  code,
  isHost,
  playerId,
}: {
  state: RoomStateJSON;
  code: string;
  isHost: boolean;
  playerId: string;
}) {
  async function handleStart() {
    try {
      await startGameFn({ data: { code, playerId } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao iniciar.");
    }
  }
  function copyCode() {
    navigator.clipboard?.writeText(code);
    toast.success("Código copiado!");
  }
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  return (
    <main className="max-w-md w-full mx-auto px-4 py-8 flex-1">
      <div className="text-center">
        <div
          className="text-[11px]"
          style={{ fontFamily: "var(--font-display)", letterSpacing: "0.08em", color: "var(--ink)" }}
        >
          CÓDIGO DA SALA
        </div>
        <div className="hq-title text-5xl sm:text-6xl tracking-widest mt-1">{code}</div>
        <button
          onClick={copyCode}
          className="mt-3 hq-btn inline-flex items-center gap-1 px-3 py-1 text-sm"
        >
          <Copy className="size-4" /> COPIAR
        </button>
        <p
          className="mt-3 text-xs break-all"
          style={{ color: "var(--ink)", fontFamily: "Comic Neue, sans-serif", fontWeight: 700 }}
        >
          Compartilhe este link: {shareUrl}
        </p>
      </div>

      <div className="mt-6 hq-panel p-4">
        <h2 className="hq-title-sm text-xl mb-3">JOGADORES ({state.players.length}/4)</h2>
        <ul className="space-y-2">
          {state.players.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between text-sm px-3 py-2 rounded-md"
              style={{
                background: "var(--hq-bg-a)",
                border: "2px solid var(--ink)",
                color: "var(--ink)",
                fontFamily: "Comic Neue, sans-serif",
                fontWeight: 700,
              }}
            >
              <span className="truncate">
                {p.name}
                {p.id === state.hostId && (
                  <span
                    className="ml-2 px-1.5 py-0.5 text-[10px]"
                    style={{
                      background: "var(--hq-primary)",
                      border: "1.5px solid var(--ink)",
                      fontFamily: "var(--font-display)",
                      letterSpacing: "0.05em",
                    }}
                  >
                    HOST
                  </span>
                )}
                {p.id === playerId && (
                  <span className="ml-2 opacity-60">(você)</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {isHost ? (
        <button
          onClick={handleStart}
          disabled={state.players.length < 2}
          className="mt-6 w-full hq-btn hq-btn-primary text-white py-3 text-lg disabled:opacity-50 inline-flex items-center justify-center gap-2"
        >
          <Play className="size-5" />
          {state.players.length < 2 ? "AGUARDANDO…" : "INICIAR!"}
        </button>
      ) : (
        <p
          className="mt-6 text-center text-sm"
          style={{ color: "var(--ink)", fontFamily: "Comic Neue, sans-serif", fontWeight: 700 }}
        >
          Aguardando o host iniciar…
        </p>
      )}
    </main>
  );
}

function Playing({
  state,
  code,
  playerId,
  isHost,
  onReset,
}: {
  state: RoomStateJSON;
  code: string;
  playerId: string;
  isHost: boolean;
  onReset: () => void;
}) {
  const game = state.game!;
  const me = game.players.find((p) => p.id === playerId);
  const opponents = game.players.filter((p) => p.id !== playerId);
  const isMyTurn =
    game.status === "playing" && game.players[game.turnIndex].id === playerId;
  const target = game.players[game.targetIndex];
  const iAmTargeted = target.id === playerId;
  const currentPlayer = game.players[game.turnIndex];

  async function onPickCard(idx: number) {
    if (!isMyTurn) return;
    try {
      await playCardFn({ data: { code, playerId, cardIndex: idx } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Jogada inválida.");
    }
  }

  async function handleReset() {
    try {
      await resetGameFn({ data: { code, playerId } });
      onReset();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao reiniciar.");
    }
  }

  const banner =
    game.status === "playing"
      ? isMyTurn
        ? `Sua vez — puxe uma carta de ${target.name}!`
        : iAmTargeted
          ? `${currentPlayer.name} está puxando uma carta sua…`
          : `${currentPlayer.name} está jogando…`
      : null;

  return (
    <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-4 pb-6 flex flex-col gap-4">
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {opponents.map((op) => {
          const isTargetForMe = isMyTurn && op.id === target.id;
          return (
            <div
              key={op.id}
              className={`hq-panel-sm p-3 transition ${isTargetForMe ? "gold-glow" : ""}`}
              style={isTargetForMe ? { background: "var(--hq-primary)" } : undefined}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className="truncate text-sm"
                  style={{ fontFamily: "var(--font-display)", color: "var(--ink)", letterSpacing: "0.04em" }}
                >
                  {op.name}
                  {op.finished && " 👑"}
                  {op.id === game.players[game.turnIndex]?.id && !op.finished && (
                    <span
                      className="ml-2 px-1 text-[9px]"
                      style={{
                        background: "var(--hq-secondary)",
                        color: "#fff",
                        border: "1.5px solid var(--ink)",
                        fontFamily: "var(--font-display)",
                        letterSpacing: "0.05em",
                      }}
                    >
                      TURNO
                    </span>
                  )}
                </span>
                <span
                  className="text-xs"
                  style={{ color: "var(--ink)", fontFamily: "Comic Neue, sans-serif", fontWeight: 700 }}
                >
                  {op.hand.length} {op.hand.length === 1 ? "carta" : "cartas"}
                </span>
              </div>
              {isTargetForMe ? (
                <>
                  <div
                    className="mb-2 inline-block px-2 py-0.5 text-[10px]"
                    style={{
                      background: "var(--hq-secondary)",
                      color: "#fff",
                      border: "2px solid var(--ink)",
                      boxShadow: "2px 2px 0 var(--ink)",
                      fontFamily: "var(--font-display)",
                      letterSpacing: "0.06em",
                    }}
                  >
                    PICK!
                  </div>
                  <Hand cards={op.hand} faceDown selectable onPick={onPickCard} />
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
        <TablePairs players={game.players} />
      </section>

      {banner && (
        <div className="flex justify-center">
          <div className="speech-bubble text-sm sm:text-base max-w-md text-center">
            {banner}
          </div>
        </div>
      )}

      {me && (
        <section className="hq-panel p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-lg"
              style={{ fontFamily: "var(--font-display)", color: "var(--ink)", letterSpacing: "0.04em" }}
            >
              {me.name}{" "}
              <span className="text-xs opacity-60" style={{ fontFamily: "Comic Neue, sans-serif" }}>
                (você)
              </span>
            </span>
            <span
              className="text-xs"
              style={{ color: "var(--ink)", fontFamily: "Comic Neue, sans-serif", fontWeight: 700 }}
            >
              {me.hand.length} {me.hand.length === 1 ? "carta" : "cartas"}
            </span>
          </div>
          <Hand cards={me.hand} />
        </section>
      )}

      <AnimatePresence>
        {game.status === "finished" && (
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
              className="hq-panel max-w-md w-full p-6 text-center"
            >
              <div
                className="text-7xl mb-2 inline-block"
                style={{ filter: "drop-shadow(4px 4px 0 var(--ink))" }}
              >
                {game.loserId === playerId ? "🍌" : "🏆"}
              </div>
              <h2 className="hq-title text-4xl mb-2">
                {game.loserId === playerId ? "OH NO!" : "FIM DA PARTIDA!"}
              </h2>
              <p
                className="mb-4 text-sm"
                style={{ color: "var(--ink)", fontFamily: "Comic Neue, sans-serif", fontWeight: 700 }}
              >
                {game.loserId === playerId ? (
                  "Ficou com a Banana!"
                ) : (
                  <>
                    Quem ficou com a Banana:{" "}
                    <strong>
                      {game.players.find((p) => p.id === game.loserId)?.name ?? "?"}
                    </strong>
                  </>
                )}
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                {isHost && (
                  <button
                    onClick={handleReset}
                    className="hq-btn hq-btn-primary text-white px-5 py-2 inline-flex items-center gap-2"
                  >
                    <RefreshCw className="size-4" />
                    NOVA PARTIDA
                  </button>
                )}
                <Link to="/" className="hq-btn px-5 py-2 inline-flex items-center">
                  MENU
                </Link>
              </div>
              {!isHost && (
                <p
                  className="mt-3 text-xs"
                  style={{ color: "var(--ink)", fontFamily: "Comic Neue, sans-serif", fontWeight: 700 }}
                >
                  Aguardando o host iniciar uma nova partida…
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
