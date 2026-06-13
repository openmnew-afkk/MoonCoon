import "dotenv/config";
import express from "express";
import cors from "cors";

const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMG = "https://image.tmdb.org/t/p";
const TMDB_KEY = process.env.TMDB_API_KEY || "";

// ── Simple in-memory cache ──
const cache = new Map<string, { data: any; expires: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && entry.expires > Date.now()) return entry.data as T;
  cache.delete(key);
  return null;
}

function setCache(key: string, data: any) {
  cache.set(key, { data, expires: Date.now() + CACHE_TTL });
}

// ── TMDb API wrapper ──
async function tmdbFetch<T>(path: string, params: Record<string, string> = {}): Promise<T | null> {
  if (!TMDB_KEY) return null;
  const cacheKey = `${path}?${JSON.stringify(params)}`;
  const cached = getCached<T>(cacheKey);
  if (cached) return cached;

  try {
    const url = new URL(`${TMDB_BASE}${path}`);
    url.searchParams.set("api_key", TMDB_KEY);
    url.searchParams.set("language", "ru-RU");
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v);
    }

    const res = await fetch(url.toString(), {
      headers: { "Accept": "application/json" },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return null;
    const data = await res.json();
    setCache(cacheKey, data);
    return data;
  } catch {
    return null;
  }
}

// ── Demo data ──
const DEMO_TRENDING = [
  { id: 1, title: "Начало", poster_path: null, vote_average: 8.8, release_date: "2010", overview: "Корпоративный шпион, который крадёт секреты через технологии共享 сновидений, получает задание внедрить идею в сознание человека.", genre_ids: [28, 878, 12] },
  { id: 2, title: "Интерстеллар", poster_path: null, vote_average: 8.6, release_date: "2014", overview: "Группа исследователей и учёных отправляется через червоточину в космосе в поисках нового дома для человечества.", genre_ids: [12, 18, 878] },
  { id: 3, title: "Тёмный рыцарь", poster_path: null, vote_average: 9.0, release_date: "2008", overview: "Бэтмен принимает вызов Джокера, который хочет погрузить Готэм в хаос.", genre_ids: [28, 80, 18] },
  { id: 4, title: "Бойцовский клуб", poster_path: null, vote_average: 8.8, release_date: "1999", overview: "Офисный работник и барыга создают подпольный бойцовский клуб, который перерастает в нечто большее.", genre_ids: [18] },
  { id: 5, title: "Матрица", poster_path: null, vote_average: 8.7, release_date: "1999", overview: "Хакер узнаёт, что реальность — это симуляция, созданная машинами, и присоединяется к сопротивлению.", genre_ids: [28, 878] },
  { id: 6, title: "Побег из Шоушенка", poster_path: null, vote_average: 9.3, release_date: "1994", overview: "Бухгалтер, осуждённый за двойное убийство, находит утешение и искупление в тюремной дружбе.", genre_ids: [18, 80] },
];

const GENRE_MAP: Record<number, string> = {
  28: "Боевик", 12: "Приключения", 16: "Мультфильм", 35: "Комедия",
  18: "Драма", 27: "Ужасы", 10749: "Мелодрама", 878: "Фантастика",
  53: "Триллер", 9648: "Детектив", 10751: "Семейный", 10770: "ТВ-фильм",
  14: "Фэнтези", 36: "История", 10752: "Военный", 37: "Вестерн",
  80: "Криминал", 99: "Документальный", 10759: "Боевик/Приключения",
  10762: "Детский", 10763: "Новости", 10764: "Реалити",
  10765: "Фантастика/Фэнтези", 10766: "Мыльная опера", 10767: "Ток-шоу",
  10768: "Война/Политика",
};

function mapGenre(ids: number[]): string[] {
  return (ids || []).map(id => GENRE_MAP[id]).filter(Boolean);
}

function buildPoster(posterPath: string | null): string {
  if (!posterPath) return "https://picsum.photos/seed/movie/300/450";
  return `${TMDB_IMG}/w500${posterPath}`;
}

function buildBackdrop(backdropPath: string | null): string | null {
  if (!backdropPath) return null;
  return `${TMDB_IMG}/w780${backdropPath}`;
}

interface MovieResult {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  overview?: string;
  genre_ids?: number[];
  media_type?: string;
}

function mapMovie(m: MovieResult) {
  return {
    id: String(m.id),
    title: m.title || m.name || "Без названия",
    poster: buildPoster(m.poster_path),
    backdrop: buildBackdrop(m.backdrop_path),
    rating: String(m.vote_average?.toFixed(1) || ""),
    year: (m.release_date || m.first_air_date || "").slice(0, 4),
    genres: mapGenre(m.genre_ids || []),
    description: m.overview || "",
    media_type: m.media_type || "movie",
  };
}

export function createServer() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Health check
  app.get("/api/ping", (_req, res) => {
    res.json({ status: "ok", app: "VseOkNax", tmdb: !!TMDB_KEY });
  });

  // ── Home: trending + categories ──
  app.get("/api/tmdb/home", async (_req, res) => {
    if (!TMDB_KEY) {
      // Demo mode
      return res.json({
        trending: DEMO_TRENDING.map(m => mapMovie(m as any)),
        new_movies: [],
        series: [],
        cartoons: [],
      });
    }

    try {
      const [trendingRes, moviesRes, seriesRes, cartoonRes] = await Promise.all([
        tmdbFetch<{ results: MovieResult[] }>("/trending/movie/week"),
        tmdbFetch<{ results: MovieResult[] }>("/movie/now_playing"),
        tmdbFetch<{ results: MovieResult[] }>("/trending/tv/week"),
        tmdbFetch<{ results: MovieResult[] }>("/discover/movie", { with_genres: "16" }),
      ]);

      res.json({
        trending: (trendingRes?.results || []).slice(0, 12).map(mapMovie),
        new_movies: (moviesRes?.results || []).slice(0, 12).map(mapMovie),
        series: (seriesRes?.results || []).slice(0, 12).map(m => {
          const movie = mapMovie(m);
          movie.id = `tv_${movie.id}`;
          return movie;
        }),
        cartoons: (cartoonRes?.results || []).slice(0, 12).map(mapMovie),
      });
    } catch (err) {
      console.error("TMDb home error:", err);
      res.json({
        trending: DEMO_TRENDING.map(m => mapMovie(m as any)),
        new_movies: [],
        series: [],
        cartoons: [],
      });
    }
  });

  // ── Search ──
  app.get("/api/tmdb/search", async (req, res) => {
    const query = (req.query.q as string || "").trim();
    if (!query) return res.json({ results: [], query: "" });

    if (!TMDB_KEY) {
      // Demo search — filter from demo data
      const demoAll = DEMO_TRENDING;
      const filtered = demoAll.filter(m =>
        (m.title || "").toLowerCase().includes(query.toLowerCase())
      );
      return res.json({ results: filtered.map(m => mapMovie(m as any)), query });
    }

    try {
      const data = await tmdbFetch<{ results: MovieResult[] }>("/search/multi", { query });
      const results = (data?.results || [])
        .filter(m => m.media_type === "movie" || m.media_type === "tv")
        .slice(0, 20)
        .map(mapMovie);
      res.json({ results, query });
    } catch (err) {
      console.error("TMDb search error:", err);
      res.json({ results: [], query });
    }
  });

  // ── Movie detail ──
  app.get("/api/tmdb/movie/:id", async (req, res) => {
    const id = req.params.id;

    if (!TMDB_KEY) {
      const demo = DEMO_TRENDING.find(m => String(m.id) === id);
      if (!demo) {
        return res.json({
          id, title: id.replace(/-/g, " "),
          poster: "https://picsum.photos/seed/movie/400/600",
          description: "", year: "", rating: "", genres: [],
          translations: [{ id: "original", name: "Оригинал" }],
        });
      }
      const m = mapMovie(demo as any);
      return res.json({
        ...m,
        translations: [{ id: "original", name: "Оригинал" }],
        trailer_url: "",
        backdrop: null,
      });
    }

    try {
      const data = await tmdbFetch<any>(`/movie/${id}`, { append_to_response: "videos,credits" });
      if (!data) return res.status(404).json({ error: "Movie not found" });

      const movie = mapMovie(data);
      const videos = data.videos?.results || [];
      const trailer = videos.find((v: any) => v.type === "Trailer" && v.site === "YouTube")
        || videos.find((v: any) => v.type === "Teaser" && v.site === "YouTube")
        || videos.find((v: any) => v.site === "YouTube");

      const cast = (data.credits?.cast || []).slice(0, 8).map((c: any) => ({
        name: c.name,
        character: c.character,
        profile: c.profile_path ? `${TMDB_IMG}/w185${c.profile_path}` : null,
      }));

      res.json({
        ...movie,
        translations: [
          { id: "original", name: "Оригинал" },
        ],
        trailer_url: trailer ? `https://www.youtube.com/embed/${trailer.key}` : "",
        cast,
        runtime: data.runtime,
        budget: data.budget,
        revenue: data.revenue,
        status: data.status,
      });
    } catch (err) {
      console.error("TMDb movie detail error:", err);
      res.json({
        id, title: id.replace(/-/g, " "),
        poster: "https://picsum.photos/seed/movie/400/600",
        description: "", year: "", rating: "", genres: [],
        translations: [{ id: "original", name: "Оригинал" }],
        trailer_url: "",
      });
    }
  });

  // ── Similar movies ──
  app.get("/api/tmdb/movie/:id/similar", async (req, res) => {
    const id = req.params.id;

    if (!TMDB_KEY) {
      const demo = DEMO_TRENDING.filter(m => String(m.id) !== id).slice(0, 6);
      return res.json({ results: demo.map(m => mapMovie(m as any)) });
    }

    try {
      const data = await tmdbFetch<{ results: MovieResult[] }>(`/movie/${id}/similar`);
      const results = (data?.results || []).slice(0, 10).map(mapMovie);
      res.json({ results });
    } catch {
      res.json({ results: [] });
    }
  });

  // ── Genre list ──
  app.get("/api/tmdb/genres", async (_req, res) => {
    if (!TMDB_KEY) {
      return res.json({ genres: [
        { id: 28, name: "Боевик" }, { id: 35, name: "Комедия" },
        { id: 18, name: "Драма" }, { id: 878, name: "Фантастика" },
        { id: 27, name: "Ужасы" }, { id: 16, name: "Мультфильм" },
      ]});
    }

    try {
      const data = await tmdbFetch<{ genres: { id: number; name: string }[] }>("/genre/movie/list");
      res.json({ genres: data?.genres || [] });
    } catch {
      res.json({ genres: [] });
    }
  });

  // ── Genre movies ──
  app.get("/api/tmdb/genre/:id", async (req, res) => {
    const genreId = req.params.id;

    if (!TMDB_KEY) {
      return res.json({ results: [] });
    }

    try {
      const data = await tmdbFetch<{ results: MovieResult[] }>("/discover/movie", {
        with_genres: genreId,
        sort_by: "popularity.desc",
      });
      const results = (data?.results || []).slice(0, 20).map(mapMovie);
      res.json({ results });
    } catch {
      res.json({ results: [] });
    }
  });

  // ── YouTube trailer embed URL helper ──
  app.get("/api/tmdb/trailer/:id", async (req, res) => {
    const id = req.params.id;

    if (!TMDB_KEY) {
      return res.json({ trailer_url: "" });
    }

    try {
      const data = await tmdbFetch<any>(`/movie/${id}/videos`);
      const videos = data?.results || [];
      const trailer = videos.find((v: any) => v.type === "Trailer" && v.site === "YouTube")
        || videos.find((v: any) => v.site === "YouTube");
      res.json({
        trailer_url: trailer ? `https://www.youtube.com/embed/${trailer.key}?autoplay=1` : "",
        trailer_key: trailer?.key || "",
      });
    } catch {
      res.json({ trailer_url: "" });
    }
  });

  return app;
}
