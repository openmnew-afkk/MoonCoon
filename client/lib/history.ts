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

const FAVORITES_KEY = "vseok_favorites";
const MAX_FAVORITES = 50;

export function getFavorites(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addToFavorites(movie: MovieCard): void {
  try {
    const favorites = getFavorites().filter((f) => f.id !== movie.id);
    favorites.unshift({ ...movie, watchedAt: new Date().toISOString() });
    localStorage.setItem(
      FAVORITES_KEY,
      JSON.stringify(favorites.slice(0, MAX_FAVORITES))
    );
  } catch {
    // localStorage might be full or disabled
  }
}

export function removeFromFavorites(movieId: string): void {
  try {
    const favorites = getFavorites().filter((f) => f.id !== movieId);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch {
    // localStorage might be full or disabled
  }
}

export function isFavorite(movieId: string): boolean {
  return getFavorites().some((f) => f.id === movieId);
}
