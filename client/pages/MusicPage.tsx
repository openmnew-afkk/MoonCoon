import { useEffect, useState, useRef } from "react";
import { api, type MusicTrack } from "@/lib/api";

export default function MusicPage() {
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    api
      .getMusic()
      .then((data) => setTracks(data.tracks || []))
      .catch((err) => console.error("Music load error:", err))
      .finally(() => setLoading(false));
  }, []);

  const handlePlay = (track: MusicTrack) => {
    if (playing === track.id) {
      // Pause
      audioRef.current?.pause();
      setPlaying(null);
      return;
    }

    setPlaying(track.id);
    setProgress(0);

    if (track.audio_url) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(track.audio_url);
      audioRef.current.play().catch(() => {});
      audioRef.current.ontimeupdate = () => {
        if (audioRef.current) {
          setProgress(
            (audioRef.current.currentTime / audioRef.current.duration) * 100
          );
        }
      };
      audioRef.current.onended = () => {
        setPlaying(null);
        setProgress(0);
      };
    }
  };

  return (
    <div className="page-enter" style={{ paddingBottom: 20 }}>
      {/* Header */}
      <div
        style={{
          padding: "20px 16px 16px",
          background: "linear-gradient(180deg, rgba(255,42,42,0.06) 0%, transparent 100%)",
        }}
      >
        <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }}>
          🎵 Музыка
        </h1>
        <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
          Слушайте бесплатно
        </div>
      </div>

      {/* Track List */}
      <div style={{ padding: "0 0px" }}>
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="music-track"
              style={{ gap: 12 }}
            >
              <div className="skeleton" style={{ width: 52, height: 52, borderRadius: 10, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ width: "60%", height: 14, marginBottom: 6 }} />
                <div className="skeleton" style={{ width: "40%", height: 12 }} />
              </div>
            </div>
          ))
        ) : tracks.length > 0 ? (
          tracks.map((track, i) => {
            const isPlaying = playing === track.id;
            return (
              <div
                key={track.id}
                className={`music-track fade-in ${isPlaying ? "playing" : ""}`}
                style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}
                onClick={() => handlePlay(track)}
              >
                {/* Cover */}
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <img
                    src={track.cover}
                    alt={track.title}
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 10,
                      objectFit: "cover",
                    }}
                  />
                  {/* Play/Pause overlay */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: isPlaying ? "rgba(0,0,0,0.4)" : "transparent",
                      borderRadius: 10,
                      transition: "background 0.2s",
                    }}
                  >
                    {isPlaying && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                        <rect x="6" y="4" width="4" height="16" rx="1" />
                        <rect x="14" y="4" width="4" height="16" rx="1" />
                      </svg>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: isPlaying ? "var(--accent)" : "var(--text-primary)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {track.title}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--text-muted)",
                      marginTop: 2,
                    }}
                  >
                    {track.artist}
                  </div>

                  {/* Progress bar */}
                  {isPlaying && (
                    <div
                      style={{
                        width: "100%",
                        height: 2,
                        background: "var(--separator)",
                        borderRadius: 1,
                        marginTop: 6,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${progress}%`,
                          height: "100%",
                          background: "var(--accent)",
                          borderRadius: 1,
                          transition: "width 0.3s linear",
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Duration */}
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--text-muted)",
                    flexShrink: 0,
                  }}
                >
                  {track.duration}
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎵</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-secondary)" }}>
              Скоро здесь появится музыка
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
