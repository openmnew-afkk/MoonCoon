import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api, type MovieDetail as MovieDetailType } from "@/lib/api";
import { addToHistory } from "@/lib/history";

export default function MovieDetail() {
  const { movieId } = useParams<{ movieId: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<MovieDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTranslation, setSelectedTranslation] = useState("");

  useEffect(() => {
    if (!movieId) return;
    setLoading(true);
    api
      .getMovie(movieId)
      .then((data) => {
        setMovie(data);
        if (data.translations?.length) {
          setSelectedTranslation(data.translations[0].id);
        }
        // Add to watch history
        addToHistory({
          id: data.id,
          title: data.title,
          poster: data.poster,
          rating: data.rating,
          year: data.year,
        });
      })
      .catch((err) => console.error("Movie detail error:", err))
      .finally(() => setLoading(false));
  }, [movieId]);

  if (loading) {
    return (
      <div style={{ padding: 16 }}>
        <div className="skeleton" style={{ width: "100%", height: 400, borderRadius: 16 }} />
        <div className="skeleton" style={{ width: "70%", height: 24, marginTop: 16 }} />
        <div className="skeleton" style={{ width: "40%", height: 16, marginTop: 8 }} />
        <div className="skeleton" style={{ width: "100%", height: 80, marginTop: 16 }} />
      </div>
    );
  }

  if (!movie) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px", color: "var(--text-muted)" }}>
        <div style={{ fontSize: 48 }}>😔</div>
        <div style={{ fontSize: 16, marginTop: 12 }}>Фильм не найден</div>
        <button className="btn-accent" style={{ marginTop: 20 }} onClick={() => navigate("/")}>
          На главную
        </button>
      </div>
    );
  }

  return (
    <div className="page-enter" style={{ paddingBottom: 20 }}>
      {/* Back Button + Poster */}
      <div style={{ position: "relative" }}>
        <img
          src={movie.poster || `https://picsum.photos/seed/${movie.id}/400/600`}
          alt={movie.title}
          style={{
            width: "100%",
            maxHeight: 450,
            objectFit: "cover",
            display: "block",
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${movie.id}/400/600`;
          }}
        />
        {/* Gradient overlay */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 200,
            background: "linear-gradient(transparent, var(--bg))",
          }}
        />
        {/* Back button */}
        <button
          className="back-btn"
          onClick={() => navigate(-1)}
          style={{ position: "absolute", top: 16, left: 16, zIndex: 5 }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Movie Info */}
      <div style={{ padding: "0 16px", marginTop: -40, position: "relative", zIndex: 2 }}>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
          }}
        >
          {movie.title}
        </h1>

        {/* Meta */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 10,
            flexWrap: "wrap",
          }}
        >
          {movie.rating && (
            <span className="rating-badge" style={{ position: "static" }}>
              ⭐ {movie.rating}
            </span>
          )}
          {movie.year && (
            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
              📅 {movie.year}
            </span>
          )}
        </div>

        {/* Genres */}
        {movie.genres?.length > 0 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
            {movie.genres.map((g) => (
              <span key={g} className="genre-tag">{g}</span>
            ))}
          </div>
        )}

        {/* Description */}
        {movie.description && (
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.6,
              color: "var(--text-secondary)",
              marginTop: 16,
            }}
          >
            {movie.description}
          </p>
        )}

        {/* Translation Select */}
        {movie.translations?.length > 1 && (
          <div style={{ marginTop: 20 }}>
            <label
              style={{
                fontSize: 13,
                color: "var(--text-muted)",
                display: "block",
                marginBottom: 8,
              }}
            >
              🎤 Выберите озвучку
            </label>
            <select
              className="select-custom"
              value={selectedTranslation}
              onChange={(e) => setSelectedTranslation(e.target.value)}
            >
              {movie.translations.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Watch Button */}
        <button
          className="btn-accent glow-accent"
          style={{ width: "100%", marginTop: 24, padding: "16px 24px", fontSize: 16 }}
          onClick={() => {
            const params = selectedTranslation ? `?t=${selectedTranslation}` : "";
            navigate(`/player/${movie.id}${params}`);
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
          Смотреть
        </button>
      </div>
    </div>
  );
}
