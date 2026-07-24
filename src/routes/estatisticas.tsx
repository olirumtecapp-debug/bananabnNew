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
      <TopBar title="ESTATÍSTICAS" showBack />
      <main className="max-w-2xl mx-auto px-4 pb-16">
        <div className="text-center mb-6">
          <div className="inline-block burst text-lg">SCORE!</div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Stat label="PARTIDAS" value={stats.games} />
          <Stat label="VITÓRIAS" value={stats.wins} highlight />
          <Stat label="DERROTAS" value={stats.losses} />
          <Stat label="APROVEITAMENTO" value={`${winRate}%`} />
          <Stat label="SEQUÊNCIA" value={stats.currentStreak} />
          <Stat label="MELHOR" value={stats.bestStreak} highlight />
        </div>
        <button
          onClick={() => {
            resetStats();
            setStats(getStats());
          }}
          className="mt-8 hq-btn inline-flex items-center gap-2 px-4 py-2 text-sm"
        >
          <RotateCcw className="size-4" />
          ZERAR
        </button>
      </main>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: number | string; highlight?: boolean }) {
  return (
    <div
      className="hq-panel p-4"
      style={
        highlight
          ? { background: "var(--hq-primary)" }
          : undefined
      }
    >
      <div
        className="text-[11px]"
        style={{
          fontFamily: "var(--font-display)",
          letterSpacing: "0.06em",
          color: "var(--ink)",
        }}
      >
        {label}
      </div>
      <div
        className="text-3xl sm:text-4xl mt-1"
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--ink)",
          textShadow: highlight ? "2px 2px 0 #fff" : "none",
        }}
      >
        {value}
      </div>
    </div>
  );
}
