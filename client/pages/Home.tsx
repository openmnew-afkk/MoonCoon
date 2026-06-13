import { useEffect, useState, useCallback } from "react";
import { api, type HomeData, type MovieCard as MovieCardType } from "@/lib/api";
import { getHistory } from "@/lib/history";
import MovieCard from "@/components/MovieCard";
import { useTelegram } from "@/hooks/useTelegram";

const GENRES = [
  { id: "28", name: "Боевик" },
  { id: "35", name: "Комедия" },
  { id: "18", name: "Драма" },
  { id: "878", name: "Фантастика" },
  { id: "27", name: "Ужасы" },
  { id: "16", name: "Мультфильм" },
];

export default function Home() {
  const { user } = useTelegram();
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [history] = useState(getHistory());
  const [activeGenre, setActiveGenre] = useState<string | null>(null);
  const [genreMovies, setGenreMovies] = useState<MovieCardType[]>([]);
  const [genreLoading, setGenreLoading] = useState(false);

  useEffect(() => {
    api.getHome()
      .then(setData)
      .catch((err) => console.error("Home load error:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleGenreClick = useCallback(async (genreId: string) => {
    if (activeGenre === genreId) {
      setActiveGenre(null);
      setGenreMovies([]);
      return;
    }
    setActiveGenre(genreId);
    setGenreLoading(true);
    try {
      const res = await api.getGenreMovies(genreId);
      setGenreMovies(res.results || []);
    } catch (err) {
      console.error("Genre fetch error:", err);
      setGenreMovies([]);
    } finally {
      setGenreLoading(false);
    }
  }, [activeGenre]);

  const userName = user?.first_name || "Друг";

  const Section = ({
    title,
    items,
    size,
  }: {
    title: string;
    items: MovieCardType[];
    size?: "small" | "medium";
  }) => {
    if (!items?.length) return null;
    return (
      <div className="fade-in">
        <div className="section-header">
          <h2 className="section-title">{title}</h2>
        </div>
        <div className="scroll-x">
          {items.map((movie, i) => (
            <MovieCard key={`${movie.id}-${i}`} movie={movie} size={size} />
          ))}
        </div>
      </div>
    );
  };

  const SkeletonRow = () => (
    <div style={{ padding: "0 16px" }}>
      <div className="skeleton" style={{ width: 140, height: 20, marginBottom: 12, marginTop: 20 }} />
      <div className="scroll-x" style={{ padding: 0 }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ flexShrink: 0 }}>
            <div className="skeleton" style={{ width: 140, height: 210, borderRadius: 12 }} />
            <div className="skeleton" style={{ width: 100, height: 14, marginTop: 8 }} />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="page-enter" style={{ paddingBottom: 20 }}>
      {/* Header */}
      <div
        style={{
          padding: "20px 16px 16px",
          background: "linear-gradient(180deg, rgba(255,42,42,0.08) 0%, transparent 100%)",
        }}
      >
        <div style={{ fontSize: 14, color: "var(--text-secondary)" }}>
          Привет, {userName} 👋
        </div>
        <h1
          style={{
            fontSize: 26,
            fontWeight: 800,
            marginTop: 4,
            letterSpacing: "-0.03em",
          }}
        >
          <span className="gradient-text">VseOkNax</span>
        </h1>
        <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
          Фильмы, сериалы и мультфильмы бесплатно
        </div>
      </div>

      {/* Genre Filter Chips */}
      <div className="scroll-x" style={{ padding: "8px 16px 4px", gap: 8 }}>
        {GENRES.map((g) => (
          <button
            key={g.id}
            onClick={() => handleGenreClick(g.id)}
            className="genre-tag"
            style={{
              cursor: "pointer",
              flexShrink: 0,
              background: activeGenre === g.id ? "var(--accent)" : undefined,
              color: activeGenre === g.id ? "#fff" : undefined,
              borderColor: activeGenre === g.id ? "var(--accent)" : undefined,
              transition: "all 0.2s",
            }}
          >
            {g.name}
          </button>
        ))}
      </div>

      {loading ? (
        <>
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </>
      ) : activeGenre ? (
        /* Genre results grid */
        <div style={{ padding: "8px 0" }}>
          <div className="section-header">
            <h2 className="section-title">
              {GENRES.find((g) => g.id === activeGenre)?.name}
            </h2>
            <button
              onClick={() => { setActiveGenre(null); setGenreMovies([]); }}
              style={{
                background: "none",
                border: "none",
                color: "var(--accent)",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Сбросить
            </button>
          </div>
          {genreLoading ? (
            <div className="movie-grid">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i}>
                  <div className="skeleton" style={{ width: "100%", aspectRatio: "2/3", borderRadius: 12 }} />
                  <div className="skeleton" style={{ width: "80%", height: 14, marginTop: 8 }} />
                </div>
              ))}
            </div>
          ) : genreMovies.length > 0 ? (
            <div className="movie-grid fade-in">
              {genreMovies.map((movie, i) => (
                <MovieCard key={`${movie.id}-${i}`} movie={movie} size="small" />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🎬</div>
              <div style={{ fontSize: 14 }}>Ничего не найдено в этом жанре</div>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Continue watching */}
          {history.length > 0 && (
            <Section title="📺 Продолжить просмотр" items={history} size="small" />
          )}

          {/* Trending */}
          <Section title="🔥 Сейчас в тренде" items={data?.trending || []} />

          {/* New movies */}
          <Section title="🎬 Новинки кино" items={data?.new_movies || []} />

          {/* Series */}
          <Section title="📺 Популярные сериалы" items={data?.series || []} />

          {/* Cartoons */}
          <Section title="🎨 Мультфильмы" items={data?.cartoons || []} />
        </>
      )}
    </div>
  );
}
