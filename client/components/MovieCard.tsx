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
  const [hovered, setHovered] = useState(false);
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
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={() => setHovered(true)}
      onTouchEnd={() => setTimeout(() => setHovered(false), 300)}
    >
      {/* Poster */}
      <div style={{ position: "relative" }}>
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

        {/* Hover overlay with rating + year */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.85) 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.25s ease",
            pointerEvents: "none",
            borderRadius: 8,
          }}
        >
          {movie.rating && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                color: "#ffd700",
                fontSize: 18,
                fontWeight: 700,
              }}
            >
              <span style={{ fontSize: 14 }}>⭐</span>
              {movie.rating}
            </div>
          )}
          {movie.year && (
            <div
              style={{
                color: "rgba(255,255,255,0.8)",
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              {movie.year}
            </div>
          )}
        </div>

        {/* Rating badge (always visible) */}
        {movie.rating && (
          <div className="rating-badge">
            <span style={{ fontSize: 10 }}>⭐</span>
            {movie.rating}
          </div>
        )}
      </div>

      {/* Info */}
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
        {/* Genre tags */}
        {movie.genres && movie.genres.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 4,
              marginTop: 6,
            }}
          >
            {movie.genres.slice(0, 2).map((genre) => (
              <span key={genre} className="genre-tag" style={{ fontSize: 10, padding: "2px 8px" }}>
                {genre}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
