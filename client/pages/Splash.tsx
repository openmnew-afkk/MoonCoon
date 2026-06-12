import { useEffect, useState, useRef } from "react";
import { APP_NAME } from "@/lib/brand";

interface Particle { id: number; x: number; size: number; duration: number; delay: number; color: string; }

function makeParticles(n: number): Particle[] {
  const colors = ["rgba(245,158,11,0.6)", "rgba(168,85,247,0.5)", "rgba(236,72,153,0.4)", "rgba(251,191,36,0.5)"];
  return Array.from({ length: n }, (_, i) => ({
    id: i, x: 5 + Math.random() * 90, size: 2 + Math.random() * 3,
    duration: 4 + Math.random() * 6, delay: Math.random() * 4,
    color: colors[i % colors.length],
  }));
}

export default function Splash({ onComplete }: { onComplete: () => void }) {
  const [out, setOut] = useState(false);
  const [progress, setProgress] = useState(0);
  const [show, setShow] = useState(false);
  const particles = useRef(makeParticles(14));

  useEffect(() => { setTimeout(() => setShow(true), 100); }, []);

  useEffect(() => {
    const dur = 2400;
    const start = Date.now();
    const tick = () => {
      const p = Math.min(100, Math.round(((Date.now() - start) / dur) * 100));
      setProgress(p);
      if (p < 100) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    const exit = setTimeout(() => { setOut(true); setTimeout(onComplete, 500); }, dur + 300);
    return () => clearTimeout(exit);
  }, [onComplete]);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100, overflow: "hidden",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(180deg, #0A0806 0%, #12090A 50%, #0A0806 100%)",
      transition: "opacity 0.5s ease, transform 0.5s ease",
      opacity: out ? 0 : 1, transform: out ? "scale(1.02)" : "scale(1)",
      fontFamily: "Space Grotesk, system-ui, sans-serif",
    }}>
      {/* Ambient glows */}
      <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translate(-50%, -50%)", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)", filter: "blur(60px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "25%", left: "35%", width: 250, height: 250, borderRadius: "50%", background: "radial-gradient(circle, rgba(168,85,247,0.06) 0%, transparent 70%)", filter: "blur(50px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "60%", right: "10%", width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(236,72,153,0.05) 0%, transparent 70%)", filter: "blur(40px)", pointerEvents: "none" }} />

      {/* Particles */}
      {particles.current.map(p => (
        <div key={p.id} style={{
          position: "absolute", bottom: -10, left: `${p.x}%`,
          width: p.size, height: p.size, borderRadius: "50%",
          background: p.color,
          animationName: "splash-particle-up", animationDuration: `${p.duration}s`,
          animationDelay: `${p.delay}s`, animationTimingFunction: "linear",
          animationIterationCount: "infinite", animationFillMode: "both",
        }} />
      ))}

      {/* Logo + Name */}
      <div style={{
        opacity: show ? 1 : 0, transform: show ? "translateY(0) scale(1)" : "translateY(20px) scale(0.9)",
        transition: "all 0.8s cubic-bezier(0.16,1,0.3,1)",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 28,
      }}>
        {/* Icon */}
        <div style={{
          width: 88, height: 88, borderRadius: 24,
          background: "linear-gradient(135deg, #F59E0B 0%, #F97316 50%, #EC4899 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 8px 48px rgba(245,158,11,0.4), 0 0 0 1px rgba(255,255,255,0.1)",
          animation: "splash-icon-glow 3s ease-in-out infinite",
        }}>
          <span style={{ fontSize: 40, fontWeight: 900, color: "#000", letterSpacing: "-0.04em", fontFamily: "Space Grotesk" }}>V</span>
        </div>

        {/* App name */}
        <div style={{ textAlign: "center" }}>
          <h1 style={{
            fontSize: 36, fontWeight: 900, letterSpacing: "-0.04em",
            background: "linear-gradient(135deg, #FBBF24 0%, #F59E0B 50%, #A855F7 100%)",
            WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
            margin: 0, fontFamily: "Space Grotesk",
          }}>{APP_NAME}</h1>
          <p style={{ fontSize: 13, color: "rgba(245,158,11,0.4)", fontWeight: 500, marginTop: 8, letterSpacing: "0.08em", fontFamily: "Space Grotesk" }}>new era of communication</p>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{
        position: "absolute", bottom: 64, left: "50%", transform: "translateX(-50%)",
        width: 200, opacity: show ? 1 : 0, transition: "opacity 0.6s ease 0.5s",
      }}>
        <div style={{ height: 2.5, borderRadius: 999, background: "rgba(245,158,11,0.1)", overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 999, width: `${progress}%`,
            background: "linear-gradient(90deg, #F59E0B, #F97316, #EC4899)",
            boxShadow: "0 0 16px rgba(245,158,11,0.5)",
            transition: "width 0.15s ease-out",
          }} />
        </div>
      </div>

      <style>{`
        @keyframes splash-particle-up {
          0% { transform: translateY(0) scale(0); opacity: 0; }
          10% { opacity: 0.7; transform: translateY(-10vh) scale(1); }
          90% { opacity: 0.3; }
          100% { transform: translateY(-110vh) scale(0.5); opacity: 0; }
        }
        @keyframes splash-icon-glow {
          0%, 100% { box-shadow: 0 8px 48px rgba(245,158,11,0.4), 0 0 0 1px rgba(255,255,255,0.1); }
          50% { box-shadow: 0 8px 64px rgba(245,158,11,0.6), 0 0 80px rgba(168,85,247,0.15), 0 0 0 1px rgba(255,255,255,0.15); }
        }
      `}</style>
    </div>
  );
}
