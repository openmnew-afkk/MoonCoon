import { useState, useEffect, useCallback } from "react";
import { api, type MovieCard as MovieCardType } from "@/lib/api";
import MovieCard from "@/components/MovieCard";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MovieCardType[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const data = await api.search(q.trim());
      setResults(data.results || []);
    } catch (err) {
      console.error("Search error:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      doSearch(query);
    }, 500);
    return () => clearTimeout(timer);
  }, [query, doSearch]);

  return (
    <div className="page-enter" style={{ padding: "16px 0" }}>
      {/* Search Input */}
      <div style={{ padding: "0 16px", marginBottom: 20 }}>
        <div style={{ position: "relative" }}>
          <svg
            style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              width: 20,
              height: 20,
              color: "var(--text-muted)",
            }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Поиск фильмов, сериалов..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                background: "var(--bg-tertiary)",
                border: "none",
                borderRadius: "50%",
                width: 22,
                height: 22,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "var(--text-muted)",
                fontSize: 14,
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="movie-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i}>
              <div className="skeleton" style={{ width: "100%", aspectRatio: "2/3", borderRadius: 12 }} />
              <div className="skeleton" style={{ width: "80%", height: 14, marginTop: 8 }} />
            </div>
          ))}
        </div>
      ) : results.length > 0 ? (
        <div className="movie-grid fade-in">
          {results.map((movie, i) => (
            <div key={`${movie.id}-${i}`}>
              <MovieCard movie={movie} size="small" />
            </div>
          ))}
        </div>
      ) : searched ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "var(--text-muted)",
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-secondary)" }}>
            Ничего не найдено
          </div>
          <div style={{ fontSize: 13, marginTop: 6 }}>
            Попробуйте изменить запрос
          </div>
        </div>
      ) : (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "var(--text-muted)",
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎬</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-secondary)" }}>
            Найдите фильм или сериал
          </div>
          <div style={{ fontSize: 13, marginTop: 6 }}>
            Введите название для поиска
          </div>
        </div>
      )}
    </div>
  );
}
