/**
 * Persistência local (localStorage) para estatísticas, preferências e id do jogador.
 * Tudo é lido/escrito apenas no cliente, com try/catch para SSR.
 */

const isBrowser = typeof window !== "undefined";

export function readJSON<T>(key: string, fallback: T): T {
  if (!isBrowser) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJSON<T>(key: string, value: T): void {
  if (!isBrowser) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export interface Stats {
  games: number;
  wins: number;
  losses: number;
  currentStreak: number;
  bestStreak: number;
}

export const DEFAULT_STATS: Stats = {
  games: 0,
  wins: 0,
  losses: 0,
  currentStreak: 0,
  bestStreak: 0,
};

export function recordResult(won: boolean): Stats {
  const cur = readJSON<Stats>("mico:stats", DEFAULT_STATS);
  const next: Stats = {
    games: cur.games + 1,
    wins: cur.wins + (won ? 1 : 0),
    losses: cur.losses + (won ? 0 : 1),
    currentStreak: won ? cur.currentStreak + 1 : 0,
    bestStreak: won ? Math.max(cur.bestStreak, cur.currentStreak + 1) : cur.bestStreak,
  };
  writeJSON("mico:stats", next);
  return next;
}

export function getStats(): Stats {
  return readJSON<Stats>("mico:stats", DEFAULT_STATS);
}

export function resetStats(): void {
  writeJSON("mico:stats", DEFAULT_STATS);
}

/** Preferências: tema (dark|light), som ligado, nome do jogador, ambiente da mesa */
export type TableTheme = "classic" | "bordo" | "safari" | "ocean" | "pastel";

export interface Prefs {
  theme: "dark" | "light";
  sound: boolean;
  name: string;
  table: TableTheme;
}

export const DEFAULT_PREFS: Prefs = { theme: "light", sound: true, name: "", table: "classic" };

export function getPrefs(): Prefs {
  return readJSON<Prefs>("mico:prefs", DEFAULT_PREFS);
}

export function setPrefs(p: Partial<Prefs>): Prefs {
  const cur = getPrefs();
  const next = { ...cur, ...p };
  writeJSON("mico:prefs", next);
  return next;
}

/** Id do jogador (usado no multiplayer para identificar quem é quem sem login). */
export function getPlayerId(): string {
  if (!isBrowser) return "";
  let id = localStorage.getItem("mico:playerId");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("mico:playerId", id);
  }
  return id;
}
