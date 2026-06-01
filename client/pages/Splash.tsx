import { useEffect, useState, useRef } from "react";

interface Bubble {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
  variant: number;
}

function makeBubbles(n: number): Bubble[] {
  const palette = [
    "rgba(147,51,234,0.55)",   // violet
    "rgba(88,28,220,0.5)",     // indigo
    "rgba(168,85,247,0.45)",   // purple
    "rgba(59,7,100,0.7)",      // deep purple
    "rgba(109,40,217,0.6)",    // violet dark
    "rgba(196,181,253,0.3)",   // lavender
    "rgba(30,10,60,0.8)",      // near black purple
  ];
  return Array.from({ length: n }, (_, i) => ({
    id: i,
    x: 3 + Math.random() * 94,
    size: 10 + Math.random() * 60,
    duration: 6 + Math.random() * 10,
    delay: Math.random() * 12,
    color: palette[Math.floor(Math.random() * palette.length)],
    variant: i % 4,
  }));
}

export default function Splash({ onComplete }: { onComplete: () => void }) {
  const [out, setOut] = useState(false);
  const [progress, setProgress] = useState(0);
  const [show, setShow] = useState(false);
  const bubbles = useRef(makeBubbles(28));

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const dur = 2600;
    const start = Date.now();
    const tick = () => {
      const p = Math.min(100, Math.round(((Date.now() - start) / dur) * 100));
      setProgress(p);
      if (p < 100) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    const exit = setTimeout(() => {
      setOut(true);
      setTimeout(onComplete, 600);
    }, dur + 200);
    return () => clearTimeout(exit);
  }, [onComplete]);

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        overflow: "hidden",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        background: "radial-gradient(ellipse at 50% 30%, #1a0533 0%, #0d001f 40%, #050008 100%)",
        transition: "opacity 0.6s ease, transform 0.6s ease",
        opacity: out ? 0 : 1,
        transform: out ? "scale(1.04)" : "scale(1)",
      }}
    >
      {/* ── Deep ambient layers ── */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 80% 60% at 20% 80%, rgba(88,28,220,0.18) 0%, transparent 60%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 60% 50% at 80% 20%, rgba(168,85,247,0.12) 0%, transparent 60%)",
        pointerEvents: "none",
      }} />

      {/* ── Rising bubbles (lava lamp) ── */}
      {bubbles.current.map(b => (
        <div key={b.id} style={{
          position: "absolute",
          bottom: -(b.size + 20),
          left: `${b.x}%`,
          width: b.size,
          height: b.size,
          borderRadius: "50%",
          background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.18), ${b.color})`,
          border: `1px solid rgba(196,181,253,0.15)`,
          boxShadow: `0 0 ${b.size * 0.5}px ${b.color}, inset 0 1px 3px rgba(255,255,255,0.12)`,
          backdropFilter: "blur(1px)",
          animationName: `bup${b.variant}`,
          animationDuration: `${b.duration}s`,
          animationDelay: `${b.delay}s`,
          animationTimingFunction: "ease-in-out",
          animationIterationCount: "infinite",
          animationFillMode: "both",
        }} />
      ))}

      {/* ── Bottom lamp glow ── */}
      <div style={{
        position: "absolute", bottom: 0, left: "50%",
        transform: "translateX(-50%)",
        width: "120%", height: "50%",
        background: "radial-gradient(ellipse at 50% 100%, rgba(109,40,217,0.3) 0%, rgba(88,28,220,0.12) 35%, transparent 65%)",
        filter: "blur(30px)",
        pointerEvents: "none",
      }} />

      {/* ── Central orb system ── */}
      <div style={{
        position: "relative",
        opacity: show ? 1 : 0,
        transform: show ? "scale(1) translateY(0)" : "scale(0.5) translateY(30px)",
        transition: "opacity 0.9s cubic-bezier(0.16,1,0.3,1), transform 1s cubic-bezier(0.16,1,0.3,1)",
      }}>

        {/* Outermost pulse ring */}
        <div style={{
          position: "absolute",
          top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
          width: 220, height: 220,
          borderRadius: "50%",
          border: "1px solid rgba(168,85,247,0.15)",
          animation: "orb-ring3 4s ease-in-out infinite",
        }} />

        {/* Second ring */}
        <div style={{
          position: "absolute",
          top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
          width: 170, height: 170,
          borderRadius: "50%",
          border: "1px solid rgba(168,85,247,0.25)",
          animation: "orb-ring2 3.5s ease-in-out infinite 0.3s",
        }} />

        {/* Orbiting dot 1 */}
        <div style={{
          position: "absolute",
          top: "50%", left: "50%",
          width: 160, height: 160,
          marginTop: -80, marginLeft: -80,
          borderRadius: "50%",
          animation: "orbit1 6s linear infinite",
        }}>
          <div style={{
            position: "absolute", top: -5, left: "50%", marginLeft: -5,
            width: 10, height: 10, borderRadius: "50%",
            background: "rgba(196,181,253,0.9)",
            boxShadow: "0 0 12px rgba(196,181,253,1), 0 0 24px rgba(168,85,247,0.8)",
          }} />
        </div>

        {/* Orbiting dot 2 (opposite, smaller) */}
        <div style={{
          position: "absolute",
          top: "50%", left: "50%",
          width: 130, height: 130,
          marginTop: -65, marginLeft: -65,
          borderRadius: "50%",
          animation: "orbit2 4.5s linear infinite reverse",
        }}>
          <div style={{
            position: "absolute", top: -4, left: "50%", marginLeft: -4,
            width: 8, height: 8, borderRadius: "50%",
            background: "rgba(139,92,246,0.9)",
            boxShadow: "0 0 10px rgba(139,92,246,1), 0 0 20px rgba(109,40,217,0.7)",
          }} />
        </div>

        {/* Core orb glow (large blurred) */}
        <div style={{
          position: "absolute",
          top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
          width: 120, height: 120,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(168,85,247,0.35) 0%, rgba(109,40,217,0.2) 40%, transparent 70%)",
          filter: "blur(20px)",
          animation: "orb-pulse 2.8s ease-in-out infinite",
        }} />

        {/* Core orb */}
        <div style={{
          position: "relative",
          width: 96, height: 96,
          borderRadius: "50%",
          background: "radial-gradient(circle at 35% 30%, rgba(220,180,255,0.35) 0%, rgba(147,51,234,0.8) 40%, rgba(88,28,220,0.95) 80%, rgba(50,10,120,1) 100%)",
          boxShadow: "0 0 30px rgba(147,51,234,0.7), 0 0 60px rgba(109,40,217,0.4), 0 0 100px rgba(88,28,220,0.25), inset 0 2px 8px rgba(255,255,255,0.15)",
          animation: "orb-breathe 2.8s ease-in-out infinite",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {/* Inner shimmer */}
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "radial-gradient(circle at 40% 35%, rgba(255,255,255,0.5) 0%, rgba(196,181,253,0.2) 50%, transparent 70%)",
            animation: "orb-shimmer 2.8s ease-in-out infinite",
          }} />
        </div>
      </div>

      {/* ── Progress bar (minimal, at bottom) ── */}
      <div style={{
        position: "absolute", bottom: 56, left: "50%",
        transform: "translateX(-50%)",
        width: 180,
        opacity: show ? 1 : 0,
        transition: "opacity 0.6s ease 0.8s",
      }}>
        <div style={{
          height: 2, borderRadius: 2,
          background: "rgba(109,40,217,0.2)",
          overflow: "hidden",
        }}>
          <div style={{
            height: "100%", borderRadius: 2,
            width: `${progress}%`,
            background: "linear-gradient(90deg, rgba(139,92,246,0.8), rgba(196,181,253,1), rgba(139,92,246,0.8))",
            boxShadow: "0 0 8px rgba(196,181,253,0.8)",
            transition: "width 0.25s ease-out",
          }} />
        </div>
      </div>

      {/* ── Keyframes ── */}
      <style>{`
        @keyframes bup0 {
          0%   { transform:translateX(0) translateY(0) scale(1); opacity:0; }
          6%   { opacity:1; }
          50%  { transform:translateX(20px) translateY(-50vh) scale(1.06); }
          94%  { opacity:0.7; }
          100% { transform:translateX(-8px) translateY(-108vh) scale(0.88); opacity:0; }
        }
        @keyframes bup1 {
          0%   { transform:translateX(0) translateY(0) scale(1); opacity:0; }
          6%   { opacity:1; }
          50%  { transform:translateX(-24px) translateY(-50vh) scale(1.1); }
          94%  { opacity:0.7; }
          100% { transform:translateX(14px) translateY(-108vh) scale(0.85); opacity:0; }
        }
        @keyframes bup2 {
          0%   { transform:translateX(0) translateY(0) scale(1); opacity:0; }
          6%   { opacity:1; }
          40%  { transform:translateX(16px) translateY(-40vh) scale(1.04); }
          70%  { transform:translateX(-12px) translateY(-70vh) scale(1.08); }
          94%  { opacity:0.6; }
          100% { transform:translateX(6px) translateY(-108vh) scale(0.9); opacity:0; }
        }
        @keyframes bup3 {
          0%   { transform:translateX(0) translateY(0) scale(1); opacity:0; }
          6%   { opacity:1; }
          35%  { transform:translateX(-18px) translateY(-35vh) scale(1.12); }
          65%  { transform:translateX(22px) translateY(-65vh) scale(1.03); }
          94%  { opacity:0.65; }
          100% { transform:translateX(-6px) translateY(-108vh) scale(0.87); opacity:0; }
        }
        @keyframes orb-breathe {
          0%,100% { transform:scale(1); }
          50%      { transform:scale(1.08); }
        }
        @keyframes orb-pulse {
          0%,100% { transform:translate(-50%,-50%) scale(1); opacity:0.6; }
          50%      { transform:translate(-50%,-50%) scale(1.3); opacity:1; }
        }
        @keyframes orb-shimmer {
          0%,100% { opacity:0.6; transform:scale(1) rotate(0deg); }
          50%      { opacity:1; transform:scale(1.15) rotate(15deg); }
        }
        @keyframes orb-ring2 {
          0%,100% { transform:translate(-50%,-50%) scale(1); opacity:0.5; }
          50%      { transform:translate(-50%,-50%) scale(1.08); opacity:1; }
        }
        @keyframes orb-ring3 {
          0%,100% { transform:translate(-50%,-50%) scale(1); opacity:0.2; }
          50%      { transform:translate(-50%,-50%) scale(1.06); opacity:0.5; }
        }
        @keyframes orbit1 {
          from { transform:rotate(0deg); }
          to   { transform:rotate(360deg); }
        }
        @keyframes orbit2 {
          from { transform:rotate(0deg); }
          to   { transform:rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
