import { useState } from "react";
import { AVATARES, type Avatar } from "@/data/avatares";
import { fala } from "@/data/dialogos";

interface AvatarPickerProps {
  value: string;
  onChange: (id: string) => void;
  compact?: boolean;
}

/** Grid de avatares HQ selecionáveis com uma prévia de personalidade. */
export function AvatarPicker({ value, onChange, compact }: AvatarPickerProps) {
  const [preview] = useState(() => new Map<string, string>());
  const previewFor = (a: Avatar) => {
    if (!preview.has(a.id)) preview.set(a.id, fala("inicio", a.personalidade) ?? a.nome);
    return preview.get(a.id)!;
  };
  const dim = compact ? 56 : 72;
  return (
    <div className="grid grid-cols-5 gap-2 sm:gap-3">
      {AVATARES.map((a) => {
        const selected = a.id === value;
        return (
          <button
            key={a.id}
            type="button"
            onClick={() => onChange(a.id)}
            className="flex flex-col items-center gap-1 focus:outline-none"
            title={previewFor(a)}
            aria-label={`Escolher ${a.nome}`}
            aria-pressed={selected}
          >
            <div
              className="rounded-full overflow-hidden transition-transform"
              style={{
                width: dim,
                height: dim,
                background: a.cor,
                border: "3px solid var(--ink)",
                boxShadow: selected
                  ? "4px 4px 0 var(--ink), 0 0 0 4px var(--hq-primary)"
                  : "3px 3px 0 var(--ink)",
                transform: selected ? "translate(-2px,-2px)" : undefined,
              }}
            >
              <img
                src={a.url}
                alt={a.nome}
                width={dim}
                height={dim}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <span
              className="text-[10px] sm:text-xs truncate max-w-[70px]"
              style={{
                fontFamily: "var(--font-display)",
                letterSpacing: "0.03em",
                color: "var(--ink)",
              }}
            >
              {a.nome.split(" ")[0]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
