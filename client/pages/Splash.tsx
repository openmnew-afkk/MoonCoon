import { useEffect, useState } from "react";
import { Moon, Sparkles } from "lucide-react";

/**
 * Красивая и изящная страница загрузки
 */
export default function Splash({
  onComplete,
  duration = 2500,
}: {
  onComplete: () => void;
  duration?: number;
}) {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const [logoScale, setLogoScale] = useState(0.8);

  useEffect(() => {
    const start = Date.now();
    let animationFrame: number;

    // Анимация появления логотипа
    setTimeout(() => setLogoScale(1), 100);

    const updateProgress = () => {
      const elapsed = Date.now() - start;
      // Плавная кривая прогресса
      const rawPercent = (elapsed / duration) * 100;
      const easedPercent = rawPercent < 50
        ? 2 * rawPercent * rawPercent / 100
        : -1 + (4 - 2 * rawPercent / 100) * rawPercent / 100;
      const percent = Math.min(Math.max(easedPercent, 0), 100);
      
      setProgress(percent);

      if (percent >= 100) {
        setFadeOut(true);
        setTimeout(() => {
          console.log("[SPLASH] Завершение загрузки, вызов onComplete");
          onComplete();
        }, 400);
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
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-all duration-500 ${
        fadeOut ? "opacity-0 scale-105" : "opacity-100 scale-100"
      }`}
      style={{
        background: "radial-gradient(ellipse at center, #1e1b4b 0%, #0f172a 50%, #000000 100%)",
      }}
    >
      {/* Анимированный градиентный фон */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-pink-900/20 animate-pulse" style={{ animationDuration: "4s" }} />
      </div>

      {/* Звезды на фоне */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-twinkle"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              opacity: Math.random() * 0.6 + 0.4,
              animationDuration: `${Math.random() * 2 + 2}s`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Основной контент */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Логотип с анимацией */}
        <div className="mb-10 relative" style={{ transform: `scale(${logoScale})`, transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
          {/* Внешнее свечение */}
          <div className="absolute inset-0 -m-8 rounded-full bg-purple-500/30 blur-3xl animate-pulse" style={{ animationDuration: "3s" }} />
          
          {/* Вращающиеся кольца */}
          <div className="relative w-32 h-32">
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-500/60 border-r-blue-500/60 animate-spin" style={{ animationDuration: "3s" }} />
            <div className="absolute inset-3 rounded-full border-2 border-transparent border-b-pink-500/60 border-l-indigo-500/60 animate-spin" style={{ animationDuration: "4s", animationDirection: "reverse" }} />

            {/* Центральный логотип */}
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 flex items-center justify-center shadow-2xl border border-white/20 backdrop-blur-xl">
              <Moon size={48} className="text-purple-400 fill-purple-400/20 drop-shadow-[0_0_20px_rgba(168,85,247,0.6)]" />
              <Sparkles size={20} className="absolute top-6 right-6 text-blue-400 animate-bounce" style={{ animationDuration: "2s" }} />
            </div>
          </div>
        </div>

        {/* Название */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black tracking-tight mb-2">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(168,85,247,0.5)]">
              MoonCoon
            </span>
          </h1>
          <p className="text-blue-200/60 text-sm font-medium tracking-widest uppercase">
            Загрузка вселенной
          </p>
        </div>

        {/* Прогресс бар */}
        <div className="mt-4 w-64">
          {/* Трек */}
          <div className="h-1.5 w-full bg-slate-800/50 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
            {/* Индикатор */}
            <div
              className="h-full bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)] transition-all duration-150 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              {/* Светящаяся точка */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
            </div>
          </div>
          
          {/* Процент */}
          <div className="mt-3 flex justify-between text-xs font-mono text-slate-400">
            <span>ЗАГРУЗКА</span>
            <span className="text-purple-400 font-bold">{Math.round(progress)}%</span>
          </div>
        </div>
      </div>

      {/* CSS анимации */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { 
            opacity: 0.3; 
            transform: scale(1);
          }
          50% { 
            opacity: 1; 
            transform: scale(1.2);
          }
        }
      `}</style>
    </div>
  );
}
