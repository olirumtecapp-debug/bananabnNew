import { useEffect, useRef, useState } from "react";
import { Palette, Check } from "lucide-react";
import { usePrefs } from "@/hooks/usePrefs";
import type { TableTheme } from "@/lib/storage";

interface ThemeSwatch {
  id: TableTheme;
  name: string;
  bg: string;
  dot: string;
  accent: string;
}

/** Presets HQ — cores refletem as variáveis --hq-* de cada tema. */
const THEMES: ThemeSwatch[] = [
  { id: "classic", name: "Amarelo POW!",   bg: "#fff2b3", dot: "#f7c53a", accent: "#e63946" },
  { id: "bordo",   name: "Vermelho ZAP!",  bg: "#ffd1d1", dot: "#e63946", accent: "#f7c53a" },
  { id: "safari",  name: "Areia BOOM!",    bg: "#ffe0b3", dot: "#e07a2b", accent: "#ffb347" },
  { id: "ocean",   name: "Azul WHAM!",     bg: "#bfe4ff", dot: "#1d6fb8", accent: "#ffd83a" },
  { id: "pastel",  name: "Rosa KAPOW!",    bg: "#ffd6ec", dot: "#ff4fa3", accent: "#a06bff" },
];

/** Seletor de ambiente estilo HQ. */
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
        className="rounded-lg p-2 inline-flex items-center justify-center"
        style={{
          background: "var(--hq-panel)",
          color: "var(--ink)",
          border: "2.5px solid var(--ink)",
          boxShadow: "3px 3px 0 var(--ink)",
        }}
        aria-label="Escolher ambiente"
        title="Ambiente da mesa"
      >
        <Palette className="size-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 w-64 hq-panel p-2">
          <div
            className="px-2 py-1 text-[11px]"
            style={{ fontFamily: "var(--font-display)", letterSpacing: "0.06em", color: "var(--ink)" }}
          >
            AMBIENTE
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
                    className="w-full flex items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition"
                    style={{
                      background: active ? "var(--hq-primary)" : "transparent",
                      color: "var(--ink)",
                      border: active ? "2px solid var(--ink)" : "2px solid transparent",
                      fontFamily: "Comic Neue, sans-serif",
                      fontWeight: 700,
                    }}
                  >
                    <span
                      className="relative shrink-0 rounded-md overflow-hidden"
                      style={{
                        width: 44,
                        height: 28,
                        background: t.bg,
                        backgroundImage: `radial-gradient(circle, ${t.dot} 1.2px, transparent 1.8px)`,
                        backgroundSize: "6px 6px",
                        border: "2px solid var(--ink)",
                      }}
                      aria-hidden
                    >
                      <span
                        className="absolute right-1 top-1 rounded-sm"
                        style={{ width: 10, height: 12, background: t.accent, border: "1.5px solid var(--ink)" }}
                      />
                    </span>
                    <span className="flex-1 truncate">{t.name}</span>
                    {active && <Check className="size-4" style={{ color: "var(--ink)" }} />}
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
