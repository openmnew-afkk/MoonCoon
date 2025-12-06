import { useEffect, useState } from "react";
import { Sparkles, Moon, Star, Zap } from "lucide-react";

/**
 * Premium splash screen with cosmic theme.
 * Displays an animated moon logo, stardust effects, and a sleek progress bar.
 * Calls `onComplete` when the animation finishes.
 */
export default function ModernSplash({
  onComplete,
  duration = 3000,
}: {
  onComplete: () => void;
  duration?: number;
}) {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const [textVisible, setTextVisible] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  // Generate particles
  useEffect(() => {
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
    }));
    setParticles(newParticles);
  }, []);

  // Simulate loading progress with smooth easing
  useEffect(() => {
    const start = Date.now();

    // Show text after a small delay
    setTimeout(() => setTextVisible(true), 400);

    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      // Smooth easing function for more natural progress
      const rawPercent = (elapsed / duration) * 100;
      const easedPercent = rawPercent < 50 
        ? 2 * rawPercent * rawPercent / 100
        : -1 + (4 - 2 * rawPercent / 100) * rawPercent / 100;
      const percent = Math.min(Math.max(easedPercent, 0), 100);

      setProgress(percent);

      if (percent >= 100) {
        clearInterval(interval);
        // start fade‑out animation
        setTimeout(() => {
          setFadeOut(true);
          setTimeout(() => {
            onComplete();
          }, 600);
        }, 200);
      }
    }, 16); // 60fps
    return () => clearInterval(interval);
  }, [duration, onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden transition-all duration-700 ${
        fadeOut ? "opacity-0 scale-110 blur-md" : "opacity-100 scale-100 blur-0"
      }`}
      style={{
        background: "radial-gradient(ellipse at center, #1e1b4b 0%, #0f172a 50%, #000000 100%)",
      }}
    >
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-pink-900/20 animate-pulse" />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-gradient-to-r from-purple-400/40 to-blue-400/40 blur-sm animate-float"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${Math.random() * 4 + 3}s`,
            }}
          />
        ))}
      </div>

      {/* Background Stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-twinkle"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 2 + 0.5}px`,
              height: `${Math.random() * 2 + 0.5}px`,
              opacity: Math.random() * 0.8 + 0.2,
              animationDuration: `${Math.random() * 2 + 1.5}s`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo Container */}
        <div className="relative mb-10">
          {/* Outer Glow Rings */}
          <div className="absolute inset-0 -m-12 rounded-full bg-purple-500/30 blur-3xl animate-pulse" style={{ animationDuration: "3s" }} />
          <div className="absolute inset-0 -m-6 rounded-full bg-blue-500/20 blur-2xl animate-pulse" style={{ animationDuration: "4s", animationDelay: "0.5s" }} />

          {/* Rotating Rings */}
          <div className="relative w-40 h-40">
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-500/60 border-r-blue-500/60 animate-spin" style={{ animationDuration: "3s" }} />
            <div className="absolute inset-3 rounded-full border-2 border-transparent border-b-pink-500/60 border-l-indigo-500/60 animate-spin" style={{ animationDuration: "4s", animationDirection: "reverse" }} />
            <div className="absolute inset-6 rounded-full border border-purple-400/30 animate-spin" style={{ animationDuration: "5s" }} />

            {/* Center Logo with Glow */}
            <div className="absolute inset-6 rounded-full bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 flex items-center justify-center shadow-2xl border border-white/20 backdrop-blur-xl relative overflow-hidden">
              {/* Inner glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 animate-pulse" />
              
              <Moon size={56} className="text-purple-400 fill-purple-400/30 drop-shadow-[0_0_20px_rgba(168,85,247,0.6)] relative z-10" />
              <Sparkles size={20} className="absolute top-8 right-8 text-blue-400 animate-bounce z-10" style={{ animationDuration: "1.5s" }} />
              <Zap size={16} className="absolute bottom-8 left-8 text-yellow-400 animate-pulse z-10" style={{ animationDuration: "2s" }} />
            </div>
          </div>
        </div>

        {/* Text Content */}
        <div className={`text-center transition-all duration-800 transform ${textVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
          <h1 className="text-6xl font-black tracking-tight mb-4">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(168,85,247,0.5)] animate-gradient">
              MoonCoon
            </span>
          </h1>
          <p className="text-blue-200/70 font-semibold text-sm tracking-[0.2em] uppercase flex items-center justify-center gap-4 mb-2">
            <span className="h-[2px] w-12 bg-gradient-to-r from-transparent via-blue-500/60 to-blue-500/60"></span>
            Загрузка вселенной
            <span className="h-[2px] w-12 bg-gradient-to-l from-transparent via-blue-500/60 to-blue-500/60"></span>
          </p>
          <p className="text-slate-400/50 text-xs mt-1">Подготовка к путешествию...</p>
        </div>

        {/* Progress Bar */}
        <div className="mt-14 w-72 relative">
          {/* Track with glow */}
          <div className="h-2 w-full bg-slate-900/60 rounded-full overflow-hidden backdrop-blur-sm border border-white/10 shadow-inner">
            {/* Animated gradient indicator */}
            <div
              className="h-full bg-gradient-to-r from-purple-600 via-pink-500 via-blue-500 to-cyan-500 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.6)] transition-all duration-150 ease-out relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              {/* Glowing dot */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.9)] animate-pulse" />
            </div>
          </div>

          {/* Percentage with style */}
          <div className="mt-3 flex justify-between items-center text-xs font-mono">
            <span className="text-slate-500 font-semibold tracking-wider">ЗАГРУЗКА</span>
            <span className="text-transparent bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text font-bold text-sm">
              {Math.round(progress)}%
            </span>
          </div>
        </div>
      </div>

      {/* Footer with enhanced design */}
      <div className="absolute bottom-10 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Star size={10} className="text-purple-400/60 fill-purple-400/20 animate-pulse" />
          <p className="text-xs text-slate-500 font-semibold tracking-widest">
            POWERED BY OPENMNEW
          </p>
          <Star size={10} className="text-blue-400/60 fill-blue-400/20 animate-pulse" style={{ animationDelay: "0.5s" }} />
        </div>
        <div className="h-[1px] w-32 bg-gradient-to-r from-transparent via-slate-600/30 to-transparent mx-auto" />
      </div>

      {/* Add CSS animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.4; }
          50% { transform: translateY(-20px) translateX(10px); opacity: 0.8; }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-twinkle {
          animation: twinkle 2s ease-in-out infinite;
        }
        .animate-shimmer {
          animation: shimmer 2s linear infinite;
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}
