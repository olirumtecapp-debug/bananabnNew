import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TopBar } from "@/components/game/TopBar";
import { Hand } from "@/components/game/Hand";
import { TablePairs } from "@/components/game/TablePairs";
import { supabase } from "@/integrations/supabase/client";
import { getPlayerId, getPrefs, recordResult } from "@/lib/storage";
import { sfx } from "@/lib/sound";
import {
  joinRoomFn,
  playCardFn,
  resetGameFn,
  startGameFn,
  type RoomStateJSON,
} from "@/lib/mico.functions";
import { Copy, RefreshCw, Play, Trophy, Frown } from "lucide-react";
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

  // Ao montar: garante que estamos "presentes" na sala (join reconecta se já estava)
  useEffect(() => {
    const pid = getPlayerId();
    setPlayerId(pid);
    const name = getPrefs().name || "Jogador";
    joinRoomFn({ data: { code: codigo, name, playerId: pid } }).catch((e) => {
      toast.error(e instanceof Error ? e.message : "Não foi possível entrar na sala.");
    });
  }, [codigo]);

  // Realtime: carrega estado inicial e escuta atualizações
  useEffect(() => {
    let mounted = true;
    async function loadInitial() {
      const { data } = await supabase.from("rooms").select("state").eq("code", codigo).maybeSingle();
      if (mounted && data) setState(data.state as unknown as RoomStateJSON);
    }
    loadInitial();

    const channel = supabase
      .channel(`room-${codigo}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "rooms", filter: `code=eq.${codigo}` },
        (payload) => {
          const row = payload.new as { state: unknown };
          setState(row.state as RoomStateJSON);
        },
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [codigo]);

  // Estatística ao fim
  useEffect(() => {
    if (!state?.game || state.game.status !== "finished" || recorded || !playerId) return;
    const won = state.game.loserId !== playerId;
    recordResult(won);
    if (won) sfx.win();
    else sfx.lose();
    setRecorded(true);
  }, [state, recorded, playerId]);

  // Sons ao mudar de estado
  useEffect(() => {
    const ev = state?.game?.lastEvent;
    if (!ev) return;
    if (ev.kind === "draw") ev.formedPair ? sfx.pair() : sfx.pick();
    if (ev.kind === "deal") sfx.deal();
  }, [state?.game?.lastEvent]);

  if (!state) {
    return (
      <div className="min-h-screen felt-bg">
        <TopBar title={`Sala ${codigo}`} showBack />
        <div className="text-center py-16 text-[var(--color-muted-foreground)]">Carregando sala…</div>
      </div>
    );
  }

  const isHost = state.hostId === playerId;
  return (
    <div className="min-h-screen felt-bg flex flex-col">
      <Toaster position="top-center" />
      <TopBar title={`Sala ${codigo}`} showBack />
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
        <div className="text-xs uppercase tracking-widest text-[var(--color-muted-foreground)]">
          Código da sala
        </div>
        <div className="font-display text-4xl sm:text-5xl gold-text tracking-widest">{code}</div>
        <button
          onClick={copyCode}
          className="mt-2 inline-flex items-center gap-1 text-sm text-[var(--color-gold)] hover:underline"
        >
          <Copy className="size-4" /> copiar código
        </button>
        <p className="mt-3 text-xs text-[var(--color-muted-foreground)] break-all">
          Compartilhe este link: {shareUrl}
        </p>
      </div>

      <div className="mt-6 rounded-2xl bg-[var(--color-felt-deep)]/70 border border-[var(--color-gold)]/25 p-4">
        <h2 className="font-semibold mb-2">Jogadores ({state.players.length}/4)</h2>
        <ul className="space-y-2">
          {state.players.map((p) => (
            <li key={p.id} className="flex items-center justify-between text-sm">
              <span className="truncate">
                {p.name}
                {p.id === state.hostId && <span className="ml-1 text-[var(--color-gold)]">★ host</span>}
                {p.id === playerId && <span className="ml-1 text-[var(--color-muted-foreground)]">(você)</span>}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {isHost ? (
        <button
          onClick={handleStart}
          disabled={state.players.length < 2}
          className="mt-4 w-full rounded-full bg-[var(--color-gold)] text-[var(--color-primary-foreground)] font-bold py-3 disabled:opacity-50 inline-flex items-center justify-center gap-2"
        >
          <Play className="size-4" />
          {state.players.length < 2 ? "Aguardando mais jogadores…" : "Iniciar partida"}
        </button>
      ) : (
        <p className="mt-4 text-center text-sm text-[var(--color-muted-foreground)]">
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

  return (
    <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-4 pb-6 flex flex-col gap-4">
      {/* Oponentes */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {opponents.map((op) => {
          const isTargetForMe = isMyTurn && op.id === target.id;
          return (
            <div
              key={op.id}
              className={`rounded-xl p-3 border transition ${
                isTargetForMe
                  ? "border-[var(--color-gold)] gold-glow bg-[var(--color-felt-deep)]/80"
                  : "border-[var(--color-gold)]/20 bg-[var(--color-felt-deep)]/50"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm truncate">
                  {op.name}
                  {op.finished && " 👑"}
                  {op.id === game.players[game.turnIndex]?.id && !op.finished && (
                    <span className="ml-1 text-[10px] text-[var(--color-gold)]">jogando…</span>
                  )}
                </span>
                <span className="text-xs text-[var(--color-muted-foreground)]">
                  {op.hand.length} {op.hand.length === 1 ? "carta" : "cartas"}
                </span>
              </div>
              {isTargetForMe ? (
                <>
                  <div className="text-[10px] uppercase tracking-widest text-[var(--color-gold)] mb-1">
                    Toque em uma carta para puxar
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
        <h2 className="text-xs uppercase tracking-widest text-[var(--color-muted-foreground)] mb-2 text-center">
          Mesa · pares descartados
        </h2>
        <TablePairs players={game.players} />
      </section>

      <div className="text-center text-sm text-[var(--color-gold)] font-semibold">
        {game.status === "playing" ? (
          isMyTurn ? (
            `Sua vez — puxe uma carta de ${target.name}`
          ) : iAmTargeted ? (
            `${currentPlayer.name} está puxando uma carta sua…`
          ) : (
            `${currentPlayer.name} está jogando…`
          )
        ) : null}
      </div>

      {me && (
        <section className="rounded-2xl bg-[var(--color-felt-deep)]/70 border border-[var(--color-gold)]/25 p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">
              {me.name} <span className="text-xs text-[var(--color-muted-foreground)]">(você)</span>
            </span>
            <span className="text-xs text-[var(--color-muted-foreground)]">
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
              initial={{ scale: 0.85, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-md w-full rounded-2xl bg-[var(--color-felt-deep)] border border-[var(--color-gold)]/50 p-6 text-center"
            >
              <div className="text-6xl mb-2">{game.loserId === playerId ? "🍌" : "🏆"}</div>
              <h2 className="font-display text-3xl gold-text mb-1">
                {game.loserId === playerId ? "Você pegou a Banana!" : "Fim da partida"}
              </h2>
              <p className="text-sm text-[var(--color-muted-foreground)] mb-4">
                {game.loserId === playerId ? (
                  <>
                    <Frown className="inline size-4 mr-1" />
                    Ficou com a carta sem par.
                  </>
                ) : (
                  <>
                    <Trophy className="inline size-4 mr-1" />
                    Quem perdeu:{" "}
                    <strong>
                      {game.players.find((p) => p.id === game.loserId)?.name ?? "?"}
                    </strong>
                  </>
                )}
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {isHost && (
                  <button
                    onClick={handleReset}
                    className="rounded-full bg-[var(--color-gold)] text-[var(--color-primary-foreground)] font-bold px-5 py-2 inline-flex items-center gap-2"
                  >
                    <RefreshCw className="size-4" />
                    Nova partida
                  </button>
                )}
                <Link
                  to="/"
                  className="rounded-full border border-[var(--color-gold)]/50 px-5 py-2 font-medium"
                >
                  Menu
                </Link>
              </div>
              {!isHost && (
                <p className="mt-3 text-xs text-[var(--color-muted-foreground)]">
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
