import { useEffect, useState, useRef } from "react";
import { APP_NAME } from "@/lib/brand";

interface Particle { id: number; x: number; size: number; duration: number; delay: number; color: string; }

function makeParticles(n: number): Particle[] {
  const colors = ["rgba(232,180,248,0.6)", "rgba(129,140,248,0.5)", "rgba(251,113,133,0.4)", "rgba(251,191,36,0.4)"];
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
    <div className="fixed inset-0 z-100 overflow-hidden flex flex-col items-center justify-center"
      style={{
        background: "linear-gradient(180deg, #08080c 0%, #12121a 50%, #08080c 100%)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
        opacity: out ? 0 : 1,
        transform: out ? "scale(1.02)" : "scale(1)",
      }}>
      {/* Ambient glows */}
      <div className="absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, hsl(280 60% 75% / 0.08) 0%, transparent 70%)", filter: "blur(60px)" }} />
      <div className="absolute bottom-[25%] left-[35%] w-[250px] h-[250px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, hsl(230 90% 72% / 0.06) 0%, transparent 70%)", filter: "blur(50px)" }} />
      <div className="absolute top-[60%] right-[10%] w-[200px] h-[200px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, hsl(350 75% 65% / 0.05) 0%, transparent 70%)", filter: "blur(40px)" }} />

      {/* Particles */}
      {particles.current.map(p => (
        <div key={p.id} className="absolute -bottom-2.5 rounded-full"
          style={{
            left: `${p.x}%`,
            width: p.size, height: p.size,
            background: p.color,
            animationName: "splash-particle-up",
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
            animationFillMode: "both",
          }} />
      ))}

      {/* Logo + Name */}
      <div style={{
        opacity: show ? 1 : 0,
        transform: show ? "translateY(0) scale(1)" : "translateY(20px) scale(0.9)",
        transition: "all 0.8s cubic-bezier(0.16,1,0.3,1)",
      }}
        className="flex flex-col items-center gap-7">
        {/* Icon */}
        <div className="w-[88px] h-[88px] flex items-center justify-center"
          style={{
            borderRadius: 24,
            background: "linear-gradient(135deg, #E8B4F8 0%, #818CF8 50%, #FB7185 100%)",
            boxShadow: "0 8px 48px rgba(129,140,248,0.4), 0 0 0 1px rgba(255,255,255,0.1)",
            animation: "splash-icon-glow 3s ease-in-out infinite",
          }}>
          <span className="text-[40px] font-black text-black tracking-[-0.04em]"
            style={{ fontFamily: "Space Grotesk" }}>V</span>
        </div>

        {/* App name */}
        <div className="text-center">
          <h1 className="text-[36px] font-black tracking-[-0.04em] text-gradient m-0"
            style={{ fontFamily: "Space Grotesk" }}>{APP_NAME}</h1>
          <p className="text-[13px] font-medium mt-2 tracking-[0.08em]"
            style={{ color: "hsl(280 60% 75% / 0.4)", fontFamily: "Space Grotesk" }}>new era of communication</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-[200px]"
        style={{ opacity: show ? 1 : 0, transition: "opacity 0.6s ease 0.5s" }}>
        <div className="h-[2.5px] rounded-full overflow-hidden" style={{ background: "hsl(280 60% 75% / 0.1)" }}>
          <div className="h-full rounded-full"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, #E8B4F8, #818CF8, #FB7185)",
              boxShadow: "0 0 16px rgba(129,140,248,0.5)",
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
          0%, 100% { box-shadow: 0 8px 48px rgba(129,140,248,0.4), 0 0 0 1px rgba(255,255,255,0.1); }
          50% { box-shadow: 0 8px 64px rgba(129,140,248,0.6), 0 0 80px rgba(232,180,248,0.15), 0 0 0 1px rgba(255,255,255,0.15); }
        }
      `}</style>
    </div>
  );
}
