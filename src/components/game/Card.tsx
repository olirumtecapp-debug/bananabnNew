import { motion } from "framer-motion";
import { cardLabel, isRedSuit, type Card as GameCard } from "@/game/mico";

interface CardProps {
  card?: GameCard;         // se undefined, mostra dorso
  faceDown?: boolean;
  small?: boolean;
  selectable?: boolean;
  onClick?: () => void;
  highlighted?: boolean;
}

/** Uma carta de baralho. Face para cima mostra rank/naipe, dorso mostra padrão dourado. */
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
      aria-label={showBack ? "Carta virada" : `Carta ${cardLabel(card!)}${card!.suit ?? ""}`}
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
  const red = isRedSuit(card.suit);
  if (card.isMico) {
    return (
      <div className="w-full h-full rounded-lg bg-[var(--color-paper)] text-[var(--color-ink)] flex flex-col items-center justify-center px-1">
        <div className="text-2xl sm:text-3xl">🐒</div>
        <div className={`${small ? "text-[10px]" : "text-xs"} font-black tracking-wider uppercase`}>Mico</div>
      </div>
    );
  }
  const label = cardLabel(card);
  return (
    <div className={`w-full h-full rounded-lg bg-[var(--color-paper)] text-[var(--color-ink)] p-1 sm:p-1.5 flex flex-col justify-between ${red ? "text-[var(--color-red)]" : ""}`}>
      <div className="flex flex-col items-start leading-none">
        <span className={`${small ? "text-xs" : "text-sm sm:text-base"} font-bold`}>{label}</span>
        <span className={`${small ? "text-xs" : "text-sm"}`}>{card.suit}</span>
      </div>
      <div className={`self-center ${small ? "text-lg" : "text-2xl sm:text-3xl"}`}>{card.suit}</div>
      <div className="flex flex-col items-end leading-none rotate-180">
        <span className={`${small ? "text-xs" : "text-sm sm:text-base"} font-bold`}>{label}</span>
        <span className={`${small ? "text-xs" : "text-sm"}`}>{card.suit}</span>
      </div>
    </div>
  );
}
