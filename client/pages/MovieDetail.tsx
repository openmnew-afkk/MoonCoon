import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api, getZonaUrl, type MovieDetail as MovieDetailType } from "@/lib/api";
import { addToHistory } from "@/lib/history";
import { useTelegram } from "@/hooks/useTelegram";

export default function MovieDetail() {
  const { movieId = "" } = useParams<{ movieId: string }>();
  const navigate = useNavigate();
  const { webApp } = useTelegram();
  const [movie, setMovie] = useState<MovieDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTranslation, setSelectedTranslation] = useState("");
  const [similar, setSimilar] = useState<any[]>([]);

  const decodedId = movieId.replace(/~/g, "/");

  useEffect(() => {
    if (!decodedId) return;
    setLoading(true);
    api.getMovie(decodedId).then((data) => {
      setMovie(data);
      if (data.translations?.length) {
        setSelectedTranslation(data.translations[0].id);
      }
      addToHistory({
        id: data.id,
        title: data.title,
        poster: data.poster,
        rating: data.rating,
        year: data.year,
      });
      // Load similar movies
      api.getSimilar(decodedId).then(s => setSimilar(s.results || [])).catch(() => {});
    }).catch((err) => console.error("Movie detail error:", err))
      .finally(() => setLoading(false));
  }, [decodedId]);

  useEffect(() => {
    if (webApp?.BackButton) {
      webApp.BackButton.show();
      const handler = () => navigate(-1);
      webApp.BackButton.onClick(handler);
      return () => { webApp.BackButton.offClick(handler); webApp.BackButton.hide(); };
    }
  }, [webApp, navigate]);

  const handleWatch = () => {
    const zonaUrl = movie?.zona_url || getZonaUrl(decodedId);
    if (webApp) {
      webApp.openLink(zonaUrl, { try_instant_view: false });
    } else {
      window.open(zonaUrl, "_blank");
    }
  };

  const handleWatchInApp = () => {
    navigate(`/player/${movieId}`);
  };

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
        <button className="btn-accent" style={{ marginTop: 20 }} onClick={() => navigate("/")}>На главную</button>
      </div>
    );
  }

  return (
    <div className="page-enter" style={{ paddingBottom: 20 }}>
      {/* Backdrop / Poster */}
      <div style={{ position: "relative" }}>
        {movie.backdrop ? (
          <img
            src={movie.backdrop}
            alt={movie.title}
            style={{ width: "100%", maxHeight: 260, objectFit: "cover", display: "block" }}
            onError={(e) => { (e.target as HTMLImageElement).src = movie.poster || `https://picsum.photos/seed/${movie.id}/800/400`; }}
          />
        ) : (
          <img
            src={movie.poster || `https://picsum.photos/seed/${movie.id}/400/600`}
            alt={movie.title}
            style={{ width: "100%", maxHeight: 450, objectFit: "cover", display: "block" }}
          />
        )}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 200,
          background: "linear-gradient(transparent, var(--bg))",
        }} />
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

      {/* Info */}
      <div style={{ padding: "0 16px", marginTop: -40, position: "relative", zIndex: 2 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          {/* Small poster */}
          <img
            src={movie.poster || `https://picsum.photos/seed/${movie.id}/300/450`}
            alt=""
            style={{ width: 100, height: 150, objectFit: "cover", borderRadius: 10, flexShrink: 0, border: "2px solid var(--bg-secondary)" }}
            onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${movie.id}/300/450`; }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
              {movie.title}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
              {movie.rating && <span className="rating-badge" style={{ position: "static" }}>⭐ {movie.rating}</span>}
              {movie.year && <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{movie.year}</span>}
              {movie.runtime && <span style={{ fontSize: 13, color: "var(--text-muted)" }}>⏱ {movie.runtime} мин</span>}
            </div>
          </div>
        </div>

        {movie.genres?.length > 0 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
            {movie.genres.map((g) => <span key={g} className="genre-tag">{g}</span>)}
          </div>
        )}

        {movie.description && (
          <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--text-secondary)", marginTop: 16 }}>
            {movie.description}
          </p>
        )}

        {/* Cast */}
        {movie.cast && movie.cast.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 10 }}>
              Актёрский состав
            </div>
            <div className="scroll-x" style={{ padding: 0, gap: 10 }}>
              {movie.cast.map((c, i) => (
                <div key={i} style={{ flexShrink: 0, width: 80, textAlign: "center" }}>
                  <div style={{
                    width: 60, height: 60, borderRadius: 30, overflow: "hidden",
                    margin: "0 auto 6px", background: "var(--bg-tertiary)",
                  }}>
                    {c.profile ? (
                      <img src={c.profile} alt={c.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "var(--text-muted)" }}>
                        {c.name[0]}
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.2 }}>{c.name}</div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>{c.character}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Translation select */}
        {movie.translations && movie.translations.length > 1 && (
          <div style={{ marginTop: 20 }}>
            <label style={{ fontSize: 13, color: "var(--text-muted)", display: "block", marginBottom: 8 }}>🎤 Озвучка</label>
            <select
              className="select-custom"
              value={selectedTranslation}
              onChange={(e) => setSelectedTranslation(e.target.value)}
            >
              {movie.translations.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Watch Buttons */}
        <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 10 }}>
          {movie.trailer_url && (
            <button
              className="btn-accent"
              style={{ width: "100%", padding: "14px 24px", fontSize: 15 }}
              onClick={() => navigate(`/player/${movieId}?trailer=true`)}
            >
              ▶ Смотреть трейлер
            </button>
          )}
          <button
            className="btn-accent glow-accent"
            style={{ width: "100%", padding: "16px 24px", fontSize: 16 }}
            onClick={handleWatch}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            Смотреть бесплатно
          </button>
          <button
            style={{
              width: "100%", padding: "14px 24px", fontSize: 14, fontWeight: 600,
              fontFamily: "inherit", background: "var(--bg-tertiary)",
              border: "1px solid var(--separator)", borderRadius: 12,
              color: "var(--text-secondary)", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "all 0.2s",
            }}
            onClick={handleWatchInApp}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            Встроенный плеер
          </button>
        </div>

        {/* Similar movies */}
        {similar.length > 0 && (
          <div style={{ marginTop: 28 }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Похожие фильмы</div>
            <div className="scroll-x" style={{ padding: 0, gap: 10 }}>
              {similar.map((m) => (
                <div
                  key={m.id}
                  className="movie-card"
                  style={{ width: 120, flexShrink: 0 }}
                  onClick={() => navigate(`/movie/${m.id}`)}
                >
                  <img
                    src={m.poster || `https://picsum.photos/seed/${m.id}/300/450`}
                    alt={m.title}
                    style={{ width: "100%", aspectRatio: "2/3", objectFit: "cover", borderRadius: 10 }}
                  />
                  <div style={{ padding: "6px 6px 8px" }}>
                    <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {m.title}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>{m.year}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
