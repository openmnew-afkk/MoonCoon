const API_BASE = import.meta.env.VITE_API_URL || "";

// ── Types ──
export interface MovieCard {
  id: string;
  title: string;
  poster: string;
  backdrop?: string;
  rating: string;
  year: string;
  genres?: string[];
  description?: string;
  media_type?: string;
}

export interface MovieDetail extends MovieDetailBase {
  translations: Translation[];
  trailer_url: string;
  video_url?: string;
  embed_url?: string;
  zona_url?: string;
  cast?: { name: string; character: string; profile: string | null }[];
  runtime?: number;
  budget?: number;
  revenue?: number;
  status?: string;
}

export interface MovieDetailBase {
  id: string;
  title: string;
  poster: string;
  backdrop?: string;
  description: string;
  year: string;
  rating: string;
  genres: string[];
}

export interface Translation {
  id: string;
  name: string;
}

export interface HomeData {
  trending: MovieCard[];
  new_movies: MovieCard[];
  series: MovieCard[];
  cartoons: MovieCard[];
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  cover: string;
  audio_url: string;
}

export interface MusicData {
  tracks: MusicTrack[];
  playlists: { id: string; title: string; count: number }[];
}

// ── Zona integration ──
const ZONA_BASE = "https://w140.zona.plus";

export function getZonaUrl(movieId: string): string {
  if (movieId.startsWith("http")) return movieId;
  return `${ZONA_BASE}/${movieId}`;
}

// ── API helpers ──
async function fetchAPI<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function fetchWithFallback<T>(path: string, fallback: T): Promise<T> {
  try {
    return await fetchAPI<T>(path);
  } catch {
    return fallback;
  }
}

// ── Demo data (fallback when server is down) ──
const DEMO_TRENDING: MovieCard[] = [
  { id: "1", title: "Начало", poster: "https://picsum.photos/seed/inception/300/450", rating: "8.8", year: "2010" },
  { id: "2", title: "Интерстеллар", poster: "https://picsum.photos/seed/interstellar/300/450", rating: "8.6", year: "2014" },
  { id: "3", title: "Тёмный рыцарь", poster: "https://picsum.photos/seed/darkknight/300/450", rating: "9.0", year: "2008" },
  { id: "4", title: "Бойцовский клуб", poster: "https://picsum.photos/seed/fightclub/300/450", rating: "8.8", year: "1999" },
  { id: "5", title: "Матрица", poster: "https://picsum.photos/seed/matrix/300/450", rating: "8.7", year: "1999" },
  { id: "6", title: "Побег из Шоушенка", poster: "https://picsum.photos/seed/shawshank/300/450", rating: "9.3", year: "1994" },
  { id: "7", title: "Форрест Гамп", poster: "https://picsum.photos/seed/forrestgump/300/450", rating: "8.8", year: "1994" },
  { id: "8", title: "Гладиатор", poster: "https://picsum.photos/seed/gladiator/300/450", rating: "8.5", year: "2000" },
];

const DEMO_NEW: MovieCard[] = [
  { id: "100", title: "Дюна: Часть вторая", poster: "https://picsum.photos/seed/dune2/300/450", rating: "8.3", year: "2024" },
  { id: "101", title: "Оппенгеймер", poster: "https://picsum.photos/seed/oppenheimer/300/450", rating: "8.5", year: "2023" },
  { id: "102", title: "Барби", poster: "https://picsum.photos/seed/barbie/300/450", rating: "7.0", year: "2023" },
  { id: "103", title: "Бедные-несчастные", poster: "https://picsum.photos/seed/poorthings/300/450", rating: "7.8", year: "2023" },
];

const DEMO_SERIES: MovieCard[] = [
  { id: "200", title: "Во все тяжкие", poster: "https://picsum.photos/seed/breakingbad/300/450", rating: "9.5", year: "2008" },
  { id: "201", title: "Игра престолов", poster: "https://picsum.photos/seed/got/300/450", rating: "9.3", year: "2011" },
  { id: "202", title: "Очень странные дела", poster: "https://picsum.photos/seed/stranger/300/450", rating: "8.7", year: "2016" },
  { id: "203", title: "Чернобыль", poster: "https://picsum.photos/seed/chernobyl/300/450", rating: "9.4", year: "2019" },
];

const DEMO_CARTOONS: MovieCard[] = [
  { id: "300", title: "Унесённые призраками", poster: "https://picsum.photos/seed/spirited/300/450", rating: "8.6", year: "2001" },
  { id: "301", title: "Твоё имя", poster: "https://picsum.photos/seed/yourname/300/450", rating: "8.4", year: "2016" },
  { id: "302", title: "Вверх", poster: "https://picsum.photos/seed/up/300/450", rating: "8.3", year: "2009" },
  { id: "303", title: "ВАЛЛ·И", poster: "https://picsum.photos/seed/walle/300/450", rating: "8.4", year: "2008" },
];

const DEMO_HOME: HomeData = {
  trending: DEMO_TRENDING,
  new_movies: DEMO_NEW,
  series: DEMO_SERIES,
  cartoons: DEMO_CARTOONS,
};

// ── API Client ──
export const api = {
  /** Home page data */
  getHome: () => fetchWithFallback<HomeData>("/api/tmdb/home", DEMO_HOME),

  /** Search movies/series */
  search: (query: string) =>
    fetchWithFallback<{ results: MovieCard[]; query: string }>(
      `/api/tmdb/search?q=${encodeURIComponent(query)}`,
      { results: [], query }
    ),

  /** Get movie/series details */
  getMovie: (movieId: string) =>
    fetchWithFallback<MovieDetail>(`/api/tmdb/movie/${movieId}`, {
      id: movieId,
      title: movieId.replace(/[-_]/g, " ").replace(/\//g, " "),
      poster: `https://picsum.photos/seed/${movieId}/400/600`,
      description: "",
      year: "",
      rating: "",
      genres: [],
      translations: [{ id: "original", name: "Оригинал" }],
      trailer_url: "",
      zona_url: getZonaUrl(movieId),
    }),

  /** Get video URL (for HLS playback) */
  getVideoUrl: (movieId: string, translationId?: string) => {
    const params = translationId ? `?translation_id=${translationId}` : "";
    return fetchWithFallback<{ video_url: string; translation_id: string | null }>(
      `/api/movie/${movieId}/video${params}`,
      { video_url: "", translation_id: null }
    );
  },

  /** Get similar movies */
  getSimilar: (movieId: string) =>
    fetchWithFallback<{ results: MovieCard[] }>(
      `/api/tmdb/movie/${movieId}/similar`,
      { results: [] }
    ),

  /** Get trailer YouTube embed URL */
  getTrailer: (movieId: string) =>
    fetchWithFallback<{ trailer_url: string; trailer_key: string }>(
      `/api/tmdb/trailer/${movieId}`,
      { trailer_url: "", trailer_key: "" }
    ),

  /** Get genre list */
  getGenres: () =>
    fetchWithFallback<{ genres: { id: number; name: string }[] }>(
      "/api/tmdb/genres",
      { genres: [] }
    ),

  /** Get movies by genre */
  getGenreMovies: (genreId: string) =>
    fetchWithFallback<{ results: MovieCard[] }>(
      `/api/tmdb/genre/${genreId}`,
      { results: [] }
    ),

  /** Get trending movies or TV shows */
  getTrending: (mediaType: "movie" | "tv") =>
    fetchWithFallback<{ results: MovieCard[] }>(
      `/api/tmdb/trending/${mediaType}`,
      { results: DEMO_TRENDING }
    ),

  /** Get upcoming movies */
  getUpcoming: () =>
    fetchWithFallback<{ results: MovieCard[] }>(
      "/api/tmdb/upcoming",
      { results: DEMO_NEW }
    ),

  /** Get top rated movies */
  getTopRated: () =>
    fetchWithFallback<{ results: MovieCard[] }>(
      "/api/tmdb/top_rated",
      { results: DEMO_TRENDING }
    ),

  /** Music data */
  getMusic: () =>
    fetchWithFallback<MusicData>("/api/music", {
      tracks: [
        { id: "1", title: "Ночь", artist: "Макс Корж", album: "", duration: "3:42", cover: "https://picsum.photos/seed/track1/300/300", audio_url: "" },
        { id: "2", title: "Грустная песня", artist: "Thrill Pill", album: "", duration: "2:58", cover: "https://picsum.photos/seed/track2/300/300", audio_url: "" },
        { id: "3", title: "Космос", artist: "Markul", album: "", duration: "4:15", cover: "https://picsum.photos/seed/track3/300/300", audio_url: "" },
      ],
      playlists: [],
    }),

  getZonaDirectUrl: (movieId: string) => getZonaUrl(movieId),
  getZonaSearchUrl: (query: string) => `${ZONA_BASE}/search/${encodeURIComponent(query)}/`,
};
