import { useCallback, useEffect, useState } from "react";
import { DEFAULT_PREFS, getPrefs, setPrefs as writePrefs, type Prefs } from "@/lib/storage";

/** Hook client-side para tema, som e nome. Aplica classe .light no <html> automaticamente. */
export function usePrefs() {
  const [prefs, setPrefsState] = useState<Prefs>(DEFAULT_PREFS);

  useEffect(() => {
    const loaded = getPrefs();
    setPrefsState(loaded);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (prefs.theme === "light") root.classList.add("light");
    else root.classList.remove("light");
  }, [prefs.theme]);

  const update = useCallback((patch: Partial<Prefs>) => {
    const next = writePrefs(patch);
    setPrefsState(next);
  }, []);

  return { prefs, update };
}
