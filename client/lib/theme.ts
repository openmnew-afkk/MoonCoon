export type ThemeMode = "light" | "dark" | "auto";
export type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "vexora-theme";

const TELEGRAM_COLORS = {
  light: { header: "#fafafa", background: "#fafafa" },
  dark:  { header: "#0a0a0a", background: "#0a0a0a" },
} as const;

export function getStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return "dark";
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === "light" || raw === "dark" || raw === "auto") return raw;
  return "dark";
}

export function setStoredTheme(mode: ThemeMode): void {
  localStorage.setItem(STORAGE_KEY, mode);
}

export function resolveTheme(
  mode: ThemeMode,
  telegramScheme?: "light" | "dark",
): ResolvedTheme {
  if (mode === "light") return "light";
  if (mode === "dark") return "dark";
  if (telegramScheme === "light" || telegramScheme === "dark") {
    return telegramScheme;
  }
  if (typeof window !== "undefined") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return "dark";
}

export function applyTheme(
  resolved: ResolvedTheme,
  webApp?: {
    setHeaderColor?: (color: string) => void;
    setBackgroundColor?: (color: string) => void;
  },
): void {
  const root = document.documentElement;
  root.classList.toggle("dark", resolved === "dark");
  root.classList.toggle("light", resolved === "light");
  root.style.colorScheme = resolved;
  root.dataset.theme = resolved;

  document.body.style.backgroundColor = "";
  document.body.style.color = "";

  const colors = TELEGRAM_COLORS[resolved];
  if (webApp?.setHeaderColor) webApp.setHeaderColor(colors.header);
  if (webApp?.setBackgroundColor) webApp.setBackgroundColor(colors.background);
}

export function initTheme(
  webApp?: {
    colorScheme?: "light" | "dark";
    setHeaderColor?: (color: string) => void;
    setBackgroundColor?: (color: string) => void;
  },
): { mode: ThemeMode; resolved: ResolvedTheme } {
  const mode = getStoredTheme();
  const resolved = resolveTheme(mode, webApp?.colorScheme);
  applyTheme(resolved, webApp);
  return { mode, resolved };
}

export function applyThemeMode(
  mode: ThemeMode,
  webApp?: {
    colorScheme?: "light" | "dark";
    setHeaderColor?: (color: string) => void;
    setBackgroundColor?: (color: string) => void;
  },
): ResolvedTheme {
  setStoredTheme(mode);
  const resolved = resolveTheme(mode, webApp?.colorScheme);
  applyTheme(resolved, webApp);
  return resolved;
}

/** For splash before React — read storage only */
export function getInitialResolvedTheme(): ResolvedTheme {
  const mode = getStoredTheme();
  return resolveTheme(mode);
}
