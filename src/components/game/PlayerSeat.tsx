import { motion } from "framer-motion";
import type { Avatar } from "@/data/avatares";
import { SpeechBubble } from "./SpeechBubble";

interface PlayerSeatProps {
  avatar: Avatar;
  name: string;
  cardsCount: number;
  isTurn?: boolean;
  isTarget?: boolean;
  finished?: boolean;
  speech?: string | null;
  size?: "sm" | "md";
}

/** Assento de jogador com avatar redondo estilo HQ, contorno preto grosso, anel pulsante quando é a vez. */
export function PlayerSeat({
  avatar,
  name,
  cardsCount,
  isTurn,
  isTarget,
  finished,
  speech,
  size = "md",
}: PlayerSeatProps) {
  const dim = size === "sm" ? 56 : 72;
  return (
    <div className="relative flex flex-col items-center gap-1">
      {speech && (
        <div className="absolute -top-14 left-1/2 -translate-x-1/2 z-10">
          <SpeechBubble text={speech} />
        </div>
      )}
      <motion.div
        animate={isTurn ? { scale: [1, 1.05, 1] } : { scale: 1 }}
        transition={isTurn ? { repeat: Infinity, duration: 1.1 } : { duration: 0.2 }}
        className="relative"
        style={{ width: dim, height: dim }}
      >
        <div
          className="w-full h-full rounded-full overflow-hidden"
          style={{
            background: avatar.cor,
            border: "3px solid var(--ink)",
            boxShadow: isTurn
              ? "4px 4px 0 var(--ink), 0 0 0 4px var(--hq-primary)"
              : isTarget
              ? "4px 4px 0 var(--ink), 0 0 0 4px var(--hq-secondary)"
              : "3px 3px 0 var(--ink)",
          }}
        >
          <img
            src={avatar.url}
            alt={avatar.nome}
            width={dim}
            height={dim}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        {finished && (
          <div
            className="absolute -top-2 -right-2 text-2xl"
            style={{ filter: "drop-shadow(2px 2px 0 var(--ink))" }}
          >
            👑
          </div>
        )}
      </motion.div>
      <div
        className="px-2 py-0.5 text-center max-w-[110px]"
        style={{
          background: "var(--ink)",
          color: "var(--paper)",
          border: "2px solid var(--ink)",
          borderRadius: 8,
          fontFamily: "var(--font-display)",
          letterSpacing: "0.04em",
          fontSize: size === "sm" ? 11 : 13,
          lineHeight: 1.2,
        }}
      >
        <div className="truncate">{name}</div>
        <div style={{ fontSize: 10, opacity: 0.85 }}>
          {cardsCount} {cardsCount === 1 ? "carta" : "cartas"}
        </div>
      </div>
    </div>
  );
}
