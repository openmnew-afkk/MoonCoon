import { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, Search, Heart } from "lucide-react";

interface Track {
  id: string;
  title: string;
  artist: string;
  cover: string;
  duration: number;
}

const DEMO_TRACKS: Track[] = [
  { id: "1", title: "Midnight Drive", artist: "Neon Pulse", cover: "https://picsum.photos/id/1062/200/200", duration: 234 },
  { id: "2", title: "Sunset Vibes", artist: "Chill Wave", cover: "https://picsum.photos/id/1015/200/200", duration: 198 },
  { id: "3", title: "Digital Dreams", artist: "Synth Master", cover: "https://picsum.photos/id/1025/200/200", duration: 267 },
  { id: "4", title: "Ocean Breeze", artist: "Lo-Fi House", cover: "https://picsum.photos/id/1036/200/200", duration: 312 },
  { id: "5", title: "Urban Lights", artist: "City Beats", cover: "https://picsum.photos/id/1044/200/200", duration: 189 },
  { id: "6", title: "Crystal Rain", artist: "Ambient Flow", cover: "https://picsum.photos/id/1047/200/200", duration: 245 },
  { id: "7", title: "Neon Skyline", artist: "Future Bass", cover: "https://picsum.photos/id/1059/200/200", duration: 221 },
  { id: "8", title: "Velvet Night", artist: "Deep House", cover: "https://picsum.photos/id/1069/200/200", duration: 278 },
  { id: "9", title: "Aurora", artist: "Dream Pop", cover: "https://picsum.photos/id/1073/200/200", duration: 203 },
  { id: "10", title: "Starfall", artist: "Chillstep", cover: "https://picsum.photos/id/1084/200/200", duration: 256 },
];

const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

export default function MusicPage() {
  const [tracks] = useState<Track[]>(DEMO_TRACKS);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [search, setSearch] = useState("");
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const filteredTracks = tracks.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.artist.toLowerCase().includes(search.toLowerCase())
  );

  const playTrack = (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    setProgress(0);
  };

  const togglePlay = () => setIsPlaying(p => !p);

  const toggleLike = (id: string) => setLiked(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const playNext = () => {
    if (!currentTrack) { playTrack(tracks[0]); return; }
    const idx = tracks.findIndex(t => t.id === currentTrack.id);
    playTrack(tracks[(idx + 1) % tracks.length]);
  };

  const playPrev = () => {
    if (!currentTrack) return;
    const idx = tracks.findIndex(t => t.id === currentTrack.id);
    playTrack(tracks[(idx - 1 + tracks.length) % tracks.length]);
  };

  useEffect(() => {
    if (progressInterval.current) clearInterval(progressInterval.current);
    if (isPlaying && currentTrack) {
      progressInterval.current = setInterval(() => {
        setProgress(p => {
          if (p >= currentTrack.duration) { playNext(); return 0; }
          return p + 1;
        });
      }, 1000);
    }
    return () => { if (progressInterval.current) clearInterval(progressInterval.current); };
  }, [isPlaying, currentTrack]);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", paddingBottom: currentTrack ? 200 : 120, fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <div style={{ padding: "16px 20px 12px" }}>
        <h1 style={{
          fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em",
          background: "linear-gradient(135deg, #e0e7ff, #818cf8)",
          WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
          margin: "0 0 16px",
        }}>Музыка</h1>

        {/* Search */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
          borderRadius: 14, background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(99,102,241,0.08)",
        }}>
          <Search size={16} style={{ color: "rgba(148,163,184,0.4)" }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Поиск треков..."
            style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#e2e8f0", fontSize: 14 }}
          />
        </div>
      </div>

      {/* Categories */}
      <div style={{ display: "flex", gap: 8, padding: "0 20px 16px", overflowX: "auto", scrollbarWidth: "none" }}>
        {["🔥 Популярное", "🎧 Chill", "🌙 Night", "⚡ Energy", "💜 Mood"].map(cat => (
          <button key={cat} style={{
            flexShrink: 0, padding: "8px 16px", borderRadius: 20,
            background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.12)",
            color: "rgba(148,163,184,0.7)", fontSize: 12, fontWeight: 600,
            cursor: "pointer", whiteSpace: "nowrap",
          }}>{cat}</button>
        ))}
      </div>

      {/* Track list */}
      <div style={{ padding: "0 16px" }}>
        {filteredTracks.map(track => (
          <button key={track.id} onClick={() => playTrack(track)} style={{
            width: "100%", display: "flex", alignItems: "center", gap: 12,
            padding: "10px 12px", borderRadius: 14, marginBottom: 4, cursor: "pointer",
            border: "none", textAlign: "left",
            background: currentTrack?.id === track.id ? "rgba(99,102,241,0.1)" : "transparent",
            transition: "background 0.2s", WebkitTapHighlightColor: "transparent",
          }}>
            <div style={{ position: "relative", width: 48, height: 48, borderRadius: 12, overflow: "hidden", flexShrink: 0 }}>
              <img src={track.cover} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              {currentTrack?.id === track.id && isPlaying && (
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 16 }}>
                    {[0, 1, 2].map(j => (
                      <div key={j} style={{
                        width: 3, background: "#818cf8", borderRadius: 2,
                        animation: `eq-bar 0.8s ease-in-out infinite ${j * 0.15}s alternate`,
                      }} />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontSize: 14, fontWeight: 600, margin: 0,
                color: currentTrack?.id === track.id ? "#a5b4fc" : "#e2e8f0",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>{track.title}</p>
              <p style={{ fontSize: 12, color: "rgba(148,163,184,0.4)", margin: "2px 0 0" }}>{track.artist}</p>
            </div>
            <span style={{ fontSize: 11, color: "rgba(148,163,184,0.3)", flexShrink: 0 }}>{formatTime(track.duration)}</span>
            <button onClick={e => { e.stopPropagation(); toggleLike(track.id); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
              <Heart size={16} style={{ color: liked.has(track.id) ? "#f472b6" : "rgba(148,163,184,0.25)" }} fill={liked.has(track.id) ? "#f472b6" : "none"} />
            </button>
          </button>
        ))}
      </div>

      {/* Now Playing Bar */}
      {currentTrack && (
        <div style={{
          position: "fixed", bottom: "calc(4.5rem + var(--tg-safe-bottom, 0px) + 8px)",
          left: 0, right: 0, zIndex: 40, padding: "0 12px",
        }}>
          <div style={{
            maxWidth: 480, margin: "0 auto", borderRadius: 18,
            background: "rgba(15,15,25,0.95)", backdropFilter: "blur(24px)",
            border: "1px solid rgba(99,102,241,0.12)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)", padding: "12px 16px",
          }}>
            {/* Progress */}
            <div style={{ height: 2, borderRadius: 2, background: "rgba(99,102,241,0.1)", marginBottom: 10, overflow: "hidden" }}>
              <div style={{
                height: "100%", width: `${(progress / currentTrack.duration) * 100}%`,
                background: "linear-gradient(90deg, #6366f1, #a78bfa)",
                borderRadius: 2, transition: "width 0.5s linear",
              }} />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <img src={currentTrack.cover} alt="" style={{ width: 44, height: 44, borderRadius: 10, objectFit: "cover" }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{currentTrack.title}</p>
                <p style={{ fontSize: 11, color: "rgba(148,163,184,0.4)", margin: "1px 0 0" }}>{currentTrack.artist}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button onClick={playPrev} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                  <SkipBack size={18} style={{ color: "rgba(148,163,184,0.6)" }} />
                </button>
                <button onClick={togglePlay} style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  border: "none", display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", boxShadow: "0 4px 16px rgba(99,102,241,0.4)",
                }}>
                  {isPlaying ? <Pause size={16} style={{ color: "white" }} /> : <Play size={16} style={{ color: "white", marginLeft: 2 }} />}
                </button>
                <button onClick={playNext} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                  <SkipForward size={18} style={{ color: "rgba(148,163,184,0.6)" }} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes eq-bar {
          0% { height: 4px; }
          100% { height: 16px; }
        }
      `}</style>
    </div>
  );
}
