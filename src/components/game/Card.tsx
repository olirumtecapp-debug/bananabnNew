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

/** Carta ilustrada com animal. Estilo fofo/infantil, cantos bem arredondados. */
export function Card({ card, faceDown = false, small = false, selectable, onClick, highlighted }: CardProps) {
  const showBack = faceDown || !card;
  const w = small ? "w-11 h-16 sm:w-14 sm:h-20" : "w-20 h-28 sm:w-24 sm:h-32";

  return (
    <motion.button
      layout
      whileHover={selectable ? { y: -10, scale: 1.06, rotate: -2 } : undefined}
      whileTap={selectable ? { scale: 0.95 } : undefined}
      onClick={selectable ? onClick : undefined}
      disabled={!selectable}
      className={[
        w,
        "relative rounded-2xl card-shadow shrink-0 select-none",
        selectable ? "cursor-pointer" : "cursor-default",
        highlighted ? "pop-glow" : "",
      ].join(" ")}
      aria-label={showBack ? "Carta virada" : `Carta ${cardLabel(card!)}`}
    >
      {showBack ? <CardBack /> : <CardFace card={card!} small={small} />}
    </motion.button>
  );
}

function CardBack() {
  return (
    <div className="w-full h-full rounded-2xl overflow-hidden bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] border-4 border-white/80 flex items-center justify-center">
      <div
        className="w-[80%] h-[80%] rounded-xl border-2 border-white/70 flex items-center justify-center"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(255,255,255,0.25) 0 6px, transparent 6px 12px)",
        }}
      >
        <span className="text-2xl sm:text-3xl drop-shadow">🎈</span>
      </div>
    </div>
  );
}

function CardFace({ card, small }: { card: GameCard; small?: boolean }) {
  return (
    <div
      className="w-full h-full rounded-2xl border-4 border-white/90 flex flex-col items-center justify-center p-1"
      style={{ background: card.animal.color }}
    >
      <div className={small ? "text-2xl sm:text-3xl" : "text-4xl sm:text-5xl"}>
        {card.animal.emoji}
      </div>
      {!small && (
        <div className="mt-1 text-[10px] sm:text-xs font-bold uppercase tracking-wide text-[var(--color-ink)]/80">
          {card.animal.name}
        </div>
      )}
    </div>
  );
}
