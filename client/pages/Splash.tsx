import { useEffect, useState } from "react";
import { Sparkles, Moon, Star } from "lucide-react";

/**
 * Premium splash screen with cosmic theme.
 * Displays an animated moon logo, stardust effects, and a sleek progress bar.
 * Calls `onComplete` when the animation finishes.
 */
export default function ModernSplash({
  onComplete,
  duration = 3500, // slightly longer for better effect
}: {
  onComplete: () => void;
  duration?: number;
}) {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const [textVisible, setTextVisible] = useState(false);

  // Simulate loading progress
  useEffect(() => {
    const start = Date.now();

    // Show text after a small delay
    setTimeout(() => setTextVisible(true), 500);

    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      // Non-linear progress for more realistic feel
      const rawPercent = (elapsed / duration) * 100;
      const percent = Math.min(rawPercent, 100);

      setProgress(percent);

      if (percent >= 100) {
        clearInterval(interval);
        // start fade‑out animation
        setFadeOut(true);
        setTimeout(() => {
          onComplete();
        }, 800);
      }
    }, 16); // 60fps
    return () => clearInterval(interval);
  }, [duration, onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden transition-all duration-1000 ${fadeOut ? "opacity-0 scale-105 blur-sm" : "opacity-100 scale-100 blur-0"
        }`}
      style={{
        background: "radial-gradient(circle at center, #1e1b4b 0%, #0f172a 100%)",
      }}
    >
      {/* Background Stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              opacity: Math.random() * 0.5 + 0.1,
              animationDuration: `${Math.random() * 3 + 2}s`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo Container */}
        <div className="relative mb-12">
          {/* Outer Glow Ring */}
          <div className="absolute inset-0 -m-8 rounded-full bg-purple-500/20 blur-3xl animate-pulse" />

          {/* Rotating Rings */}
          <div className="relative w-32 h-32">
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-500/50 border-r-blue-500/50 animate-spin" style={{ animationDuration: "3s" }} />
            <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-pink-500/50 border-l-indigo-500/50 animate-spin" style={{ animationDuration: "4s", animationDirection: "reverse" }} />

            {/* Center Logo */}
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-slate-900 to-indigo-950 flex items-center justify-center shadow-2xl border border-white/10 backdrop-blur-md">
              <Moon size={48} className="text-purple-400 fill-purple-400/20 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
              <Sparkles size={24} className="absolute top-6 right-6 text-blue-400 animate-bounce" style={{ animationDuration: "2s" }} />
            </div>
          </div>
        </div>

        {/* Text Content */}
        <div className={`text-center transition-all duration-1000 transform ${textVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}>
          <h1 className="text-5xl font-black tracking-tight mb-3">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent drop-shadow-lg">
              MoonCoon
            </span>
          </h1>
          <p className="text-blue-200/60 font-medium text-sm tracking-widest uppercase flex items-center justify-center gap-3">
            <span className="h-[1px] w-8 bg-gradient-to-r from-transparent to-blue-500/50"></span>
            Загрузка вселенной
            <span className="h-[1px] w-8 bg-gradient-to-l from-transparent to-blue-500/50"></span>
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mt-12 w-64 relative">
          {/* Track */}
          <div className="h-1.5 w-full bg-slate-800/50 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
            {/* Indicator */}
            <div
              className="h-full bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)] transition-all duration-100 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
            </div>
          </div>

          {/* Percentage */}
          <div className="mt-2 flex justify-between text-[10px] font-mono text-slate-500">
            <span>LOADING...</span>
            <span className="text-purple-400">{Math.round(progress)}%</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 text-center">
        <p className="text-[10px] text-slate-600 flex items-center gap-1.5">
          <Star size={8} className="fill-slate-600" />
          POWERED BY OPENMNEW
          <Star size={8} className="fill-slate-600" />
        </p>
      </div>
    </div>
  );
}
