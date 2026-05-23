import { useCallback, useEffect, useState } from "react";
import { useTelegram } from "@/hooks/useTelegram";
import {
  applyThemeMode,
  getStoredTheme,
  initTheme,
  resolveTheme,
  type ResolvedTheme,
  type ThemeMode,
} from "@/lib/theme";

export function useAppTheme() {
  const { webApp } = useTelegram();
  const [mode, setMode] = useState<ThemeMode>(() => getStoredTheme());
  const [resolved, setResolved] = useState<ResolvedTheme>("dark");

  useEffect(() => {
    const result = initTheme(webApp ?? undefined);
    setMode(result.mode);
    setResolved(result.resolved);
  }, [webApp]);

  useEffect(() => {
    if (mode !== "auto") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => {
      const next = resolveTheme("auto", webApp?.colorScheme);
      setResolved(next);
      import("@/lib/theme").then(({ applyTheme }) =>
        applyTheme(next, webApp ?? undefined),
      );
    };
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [mode, webApp]);

  const setTheme = useCallback(
    (next: ThemeMode) => {
      const r = applyThemeMode(next, webApp ?? undefined);
      setMode(next);
      setResolved(r);
    },
    [webApp],
  );

  return { mode, resolved, setTheme, isDark: resolved === "dark" };
}
