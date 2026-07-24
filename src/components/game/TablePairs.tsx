import { motion } from "framer-motion";
import { Card } from "./Card";
import type { Player } from "@/game/mico";

interface TablePairsProps {
  players: Player[];
}

/**
 * Mesa central estilo HQ: cada jogador é um painel branco com
 * borda preta grossa, faixa amarela com o nome e pares empilhados
 * levemente rotacionados.
 */
export function TablePairs({ players }: TablePairsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {players.map((p) => (
        <motion.div
          key={p.id}
          layout
          className="hq-panel-sm p-3 min-w-0"
        >
          <div
            className="flex items-center justify-between mb-2 gap-2 px-2 py-1 rounded-md"
            style={{
              background: "var(--hq-primary)",
              border: "2px solid var(--ink)",
              color: "var(--ink)",
              fontFamily: "var(--font-display)",
              letterSpacing: "0.04em",
            }}
          >
            <span className="truncate text-sm">
              {p.name} {p.finished && <span>👑</span>}
            </span>
            <span className="text-[10px] shrink-0" style={{ fontFamily: "Comic Neue, sans-serif" }}>
              {p.pairs.length} {p.pairs.length === 1 ? "PAR" : "PARES"}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 min-h-[3.5rem] items-center">
            {p.pairs.length === 0 && (
              <span
                className="text-[10px] italic"
                style={{ color: "var(--ink)", opacity: 0.55 }}
              >
                nenhum par ainda
              </span>
            )}
            {p.pairs.map((pair, idx) => (
              <div
                key={idx}
                className="flex -space-x-3"
                style={{ transform: `rotate(${idx % 2 === 0 ? -3 : 3}deg)` }}
              >
                <Card card={pair[0]} small />
                <Card card={pair[1]} small />
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
