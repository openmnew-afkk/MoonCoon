const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface MovieCard {
  id: string;
  title: string;
  poster: string;
  rating: string;
  year: string;
  href?: string;
}

export interface MovieDetail {
  id: string;
  title: string;
  poster: string;
  description: string;
  year: string;
  rating: string;
  genres: string[];
  translations: Translation[];
  video_url: string;
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

async function fetchAPI<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export const api = {
  getHome: () => fetchAPI<HomeData>("/api/home"),

  search: (query: string) =>
    fetchAPI<{ results: MovieCard[]; query: string }>(`/api/search?q=${encodeURIComponent(query)}`),

  getMovie: (movieId: string) =>
    fetchAPI<MovieDetail>(`/api/movie/${movieId}`),

  getVideoUrl: (movieId: string, translationId?: string) => {
    const params = translationId ? `?translation_id=${translationId}` : "";
    return fetchAPI<{ video_url: string; translation_id: string | null }>(
      `/api/movie/${movieId}/video${params}`
    );
  },

  getMusic: () => fetchAPI<MusicData>("/api/music"),
};
