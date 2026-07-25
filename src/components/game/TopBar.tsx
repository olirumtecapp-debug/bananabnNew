import { Link } from "@tanstack/react-router";
import { usePrefs } from "@/hooks/usePrefs";
import { Moon, Sun, Volume2, VolumeX, Home, Heart } from "lucide-react";
import { ThemePicker } from "./ThemePicker";

interface TopBarProps {
  title?: string;
  showBack?: boolean;
}

/** Barra superior estilo HQ com botões quadrados de borda preta. */
export function TopBar({ title, showBack }: TopBarProps) {
  const { prefs, update } = usePrefs();
  const btn =
    "rounded-lg p-2 transition inline-flex items-center justify-center";
  const btnStyle = {
    background: "var(--hq-panel)",
    color: "var(--ink)",
    border: "2.5px solid var(--ink)",
    boxShadow: "3px 3px 0 var(--ink)",
  } as const;
  return (
    <>
    <div className="hq-stripe" aria-hidden />
    <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 px-3 sm:px-6 py-3">

      {showBack ? (
        <Link to="/" className={`${btn} gap-1 px-3`} style={btnStyle} aria-label="Voltar ao menu">
          <Home className="size-4" />
          <span
            className="hidden sm:inline text-sm"
            style={{ fontFamily: "var(--font-display)", letterSpacing: "0.05em" }}
          >
            MENU
          </span>
        </Link>
      ) : (
        <span />
      )}
      <h1 className="truncate text-center hq-title text-2xl sm:text-3xl">
        {title ?? "BANANA!"}
      </h1>
      <div className="flex items-center gap-2 shrink-0">
        <ThemePicker />
        <Link
          to="/doacao"
          className={btn}
          style={{ ...btnStyle, background: "var(--hq-accent)", color: "#fff" }}
          aria-label="Doação"
          title="Apoie o projeto"
        >
          <Heart className="size-4 fill-current" />
        </Link>
        <button
          onClick={() => update({ sound: !prefs.sound })}
          className={btn}
          style={btnStyle}
          aria-label={prefs.sound ? "Silenciar" : "Ativar som"}
          title={prefs.sound ? "Som ligado" : "Som desligado"}
        >
          {prefs.sound ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
        </button>
        <button
          onClick={() => update({ theme: prefs.theme === "dark" ? "light" : "dark" })}
          className={btn}
          style={btnStyle}
          aria-label="Alternar tema"
          title="Alternar tema"
        >
          {prefs.theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>
      </div>
    </header>
    </>
  );
}
