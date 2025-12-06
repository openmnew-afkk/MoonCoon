import { useEffect, useState } from "react";
import { Moon } from "lucide-react";

/**
 * Шедевр страницы загрузки - элегантная и изящная
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
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const start = Date.now();
    let animationFrame: number;
    let timeoutId: NodeJS.Timeout;

    const updateProgress = () => {
      const elapsed = Date.now() - start;
      const rawPercent = (elapsed / duration) * 100;
      // Плавная easing функция
      const easedPercent = rawPercent < 50
        ? 2 * rawPercent * rawPercent / 100
        : -1 + (4 - 2 * rawPercent / 100) * rawPercent / 100;
      const percent = Math.min(Math.max(easedPercent, 0), 100);
      
      setProgress(percent);

      if (percent >= 100 && !completed) {
        setCompleted(true);
        setFadeOut(true);
        console.log("[SPLASH] Прогресс 100%, начинаем fadeOut");
        timeoutId = setTimeout(() => {
          console.log("[SPLASH] Вызываем onComplete");
          try {
            onComplete();
            console.log("[SPLASH] onComplete вызван успешно");
          } catch (error) {
            console.error("[SPLASH] Ошибка при вызове onComplete:", error);
            // Пробуем еще раз
            setTimeout(() => {
              try {
                onComplete();
              } catch (e) {
                console.error("[SPLASH] Критическая ошибка:", e);
              }
            }, 100);
          }
        }, 300);
      } else if (!completed) {
        animationFrame = requestAnimationFrame(updateProgress);
      }
    };

    animationFrame = requestAnimationFrame(updateProgress);

    // Fallback таймаут
    const maxTimeout = setTimeout(() => {
      if (!completed) {
        console.warn("[SPLASH] Таймаут, завершаем");
        setCompleted(true);
        setFadeOut(true);
        setTimeout(() => {
          try {
            onComplete();
          } catch (error) {
            console.error("[SPLASH] Ошибка:", error);
          }
        }, 300);
      }
    }, duration + 1000);

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      if (timeoutId) clearTimeout(timeoutId);
      clearTimeout(maxTimeout);
    };
  }, [duration, onComplete, completed]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-500 ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{
        background: "radial-gradient(circle at center, #1e1b4b 0%, #0f172a 100%)",
      }}
    >
      {/* Тонкие звезды на фоне */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/40"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: "1.5px",
              height: "1.5px",
              opacity: Math.random() * 0.5 + 0.3,
              animation: `twinkle ${2 + Math.random() * 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Основной контент */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Логотип - элегантный и минималистичный */}
        <div className="mb-12 relative">
          {/* Мягкое свечение */}
          <div className="absolute inset-0 -m-6 rounded-full bg-purple-500/15 blur-2xl" />
          
          {/* Центральный логотип */}
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-slate-900/80 to-indigo-950/80 flex items-center justify-center border border-white/10 backdrop-blur-md shadow-2xl">
            <Moon size={44} className="text-purple-400 fill-purple-400/10 drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]" />
          </div>
        </div>

        {/* Название - изящная типографика */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black tracking-tight mb-3">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              MoonCoon
            </span>
          </h1>
          <p className="text-blue-200/50 text-xs font-medium tracking-[0.3em] uppercase">
            Загрузка
          </p>
        </div>

        {/* Прогресс бар - минималистичный и элегантный */}
        <div className="w-56">
          <div className="h-0.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-100 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
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
