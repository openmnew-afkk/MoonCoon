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

  const showTrailer = searchParams.get("trailer") === "true";
  const decodedId = movieId.replace(/~/g, "/");

  const [videoUrl, setVideoUrl] = useState("");
  const [embedUrl, setEmbedUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"loading" | "hls" | "youtube" | "embed" | "zona">("loading");
  const [title, setTitle] = useState("");
  const [showControls, setShowControls] = useState(true);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!decodedId) return;

    if (showTrailer) {
      // Load trailer
      api.getTrailer(decodedId).then((data) => {
        if (data.trailer_url) {
          setEmbedUrl(data.trailer_url);
          setMode("youtube");
        } else {
          // Fallback to zona
          setEmbedUrl(getZonaUrl(decodedId));
          setMode("zona");
        }
        setLoading(false);
      }).catch(() => {
        setEmbedUrl(getZonaUrl(decodedId));
        setMode("zona");
        setLoading(false);
      });

      // Get title
      api.getMovie(decodedId).then(m => setTitle(m.title)).catch(() => {});
    } else {
      // Load movie for playback
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
          // If no video, try trailer as embed
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

  // HLS.js
  useEffect(() => {
    if (mode !== "hls" || !videoUrl || !videoRef.current) return;
    const video = videoRef.current;

    if (videoUrl.includes("m3u8")) {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = videoUrl;
        video.play().catch(() => {});
      } else {
        import("hls.js")
          .then(({ default: Hls }) => {
            if (Hls.isSupported()) {
              const hls = new Hls({ maxBufferLength: 30, maxMaxBufferLength: 60 });
              hls.loadSource(videoUrl);
              hls.attachMedia(video);
              hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
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
          });
      }
    } else {
      video.src = videoUrl;
      video.play().catch(() => {});
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
    hideTimerRef.current = setTimeout(() => setShowControls(false), 3500);
  };

  useEffect(() => {
    scheduleHide();
    return () => { if (hideTimerRef.current) clearTimeout(hideTimerRef.current); };
  }, []);

  const openOnZona = () => {
    const url = getZonaUrl(decodedId);
    if (webApp) {
      webApp.openLink(url, { try_instant_view: false });
    } else {
      window.open(url, "_blank");
    }
  };

  return (
    <div className="player-container" onClick={scheduleHide} style={{ background: "#000" }}>
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
        <video
          ref={videoRef}
          controls
          playsInline
          autoPlay
          style={{ width: "100%", height: "100%", objectFit: "contain", background: "#000" }}
        />
      ) : (mode === "youtube" || mode === "embed" || mode === "zona") ? (
        <iframe
          src={embedUrl}
          style={{ width: "100%", height: "100%", border: "none", background: "#000" }}
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation"
        />
      ) : null}

      {/* Top overlay */}
      {showControls && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0,
          padding: "12px 16px",
          background: "linear-gradient(rgba(0,0,0,0.8), transparent)",
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
