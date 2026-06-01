import { useEffect, useState, useRef } from "react";
import { getInitialResolvedTheme } from "@/lib/theme";

interface Bubble {
  id: number;
  x: number;          // % from left
  size: number;       // px diameter
  duration: number;   // s to float to top
  delay: number;      // s start delay
  color: string;
  blur: number;       // px blur
  wobble: number;     // amplitude px horizontal wobble
}

const PHASES = ["Инициализация...", "Загрузка данных...", "Подготовка ленты...", "Почти готово...", "Готово ✓"];

const BUBBLE_COLORS = [
  "rgba(203,255,77,0.55)",
  "rgba(168,85,247,0.5)",
  "rgba(59,130,246,0.45)",
  "rgba(236,72,153,0.45)",
  "rgba(52,211,153,0.4)",
  "rgba(251,191,36,0.45)",
  "rgba(203,255,77,0.35)",
  "rgba(168,85,247,0.35)",
];

function generateBubbles(count: number): Bubble[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: 5 + Math.random() * 90,
    size: 12 + Math.random() * 52,
    duration: 5 + Math.random() * 9,
    delay: Math.random() * 10,
    color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
    blur: Math.random() * 3,
    wobble: 8 + Math.random() * 20,
  }));
}

export default function Splash({ onComplete }: { onComplete: () => void }) {
  const [fadeOut, setFadeOut] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [logoVisible, setLogoVisible] = useState(false);
  const [titleVisible, setTitleVisible] = useState(false);
  const [barVisible, setBarVisible] = useState(false);
  const bubbles = useRef<Bubble[]>(generateBubbles(22));
  const isDark = getInitialResolvedTheme() === "dark";

  useEffect(() => {
    const t1 = setTimeout(() => setLogoVisible(true), 100);
    const t2 = setTimeout(() => setTitleVisible(true), 400);
    const t3 = setTimeout(() => setBarVisible(true), 640);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  useEffect(() => {
    const duration = 2400;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const p = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(p);
      const phaseAt = [0, 22, 48, 72, 94];
      const newPhase = phaseAt.filter(t => p >= t).length - 1;
      setPhaseIndex(Math.max(0, Math.min(newPhase, PHASES.length - 1)));
      if (elapsed < duration) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    const exitTimer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => onComplete(), 500);
    }, duration + 200);
    return () => { clearTimeout(exitTimer); };
  }, [onComplete]);

  const bgDark = "linear-gradient(175deg, #05050c 0%, #0c0a1a 45%, #0a080f 100%)";
  const bgLight = "linear-gradient(175deg, #f0f0ff 0%, #e8e0f8 45%, #f5f2ff 100%)";

  return (
    <div
      className={`fixed inset-0 z-[100] overflow-hidden flex flex-col items-center justify-center transition-all duration-700 ease-in-out ${fadeOut ? "opacity-0 scale-[1.05]" : "opacity-100 scale-100"}`}
      style={{ background: isDark ? bgDark : bgLight }}
    >
      {/* ── Lava-lamp bubbles ── */}
      {bubbles.current.map(b => (
        <div
          key={b.id}
          style={{
            position: "absolute",
            bottom: `-${b.size + 10}px`,
            left: `${b.x}%`,
            width: b.size,
            height: b.size,
            borderRadius: "50%",
            background: b.color,
            filter: `blur(${b.blur}px)`,
            backdropFilter: "blur(2px)",
            border: `1px solid ${b.color.replace(/[\d.]+\)$/, "0.8)")}`,
            boxShadow: `0 0 ${b.size * 0.6}px ${b.color}, inset 0 2px 4px rgba(255,255,255,0.3)`,
            animationName: `bubble-rise-${b.id % 4}`,
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
            animationTimingFunction: "ease-in-out",
            animationIterationCount: "infinite",
            animationFillMode: "both",
          }}
        />
      ))}

      {/* ── Warm lamp glow at bottom ── */}
      <div style={{
        position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "110%", height: "45%",
        background: isDark
          ? "radial-gradient(ellipse at 50% 100%, rgba(168,85,247,0.18) 0%, rgba(203,255,77,0.06) 40%, transparent 70%)"
          : "radial-gradient(ellipse at 50% 100%, rgba(168,85,247,0.12) 0%, rgba(99,60,255,0.05) 40%, transparent 70%)",
        filter: "blur(20px)",
        pointerEvents: "none",
      }} />

      {/* ── Top ambient orbs ── */}
      <div style={{
        position: "absolute", top: "-10%", left: "20%",
        width: "50vw", height: "50vw", borderRadius: "50%",
        background: isDark ? "rgba(203,255,77,0.05)" : "rgba(120,80,255,0.06)",
        filter: "blur(70px)", animation: "orb-drift 11s ease-in-out infinite",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", top: "-5%", right: "10%",
        width: "40vw", height: "40vw", borderRadius: "50%",
        background: isDark ? "rgba(168,85,247,0.07)" : "rgba(236,72,153,0.06)",
        filter: "blur(60px)", animation: "orb-drift 14s ease-in-out infinite reverse",
        pointerEvents: "none",
      }} />

      {/* ── Main content ── */}
      <div className="relative z-10 flex flex-col items-center px-8 w-full max-w-xs">

        {/* Logo */}
        <div style={{
          position: "relative", width: 96, height: 96,
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 28,
          opacity: logoVisible ? 1 : 0,
          transform: logoVisible ? "scale(1) translateY(0)" : "scale(0.6) translateY(20px)",
          transition: "opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1)",
        }}>
          {/* Spinning conic ring */}
          <div style={{
            position: "absolute", inset: -6, borderRadius: "26px",
            background: "conic-gradient(from 0deg, #CBFF4D, #a855f7, #ec4899, #3b82f6, #CBFF4D)",
            opacity: 0.85,
            animation: "ring-spin 5s linear infinite",
          }} />
          {/* Glass inner */}
          <div style={{
            position: "relative", width: "100%", height: "100%",
            borderRadius: "20px",
            background: isDark
              ? "linear-gradient(145deg, rgba(20,18,36,0.95), rgba(10,8,20,0.98))"
              : "rgba(255,255,255,0.95)",
            backdropFilter: "blur(12px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 20px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
          }}>
            <span style={{ fontSize: 42 }}>🌙</span>
          </div>
          {/* Outer glow */}
          <div style={{
            position: "absolute", inset: -18, borderRadius: "38px",
            background: "conic-gradient(from 0deg, #CBFF4D22, #a855f722, #ec489922, #CBFF4D22)",
            filter: "blur(22px)",
            animation: "ring-spin 5s linear infinite",
            zIndex: -1,
          }} />
          {/* Bubble floating off the logo */}
          <div style={{
            position: "absolute", top: -8, right: -8,
            width: 18, height: 18, borderRadius: "50%",
            background: "rgba(203,255,77,0.7)",
            boxShadow: "0 0 12px rgba(203,255,77,0.9)",
            animation: "logo-bubble1 3s ease-in-out infinite",
          }} />
          <div style={{
            position: "absolute", bottom: -4, left: -10,
            width: 12, height: 12, borderRadius: "50%",
            background: "rgba(168,85,247,0.8)",
            boxShadow: "0 0 10px rgba(168,85,247,0.9)",
            animation: "logo-bubble2 3.7s ease-in-out infinite 0.6s",
          }} />
        </div>

        {/* Title */}
        <div style={{
          opacity: titleVisible ? 1 : 0,
          transform: titleVisible ? "translateY(0)" : "translateY(18px)",
          transition: "opacity 0.6s ease, transform 0.6s cubic-bezier(0.16,1,0.3,1)",
          textAlign: "center", marginBottom: 8,
        }}>
          <h1 style={{
            fontSize: 48, fontWeight: 900, letterSpacing: "-0.04em",
            lineHeight: 1, margin: 0,
            background: "linear-gradient(135deg, #CBFF4D 0%, #a855f7 40%, #ec4899 70%, #CBFF4D 100%)",
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text", backgroundClip: "text",
            color: "transparent",
            animation: "gradient-shift 3s linear infinite",
          }}>
            Vexora
          </h1>
          <p style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.38em",
            textTransform: "uppercase", marginTop: 7,
            color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)",
          }}>
            Create · Connect · Inspire
          </p>
        </div>

        {/* Progress bar */}
        <div style={{
          width: "100%", maxWidth: 240, marginTop: 40,
          opacity: barVisible ? 1 : 0,
          transform: barVisible ? "translateY(0)" : "translateY(12px)",
          transition: "opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s",
        }}>
          <div style={{
            height: 5, borderRadius: 5, overflow: "hidden",
            background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
          }}>
            <div style={{
              height: "100%", borderRadius: 5,
              width: `${progress}%`,
              background: "linear-gradient(90deg, #CBFF4D, #a855f7, #ec4899)",
              transition: "width 0.3s ease-out",
              boxShadow: "0 0 14px rgba(203,255,77,0.65), 0 0 28px rgba(203,255,77,0.3)",
            }} />
          </div>

          <div style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "center", marginTop: 10,
          }}>
            <p style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: isDark ? "rgba(255,255,255,0.32)" : "rgba(0,0,0,0.32)",
            }}>
              {PHASES[phaseIndex]}
            </p>
            <p style={{
              fontSize: 11, fontFamily: "monospace", fontWeight: 700,
              color: progress === 100 ? "#CBFF4D" : (isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.25)"),
              transition: "color 0.3s ease",
            }}>
              {progress}%
            </p>
          </div>

          {/* Phase dots */}
          <div style={{ display: "flex", justifyContent: "center", gap: 5, marginTop: 14 }}>
            {PHASES.map((_, i) => (
              <div key={i} style={{
                width: i === phaseIndex ? 18 : 5,
                height: 5, borderRadius: 5,
                background: i <= phaseIndex
                  ? "linear-gradient(90deg, #CBFF4D, #a855f7)"
                  : (isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"),
                transition: "width 0.3s cubic-bezier(0.34,1.56,0.64,1), background 0.3s",
                boxShadow: i <= phaseIndex ? "0 0 8px rgba(203,255,77,0.5)" : "none",
              }} />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes orb-drift {
          0%,100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(4%,5%) scale(1.07); }
        }
        @keyframes ring-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes gradient-shift {
          0%   { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        /* 4 bubble path variants with horizontal wobble */
        @keyframes bubble-rise-0 {
          0%   { transform: translateX(0px) translateY(0px) scale(1);   opacity: 0; }
          8%   { opacity: 1; }
          50%  { transform: translateX(18px) translateY(-50vh) scale(1.05); }
          92%  { opacity: 0.7; }
          100% { transform: translateX(-8px) translateY(-105vh) scale(0.9); opacity: 0; }
        }
        @keyframes bubble-rise-1 {
          0%   { transform: translateX(0px) translateY(0px) scale(1);   opacity: 0; }
          8%   { opacity: 1; }
          50%  { transform: translateX(-22px) translateY(-50vh) scale(1.08); }
          92%  { opacity: 0.7; }
          100% { transform: translateX(12px) translateY(-105vh) scale(0.85); opacity: 0; }
        }
        @keyframes bubble-rise-2 {
          0%   { transform: translateX(0px) translateY(0px) scale(1);   opacity: 0; }
          8%   { opacity: 1; }
          40%  { transform: translateX(14px) translateY(-40vh) scale(1.03); }
          70%  { transform: translateX(-10px) translateY(-70vh) scale(1.06); }
          92%  { opacity: 0.6; }
          100% { transform: translateX(6px) translateY(-105vh) scale(0.9); opacity: 0; }
        }
        @keyframes bubble-rise-3 {
          0%   { transform: translateX(0px) translateY(0px) scale(1);   opacity: 0; }
          8%   { opacity: 1; }
          35%  { transform: translateX(-16px) translateY(-35vh) scale(1.1); }
          65%  { transform: translateX(20px) translateY(-65vh) scale(1.02); }
          92%  { opacity: 0.65; }
          100% { transform: translateX(-5px) translateY(-105vh) scale(0.88); opacity: 0; }
        }
        @keyframes logo-bubble1 {
          0%,100% { transform: translate(0,0) scale(1); opacity: 0.9; }
          50%      { transform: translate(4px,-6px) scale(1.15); opacity: 1; }
        }
        @keyframes logo-bubble2 {
          0%,100% { transform: translate(0,0) scale(1); opacity: 0.85; }
          50%      { transform: translate(-5px,-8px) scale(1.2); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
