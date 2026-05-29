import { useEffect, useState, useRef } from "react";
import { getInitialResolvedTheme } from "@/lib/theme";

interface Particle {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
}

const PHASES = ["Инициализация...", "Загрузка данных...", "Подготовка ленты...", "Почти готово...", "Готово ✓"];

function generateParticles(count: number): Particle[] {
  const colors = ["#CBFF4D", "#a855f7", "#3b82f6", "#ec4899", "#34d399", "#f59e0b"];
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 6 + 5,
    delay: Math.random() * 8,
    color: colors[Math.floor(Math.random() * colors.length)],
  }));
}

export default function Splash({ onComplete }: { onComplete: () => void }) {
  const [fadeOut, setFadeOut] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [logoVisible, setLogoVisible] = useState(false);
  const [titleVisible, setTitleVisible] = useState(false);
  const [barVisible, setBarVisible] = useState(false);
  const particles = useRef<Particle[]>(generateParticles(18));
  const isDark = getInitialResolvedTheme() === "dark";

  useEffect(() => {
    // Staggered reveal
    const t1 = setTimeout(() => setLogoVisible(true), 80);
    const t2 = setTimeout(() => setTitleVisible(true), 360);
    const t3 = setTimeout(() => setBarVisible(true), 560);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  useEffect(() => {
    const duration = 2200;
    const start = Date.now();

    const tick = () => {
      const elapsed = Date.now() - start;
      const p = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(p);

      // Phase updates
      const phaseAt = [0, 22, 48, 72, 94];
      const newPhase = phaseAt.filter(t => p >= t).length - 1;
      setPhaseIndex(Math.max(0, Math.min(newPhase, PHASES.length - 1)));

      if (elapsed < duration) {
        requestAnimationFrame(tick);
      }
    };
    const frame = requestAnimationFrame(tick);

    const exitTimer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => onComplete(), 500);
    }, duration + 200);

    return () => { cancelAnimationFrame(frame); clearTimeout(exitTimer); };
  }, [onComplete]);

  return (
    <div
      className={`splash-root fixed inset-0 z-[100] overflow-hidden flex flex-col items-center justify-center transition-all duration-700 ease-in-out ${fadeOut ? "opacity-0 scale-[1.04]" : "opacity-100 scale-100"}`}
      style={{
        background: isDark
          ? "linear-gradient(160deg, #050508 0%, #0a0a14 40%, #08080f 100%)"
          : "linear-gradient(160deg, #f0f2ff 0%, #e8eaf6 40%, #f5f5fb 100%)",
      }}
    >
      {/* Ambient glow orbs */}
      <div style={{
        position: "absolute", top: "-20%", left: "-15%",
        width: "65vw", height: "65vw", borderRadius: "50%",
        background: isDark ? "rgba(203,255,77,0.07)" : "rgba(100,120,255,0.1)",
        filter: "blur(80px)", animation: "splash-orb-drift1 10s ease-in-out infinite",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "-15%", right: "-10%",
        width: "55vw", height: "55vw", borderRadius: "50%",
        background: isDark ? "rgba(168,85,247,0.1)" : "rgba(236,72,153,0.08)",
        filter: "blur(70px)", animation: "splash-orb-drift2 12s ease-in-out infinite",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        width: "40vw", height: "40vw", borderRadius: "50%",
        background: isDark ? "rgba(59,130,246,0.06)" : "rgba(99,102,241,0.07)",
        filter: "blur(60px)", transform: "translate(-50%,-50%)",
        animation: "splash-orb-pulse 6s ease-in-out infinite",
        pointerEvents: "none",
      }} />

      {/* Floating particles */}
      {particles.current.map(p => (
        <div
          key={p.id}
          className="splash-particle"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            opacity: 0.6,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
          }}
        />
      ))}

      {/* Dot grid */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `radial-gradient(circle at 1px 1px, ${isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)"} 1px, transparent 0)`,
        backgroundSize: "28px 28px",
        maskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent)",
        WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent)",
        pointerEvents: "none",
      }} />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center px-8 w-full max-w-sm">

        {/* Logo */}
        <div style={{
          position: "relative",
          width: 100, height: 100,
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 28,
          opacity: logoVisible ? 1 : 0,
          transform: logoVisible ? "scale(1) rotate(0deg)" : "scale(0.5) rotate(-15deg)",
          transition: "opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)",
        }}>
          {/* Spinning ring */}
          <div style={{
            position: "absolute", inset: -6, borderRadius: "28px",
            background: "conic-gradient(from 0deg, #CBFF4D, #a855f7, #ec4899, #3b82f6, #CBFF4D)",
            opacity: 0.8,
            animation: "adel-ring-spin 5s linear infinite",
          }} />
          {/* Inner card */}
          <div style={{
            position: "relative", width: "100%", height: "100%",
            borderRadius: "22px",
            background: isDark
              ? "linear-gradient(145deg, #141420, #0d0d1a)"
              : "rgba(255,255,255,0.95)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: isDark
              ? "0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)"
              : "0 20px 60px rgba(99,102,241,0.15), inset 0 1px 0 rgba(255,255,255,1)",
          }}>
            <span style={{ fontSize: 44 }}>🌙</span>
          </div>
          {/* Glow pulse */}
          <div style={{
            position: "absolute", inset: -16, borderRadius: "36px",
            background: "conic-gradient(from 0deg, #CBFF4D33, #a855f733, #ec489933, #CBFF4D33)",
            filter: "blur(20px)",
            animation: "adel-ring-spin 5s linear infinite",
            zIndex: -1,
          }} />
        </div>

        {/* Title */}
        <div style={{
          opacity: titleVisible ? 1 : 0,
          transform: titleVisible ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.6s ease, transform 0.6s cubic-bezier(0.16,1,0.3,1)",
          textAlign: "center",
          marginBottom: 8,
        }}>
          <h1 style={{
            fontSize: 44,
            fontWeight: 900,
            letterSpacing: "-0.04em",
            lineHeight: 1,
            margin: 0,
            background: "linear-gradient(135deg, #CBFF4D 0%, #a855f7 45%, #ec4899 75%, #CBFF4D 100%)",
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            animation: "gradient-shift 3s linear infinite",
          }}>
            Vexora
          </h1>
          <p style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.38em",
            textTransform: "uppercase",
            marginTop: 6,
            color: isDark ? "rgba(255,255,255,0.38)" : "rgba(0,0,0,0.38)",
          }}>
            Create · Connect · Inspire
          </p>
        </div>

        {/* Progress bar */}
        <div style={{
          width: "100%", maxWidth: 260, marginTop: 36,
          opacity: barVisible ? 1 : 0,
          transform: barVisible ? "translateY(0)" : "translateY(12px)",
          transition: "opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s",
        }}>
          {/* Track */}
          <div style={{
            height: 4, borderRadius: 4, overflow: "hidden",
            background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
            border: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.05)",
          }}>
            {/* Fill */}
            <div style={{
              height: "100%", borderRadius: 4,
              width: `${progress}%`,
              background: "linear-gradient(90deg, #CBFF4D, #a855f7, #ec4899)",
              transition: "width 0.3s ease-out",
              boxShadow: "0 0 12px rgba(203,255,77,0.6), 0 0 24px rgba(203,255,77,0.3)",
            }} />
          </div>

          {/* Labels */}
          <div style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "center", marginTop: 12,
          }}>
            <p style={{
              fontSize: 10, fontWeight: 700,
              letterSpacing: "0.12em", textTransform: "uppercase",
              color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)",
              transition: "opacity 0.3s ease",
            }}>
              {PHASES[phaseIndex]}
            </p>
            <p style={{
              fontSize: 11, fontFamily: "monospace",
              fontWeight: 600,
              color: progress === 100 ? "#CBFF4D" : (isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.25)"),
              transition: "color 0.3s ease",
            }}>
              {progress}%
            </p>
          </div>

          {/* Segment dots */}
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 16 }}>
            {PHASES.map((_, i) => (
              <div key={i} style={{
                width: i === phaseIndex ? 20 : 6,
                height: 4,
                borderRadius: 4,
                background: i <= phaseIndex
                  ? "linear-gradient(90deg, #CBFF4D, #a855f7)"
                  : (isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"),
                transition: "width 0.3s cubic-bezier(0.34,1.56,0.64,1), background 0.3s ease",
                boxShadow: i <= phaseIndex ? "0 0 8px rgba(203,255,77,0.5)" : "none",
              }} />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes splash-orb-drift1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(5%, 4%) scale(1.06); }
        }
        @keyframes splash-orb-drift2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-4%, -3%) scale(1.05); }
        }
        @keyframes splash-orb-pulse {
          0%, 100% { opacity: 0.5; transform: translate(-50%,-50%) scale(1); }
          50% { opacity: 1; transform: translate(-50%,-50%) scale(1.1); }
        }
      `}</style>
    </div>
  );
}
