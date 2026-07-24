import { AnimatePresence, motion } from "framer-motion";

interface SpeechBubbleProps {
  text: string | null;
  /** Direção da cauda: down (padrão) = balão acima do avatar */
  tail?: "down" | "up" | "left" | "right";
  className?: string;
}

/** Balão de fala HQ animado. Sumiu quando `text` vira null. */
export function SpeechBubble({ text, tail = "down", className = "" }: SpeechBubbleProps) {
  return (
    <AnimatePresence>
      {text && (
        <motion.div
          initial={{ opacity: 0, scale: 0.6, rotate: -6 }}
          animate={{ opacity: 1, scale: 1, rotate: -2 }}
          exit={{ opacity: 0, scale: 0.6, rotate: 4 }}
          transition={{ type: "spring", stiffness: 340, damping: 18 }}
          className={`speech-bubble text-xs sm:text-sm max-w-[180px] text-center pointer-events-none ${className}`}
          data-tail={tail}
        >
          {text}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
