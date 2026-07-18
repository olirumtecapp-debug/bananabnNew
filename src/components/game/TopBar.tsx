import { Link } from "@tanstack/react-router";
import { usePrefs } from "@/hooks/usePrefs";
import { Moon, Sun, Volume2, VolumeX, Home } from "lucide-react";

interface TopBarProps {
  title?: string;
  showBack?: boolean;
}

/** Barra superior com toggle de tema, som e botão home. */
export function TopBar({ title, showBack }: TopBarProps) {
  const { prefs, update } = usePrefs();
  return (
    <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 px-3 sm:px-6 py-3">
      {showBack ? (
        <Link
          to="/"
          className="inline-flex items-center gap-1 rounded-full bg-[var(--color-felt-deep)]/60 border border-[var(--color-gold)]/30 px-3 py-1.5 text-sm hover:bg-[var(--color-felt-deep)] transition"
          aria-label="Voltar ao menu"
        >
          <Home className="size-4" />
          <span className="hidden sm:inline">Menu</span>
        </Link>
      ) : (
        <span />
      )}
      <h1 className="truncate text-center font-display text-lg sm:text-xl gold-text">
        {title ?? "Banana"}
      </h1>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => update({ sound: !prefs.sound })}
          className="rounded-full p-2 bg-[var(--color-felt-deep)]/60 border border-[var(--color-gold)]/30 hover:bg-[var(--color-felt-deep)] transition"
          aria-label={prefs.sound ? "Silenciar" : "Ativar som"}
          title={prefs.sound ? "Som ligado" : "Som desligado"}
        >
          {prefs.sound ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
        </button>
        <button
          onClick={() => update({ theme: prefs.theme === "dark" ? "light" : "dark" })}
          className="rounded-full p-2 bg-[var(--color-felt-deep)]/60 border border-[var(--color-gold)]/30 hover:bg-[var(--color-felt-deep)] transition"
          aria-label="Alternar tema"
          title="Alternar tema"
        >
          {prefs.theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>
      </div>
    </header>
  );
}
