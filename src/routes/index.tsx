import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TopBar } from "@/components/game/TopBar";
import { Bot, Users, BookOpen, BarChart3, Sparkles } from "lucide-react";
import { getPlayerId, getPrefs, setPrefs } from "@/lib/storage";
import { createRoomFn, joinRoomFn } from "@/lib/mico.functions";
import { toast, Toaster } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Banana — Menu principal" },
      {
        name: "description",
        content:
          "Escolha um modo de jogo: vs IA, criar sala online ou entrar em sala com código.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const [name, setName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setName(getPrefs().name);
  }, []);

  function saveName(v: string) {
    setName(v);
    setPrefs({ name: v });
  }

  async function handleCreate() {
    const n = (name || "").trim();
    if (!n) {
      toast.error("Digite seu nome para criar uma sala.");
      return;
    }
    setBusy(true);
    try {
      const res = await createRoomFn({ data: { name: n, playerId: getPlayerId() } });
      navigate({ to: "/sala/$codigo", params: { codigo: res.code } });
    } catch (e) {
      toast.error("Não foi possível criar a sala. Tente novamente.");
      console.error(e);
    } finally {
      setBusy(false);
    }
  }

  async function handleJoin() {
    const n = (name || "").trim();
    const c = joinCode.trim().toUpperCase();
    if (!n || !c) {
      toast.error("Digite seu nome e o código da sala.");
      return;
    }
    setBusy(true);
    try {
      await joinRoomFn({ data: { name: n, code: c, playerId: getPlayerId() } });
      navigate({ to: "/sala/$codigo", params: { codigo: c } });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao entrar na sala.";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  const inputStyle = {
    background: "var(--hq-panel)",
    color: "var(--ink)",
    border: "2.5px solid var(--ink)",
    boxShadow: "3px 3px 0 var(--ink)",
    fontFamily: "Comic Neue, sans-serif",
    fontWeight: 700,
  } as const;

  return (
    <div className="min-h-screen felt-bg">
      <Toaster position="top-center" />
      <TopBar />
      <main className="max-w-5xl mx-auto px-4 pb-16">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
          className="text-center py-8 sm:py-12 relative"
        >
          <motion.div
            animate={{ rotate: [-3, 3, -3] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="text-7xl sm:text-8xl mb-2 inline-block"
            style={{ filter: "drop-shadow(4px 4px 0 var(--ink))" }}
          >
            🍌
          </motion.div>
          <h1 className="hq-title text-6xl sm:text-8xl">BANANA!</h1>
          <div className="mt-4 inline-block burst text-base sm:text-lg">
            OLD MAID!
          </div>
          <p
            className="mt-5 text-sm sm:text-base max-w-xl mx-auto"
            style={{ color: "var(--ink)", fontFamily: "Comic Neue, sans-serif", fontWeight: 700 }}
          >
            O clássico jogo de cartas em português. Enfrente a IA ou chame os amigos por sala online!
          </p>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Link to="/jogar/ia" className="hq-panel p-5 group block hover:-translate-y-1 transition-transform">
            <div className="flex items-center gap-3 mb-2">
              <div
                className="rounded-lg p-3"
                style={{
                  background: "var(--hq-secondary)",
                  border: "2.5px solid var(--ink)",
                  boxShadow: "3px 3px 0 var(--ink)",
                }}
              >
                <Bot className="size-6 text-white" />
              </div>
              <h2 className="hq-title-sm text-2xl">JOGAR vs IA</h2>
            </div>
            <p style={{ color: "var(--ink)", fontFamily: "Comic Neue, sans-serif", fontWeight: 700 }}>
              Partida rápida contra 1 a 3 oponentes da IA. Perfeito pra treinar!
            </p>
          </Link>

          <div className="hq-panel p-5">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="rounded-lg p-3"
                style={{
                  background: "var(--hq-accent)",
                  border: "2.5px solid var(--ink)",
                  boxShadow: "3px 3px 0 var(--ink)",
                }}
              >
                <Users className="size-6 text-white" />
              </div>
              <h2 className="hq-title-sm text-2xl">MULTIPLAYER</h2>
            </div>
            <label
              className="block text-[11px] mb-1"
              style={{
                fontFamily: "var(--font-display)",
                letterSpacing: "0.06em",
                color: "var(--ink)",
              }}
            >
              SEU NOME
            </label>
            <input
              value={name}
              onChange={(e) => saveName(e.target.value)}
              maxLength={20}
              placeholder="Como quer ser chamado?"
              className="w-full rounded-lg px-3 py-2 mb-3 focus:outline-none"
              style={inputStyle}
            />
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                onClick={handleCreate}
                disabled={busy}
                className="hq-btn hq-btn-primary py-2 px-3 text-white disabled:opacity-50 inline-flex items-center justify-center gap-1"
              >
                <Sparkles className="size-4" />
                CRIAR SALA
              </button>
              <div className="flex gap-2">
                <input
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  placeholder="CÓDIGO"
                  className="min-w-0 flex-1 rounded-lg px-3 py-2 uppercase tracking-widest focus:outline-none"
                  style={{ ...inputStyle, fontFamily: "var(--font-display)", letterSpacing: "0.1em" }}
                />
                <button
                  onClick={handleJoin}
                  disabled={busy}
                  className="hq-btn px-3 py-2 disabled:opacity-50"
                >
                  ENTRAR
                </button>
              </div>
            </div>
            <p
              className="mt-3 text-xs"
              style={{ color: "var(--ink)", fontFamily: "Comic Neue, sans-serif", fontWeight: 700 }}
            >
              Funciona em qualquer rede — Wi-Fi ou internet.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 mt-5">
          <Link
            to="/tutorial"
            className="hq-panel-sm p-4 flex items-center gap-3 hover:-translate-y-0.5 transition-transform"
          >
            <BookOpen className="size-5" style={{ color: "var(--ink)" }} />
            <div>
              <div className="hq-title-sm text-lg">COMO JOGAR</div>
              <div
                className="text-xs"
                style={{ color: "var(--ink)", opacity: 0.7, fontFamily: "Comic Neue, sans-serif", fontWeight: 700 }}
              >
                Regras e dicas
              </div>
            </div>
          </Link>
          <Link
            to="/estatisticas"
            className="hq-panel-sm p-4 flex items-center gap-3 hover:-translate-y-0.5 transition-transform"
          >
            <BarChart3 className="size-5" style={{ color: "var(--ink)" }} />
            <div>
              <div className="hq-title-sm text-lg">ESTATÍSTICAS</div>
              <div
                className="text-xs"
                style={{ color: "var(--ink)", opacity: 0.7, fontFamily: "Comic Neue, sans-serif", fontWeight: 700 }}
              >
                Seu histórico local
              </div>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
