import { useEffect, useState } from "react";
import { Sparkles, Target } from "lucide-react";
import { getInitialResolvedTheme } from "@/lib/theme";

export default function Splash({ onComplete }: { onComplete: () => void }) {
  const [fadeOut, setFadeOut] = useState(false);
  const [progress, setProgress] = useState(0);
  const isDark = getInitialResolvedTheme() === "dark";

  useEffect(() => {
    const start = Date.now();
    const duration = 800;

    const tick = () => {
      const elapsed = Date.now() - start;
      const p = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(p);
      if (elapsed < duration) {
        requestAnimationFrame(tick);
      }
    };
    const frame = requestAnimationFrame(tick);

    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => onComplete(), 400);
    }, duration + 100);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <div
      data-theme={isDark ? "dark" : "light"}
      className={`splash-screen fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden transition-all duration-700 ease-out ${
        fadeOut ? "opacity-0 scale-[1.02]" : "opacity-100 scale-100"
      } ${isDark ? "splash-dark" : "splash-light"}`}
    >
      <div className="splash-orb splash-orb-1" aria-hidden />
      <div className="splash-orb splash-orb-2" aria-hidden />
      <div className="splash-orb splash-orb-3" aria-hidden />
      <div className="splash-grid" aria-hidden />

      <div className="relative z-10 flex flex-col items-center px-8 w-full max-w-sm">
        <div className="splash-logo-wrap mb-8">
          <div className="splash-logo-ring" aria-hidden />
          <div className="splash-logo-box">
            <div className="relative">
              <Sparkles className="absolute -top-4 -right-4 text-amber-400 animate-pulse" size={20} />
              <Target className="w-16 h-16 text-primary drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
            </div>
          </div>
        </div>

        <h1 className="splash-title text-4xl sm:text-5xl font-black tracking-tighter mb-2">
          Vexora
        </h1>
        <p className="splash-tagline text-[11px] font-bold tracking-[0.4em] uppercase mb-12 opacity-60">
          Create · Connect · Inspire
        </p>

        <div className="w-full max-w-[240px] relative">
          <div className="splash-progress-track h-1.5 rounded-full overflow-hidden bg-white/5 border border-white/5">
            <div
              className="splash-progress-fill h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-4">
            <p className="splash-loading-text text-[10px] font-bold tracking-widest uppercase opacity-40">
              {progress < 100 ? "Initializing..." : "System Ready"}
            </p>
            <p className="text-[10px] font-mono opacity-30">{progress}%</p>
          </div>
        </div>
      </div>

      <style>{`
        .splash-light {
          background: linear-gradient(165deg, #f8fafc 0%, #e8eef7 45%, #f1f5f9 100%);
          color: #0f172a;
        }
        .splash-dark {
          background: linear-gradient(165deg, #0a0e17 0%, #0f1419 50%, #080c14 100%);
          color: #f8fafc;
        }

        .splash-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }
        .splash-light .splash-orb-1 {
          top: -15%;
          left: -10%;
          width: 55vw;
          height: 55vw;
          background: rgba(99, 102, 241, 0.2);
          animation: splash-float 9s ease-in-out infinite;
        }
        .splash-light .splash-orb-2 {
          bottom: -10%;
          right: -15%;
          width: 50vw;
          height: 50vw;
          background: rgba(168, 85, 247, 0.15);
          animation: splash-float 11s ease-in-out infinite reverse;
        }
        .splash-light .splash-orb-3 {
          top: 40%;
          left: 50%;
          width: 35vw;
          height: 35vw;
          transform: translate(-50%, -50%);
          background: rgba(59, 130, 246, 0.12);
          animation: splash-pulse 6s ease-in-out infinite;
        }
        .splash-dark .splash-orb-1 {
          top: -15%;
          left: -10%;
          width: 55vw;
          height: 55vw;
          background: rgba(124, 58, 237, 0.35);
          animation: splash-float 9s ease-in-out infinite;
        }
        .splash-dark .splash-orb-2 {
          bottom: -10%;
          right: -15%;
          width: 50vw;
          height: 50vw;
          background: rgba(217, 70, 239, 0.2);
          animation: splash-float 11s ease-in-out infinite reverse;
        }
        .splash-dark .splash-orb-3 {
          top: 40%;
          left: 50%;
          width: 35vw;
          height: 35vw;
          transform: translate(-50%, -50%);
          background: rgba(59, 130, 246, 0.18);
          animation: splash-pulse 6s ease-in-out infinite;
        }

        .splash-grid {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(
            circle at 1px 1px,
            currentColor 1px,
            transparent 0
          );
          background-size: 28px 28px;
          mask-image: radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent);
          -webkit-mask-image: radial-gradient(
            ellipse 70% 60% at 50% 40%,
            black,
            transparent
          );
          opacity: 0.06;
        }

        .splash-logo-wrap {
          position: relative;
          width: 7.5rem;
          height: 7.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .splash-logo-ring {
          position: absolute;
          inset: -6px;
          border-radius: 1.75rem;
          background: conic-gradient(from 0deg, #667eea, #a855f7, #ec4899, #667eea);
          opacity: 0.7;
          animation: splash-ring-spin 6s linear infinite;
        }
        .splash-logo-box {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }
        .splash-light .splash-logo-box {
          background: rgba(255, 255, 255, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.9);
          box-shadow:
            0 20px 50px rgba(99, 102, 241, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 1);
        }
        .splash-dark .splash-logo-box {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
        }
        .splash-moon-icon {
          color: inherit;
          filter: drop-shadow(0 0 16px rgba(139, 92, 246, 0.5));
          animation: splash-icon-pulse 3s ease-in-out infinite;
        }

        .splash-title {
          background: linear-gradient(
            135deg,
            #667eea 0%,
            #a855f7 40%,
            #ec4899 70%,
            #667eea 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: splash-slide-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards,
                     splash-gradient-shift 4s linear infinite;
        }
        .splash-tagline {
          color: color-mix(in srgb, currentColor 45%, transparent);
          animation: splash-slide-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.08s forwards;
          opacity: 0;
        }
        .splash-light .splash-progress-track {
          background: rgba(15, 23, 42, 0.08);
        }
        .splash-dark .splash-progress-track {
          background: rgba(255, 255, 255, 0.1);
        }
        .splash-progress-fill {
          background: linear-gradient(90deg, #667eea, #a855f7, #ec4899);
          box-shadow: 0 0 16px rgba(139, 92, 246, 0.6);
        }
        .splash-loading-text {
          color: color-mix(in srgb, currentColor 50%, transparent);
        }

        @keyframes splash-slide-up {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes splash-float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(4%, 3%) scale(1.05); }
        }
        @keyframes splash-pulse {
          0%, 100% { opacity: 0.7; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.08); }
        }
        @keyframes splash-ring-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes splash-icon-pulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 16px rgba(139, 92, 246, 0.5)); }
          50% { transform: scale(1.05); filter: drop-shadow(0 0 24px rgba(139, 92, 246, 0.7)); }
        }
        @keyframes splash-gradient-shift {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </div>
  );
}
