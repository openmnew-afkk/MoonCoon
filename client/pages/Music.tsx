import { useState, useRef, useEffect, useCallback } from "react";
import {
  Play, Pause, SkipBack, SkipForward, Heart,
  Volume2, VolumeX, Shuffle, Repeat, ChevronDown, MoreHorizontal,
  ListMusic,
} from "lucide-react";

interface Track {
  id: string;
  title: string;
  artist: string;
  cover: string;
  duration: number;
  src: string;
  liked: boolean;
  color: string;
}

const TRACKS: Track[] = [
  {
    id: "1", title: "Chill Vibes", artist: "FASSounds",
    cover: "https://picsum.photos/id/1062/400/400",
    duration: 132, src: "https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3",
    liked: false, color: "#E8B4F8",
  },
  {
    id: "2", title: "Lofi Study", artist: "FASSounds",
    cover: "https://picsum.photos/id/1025/400/400",
    duration: 147, src: "https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3",
    liked: true, color: "#818CF8",
  },
  {
    id: "3", title: "Ambient Dreams", artist: "Lesfm",
    cover: "https://picsum.photos/id/1047/400/400",
    duration: 180, src: "https://cdn.pixabay.com/audio/2022/08/02/audio_884fe92c21.mp3",
    liked: false, color: "#34D399",
  },
  {
    id: "4", title: "Good Night", artist: "FASSounds",
    cover: "https://picsum.photos/id/1039/400/400",
    duration: 146, src: "https://cdn.pixabay.com/audio/2022/05/16/audio_460b6b4bce.mp3",
    liked: false, color: "#FBBF24",
  },
  {
    id: "5", title: "Beautiful Day", artist: "Lesfm",
    cover: "https://picsum.photos/id/1015/400/400",
    duration: 150, src: "https://cdn.pixabay.com/audio/2022/10/12/audio_870ca3019f.mp3",
    liked: false, color: "#FB7185",
  },
  {
    id: "6", title: "Jazzy Abstract", artist: "Coma-Media",
    cover: "https://picsum.photos/id/1043/400/400",
    duration: 120, src: "https://cdn.pixabay.com/audio/2022/11/22/audio_febc508520.mp3",
    liked: false, color: "#34D399",
  },
  {
    id: "7", title: "Spirit Blossom", artist: "RomanBelov",
    cover: "https://picsum.photos/id/1057/400/400",
    duration: 208, src: "https://cdn.pixabay.com/audio/2022/01/20/audio_d16737dc28.mp3",
    liked: true, color: "#E8B4F8",
  },
  {
    id: "8", title: "Unlock Me", artist: "Nojisuma",
    cover: "https://picsum.photos/id/1069/400/400",
    duration: 128, src: "https://cdn.pixabay.com/audio/2023/07/30/audio_e3a7a3e3ab.mp3",
    liked: false, color: "#818CF8",
  },
];

function fmt(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

type View = "list" | "player";

export default function MusicPage() {
  const [tracks, setTracks] = useState(TRACKS);
  const [current, setCurrent] = useState<number>(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [muted, setMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [view, setView] = useState<View>("list");
  const [coverLoaded, setCoverLoaded] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);

  const track = tracks[current];

  useEffect(() => {
    const a = new Audio();
    a.preload = "metadata";
    a.crossOrigin = "anonymous";
    a.volume = volume;
    audioRef.current = a;

    a.addEventListener("loadedmetadata", () => setDuration(a.duration));
    a.addEventListener("ended", () => {
      if (repeat) { a.currentTime = 0; a.play(); }
      else skipNext();
    });

    return () => { a.pause(); a.src = ""; cancelAnimationFrame(animRef.current); };
  }, []);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.src = track.src;
    a.load();
    setCoverLoaded(false);
    if (playing) a.play().catch(() => {});
  }, [current]);

  useEffect(() => {
    const tick = () => {
      const a = audioRef.current;
      if (a && playing) setProgress(a.currentTime);
      animRef.current = requestAnimationFrame(tick);
    };
    if (playing) animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [playing]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = muted ? 0 : volume;
  }, [volume, muted]);

  const togglePlay = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) { a.pause(); setPlaying(false); }
    else { a.play().catch(() => {}); setPlaying(true); }
  }, [playing]);

  const skipNext = useCallback(() => {
    if (shuffle) {
      let next = Math.floor(Math.random() * tracks.length);
      if (next === current) next = (next + 1) % tracks.length;
      setCurrent(next);
    } else {
      setCurrent(p => (p + 1) % tracks.length);
    }
    setPlaying(true);
  }, [current, shuffle, tracks.length]);

  const skipPrev = useCallback(() => {
    const a = audioRef.current;
    if (a && a.currentTime > 3) { a.currentTime = 0; return; }
    setCurrent(p => (p - 1 + tracks.length) % tracks.length);
    setPlaying(true);
  }, [tracks.length]);

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const bar = progressBarRef.current;
    const a = audioRef.current;
    if (!bar || !a || !duration) return;
    const rect = bar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    a.currentTime = pct * duration;
    setProgress(a.currentTime);
  };

  const toggleLike = (id: string) => {
    setTracks(p => p.map(t => t.id === id ? { ...t, liked: !t.liked } : t));
  };

  const pct = duration > 0 ? (progress / duration) * 100 : 0;

  if (view === "player") {
    return (
      <div style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "#08080c",
        display: "flex", flexDirection: "column",
        fontFamily: "Inter, sans-serif",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -80, left: "50%", transform: "translateX(-50%)",
          width: "150%", height: 500,
          background: `radial-gradient(ellipse 60% 50% at 50% 30%, ${track.color}30 0%, transparent 70%)`,
          filter: "blur(60px)", pointerEvents: "none",
        }} />

        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px", paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)",
          position: "relative", zIndex: 10,
        }}>
          <button onClick={() => setView("list")} className="btn-icon-luxe" style={{ width: 40, height: 40 }}>
            <ChevronDown size={22} style={{ color: "rgba(255,255,255,0.7)" }} />
          </button>
          <span style={{
            fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
            background: "linear-gradient(135deg, #E8B4F8, #818CF8)",
            WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
          }}>
            Сейчас играет
          </span>
          <button className="btn-icon-luxe" style={{ width: 40, height: 40 }}>
            <MoreHorizontal size={20} style={{ color: "rgba(255,255,255,0.5)" }} />
          </button>
        </div>

        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 32px", position: "relative", zIndex: 5 }}>
          <div style={{
            width: "min(80vw, 340px)", height: "min(80vw, 340px)", borderRadius: 28,
            overflow: "hidden", position: "relative",
            boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 80px ${track.color}20`,
            transform: playing ? "scale(1)" : "scale(0.92)",
            transition: "transform 0.5s cubic-bezier(0.34,1.56,0.64,1)",
            border: "2px solid rgba(255,255,255,0.06)",
          }}>
            <img
              src={track.cover}
              alt={track.title}
              onLoad={() => setCoverLoaded(true)}
              style={{
                width: "100%", height: "100%", objectFit: "cover",
                opacity: coverLoaded ? 1 : 0, transition: "opacity 0.4s",
              }}
            />
            {!coverLoaded && (
              <div style={{
                position: "absolute", inset: 0,
                background: `linear-gradient(135deg, #12121a, #1a1a2e)`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <ListMusic size={48} style={{ color: `${track.color}55` }} />
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: "20px 28px", paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 24px)", position: "relative", zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{
                fontSize: 24, fontWeight: 900, margin: 0, letterSpacing: "-0.02em",
                color: "#fff",
              }}>{track.title}</h2>
              <p style={{
                fontSize: 14, margin: "4px 0 0", fontWeight: 500,
                background: "linear-gradient(135deg, #E8B4F8, #818CF8)",
                WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
              }}>{track.artist}</p>
            </div>
            <button onClick={() => toggleLike(track.id)} className="btn-icon-luxe" style={{ width: 44, height: 44 }}>
              <Heart size={22} fill={track.liked ? "#FB7185" : "none"}
                style={{ color: track.liked ? "#FB7185" : "rgba(255,255,255,0.3)" }} />
            </button>
          </div>

          <div ref={progressBarRef} onClick={seek} style={{ height: 28, display: "flex", alignItems: "center", cursor: "pointer", marginBottom: 4 }}>
            <div style={{ width: "100%", height: 5, borderRadius: 4, background: "rgba(255,255,255,0.08)", position: "relative", overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 4,
                background: "linear-gradient(90deg, #E8B4F8, #818CF8)",
                width: `${pct}%`, transition: "width 0.1s linear",
                boxShadow: "0 0 12px rgba(129,140,248,0.5)",
              }} />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
            <span style={{ fontSize: 11, color: "rgba(148,163,184,0.5)", fontWeight: 500 }}>{fmt(progress)}</span>
            <span style={{ fontSize: 11, color: "rgba(148,163,184,0.5)", fontWeight: 500 }}>{fmt(duration)}</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <button onClick={() => setShuffle(!shuffle)} className="btn-icon-luxe" style={{ width: 44, height: 44 }}>
              <Shuffle size={18} style={{ color: shuffle ? "#E8B4F8" : "rgba(255,255,255,0.3)" }} />
            </button>
            <button onClick={skipPrev} className="btn-icon-luxe" style={{ width: 48, height: 48 }}>
              <SkipBack size={24} fill="rgba(255,255,255,0.9)" style={{ color: "rgba(255,255,255,0.9)" }} />
            </button>
            <button onClick={togglePlay} className="btn-luxe" style={{
              width: 72, height: 72, borderRadius: 36, padding: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {playing
                ? <Pause size={28} strokeWidth={2.5} style={{ color: "#000" }} />
                : <Play size={28} strokeWidth={2.5} style={{ color: "#000", marginLeft: 3 }} />
              }
            </button>
            <button onClick={skipNext} className="btn-icon-luxe" style={{ width: 48, height: 48 }}>
              <SkipForward size={24} fill="rgba(255,255,255,0.9)" style={{ color: "rgba(255,255,255,0.9)" }} />
            </button>
            <button onClick={() => setRepeat(!repeat)} className="btn-icon-luxe" style={{ width: 44, height: 44 }}>
              <Repeat size={18} style={{ color: repeat ? "#E8B4F8" : "rgba(255,255,255,0.3)" }} />
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => setMuted(!muted)} className="btn-icon-luxe" style={{ width: 36, height: 36 }}>
              {muted ? <VolumeX size={16} style={{ color: "rgba(148,163,184,0.3)" }} /> : <Volume2 size={16} style={{ color: "rgba(255,255,255,0.5)" }} />}
            </button>
            <div style={{ flex: 1, height: 20, display: "flex", alignItems: "center" }}>
              <input
                type="range" min="0" max="1" step="0.02"
                value={muted ? 0 : volume}
                onChange={e => { setVolume(parseFloat(e.target.value)); setMuted(false); }}
                style={{
                  width: "100%", height: 3, appearance: "none", WebkitAppearance: "none",
                  background: `linear-gradient(to right, #E8B4F8 ${(muted ? 0 : volume) * 100}%, rgba(255,255,255,0.08) ${(muted ? 0 : volume) * 100}%)`,
                  borderRadius: 2, outline: "none", cursor: "pointer",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", fontFamily: "Inter, sans-serif", paddingBottom: track ? 140 : 80 }}>
      <div style={{ padding: "16px 16px 8px" }}>
        <h1 className="text-gradient" style={{ fontSize: 26, fontWeight: 900, margin: "0 0 4px" }}>Музыка</h1>
        <p style={{ fontSize: 12, color: "hsl(var(--muted-foreground))", margin: 0 }}>{tracks.length} треков · бесплатные биты</p>
      </div>

      <div style={{ padding: "8px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
        {tracks.map((t, i) => (
          <button
            key={t.id}
            onClick={() => { setCurrent(i); setPlaying(true); }}
            className="press-scale"
            style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 12px", borderRadius: 18,
              background: current === i ? `hsl(var(--card))` : "transparent",
              border: current === i ? "1px solid hsl(240 12% 20% / 0.5)" : "1px solid transparent",
              cursor: "pointer", textAlign: "left", width: "100%",
              WebkitTapHighlightColor: "transparent",
              transition: "all 0.15s",
              boxShadow: current === i ? "0 2px 12px rgba(0,0,0,0.15)" : "none",
            }}
          >
            <div style={{
              width: 48, height: 48, borderRadius: 14, flexShrink: 0,
              overflow: "hidden", position: "relative",
              boxShadow: current === i ? `0 4px 16px ${t.color}30` : "none",
              border: "1px solid rgba(255,255,255,0.06)",
            }}>
              <img src={t.cover} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              {current === i && playing && (
                <div style={{
                  position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 16 }}>
                    {[0,1,2].map(j => (
                      <div key={j} style={{
                        width: 3, borderRadius: 2,
                        background: "linear-gradient(135deg, #E8B4F8, #818CF8)",
                        animation: `eq-bar 0.6s ease-in-out infinite ${j * 0.15}s alternate`,
                      }} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontSize: 14, fontWeight: 600, margin: 0,
                color: current === i ? "#E8B4F8" : "#fff",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>{t.title}</p>
              <p style={{ fontSize: 11, color: "hsl(var(--muted-foreground))", margin: "2px 0 0" }}>
                {t.artist} · {fmt(t.duration)}
              </p>
            </div>

            <button onClick={e => { e.stopPropagation(); toggleLike(t.id); }}
              className="press-scale"
              style={{
                background: "none", border: "none", cursor: "pointer", padding: 6,
                WebkitTapHighlightColor: "transparent",
              }}>
              <Heart size={16} fill={t.liked ? "#FB7185" : "none"}
                style={{ color: t.liked ? "#FB7185" : "hsl(var(--muted-foreground))" }} />
            </button>
          </button>
        ))}
      </div>

      {track && (
        <div
          onClick={() => setView("player")}
          style={{
            position: "fixed", bottom: 70, left: 0, right: 0, zIndex: 40,
            padding: "0 12px", cursor: "pointer",
          }}
        >
          <div className="glass-card" style={{
            maxWidth: 456, margin: "0 auto", borderRadius: 20,
            padding: 0, overflow: "hidden",
          }}>
            <div style={{ height: 2, background: "rgba(255,255,255,0.05)" }}>
              <div style={{
                height: "100%", width: `${pct}%`,
                background: "linear-gradient(90deg, #E8B4F8, #818CF8)",
                transition: "width 0.3s linear",
              }} />
            </div>

            <div style={{ padding: "8px 12px", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 12, overflow: "hidden", flexShrink: 0,
                border: "1px solid rgba(255,255,255,0.06)",
              }}>
                <img src={track.cover} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: 13, fontWeight: 700, margin: 0,
                  color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {track.title}
                </p>
                <p style={{ fontSize: 11, color: "hsl(var(--muted-foreground))", margin: "1px 0 0" }}>{track.artist}</p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 4 }} onClick={e => e.stopPropagation()}>
                <button onClick={skipPrev} className="btn-icon-luxe" style={{ width: 36, height: 36 }}>
                  <SkipBack size={16} style={{ color: "rgba(255,255,255,0.6)" }} />
                </button>
                <button onClick={togglePlay} className="btn-luxe" style={{
                  width: 42, height: 42, borderRadius: 14, padding: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {playing
                    ? <Pause size={16} style={{ color: "#000" }} />
                    : <Play size={16} style={{ color: "#000", marginLeft: 2 }} />
                  }
                </button>
                <button onClick={skipNext} className="btn-icon-luxe" style={{ width: 36, height: 36 }}>
                  <SkipForward size={16} style={{ color: "rgba(255,255,255,0.6)" }} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes eq-bar {
          0% { height: 4px; }
          100% { height: 14px; }
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px; height: 14px;
          border-radius: 50%;
          background: linear-gradient(135deg, #E8B4F8, #818CF8);
          border: 2px solid #08080c;
          margin-top: -5px;
          box-shadow: 0 0 12px rgba(129,140,248,0.5);
        }
      `}</style>
    </div>
  );
}
