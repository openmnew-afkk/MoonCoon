import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, SkipBack, SkipForward, Search, Heart, Volume2, VolumeX } from "lucide-react";

const ACCENT = "#CBFF4D";

interface Track {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  key: string;
  genre: string;
  liked: boolean;
  notes: number[]; // frequencies for Web Audio
}

const TRACKS: Track[] = [
  { id: "1", title: "Neon Dreams", artist: "Synthwave", bpm: 120, key: "Am", genre: "Electronic", liked: false,
    notes: [261.63, 329.63, 392.00, 523.25, 392.00, 329.63, 261.63, 349.23, 440.00, 523.25] },
  { id: "2", title: "Midnight Drive", artist: "Lo-Fi Chill", bpm: 85, key: "Dm", genre: "Lo-Fi", liked: false,
    notes: [293.66, 349.23, 440.00, 349.23, 293.66, 261.63, 349.23, 293.66, 392.00, 349.23] },
  { id: "3", title: "Crystal Waves", artist: "Ambient Sky", bpm: 90, key: "C", genre: "Ambient", liked: false,
    notes: [523.25, 659.25, 783.99, 659.25, 523.25, 440.00, 523.25, 659.25, 783.99, 1046.50] },
  { id: "4", title: "Golden Hour", artist: "Sunset Beats", bpm: 100, key: "G", genre: "Chill", liked: false,
    notes: [392.00, 493.88, 587.33, 493.88, 392.00, 329.63, 392.00, 493.88, 587.33, 659.25] },
  { id: "5", title: "Starlight", artist: "Dream Pop", bpm: 110, key: "Em", genre: "Pop", liked: false,
    notes: [329.63, 392.00, 493.88, 587.33, 493.88, 392.00, 329.63, 440.00, 523.25, 659.25] },
  { id: "6", title: "Velvet Night", artist: "Jazz Hop", bpm: 75, key: "Bb", genre: "Jazz", liked: false,
    notes: [466.16, 349.23, 293.66, 349.23, 466.16, 587.33, 466.16, 349.23, 293.66, 233.08] },
  { id: "7", title: "Aurora", artist: "Ethereal", bpm: 95, key: "F", genre: "Ambient", liked: true,
    notes: [349.23, 440.00, 523.25, 659.25, 523.25, 440.00, 349.23, 523.25, 659.25, 783.99] },
  { id: "8", title: "Pulse", artist: "Tech Minimal", bpm: 128, key: "Am", genre: "Techno", liked: false,
    notes: [220.00, 261.63, 329.63, 261.63, 220.00, 329.63, 392.00, 329.63, 220.00, 261.63] },
];

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function MusicPage() {
  const [tracks, setTracks] = useState(TRACKS);
  const [search, setSearch] = useState("");
  const [current, setCurrent] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.6);
  const [muted, setMuted] = useState(false);

  const ctxRef = useRef<AudioContext | null>(null);
  const schedulerRef = useRef<number | null>(null);
  const noteIndexRef = useRef(0);
  const startTimeRef = useRef(0);
  const gainRef = useRef<GainNode | null>(null);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      gainRef.current = ctxRef.current.createGain();
      gainRef.current.gain.value = muted ? 0 : volume;
      gainRef.current.connect(ctxRef.current.destination);
    }
    return ctxRef.current;
  }, []);

  // Update volume
  useEffect(() => {
    if (gainRef.current) {
      gainRef.current.gain.value = muted ? 0 : volume;
    }
  }, [volume, muted]);

  const stopPlayback = useCallback(() => {
    if (schedulerRef.current) {
      clearInterval(schedulerRef.current);
      schedulerRef.current = null;
    }
    setPlaying(false);
  }, []);

  const playTrack = useCallback((trackId: string) => {
    stopPlayback();
    const track = tracks.find(t => t.id === trackId);
    if (!track) return;

    const ctx = getCtx();
    if (ctx.state === "suspended") ctx.resume();

    setCurrent(trackId);
    setPlaying(true);
    noteIndexRef.current = 0;
    startTimeRef.current = Date.now();
    setProgress(0);

    const beatInterval = 60000 / track.bpm;
    const totalDuration = track.notes.length * beatInterval;

    const playNote = () => {
      const idx = noteIndexRef.current;
      if (idx >= track.notes.length) {
        // Loop
        noteIndexRef.current = 0;
        startTimeRef.current = Date.now();
        return;
      }

      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();
      osc.type = idx % 3 === 0 ? "triangle" : "sine";
      osc.frequency.value = track.notes[idx];

      const now = ctx.currentTime;
      noteGain.gain.setValueAtTime(0, now);
      noteGain.gain.linearRampToValueAtTime(0.15, now + 0.03);
      noteGain.gain.exponentialRampToValueAtTime(0.001, now + (beatInterval / 1000) * 0.9);

      osc.connect(noteGain);
      noteGain.connect(gainRef.current!);
      osc.start(now);
      osc.stop(now + (beatInterval / 1000));

      noteIndexRef.current++;
      setProgress((Date.now() - startTimeRef.current) / totalDuration * 100);
    };

    playNote();
    schedulerRef.current = window.setInterval(() => {
      playNote();
    }, beatInterval);
  }, [tracks, getCtx, stopPlayback]);

  const togglePlay = useCallback(() => {
    if (playing) {
      stopPlayback();
    } else if (current) {
      playTrack(current);
    }
  }, [playing, current, playTrack, stopPlayback]);

  const skipNext = useCallback(() => {
    const idx = tracks.findIndex(t => t.id === current);
    const next = tracks[(idx + 1) % tracks.length];
    playTrack(next.id);
  }, [current, tracks, playTrack]);

  const skipPrev = useCallback(() => {
    const idx = tracks.findIndex(t => t.id === current);
    const prev = tracks[(idx - 1 + tracks.length) % tracks.length];
    playTrack(prev.id);
  }, [current, tracks, playTrack]);

  const toggleLike = (id: string) => {
    setTracks(p => p.map(t => t.id === id ? { ...t, liked: !t.liked } : t));
  };

  useEffect(() => () => stopPlayback(), [stopPlayback]);

  const filtered = tracks.filter(t =>
    !search || t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.artist.toLowerCase().includes(search.toLowerCase())
  );
  const currentTrack = tracks.find(t => t.id === current);

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", fontFamily: "Inter, sans-serif", paddingBottom: currentTrack ? 140 : 80 }}>
      {/* Header */}
      <div style={{ padding: "16px 16px 12px" }}>
        <h1 style={{
          fontSize: 22, fontWeight: 800, margin: "0 0 12px",
          background: `linear-gradient(135deg, #f0fdf4, ${ACCENT})`,
          WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
        }}>Музыка</h1>

        {/* Search */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "10px 14px", borderRadius: 14,
          background: "rgba(255,255,255,0.04)",
          border: `1px solid ${ACCENT}10`,
        }}>
          <Search size={16} style={{ color: `${ACCENT}66` }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Поиск треков..."
            style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#e2e8f0", fontSize: 13 }}
          />
        </div>
      </div>

      {/* Track list */}
      <div style={{ padding: "0 12px", display: "flex", flexDirection: "column", gap: 4 }}>
        {filtered.map((track, i) => (
          <button key={track.id} onClick={() => playTrack(track.id)} style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "12px 14px", borderRadius: 14,
            background: current === track.id ? `${ACCENT}08` : "transparent",
            border: current === track.id ? `1px solid ${ACCENT}15` : "1px solid transparent",
            cursor: "pointer", textAlign: "left", width: "100%",
            WebkitTapHighlightColor: "transparent",
            transition: "all 0.15s",
          }}>
            {/* Number / Playing indicator */}
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: current === track.id ? `${ACCENT}15` : "rgba(255,255,255,0.04)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {current === track.id && playing ? (
                <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 16 }}>
                  {[0,1,2].map(j => (
                    <div key={j} style={{
                      width: 3, borderRadius: 2,
                      background: ACCENT,
                      animation: `eq-bar 0.6s ease-in-out infinite ${j * 0.15}s alternate`,
                    }} />
                  ))}
                </div>
              ) : (
                <span style={{ fontSize: 12, fontWeight: 600, color: current === track.id ? ACCENT : "rgba(148,163,184,0.3)" }}>
                  {i + 1}
                </span>
              )}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontSize: 14, fontWeight: 600, margin: 0,
                color: current === track.id ? ACCENT : "#e2e8f0",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>{track.title}</p>
              <p style={{ fontSize: 11, color: "rgba(148,163,184,0.4)", margin: "2px 0 0" }}>
                {track.artist} · {track.genre}
              </p>
            </div>

            {/* BPM */}
            <span style={{ fontSize: 10, color: "rgba(148,163,184,0.25)", fontWeight: 500 }}>{track.bpm} bpm</span>

            {/* Like */}
            <button onClick={e => { e.stopPropagation(); toggleLike(track.id); }} style={{
              background: "none", border: "none", cursor: "pointer", padding: 4,
            }}>
              <Heart size={16} fill={track.liked ? "#ef4444" : "none"}
                style={{ color: track.liked ? "#ef4444" : "rgba(148,163,184,0.2)" }} />
            </button>
          </button>
        ))}
      </div>

      {/* Now Playing Bar */}
      {currentTrack && (
        <div style={{
          position: "fixed", bottom: 70, left: 0, right: 0, zIndex: 40,
          padding: "0 12px",
        }}>
          <div style={{
            maxWidth: 456, margin: "0 auto", borderRadius: 16,
            background: "rgba(15,15,20,0.92)",
            backdropFilter: "blur(30px) saturate(1.8)",
            WebkitBackdropFilter: "blur(30px) saturate(1.8)",
            border: `1px solid ${ACCENT}12`,
            boxShadow: `0 8px 30px rgba(0,0,0,0.5), 0 0 20px ${ACCENT}08`,
            overflow: "hidden",
          }}>
            {/* Progress bar */}
            <div style={{ height: 2, background: "rgba(255,255,255,0.05)" }}>
              <div style={{
                height: "100%", width: `${progress % 100}%`,
                background: `linear-gradient(90deg, ${ACCENT}, #a3e635)`,
                transition: "width 0.3s linear",
              }} />
            </div>

            <div style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 12 }}>
              {/* Track info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {currentTrack.title}
                </p>
                <p style={{ fontSize: 11, color: "rgba(148,163,184,0.4)", margin: "1px 0 0" }}>{currentTrack.artist}</p>
              </div>

              {/* Controls */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button onClick={skipPrev} style={ctrlBtn}><SkipBack size={16} style={{ color: "rgba(255,255,255,0.6)" }} /></button>
                <button onClick={togglePlay} style={{
                  ...ctrlBtn, width: 40, height: 40, borderRadius: 14,
                  background: `linear-gradient(135deg, ${ACCENT}, #a3e635)`,
                }}>
                  {playing
                    ? <Pause size={18} style={{ color: "#0a0a0f" }} />
                    : <Play size={18} style={{ color: "#0a0a0f", marginLeft: 2 }} />
                  }
                </button>
                <button onClick={skipNext} style={ctrlBtn}><SkipForward size={16} style={{ color: "rgba(255,255,255,0.6)" }} /></button>
              </div>

              {/* Volume */}
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: 4 }}>
                <button onClick={() => setMuted(!muted)} style={ctrlBtn}>
                  {muted
                    ? <VolumeX size={15} style={{ color: "rgba(148,163,184,0.3)" }} />
                    : <Volume2 size={15} style={{ color: `${ACCENT}88` }} />
                  }
                </button>
                <input
                  type="range" min="0" max="1" step="0.05"
                  value={muted ? 0 : volume}
                  onChange={e => { setVolume(parseFloat(e.target.value)); setMuted(false); }}
                  style={{
                    width: 50, height: 3, appearance: "none", WebkitAppearance: "none",
                    background: `linear-gradient(to right, ${ACCENT} ${(muted ? 0 : volume) * 100}%, rgba(255,255,255,0.1) ${(muted ? 0 : volume) * 100}%)`,
                    borderRadius: 2, outline: "none", cursor: "pointer",
                  }}
                />
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
      `}</style>
    </div>
  );
}

const ctrlBtn: React.CSSProperties = {
  background: "none", border: "none", cursor: "pointer",
  padding: 6, borderRadius: 10, display: "flex",
  alignItems: "center", justifyContent: "center",
  WebkitTapHighlightColor: "transparent",
};
