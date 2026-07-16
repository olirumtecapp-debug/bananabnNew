import { AnimatePresence, motion } from "framer-motion";
import { Card } from "./Card";
import type { Card as GameCard } from "@/game/mico";

interface HandProps {
  cards: GameCard[];
  faceDown?: boolean;
  selectable?: boolean;
  onPick?: (index: number) => void;
  label?: string;
  highlightedIndex?: number;
}

/** Leque de cartas na horizontal, com sobreposição. Usada tanto para o jogador quanto para adversário. */
export function Hand({ cards, faceDown, selectable, onPick, label, highlightedIndex }: HandProps) {
  return (
    <div className="flex flex-col items-center gap-2 min-w-0 w-full">
      {label && (
        <div className="text-xs sm:text-sm text-[var(--color-muted-foreground)] uppercase tracking-widest">
          {label}
        </div>
      )}
      <div className="flex justify-center -space-x-6 sm:-space-x-8 flex-wrap gap-y-2">
        <AnimatePresence initial={false}>
          {cards.map((card, i) => (
            <motion.div
              key={faceDown ? `back-${i}` : card.id}
              initial={{ y: -30, opacity: 0, rotate: -5 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              exit={{ y: 20, opacity: 0, scale: 0.8 }}
              transition={{ delay: i * 0.03, type: "spring", stiffness: 260, damping: 22 }}
              className="relative"
            >
              <Card
                card={faceDown ? undefined : card}
                faceDown={faceDown}
                selectable={selectable}
                onClick={() => onPick?.(i)}
                highlighted={highlightedIndex === i}
              />
            </motion.div>
          ))}
        </AnimatePresence>
        {cards.length === 0 && (
          <span className="text-xs text-[var(--color-muted-foreground)] italic">sem cartas</span>
        )}
      </div>
    </div>
  );
}
