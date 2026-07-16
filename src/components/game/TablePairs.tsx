import { motion } from "framer-motion";
import { Card } from "./Card";
import type { Player } from "@/game/mico";

interface TablePairsProps {
  players: Player[];
}

/**
 * Mesa central: mostra os pares já descartados por cada jogador,
 * lado a lado, com nome e quantidade. Pares aparecem como cartas pequenas.
 */
export function TablePairs({ players }: TablePairsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
      {players.map((p) => (
        <motion.div
          key={p.id}
          layout
          className="rounded-xl bg-[var(--color-felt-deep)]/60 border border-[var(--color-gold)]/20 p-3 min-w-0"
        >
          <div className="flex items-center justify-between mb-2 gap-2">
            <span className="truncate font-semibold text-sm text-[var(--color-paper)]">
              {p.name} {p.finished && <span className="gold-text">👑</span>}
            </span>
            <span className="text-xs text-[var(--color-muted-foreground)] shrink-0">
              {p.pairs.length} {p.pairs.length === 1 ? "par" : "pares"}
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {p.pairs.length === 0 && (
              <span className="text-[10px] italic text-[var(--color-muted-foreground)]">
                nenhum par ainda
              </span>
            )}
            {p.pairs.map((pair, idx) => (
              <div key={idx} className="flex -space-x-4">
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
