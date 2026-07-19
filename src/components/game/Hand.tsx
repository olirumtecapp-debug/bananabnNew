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
  shuffling?: boolean;
}

/** Leque de cartas na horizontal, com sobreposição. Usada tanto para o jogador quanto para adversário. */
export function Hand({ cards, faceDown, selectable, onPick, label, highlightedIndex, shuffling }: HandProps) {
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
              animate={
                shuffling
                  ? {
                      y: [0, -18, 12, -8, 0],
                      x: [0, (i % 2 === 0 ? -1 : 1) * 22, (i % 2 === 0 ? 1 : -1) * 18, 6, 0],
                      rotate: [0, -8, 10, -4, 0],
                      opacity: 1,
                    }
                  : { y: 0, x: 0, opacity: 1, rotate: 0 }
              }
              exit={{ y: 20, opacity: 0, scale: 0.8 }}
              transition={
                shuffling
                  ? { duration: 0.9, times: [0, 0.25, 0.5, 0.75, 1], ease: "easeInOut" }
                  : { delay: i * 0.03, type: "spring", stiffness: 260, damping: 22 }
              }
              className="relative"
            >
              <Card
                card={faceDown ? undefined : card}
                faceDown={faceDown}
                selectable={selectable && !shuffling}
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
