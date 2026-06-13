import { useNavigate } from "react-router-dom";
import type { MovieCard as MovieCardType } from "@/lib/api";

interface Props {
  movie: MovieCardType;
  size?: "small" | "medium";
}

export default function MovieCard({ movie, size = "medium" }: Props) {
  const navigate = useNavigate();
  const width = size === "small" ? 130 : 160;

  return (
    <div
      className="movie-card"
      style={{ width, flexShrink: 0 }}
      onClick={() => navigate(`/movie/${movie.id}`)}
    >
      {/* Постер */}
      <img
        src={movie.poster || `https://picsum.photos/seed/${movie.id}/300/450`}
        alt={movie.title}
        className="poster-img"
        style={{ width: "100%", display: "block" }}
        loading="lazy"
        onError={(e) => {
          (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${movie.id}/300/450`;
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
