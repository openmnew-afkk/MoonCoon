import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { api, getZonaUrl } from "@/lib/api";
import { useTelegram } from "@/hooks/useTelegram";

export default function Player() {
  const { movieId = "" } = useParams<{ movieId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { webApp } = useTelegram();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const showTrailer = searchParams.get("trailer") === "true";
  const decodedId = movieId.replace(/~/g, "/");

  const [videoUrl, setVideoUrl] = useState("");
  const [embedUrl, setEmbedUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"loading" | "hls" | "youtube" | "embed" | "zona">("loading");
  const [title, setTitle] = useState("");
  const [showControls, setShowControls] = useState(true);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const [loadProgress, setLoadProgress] = useState(0);
  const [isHlsReady, setIsHlsReady] = useState(false);
  const [iframeBlocked, setIframeBlocked] = useState(false);

  useEffect(() => {
    if (!decodedId) return;

    if (showTrailer) {
      api.getTrailer(decodedId).then((data) => {
        if (data.trailer_url) {
          setEmbedUrl(data.trailer_url);
          setMode("youtube");
        } else {
          setEmbedUrl(getZonaUrl(decodedId));
          setMode("zona");
        }
        setLoading(false);
      }).catch(() => {
        setEmbedUrl(getZonaUrl(decodedId));
        setMode("zona");
        setLoading(false);
      });

      api.getMovie(decodedId).then(m => setTitle(m.title)).catch(() => {});
    } else {
      api.getMovie(decodedId).then((m) => {
        setTitle(m.title);

        if (m.video_url && !m.video_url.startsWith("EMBED:")) {
          setVideoUrl(m.video_url);
          setMode("hls");
          setLoading(false);
        } else if (m.video_url?.startsWith("EMBED:")) {
          setEmbedUrl(m.video_url.replace("EMBED:", ""));
          setMode("embed");
          setLoading(false);
        } else if (m.trailer_url) {
          setEmbedUrl(m.trailer_url);
          setMode("youtube");
          setLoading(false);
        } else {
          setEmbedUrl(m.zona_url || getZonaUrl(decodedId));
          setMode("zona");
          setLoading(false);
        }
      }).catch(() => {
        setEmbedUrl(getZonaUrl(decodedId));
        setMode("zona");
        setLoading(false);
      });
    }
  }, [decodedId, showTrailer]);

  // HLS.js with progress tracking
  useEffect(() => {
    if (mode !== "hls" || !videoUrl || !videoRef.current) return;
    const video = videoRef.current;

    setIsHlsReady(false);
    setLoadProgress(0);

    if (videoUrl.includes("m3u8")) {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = videoUrl;
        video.play().catch(() => {});
        setIsHlsReady(true);
        setLoadProgress(100);
      } else {
        import("hls.js")
          .then(({ default: Hls }) => {
            if (Hls.isSupported()) {
              const hls = new Hls({ maxBufferLength: 30, maxMaxBufferLength: 60 });
              hls.loadSource(videoUrl);
              hls.attachMedia(video);
              hls.on(Hls.Events.MANIFEST_PARSED, () => {
                setIsHlsReady(true);
                setLoadProgress(100);
                video.play().catch(() => {});
              });
              video.addEventListener("progress", () => {
                if (video.buffered.length > 0 && video.duration > 0) {
                  const end = video.buffered.end(video.buffered.length - 1);
                  const progress = Math.min(100, Math.round((end / video.duration) * 100));
                  setLoadProgress(progress);
                }
              });
              hls.on(Hls.Events.ERROR, (_: any, data: any) => {
                if (data.fatal) {
                  setEmbedUrl(getZonaUrl(decodedId));
                  setMode("zona");
                }
              });
            }
          })
          .catch(() => {
            video.src = videoUrl;
            video.play().catch(() => {});
            setIsHlsReady(true);
            setLoadProgress(100);
          });
      }
    } else {
      video.src = videoUrl;
      video.play().catch(() => {});
      setIsHlsReady(true);
      setLoadProgress(100);
    }
  }, [mode, videoUrl, decodedId]);

  useEffect(() => {
    if (webApp?.BackButton) {
      webApp.BackButton.show();
      const handler = () => navigate(-1);
      webApp.BackButton.onClick(handler);
      return () => { webApp.BackButton.offClick(handler); webApp.BackButton.hide(); };
    }
  }, [webApp, navigate]);

  const scheduleHide = () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    setShowControls(true);
    hideTimerRef.current = setTimeout(() => setShowControls(false), 3000);
  };

  useEffect(() => {
    scheduleHide();
    return () => { if (hideTimerRef.current) clearTimeout(hideTimerRef.current); };
  }, []);

  const handleToggleControls = () => {
    if (showControls) {
      setShowControls(false);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    } else {
      scheduleHide();
    }
  };

  const openOnZona = () => {
    const url = getZonaUrl(decodedId);
    if (webApp) {
      webApp.openLink(url, { try_instant_view: false });
    } else {
      window.open(url, "_blank");
    }
  };

  const handleIframeError = () => {
    setIframeBlocked(true);
  };

  return (
    <div
      ref={containerRef}
      className="player-container"
      onClick={mode === "youtube" ? undefined : handleToggleControls}
      style={{ background: "#000", position: "relative" }}
    >
      {loading ? (
        <div style={{ textAlign: "center", color: "#888" }}>
          <div style={{
            width: 48, height: 48,
            border: "3px solid rgba(255,255,255,0.1)",
            borderTopColor: "var(--accent)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 16px",
          }} />
          <div style={{ fontSize: 14 }}>{showTrailer ? "Загрузка трейлера..." : "Загрузка..."}</div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : mode === "hls" ? (
        <>
          <video
            ref={videoRef}
            controls
            playsInline
            autoPlay
            style={{ width: "100%", height: "100%", objectFit: "contain", background: "#000" }}
            onTimeUpdate={scheduleHide}
          />
          {!isHlsReady && loadProgress < 100 && (
            <div style={{
              position: "absolute", bottom: 80, left: "50%", transform: "translateX(-50%)",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
            }}>
              <div style={{
                width: 200, height: 4, borderRadius: 2,
                background: "rgba(255,255,255,0.15)", overflow: "hidden",
              }}>
                <div style={{
                  width: `${loadProgress}%`, height: "100%", borderRadius: 2,
                  background: "var(--accent)", transition: "width 0.3s",
                }} />
              </div>
              <div style={{ fontSize: 12, color: "#888" }}>
                Загрузка... {loadProgress}%
              </div>
            </div>
          )}
        </>
      ) : (mode === "youtube" || mode === "embed" || mode === "zona") ? (
        <>
          {iframeBlocked ? (
            <div style={{ textAlign: "center", padding: 40, color: "#888" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
              <div style={{ fontSize: 14, marginBottom: 16 }}>
                Не удалось загрузить плеер.<br />
                Возможно, сайт заблокировал встраивание.
              </div>
              <button
                onClick={openOnZona}
                style={{
                  background: "var(--accent)", border: "none", borderRadius: 10,
                  padding: "12px 24px", color: "#fff", fontSize: 14, fontWeight: 600,
                  fontFamily: "inherit", cursor: "pointer",
                }}
              >
                Открыть на Zona ↗
              </button>
            </div>
          ) : (
            <iframe
              src={embedUrl}
              style={{ width: "100%", height: "100%", border: "none", background: "#000" }}
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              allowFullScreen
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation"
              onError={handleIframeError}
              referrerPolicy="no-referrer"
            />
          )}
        </>
      ) : null}

      {/* Custom overlay for YouTube trailer */}
      {mode === "youtube" && showControls && !loading && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0,
          padding: "12px 16px",
          background: "linear-gradient(rgba(0,0,0,0.85), transparent)",
          display: "flex", alignItems: "center", gap: 10, zIndex: 10,
        }}>
          <button
            className="back-btn"
            onClick={(e) => { e.stopPropagation(); navigate(-1); }}
            style={{ background: "rgba(255,255,255,0.15)", borderColor: "transparent", width: 36, height: 36 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <div style={{
            fontSize: 14, fontWeight: 600, color: "#fff", flex: 1,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {title} <span style={{ opacity: 0.5, fontWeight: 400 }}>— Трейлер</span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); openOnZona(); }}
            style={{
              background: "rgba(255,42,42,0.8)", border: "none", borderRadius: 8,
              padding: "6px 12px", color: "#fff", fontSize: 12, fontWeight: 600,
              fontFamily: "inherit", cursor: "pointer", whiteSpace: "nowrap",
            }}
          >
            Открыть на Zona ↗
          </button>
        </div>
      )}

      {/* Top overlay for non-YouTube modes */}
      {mode !== "youtube" && showControls && !loading && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0,
          padding: "12px 16px",
          background: "linear-gradient(rgba(0,0,0,0.8), transparent)",
          display: "flex", alignItems: "center", gap: 10, zIndex: 10,
          pointerEvents: "none",
        }}>
          <button
            className="back-btn"
            onClick={(e) => { e.stopPropagation(); navigate(-1); }}
            style={{ background: "rgba(255,255,255,0.15)", borderColor: "transparent", width: 36, height: 36, pointerEvents: "auto" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          {title && (
            <div style={{
              fontSize: 14, fontWeight: 600, color: "#fff", flex: 1,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {title} {showTrailer && <span style={{ opacity: 0.5, fontWeight: 400 }}>— Трейлер</span>}
            </div>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); openOnZona(); }}
            style={{
              background: "rgba(255,42,42,0.8)", border: "none", borderRadius: 8,
              padding: "6px 12px", color: "#fff", fontSize: 12, fontWeight: 600,
              fontFamily: "inherit", cursor: "pointer", whiteSpace: "nowrap",
            }}
          >
            Открыть на Zona ↗
          </button>
        </div>
      )}
    </div>
  );
}
