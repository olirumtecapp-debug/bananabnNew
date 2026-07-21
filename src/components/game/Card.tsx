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

/** Carta com face em papel marfim, moldura dourada e ilustração da fruta. */
export function Card({ card, faceDown = false, small = false, selectable, onClick, highlighted }: CardProps) {
  const showBack = faceDown || !card;
  const w = small ? "w-10 h-14 sm:w-12 sm:h-16" : "w-16 h-24 sm:w-20 sm:h-28";

  return (
    <motion.button
      layout
      whileHover={selectable ? { y: -10, scale: 1.05 } : undefined}
      whileTap={selectable ? { scale: 0.97 } : undefined}
      onClick={selectable ? onClick : undefined}
      disabled={!selectable}
      className={[
        w,
        "relative rounded-xl card-shadow shrink-0 select-none",
        selectable ? "cursor-pointer" : "cursor-default",
        highlighted ? "pulse-ring" : "",
      ].join(" ")}
      aria-label={showBack ? "Carta virada" : `Carta ${cardLabel(card!)}`}
    >
      {showBack ? <CardBack small={small} /> : <CardFace card={card!} small={small} />}
    </motion.button>
  );
}

function CardBack({ small }: { small?: boolean }) {
  return (
    <div className="w-full h-full rounded-xl overflow-hidden bg-gradient-to-br from-[oklch(0.38_0.09_155)] via-[oklch(0.28_0.07_155)] to-[oklch(0.16_0.05_155)] border border-[var(--color-gold)]/60 shimmer">
      {/* moldura dupla */}
      <div className="absolute inset-[3px] rounded-[10px] border border-[var(--color-gold)]/40" />
      <div
        className="absolute inset-[7px] rounded-[8px] border border-[var(--color-gold)]/30"
        style={{
          backgroundImage: `
            repeating-linear-gradient(45deg,  oklch(0.82 0.14 82 / 0.14) 0 2px, transparent 2px 9px),
            repeating-linear-gradient(-45deg, oklch(0.82 0.14 82 / 0.14) 0 2px, transparent 2px 9px)
          `,
        }}
      />
      {/* monograma central */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative flex items-center justify-center">
          <div
            className="absolute rounded-full"
            style={{
              width: small ? 22 : 36,
              height: small ? 22 : 36,
              background:
                "radial-gradient(circle, oklch(0.82 0.14 82 / 0.35) 0%, transparent 70%)",
            }}
          />
          <span
            className="gold-text font-black relative"
            style={{
              fontFamily: "var(--font-display, serif)",
              fontSize: small ? 14 : 22,
              lineHeight: 1,
              textShadow: "0 1px 0 rgba(0,0,0,0.4)",
            }}
          >
            B
          </span>
        </div>
      </div>
    </div>
  );
}

function CardFace({ card, small }: { card: GameCard; small?: boolean }) {
  const isMico = card.isMico;
  return (
    <div
      className={[
        "relative w-full h-full rounded-xl overflow-hidden text-[var(--color-ink)]",
        isMico ? "ring-2 ring-[var(--color-gold)]" : "",
      ].join(" ")}
      style={{
        background: `
          radial-gradient(ellipse at 50% 35%, ${card.animal.color} 0%, transparent 60%),
          linear-gradient(180deg, var(--color-paper) 0%, oklch(0.94 0.03 90) 100%)
        `,
      }}
    >
      {/* moldura dupla dourada */}
      <div className="absolute inset-[2px] rounded-[10px] border border-[var(--color-gold)]/55 pointer-events-none" />
      <div className="absolute inset-[5px] rounded-[8px] border border-[var(--color-gold)]/25 pointer-events-none" />

      {/* textura papel */}
      <div
        className="absolute inset-0 opacity-40 mix-blend-multiply pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, oklch(0.85 0.02 90 / 0.25) 0 1px, transparent 1px 3px)",
        }}
      />

      {/* nome topo-esq */}
      <span
        className={`absolute top-1 left-1.5 font-black uppercase tracking-wide leading-none ${
          small ? "text-[8px]" : "text-[9px] sm:text-[10px]"
        }`}
        style={{ color: "var(--color-ink)" }}
      >
        {small ? card.animal.name.slice(0, 3) : card.animal.name}
      </span>
      {/* nome baixo-dir invertido */}
      <span
        className={`absolute bottom-1 right-1.5 font-black uppercase tracking-wide leading-none rotate-180 ${
          small ? "text-[8px]" : "text-[9px] sm:text-[10px]"
        }`}
        style={{ color: "var(--color-ink)" }}
      >
        {small ? card.animal.name.slice(0, 3) : card.animal.name}
      </span>

      {/* halo + emoji central */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="absolute rounded-full"
          style={{
            width: small ? "60%" : "70%",
            height: small ? "60%" : "70%",
            background: `radial-gradient(circle, ${card.animal.color} 0%, transparent 65%)`,
            filter: "blur(2px)",
          }}
        />
        <span
          className={`relative ${small ? "text-2xl" : "text-3xl sm:text-4xl"}`}
          style={{ filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.18))" }}
        >
          {card.animal.emoji}
        </span>
      </div>

      {isMico && (
        <div
          className="absolute inset-0 pointer-events-none rounded-xl"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, oklch(0.82 0.14 82 / 0.15) 0%, transparent 70%)",
          }}
        />
      )}
    </div>
  );
}
