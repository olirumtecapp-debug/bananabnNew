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

/**
 * Carta estilo HQ: contorno preto grosso, sombra chapada offset,
 * fundo branco papel, título em Bangers e emoji da fruta com halo.
 */
export function Card({ card, faceDown = false, small = false, selectable, onClick, highlighted }: CardProps) {
  const showBack = faceDown || !card;
  const w = small ? "w-10 h-14 sm:w-12 sm:h-16" : "w-16 h-24 sm:w-20 sm:h-28";

  return (
    <motion.button
      layout
      whileHover={selectable ? { y: -10, rotate: -2, scale: 1.05 } : undefined}
      whileTap={selectable ? { scale: 0.95, y: 0 } : undefined}
      onClick={selectable ? onClick : undefined}
      disabled={!selectable}
      className={[
        w,
        "relative rounded-xl card-shadow shrink-0 select-none",
        selectable ? "cursor-pointer" : "cursor-default",
        highlighted ? "pulse-ring" : "",
      ].join(" ")}
      style={{ border: `${small ? 2.5 : 3}px solid var(--ink)`, background: "var(--hq-panel)" }}
      aria-label={showBack ? "Carta virada" : `Carta ${cardLabel(card!)}`}
    >
      {showBack ? <CardBack small={small} /> : <CardFace card={card!} small={small} />}
    </motion.button>
  );
}

function CardBack({ small }: { small?: boolean }) {
  return (
    <div
      className="relative w-full h-full rounded-[8px] overflow-hidden"
      style={{
        background: `
          radial-gradient(circle, color-mix(in oklab, var(--ink) 40%, transparent) 1.5px, transparent 2px)
        `,
        backgroundSize: "8px 8px",
        backgroundColor: "var(--hq-secondary)",
      }}
    >
      {/* Faixa central com "B" */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="flex items-center justify-center rounded-full"
          style={{
            width: small ? 26 : 42,
            height: small ? 26 : 42,
            background: "var(--hq-primary)",
            border: `${small ? 2 : 2.5}px solid var(--ink)`,
            boxShadow: small ? "2px 2px 0 var(--ink)" : "3px 3px 0 var(--ink)",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: small ? 16 : 24,
              color: "var(--ink)",
              lineHeight: 1,
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
    <div className="relative w-full h-full rounded-[8px] overflow-hidden">
      {/* fundo com halo colorido da fruta */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 45%, ${card.animal.color} 0%, #fff 78%)`,
        }}
      />

      {/* action lines sutis quando é Mico */}
      {isMico && (
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "conic-gradient(from 0deg, transparent 0 6deg, color-mix(in oklab, var(--ink) 25%, transparent) 6deg 8deg, transparent 8deg 18deg)",
          }}
        />
      )}

      {/* Halftone pattern overlay leve */}
      <div
        className="absolute inset-0 opacity-25 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, color-mix(in oklab, var(--ink) 60%, transparent) 0.8px, transparent 1.5px)",
          backgroundSize: "6px 6px",
        }}
      />

      {/* nome topo-esq em faixa */}
      <span
        className={`absolute top-1 left-1 leading-none px-1 rounded-sm ${
          small ? "text-[8px]" : "text-[10px] sm:text-[11px]"
        }`}
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--ink)",
          background: "var(--hq-primary)",
          border: "1.5px solid var(--ink)",
          letterSpacing: "0.05em",
        }}
      >
        {small ? card.animal.name.slice(0, 3) : card.animal.name}
      </span>
      {/* nome baixo-dir invertido */}
      <span
        className={`absolute bottom-1 right-1 leading-none px-1 rounded-sm rotate-180 ${
          small ? "text-[8px]" : "text-[10px] sm:text-[11px]"
        }`}
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--ink)",
          background: "var(--hq-primary)",
          border: "1.5px solid var(--ink)",
          letterSpacing: "0.05em",
        }}
      >
        {small ? card.animal.name.slice(0, 3) : card.animal.name}
      </span>

      {/* emoji central grande */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={`relative ${small ? "text-2xl" : "text-4xl sm:text-5xl"}`}
          style={{ filter: "drop-shadow(2px 2px 0 var(--ink))" }}
        >
          {card.animal.emoji}
        </span>
      </div>

      {isMico && !small && (
        <span
          className="absolute -top-1 -right-1 rotate-12 text-[9px] px-1.5 py-0.5"
          style={{
            fontFamily: "var(--font-display)",
            background: "var(--hq-secondary)",
            color: "#fff",
            border: "1.5px solid var(--ink)",
            letterSpacing: "0.06em",
          }}
        >
          MICO!
        </span>
      )}
    </div>
  );
}
