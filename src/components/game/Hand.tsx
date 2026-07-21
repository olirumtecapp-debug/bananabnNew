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

/**
 * Leque de cartas com sobreposição. Quando `shuffling` está ativo,
 * as cartas passam por três atos:
 *   1) Recolher — convergem para o centro e viram de dorso.
 *   2) Riffle — split em duas metades que se cruzam com rotação 3D.
 *   3) Fan — reabrem no leque original.
 */
export function Hand({ cards, faceDown, selectable, onPick, label, highlightedIndex, shuffling }: HandProps) {
  const n = cards.length;

  return (
    <div className="flex flex-col items-center gap-2 min-w-0 w-full">
      {label && (
        <div className="text-xs sm:text-sm text-[var(--color-muted-foreground)] uppercase tracking-widest">
          {label}
        </div>
      )}
      <div
        className="flex justify-center -space-x-6 sm:-space-x-8 flex-wrap gap-y-2"
        style={{ perspective: 900 }}
      >
        <AnimatePresence initial={false}>
          {cards.map((card, i) => {
            const half = n > 0 ? (n - 1) / 2 : 0;
            const offset = i - half; // negativo = esquerda, positivo = direita
            const isLeft = offset <= 0;
            // deslocamento base para o riffle (metade esquerda vs direita)
            const riffleX = (isLeft ? -1 : 1) * (30 + Math.abs(offset) * 6);
            const gatherX = -offset * 26; // convergem ao centro anulando a sobreposição do leque

            const shuffleAnim = {
              // recolher (0 → 0.28)
              x: [0, gatherX, gatherX, riffleX, 0, 0],
              y: [0, -6, -14, -22, -4, 0],
              rotate: [0, -offset * 2, 0, 0, -offset * 1.5, 0],
              rotateY: [0, 0, 0, isLeft ? -35 : 35, 0, 0],
              scale: [1, 1.02, 1.05, 1.05, 1.02, 1],
              zIndex: isLeft ? [1, 2, 3, 4, 3, 1] : [1, 2, 3, 5, 3, 1],
              opacity: 1,
            } as const;

            return (
              <motion.div
                key={faceDown ? `back-${i}` : card.id}
                initial={{ y: -30, opacity: 0, rotate: -5 }}
                animate={
                  shuffling
                    ? shuffleAnim
                    : { x: 0, y: 0, opacity: 1, rotate: 0, rotateY: 0, scale: 1 }
                }
                exit={{ y: 20, opacity: 0, scale: 0.8 }}
                transition={
                  shuffling
                    ? {
                        duration: 1.6,
                        times: [0, 0.22, 0.42, 0.62, 0.82, 1],
                        ease: [0.65, 0, 0.35, 1],
                      }
                    : { delay: i * 0.03, type: "spring", stiffness: 260, damping: 22 }
                }
                style={{ transformStyle: "preserve-3d" }}
                className="relative"
              >
                <Card
                  card={faceDown ? undefined : card}
                  faceDown={faceDown || shuffling}
                  selectable={selectable && !shuffling}
                  onClick={() => onPick?.(i)}
                  highlighted={highlightedIndex === i}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
        {cards.length === 0 && (
          <span className="text-xs text-[var(--color-muted-foreground)] italic">sem cartas</span>
        )}
      </div>
    </div>
  );
}
