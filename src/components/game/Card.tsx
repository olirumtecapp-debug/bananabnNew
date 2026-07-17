import { motion } from "framer-motion";
import { cardLabel, type Card as GameCard } from "@/game/mico";

interface CardProps {
  card?: GameCard;
  faceDown?: boolean;
  small?: boolean;
  selectable?: boolean;
  onClick?: () => void;
  highlighted?: boolean;
}

/** Carta com face em papel marfim e ilustração do animal. Dorso em verde/dourado. */
export function Card({ card, faceDown = false, small = false, selectable, onClick, highlighted }: CardProps) {
  const showBack = faceDown || !card;
  const w = small ? "w-10 h-14 sm:w-12 sm:h-16" : "w-16 h-24 sm:w-20 sm:h-28";

  return (
    <motion.button
      layout
      whileHover={selectable ? { y: -8, scale: 1.04 } : undefined}
      whileTap={selectable ? { scale: 0.97 } : undefined}
      onClick={selectable ? onClick : undefined}
      disabled={!selectable}
      className={[
        w,
        "relative rounded-lg card-shadow shrink-0 select-none",
        selectable ? "cursor-pointer" : "cursor-default",
        highlighted ? "gold-glow" : "",
      ].join(" ")}
      aria-label={showBack ? "Carta virada" : `Carta ${cardLabel(card!)}`}
    >
      {showBack ? <CardBack /> : <CardFace card={card!} small={small} />}
    </motion.button>
  );
}

function CardBack() {
  return (
    <div className="w-full h-full rounded-lg overflow-hidden bg-gradient-to-br from-[oklch(0.35_0.08_155)] to-[oklch(0.18_0.05_155)] border border-[var(--color-gold)]/40 flex items-center justify-center">
      <div
        className="w-[85%] h-[85%] rounded-md border border-[var(--color-gold)]/50"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, oklch(0.82 0.14 82 / 0.15) 0 6px, transparent 6px 12px)",
        }}
      >
        <div className="w-full h-full flex items-center justify-center">
          <span className="gold-text text-lg sm:text-xl font-bold" style={{ fontFamily: "var(--font-display, serif)" }}>M</span>
        </div>
      </div>
    </div>
  );
}

function CardFace({ card, small }: { card: GameCard; small?: boolean }) {
  return (
    <div
      className="w-full h-full rounded-lg bg-[var(--color-paper)] text-[var(--color-ink)] p-1 flex flex-col items-center justify-between overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(180deg, ${card.animal.color} 0%, var(--color-paper) 70%)`,
      }}
    >
      <span className={`${small ? "text-[9px]" : "text-[10px] sm:text-xs"} font-bold uppercase tracking-wide self-start leading-none`}>
        {small ? card.animal.name.slice(0, 3) : card.animal.name}
      </span>
      <span className={small ? "text-xl sm:text-2xl" : "text-3xl sm:text-4xl"}>
        {card.animal.emoji}
      </span>
      <span className={`${small ? "text-[9px]" : "text-[10px] sm:text-xs"} font-bold uppercase tracking-wide self-end rotate-180 leading-none`}>
        {small ? card.animal.name.slice(0, 3) : card.animal.name}
      </span>
    </div>
  );
}
