import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
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
import { Copy, RefreshCw, Play, LogIn } from "lucide-react";
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
  const stateRef = useRef<RoomStateJSON | null>(null);
  stateRef.current = state;

  // Repoll imediato usado por ações locais para atualizar sem esperar o próximo tick.
  const refresh = useCallback(async () => {
    try {
      const res = await getRoomStateFn({ data: { code: codigo } });
      if (res) setState(res.state);
    } catch {
      /* ignora */
    }
  }, [codigo]);

  useEffect(() => {
    const pid = getPlayerId();
    setPlayerId(pid);
    const name = getPrefs().name || "Jogador";
    joinRoomFn({ data: { code: codigo, name, playerId: pid } })
      .then((res) => {
        if (res && "spectator" in res && res.spectator) {
          toast.info(res.message);
        }
        refresh();
      })
      .catch((e) => {
        toast.error(e instanceof Error ? e.message : "Não foi possível entrar na sala.");
      });
  }, [codigo, refresh]);

  // Polling adaptativo: rápido durante a partida, lento no lobby/fim.
  useEffect(() => {
    let mounted = true;
    let timer: ReturnType<typeof setTimeout> | null = null;

    async function tick() {
      try {
        const res = await getRoomStateFn({ data: { code: codigo } });
        if (mounted && res) setState(res.state);
      } catch {
        /* ignora falhas transitórias */
      }
      if (mounted) {
        const phase = stateRef.current?.phase;
        const delay = phase === "playing" ? 700 : 1500;
        timer = setTimeout(tick, delay);
      }
    }
    tick();

    return () => {
      mounted = false;
      if (timer) clearTimeout(timer);
    };
  }, [codigo]);

  useEffect(() => {
    if (!state?.game || state.game.status !== "finished" || recorded || !playerId) return;
    const inGame = state.game.players.some((p) => p.id === playerId);
    if (!inGame) return; // espectador não conta resultado
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
  const isInRoom = state.players.some((p) => p.id === playerId);
  return (
    <div className="min-h-screen felt-bg flex flex-col">
      <Toaster position="top-center" />
      <TopBar title={`SALA ${codigo}`} showBack />
      {!isInRoom && <JoinCta code={codigo} onJoined={refresh} />}
      {state.phase === "lobby" ? (
        <Lobby state={state} code={codigo} isHost={isHost} playerId={playerId} onChanged={refresh} />
      ) : (
        <Playing
          state={state}
          code={codigo}
          playerId={playerId}
          isHost={isHost}
          onReset={() => setRecorded(false)}
          refresh={refresh}
        />
      )}
      <DiagnosticStrip state={state} playerId={playerId} />
    </div>
  );
}

function JoinCta({ code, onJoined }: { code: string; onJoined: () => void }) {
  const [joining, setJoining] = useState(false);
  async function handleJoin() {
    setJoining(true);
    try {
      const pid = getPlayerId();
      const name = getPrefs().name || "Jogador";
      await joinRoomFn({ data: { code, name, playerId: pid } });
      onJoined();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao entrar.");
    } finally {
      setJoining(false);
    }
  }
  return (
    <div className="max-w-md mx-auto w-full px-4 pt-4">
      <div className="hq-panel p-3 flex items-center justify-between gap-3">
        <span style={{ color: "var(--ink)", fontFamily: "Comic Neue, sans-serif", fontWeight: 700 }}>
          Você ainda não entrou nesta sala.
        </span>
        <button
          onClick={handleJoin}
          disabled={joining}
          className="hq-btn hq-btn-primary text-white px-3 py-1.5 text-sm inline-flex items-center gap-1 disabled:opacity-50"
        >
          <LogIn className="size-4" /> ENTRAR
        </button>
      </div>
    </div>
  );
}

function DiagnosticStrip({ state, playerId }: { state: RoomStateJSON; playerId: string }) {
  const meShort = playerId ? playerId.slice(0, 6) : "—";
  const cur =
    state.game && state.game.status === "playing"
      ? state.game.players[state.game.turnIndex]
      : null;
  const curShort = cur ? `${cur.name} (${cur.id.slice(0, 6)})` : "—";
  return (
    <div
      className="max-w-6xl w-full mx-auto px-3 pb-3 mt-auto text-[10px] text-center opacity-70"
      style={{ color: "var(--ink)", fontFamily: "Comic Neue, sans-serif" }}
    >
      Meu ID: <strong>{meShort}</strong> · Vez de: <strong>{curShort}</strong>
    </div>
  );
}

function Lobby({
  state,
  code,
  isHost,
  playerId,
  onChanged,
}: {
  state: RoomStateJSON;
  code: string;
  isHost: boolean;
  playerId: string;
  onChanged: () => void;
}) {
  const [pending, setPending] = useState(false);
  async function handleStart() {
    setPending(true);
    try {
      await startGameFn({ data: { code, playerId } });
      await onChanged();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao iniciar.");
    } finally {
      setPending(false);
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
        <p
          className="mt-1 text-[11px] opacity-80"
          style={{ color: "var(--ink)", fontFamily: "Comic Neue, sans-serif", fontWeight: 700 }}
        >
          Aguarde todos aparecerem antes de iniciar.
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
                {p.id === playerId && <span className="ml-2 opacity-60">(você)</span>}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {isHost ? (
        <button
          onClick={handleStart}
          disabled={state.players.length < 2 || pending}
          className="mt-6 w-full hq-btn hq-btn-primary text-white py-3 text-lg disabled:opacity-50 inline-flex items-center justify-center gap-2"
        >
          <Play className="size-5" />
          {pending ? "INICIANDO…" : state.players.length < 2 ? "AGUARDANDO…" : "INICIAR!"}
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
  refresh,
}: {
  state: RoomStateJSON;
  code: string;
  playerId: string;
  isHost: boolean;
  onReset: () => void;
  refresh: () => Promise<void>;
}) {
  const game = state.game!;
  const me = game.players.find((p) => p.id === playerId);
  const opponents = game.players.filter((p) => p.id !== playerId);
  const isMyTurn =
    game.status === "playing" && game.players[game.turnIndex].id === playerId;
  const target = game.players[game.targetIndex];
  const iAmTargeted = target.id === playerId;
  const currentPlayer = game.players[game.turnIndex];
  const [pending, setPending] = useState(false);

  async function onPickCard(idx: number) {
    if (!isMyTurn || pending) return;
    setPending(true);
    try {
      await playCardFn({ data: { code, playerId, cardIndex: idx } });
      await refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Jogada inválida.";
      if (/não é sua vez/i.test(msg)) {
        toast("Outro jogador já jogou, aguarde…", { duration: 1500 });
        await refresh();
      } else {
        toast.error(msg);
      }
    } finally {
      setPending(false);
    }
  }

  async function handleReset() {
    setPending(true);
    try {
      await resetGameFn({ data: { code, playerId } });
      onReset();
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao reiniciar.");
    } finally {
      setPending(false);
    }
  }

  const banner =
    game.status === "playing"
      ? isMyTurn
        ? `Sua vez — puxe uma carta de ${target.name}!`
        : iAmTargeted
          ? `${currentPlayer.name} está puxando uma carta sua…`
          : me
            ? `${currentPlayer.name} está jogando…`
            : `Você está assistindo — ${currentPlayer.name} está jogando.`
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
              <div className="flex items-center justify-between mb-2 gap-2 min-w-0">
                <span
                  className="truncate text-sm min-w-0"
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
                  className="text-xs shrink-0"
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
                  <Hand cards={op.hand} faceDown selectable={!pending} onPick={onPickCard} />
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
          <div className="flex items-center justify-between mb-2 gap-2 min-w-0">
            <span
              className="text-lg truncate min-w-0"
              style={{ fontFamily: "var(--font-display)", color: "var(--ink)", letterSpacing: "0.04em" }}
            >
              {me.name}{" "}
              <span className="text-xs opacity-60" style={{ fontFamily: "Comic Neue, sans-serif" }}>
                (você)
              </span>
            </span>
            <span
              className="text-xs shrink-0"
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
                    disabled={pending}
                    className="hq-btn hq-btn-primary text-white px-5 py-2 inline-flex items-center gap-2 disabled:opacity-50"
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
