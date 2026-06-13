import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";
import { useTelegram } from "@/hooks/useTelegram";

export default function Player() {
  const { movieId } = useParams<{ movieId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { webApp } = useTelegram();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showControls, setShowControls] = useState(true);
  const [title, setTitle] = useState("");
  const hideTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const translationId = searchParams.get("t") || undefined;

  useEffect(() => {
    if (!movieId) return;

    // Fetch movie info for title
    api.getMovie(movieId).then((m) => setTitle(m.title)).catch(() => {});

    // Fetch video URL
    api
      .getVideoUrl(movieId, translationId)
      .then((data) => {
        if (data.video_url) {
          setVideoUrl(data.video_url);
        } else {
          setError("Видео не найдено. Попробуйте другую озвучку.");
        }
      })
      .catch(() => setError("Ошибка загрузки видео"))
      .finally(() => setLoading(false));
  }, [movieId, translationId]);

  // HLS.js support
  useEffect(() => {
    if (!videoUrl || !videoRef.current) return;
    const video = videoRef.current;

    // If it's an embed URL, we can't play it directly
    if (videoUrl.startsWith("EMBED:")) {
      setError("Используется embed-плеер. Откройте в браузере.");
      return;
    }

    if (videoUrl.endsWith(".m3u8") || videoUrl.includes("m3u8")) {
      // Try native HLS first (Safari)
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = videoUrl;
        video.play().catch(() => {});
      } else {
        // Load HLS.js dynamically
        import("hls.js")
          .then(({ default: Hls }) => {
            if (Hls.isSupported()) {
              const hls = new Hls({
                maxBufferLength: 30,
                maxMaxBufferLength: 60,
              });
              hls.loadSource(videoUrl);
              hls.attachMedia(video);
              hls.on(Hls.Events.MANIFEST_PARSED, () => {
                video.play().catch(() => {});
              });
              hls.on(Hls.Events.ERROR, (_event: any, data: any) => {
                if (data.fatal) {
                  setError("Ошибка воспроизведения видео");
                }
              });
            } else {
              setError("HLS не поддерживается в вашем браузере");
            }
          })
          .catch(() => {
            // Fallback - try direct
            video.src = videoUrl;
            video.play().catch(() => {});
          });
      }
    } else {
      // Direct video URL
      video.src = videoUrl;
      video.play().catch(() => {});
    }
  }, [videoUrl]);

  // Telegram back button
  useEffect(() => {
    if (webApp?.BackButton) {
      webApp.BackButton.show();
      const handler = () => navigate(-1);
      webApp.BackButton.onClick(handler);
      return () => {
        webApp.BackButton.offClick(handler);
        webApp.BackButton.hide();
      };
    }
  }, [webApp, navigate]);

  // Auto-hide controls
  const scheduleHide = () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    setShowControls(true);
    hideTimerRef.current = setTimeout(() => setShowControls(false), 3000);
  };

  useEffect(() => {
    scheduleHide();
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  return (
    <div
      className="player-container"
      onClick={scheduleHide}
      style={{ background: "#000" }}
    >
      {loading ? (
        <div style={{ textAlign: "center", color: "var(--text-secondary)" }}>
          <div
            style={{
              width: 48,
              height: 48,
              border: "3px solid rgba(255,255,255,0.1)",
              borderTopColor: "var(--accent)",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <div>Загрузка видео...</div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : error ? (
        <div style={{ textAlign: "center", padding: 40, color: "var(--text-secondary)" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>😔</div>
          <div style={{ fontSize: 16, marginBottom: 8 }}>{error}</div>
          <button
            className="btn-accent"
            style={{ marginTop: 16 }}
            onClick={() => navigate(-1)}
          >
            ← Назад
          </button>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            controls
            playsInline
            autoPlay
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              background: "#000",
            }}
          />

          {/* Top overlay with back + title */}
          {showControls && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                padding: "16px",
                background: "linear-gradient(rgba(0,0,0,0.7), transparent)",
                display: "flex",
                alignItems: "center",
                gap: 12,
                zIndex: 10,
                transition: "opacity 0.3s",
              }}
            >
              <button
                className="back-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(-1);
                }}
                style={{
                  background: "rgba(255,255,255,0.15)",
                  borderColor: "transparent",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
              {title && (
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: "#fff",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {title}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
