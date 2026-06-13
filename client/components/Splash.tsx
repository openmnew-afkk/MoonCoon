import { useEffect, useState } from "react";

interface Props {
  onComplete: () => void;
}

export default function Splash({ onComplete }: Props) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 300);
    const t2 = setTimeout(() => setPhase(2), 1200);
    const t3 = setTimeout(() => setPhase(3), 2000);
    const t4 = setTimeout(() => onComplete(), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onComplete]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#0a0a0a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        overflow: "hidden",
      }}
    >
      {/* Background cinema rays */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at center, rgba(255,42,42,0.08) 0%, transparent 70%)",
          opacity: phase >= 1 ? 1 : 0,
          transition: "opacity 0.8s ease-out",
        }}
      />

      {/* Film strip decoration */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: "linear-gradient(90deg, transparent, #ff2a2a, #ff6b35, #ff2a2a, transparent)",
          opacity: phase >= 1 ? 0.6 : 0,
          transition: "opacity 0.5s",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 4,
          background: "linear-gradient(90deg, transparent, #ff2a2a, #ff6b35, #ff2a2a, transparent)",
          opacity: phase >= 1 ? 0.6 : 0,
          transition: "opacity 0.5s",
        }}
      />

      {/* Cinema icon */}
      <div
        style={{
          fontSize: 64,
          marginBottom: 20,
          opacity: phase >= 1 ? 1 : 0,
          transform: phase >= 1 ? "scale(1)" : "scale(0.5)",
          transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
          filter: phase >= 2 ? "drop-shadow(0 0 30px rgba(255,42,42,0.4))" : "none",
        }}
      >
        🎬
      </div>

      {/* App name */}
      <div
        style={{
          fontSize: 36,
          fontWeight: 800,
          letterSpacing: "-0.03em",
          opacity: phase >= 1 ? 1 : 0,
          transform: phase >= 1 ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.6s ease-out 0.2s",
          background: "linear-gradient(135deg, #ff2a2a, #ff6b35)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        VseOkNax
      </div>

      {/* Tagline */}
      <div
        style={{
          fontSize: 14,
          color: "rgba(255,255,255,0.5)",
          marginTop: 8,
          opacity: phase >= 2 ? 1 : 0,
          transform: phase >= 2 ? "translateY(0)" : "translateY(10px)",
          transition: "all 0.5s ease-out",
          letterSpacing: "0.05em",
        }}
      >
        кино без границ
      </div>

      {/* Loading bar */}
      <div
        style={{
          width: 120,
          height: 3,
          background: "rgba(255,255,255,0.08)",
          borderRadius: 2,
          marginTop: 32,
          overflow: "hidden",
          opacity: phase >= 2 ? 1 : 0,
          transition: "opacity 0.3s",
        }}
      >
        <div
          style={{
            width: phase >= 3 ? "100%" : phase >= 2 ? "60%" : "0%",
            height: "100%",
            background: "linear-gradient(90deg, #ff2a2a, #ff6b35)",
            borderRadius: 2,
            transition: "width 0.8s ease-out",
          }}
        />
      </div>

      {/* Fade out */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "#0a0a0a",
          opacity: phase >= 3 ? 1 : 0,
          transition: "opacity 0.6s ease-in",
          pointerEvents: "none",
        }}
      />

      <style>{`
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(255,42,42,0.2); }
          50% { box-shadow: 0 0 40px rgba(255,42,42,0.4); }
        }
      `}</style>
    </div>
  );
}
