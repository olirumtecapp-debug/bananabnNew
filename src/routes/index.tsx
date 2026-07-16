import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TopBar } from "@/components/game/TopBar";
import { Bot, Users, BookOpen, BarChart3, Sparkles } from "lucide-react";
import { getPrefs, setPrefs } from "@/lib/storage";
import { createRoomFn, joinRoomFn } from "@/lib/mico.functions";
import { toast, Toaster } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mico — Menu principal" },
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
      const res = await createRoomFn({ data: { name: n } });
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
      await joinRoomFn({ data: { name: n, code: c } });
      navigate({ to: "/sala/$codigo", params: { codigo: c } });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao entrar na sala.";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen felt-bg">
      <Toaster position="top-center" />
      <TopBar />
      <main className="max-w-5xl mx-auto px-4 pb-16">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
          className="text-center py-8 sm:py-14"
        >
          <div className="text-6xl sm:text-8xl mb-2">🐒</div>
          <h1 className="font-display text-5xl sm:text-7xl font-black gold-text">Mico</h1>
          <p className="mt-3 text-[var(--color-muted-foreground)] text-sm sm:text-base max-w-xl mx-auto">
            O clássico jogo de cartas em português. Jogue contra a IA ou crie uma sala e chame os
            amigos.
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            to="/jogar/ia"
            className="group rounded-2xl bg-[var(--color-felt-deep)]/70 border border-[var(--color-gold)]/30 p-6 hover:gold-glow transition"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-full bg-[var(--color-gold)]/20 p-3 group-hover:bg-[var(--color-gold)]/40 transition">
                <Bot className="size-6 text-[var(--color-gold)]" />
              </div>
              <h2 className="text-xl font-bold">Jogar vs IA</h2>
            </div>
            <p className="text-sm text-[var(--color-muted-foreground)]">
              Partida rápida contra 1 a 3 oponentes controlados pela IA. Ideal para praticar.
            </p>
          </Link>

          <div className="rounded-2xl bg-[var(--color-felt-deep)]/70 border border-[var(--color-gold)]/30 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="rounded-full bg-[var(--color-gold)]/20 p-3">
                <Users className="size-6 text-[var(--color-gold)]" />
              </div>
              <h2 className="text-xl font-bold">Multiplayer online</h2>
            </div>
            <label className="block text-xs uppercase tracking-widest text-[var(--color-muted-foreground)] mb-1">
              Seu nome
            </label>
            <input
              value={name}
              onChange={(e) => saveName(e.target.value)}
              maxLength={20}
              placeholder="Como quer ser chamado?"
              className="w-full rounded-lg bg-[var(--color-background)]/60 border border-[var(--color-gold)]/20 px-3 py-2 mb-3 focus:outline-none focus:border-[var(--color-gold)]"
            />
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                onClick={handleCreate}
                disabled={busy}
                className="rounded-lg bg-[var(--color-gold)] text-[var(--color-primary-foreground)] font-bold py-2 disabled:opacity-50 hover:brightness-110 transition"
              >
                <Sparkles className="inline size-4 -mt-0.5 mr-1" />
                Criar sala
              </button>
              <div className="flex gap-2">
                <input
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  placeholder="CÓDIGO"
                  className="min-w-0 flex-1 rounded-lg bg-[var(--color-background)]/60 border border-[var(--color-gold)]/20 px-3 py-2 uppercase tracking-widest focus:outline-none focus:border-[var(--color-gold)]"
                />
                <button
                  onClick={handleJoin}
                  disabled={busy}
                  className="shrink-0 rounded-lg border border-[var(--color-gold)] text-[var(--color-gold)] font-bold px-3 py-2 disabled:opacity-50 hover:bg-[var(--color-gold)]/10 transition"
                >
                  Entrar
                </button>
              </div>
            </div>
            <p className="mt-3 text-xs text-[var(--color-muted-foreground)]">
              Funciona em qualquer rede — mesma Wi-Fi ou internet.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 mt-4">
          <Link
            to="/tutorial"
            className="rounded-2xl bg-[var(--color-felt-deep)]/70 border border-[var(--color-gold)]/30 p-5 hover:gold-glow transition flex items-center gap-3"
          >
            <BookOpen className="size-5 text-[var(--color-gold)]" />
            <div>
              <div className="font-semibold">Como jogar</div>
              <div className="text-xs text-[var(--color-muted-foreground)]">Regras e dicas</div>
            </div>
          </Link>
          <Link
            to="/estatisticas"
            className="rounded-2xl bg-[var(--color-felt-deep)]/70 border border-[var(--color-gold)]/30 p-5 hover:gold-glow transition flex items-center gap-3"
          >
            <BarChart3 className="size-5 text-[var(--color-gold)]" />
            <div>
              <div className="font-semibold">Estatísticas</div>
              <div className="text-xs text-[var(--color-muted-foreground)]">Seu histórico local</div>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
