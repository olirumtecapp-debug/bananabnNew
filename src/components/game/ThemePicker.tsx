import { useEffect, useRef, useState } from "react";
import { Palette, Check } from "lucide-react";
import { usePrefs } from "@/hooks/usePrefs";
import type { TableTheme } from "@/lib/storage";

interface ThemeSwatch {
  id: TableTheme;
  name: string;
  felt: string;
  gold: string;
  paper: string;
}

const THEMES: ThemeSwatch[] = [
  { id: "classic", name: "Cassino Clássico", felt: "oklch(0.28 0.06 155)", gold: "oklch(0.82 0.14 82)", paper: "oklch(0.97 0.02 90)" },
  { id: "bordo",   name: "Royal Bordô",      felt: "oklch(0.32 0.11 18)",  gold: "oklch(0.85 0.11 88)", paper: "oklch(0.97 0.02 85)" },
  { id: "safari",  name: "Safári Areia",     felt: "oklch(0.44 0.08 65)",  gold: "oklch(0.72 0.16 55)", paper: "oklch(0.96 0.03 80)" },
  { id: "ocean",   name: "Oceano Noturno",   felt: "oklch(0.32 0.08 220)", gold: "oklch(0.88 0.02 230)", paper: "oklch(0.96 0.02 220)" },
  { id: "pastel",  name: "Festa Pastel",     felt: "oklch(0.44 0.10 340)", gold: "oklch(0.78 0.16 20)", paper: "oklch(0.98 0.01 340)" },
];

/** Botão de ambiente com popover para escolher o tema da mesa. */
export function ThemePicker() {
  const { prefs, update } = usePrefs();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-full p-2 bg-[var(--color-felt-deep)]/60 border border-[var(--color-gold)]/30 hover:bg-[var(--color-felt-deep)] transition"
        aria-label="Escolher ambiente"
        title="Ambiente da mesa"
      >
        <Palette className="size-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 w-64 rounded-2xl border border-[var(--color-gold)]/40 bg-[var(--color-popover)] shadow-2xl p-2">
          <div className="px-2 py-1 text-[10px] uppercase tracking-widest text-[var(--color-muted-foreground)]">
            Ambiente da mesa
          </div>
          <ul className="space-y-1">
            {THEMES.map((t) => {
              const active = (prefs.table ?? "classic") === t.id;
              return (
                <li key={t.id}>
                  <button
                    onClick={() => {
                      update({ table: t.id });
                      setOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-[var(--color-felt-deep)]/60 transition ${
                      active ? "bg-[var(--color-felt-deep)]/70" : ""
                    }`}
                  >
                    <span
                      className="relative shrink-0 rounded-md overflow-hidden border border-[var(--color-gold)]/40"
                      style={{ width: 40, height: 26, background: t.felt }}
                      aria-hidden
                    >
                      <span
                        className="absolute left-1 top-1 rounded-sm"
                        style={{ width: 10, height: 14, background: t.paper, boxShadow: "0 1px 2px rgba(0,0,0,0.3)" }}
                      />
                      <span
                        className="absolute right-1 top-1 rounded-sm"
                        style={{ width: 10, height: 14, background: t.paper, boxShadow: "0 1px 2px rgba(0,0,0,0.3)" }}
                      />
                      <span
                        className="absolute inset-x-1 bottom-1 h-[3px] rounded-full"
                        style={{ background: t.gold }}
                      />
                    </span>
                    <span className="flex-1 truncate">{t.name}</span>
                    {active && <Check className="size-4 text-[var(--color-gold)]" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
