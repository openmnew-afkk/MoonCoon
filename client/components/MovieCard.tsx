import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { MovieCard as MovieCardType } from "@/lib/api";

interface Props {
  movie: MovieCardType;
  size?: "small" | "medium";
}

export default function MovieCard({ movie, size = "medium" }: Props) {
  const navigate = useNavigate();
  const [posterLoaded, setPosterLoaded] = useState(false);
  const width = size === "small" ? 130 : 160;

  const fallback = `https://picsum.photos/seed/${movie.id}/300/450`;
  const posterSrc = movie.poster || fallback;

  return (
    <div
      className="movie-card"
      style={{
        width,
        flexShrink: 0,
        background: !posterLoaded && movie.backdrop
          ? `url(${movie.backdrop}) center/cover no-repeat`
          : undefined,
      }}
      onClick={() => navigate(`/movie/${movie.id}`)}
    >
      {/* Постер */}
      <img
        src={posterSrc}
        alt={movie.title}
        className="poster-img"
        style={{
          width: "100%",
          display: "block",
          opacity: posterLoaded ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
        loading="lazy"
        onLoad={() => setPosterLoaded(true)}
        onError={(e) => {
          (e.target as HTMLImageElement).src = fallback;
        }}
      />

      {/* Рейтинг */}
      {movie.rating && (
        <div className="rating-badge">
          <span style={{ fontSize: 10 }}>⭐</span>
          {movie.rating}
        </div>
      )}

      {/* Инфо */}
      <div style={{ padding: "8px 8px 10px" }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--text-primary)",
            lineHeight: 1.3,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {movie.title}
        </div>
        {movie.year && (
          <div
            style={{
              fontSize: 11,
              color: "var(--text-muted)",
              marginTop: 2,
            }}
          >
            {movie.year}
          </div>
        )}
      </div>
    </div>
  );
}
