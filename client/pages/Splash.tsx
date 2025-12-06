import { useEffect, useState } from "react";
import { Moon } from "lucide-react";

/**
 * Изящная и простая страница загрузки
 */
export default function Splash({
  onComplete,
  duration = 2000,
}: {
  onComplete: () => void;
  duration?: number;
}) {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const start = Date.now();
    let animationFrame: number;

    const updateProgress = () => {
      const elapsed = Date.now() - start;
      const percent = Math.min((elapsed / duration) * 100, 100);
      
      setProgress(percent);

      if (percent >= 100) {
        setFadeOut(true);
        setTimeout(() => {
          onComplete();
        }, 300);
      } else {
        animationFrame = requestAnimationFrame(updateProgress);
      }
    };

    animationFrame = requestAnimationFrame(updateProgress);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [duration, onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-300 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
      style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
      }}
    >
      {/* Простые звезды на фоне */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/30"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: "2px",
              height: "2px",
              animation: `twinkle ${2 + Math.random() * 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Основной контент */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Логотип */}
        <div className="mb-8 relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center border border-white/10 backdrop-blur-sm">
            <Moon size={40} className="text-purple-400" />
          </div>
          {/* Свечение */}
          <div className="absolute inset-0 -m-4 rounded-full bg-purple-500/20 blur-xl animate-pulse" />
        </div>

        {/* Название */}
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          MoonCoon
        </h1>

        {/* Прогресс бар */}
        <div className="mt-8 w-48">
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-100 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-center text-xs text-white/40 mt-2 font-mono">
            {Math.round(progress)}%
          </p>
        </div>
      </div>

      {/* CSS для анимации звезд */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
