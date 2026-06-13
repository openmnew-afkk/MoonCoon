import type { MovieCard } from "./api";

const STORAGE_KEY = "vseok_history";
const MAX_ITEMS = 10;

export interface HistoryItem extends MovieCard {
  watchedAt: string;
}

export function getHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addToHistory(movie: MovieCard): void {
  try {
    const history = getHistory().filter((h) => h.id !== movie.id);
    history.unshift({ ...movie, watchedAt: new Date().toISOString() });
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(history.slice(0, MAX_ITEMS))
    );
  } catch {
    // localStorage might be full or disabled
  }
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}
