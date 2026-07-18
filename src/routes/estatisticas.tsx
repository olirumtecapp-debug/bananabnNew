import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { TopBar } from "@/components/game/TopBar";
import { getStats, resetStats, type Stats } from "@/lib/storage";
import { RotateCcw } from "lucide-react";

export const Route = createFileRoute("/estatisticas")({
  head: () => ({
    meta: [
      { title: "Estatísticas — Banana" },
      { name: "description", content: "Seu histórico de partidas de Banana, salvo no navegador." },
    ],
  }),
  component: Estatisticas,
});

function Estatisticas() {
  const [stats, setStats] = useState<Stats | null>(null);
  useEffect(() => setStats(getStats()), []);
  if (!stats) return null;

  const winRate = stats.games > 0 ? Math.round((stats.wins / stats.games) * 100) : 0;

  return (
    <div className="min-h-screen felt-bg">
      <TopBar title="Estatísticas" showBack />
      <main className="max-w-2xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Stat label="Partidas" value={stats.games} />
          <Stat label="Vitórias" value={stats.wins} highlight />
          <Stat label="Derrotas" value={stats.losses} />
          <Stat label="Aproveitamento" value={`${winRate}%`} />
          <Stat label="Sequência atual" value={stats.currentStreak} />
          <Stat label="Melhor sequência" value={stats.bestStreak} highlight />
        </div>
        <button
          onClick={() => {
            resetStats();
            setStats(getStats());
          }}
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-[var(--color-gold)]/40 px-4 py-2 text-sm hover:bg-[var(--color-gold)]/10"
        >
          <RotateCcw className="size-4" />
          Zerar estatísticas
        </button>
      </main>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: number | string; highlight?: boolean }) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        highlight
          ? "border-[var(--color-gold)]/60 bg-[var(--color-gold)]/10"
          : "border-[var(--color-gold)]/20 bg-[var(--color-felt-deep)]/60"
      }`}
    >
      <div className="text-xs uppercase tracking-widest text-[var(--color-muted-foreground)]">
        {label}
      </div>
      <div className={`text-2xl sm:text-3xl font-black mt-1 ${highlight ? "gold-text" : ""}`}>
        {value}
      </div>
    </div>
  );
}
