import { Check } from "lucide-react";
import { usePrefs } from "@/hooks/usePrefs";
import { TABLE_THEMES } from "@/lib/tables";

/** Galeria grande de ambientes de mesa, usada no menu principal antes de iniciar a partida. */
export function ThemeGallery() {
  const { prefs, update } = usePrefs();
  const current = prefs.table ?? "classic";

  return (
    <section className="rounded-2xl bg-[var(--color-felt-deep)]/70 border border-[var(--color-gold)]/30 p-5">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-lg font-bold">Ambiente da mesa</h2>
        <span className="text-xs text-[var(--color-muted-foreground)]">
          Escolha antes de começar
        </span>
      </div>
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {TABLE_THEMES.map((t) => {
          const active = current === t.id;
          return (
            <button
              key={t.id}
              onClick={() => update({ table: t.id })}
              className={`group relative rounded-xl border p-2 text-left transition ${
                active
                  ? "border-[var(--color-gold)] bg-[var(--color-felt-deep)]/80 gold-glow"
                  : "border-[var(--color-gold)]/25 hover:border-[var(--color-gold)]/60 bg-[var(--color-felt-deep)]/40"
              }`}
              aria-pressed={active}
              aria-label={`Ambiente ${t.name}`}
            >
              <span
                className="relative block w-full aspect-[5/3] rounded-lg overflow-hidden border border-[var(--color-gold)]/30"
                style={{ background: t.felt }}
                aria-hidden
              >
                <span
                  className="absolute left-2 top-2 rounded-sm rotate-[-6deg]"
                  style={{ width: 22, height: 30, background: t.paper, boxShadow: "0 2px 4px rgba(0,0,0,0.35)" }}
                />
                <span
                  className="absolute right-2 top-2 rounded-sm rotate-[6deg]"
                  style={{ width: 22, height: 30, background: t.paper, boxShadow: "0 2px 4px rgba(0,0,0,0.35)" }}
                />
                <span
                  className="absolute inset-x-2 bottom-2 h-[4px] rounded-full"
                  style={{ background: t.gold }}
                />
              </span>
              <div className="mt-2 flex items-center justify-between gap-1">
                <span className="text-sm font-semibold truncate">{t.name}</span>
                {active && <Check className="size-4 shrink-0 text-[var(--color-gold)]" />}
              </div>
              <p className="text-[11px] text-[var(--color-muted-foreground)] line-clamp-2">
                {t.description}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
