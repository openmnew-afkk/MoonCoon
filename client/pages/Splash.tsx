import { useEffect, useState } from "react";
import { Sparkles, Moon, Star, Heart } from "lucide-react";

export default function Splash({ onComplete }: { onComplete: () => void }) {
  const [fadeOut, setFadeOut] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { icon: Moon, text: "Добро пожаловать" },
    { icon: Star, text: "Создаём магию" },
    { icon: Heart, text: "Погружайтесь" },
  ];

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 800);

    // Запускаем fade out через 3 секунды
    const timer = setTimeout(() => {
      clearInterval(stepInterval);
      setFadeOut(true);
      // Завершаем через 0.5 секунд после начала fade out
      setTimeout(() => onComplete(), 500);
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearInterval(stepInterval);
    };
  }, [onComplete, steps.length]);

  const CurrentIcon = steps[currentStep].icon;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 overflow-hidden transition-all duration-500 ${
        fadeOut ? "opacity-0 scale-105" : "opacity-100 scale-100"
      }`}
    >
      {/* Динамический градиентный фон */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-pink-500/20 to-blue-500/20 animate-pulse" />

      {/* Плавающие формы */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/10 backdrop-blur-sm"
            style={{
              width: `${20 + Math.random() * 40}px`,
              height: `${20 + Math.random() * 40}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `drift ${10 + Math.random() * 20}s linear infinite`,
              animationDelay: `${Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      {/* Центральный контент */}
      <div className="relative z-10 flex flex-col items-center text-center px-6">
        {/* Иконка с анимацией */}
        <div className="relative mb-8">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-400 to-purple-600 blur-xl opacity-50 animate-ping" />
          <div className="relative p-6 rounded-full bg-gradient-to-br from-pink-400 via-purple-500 to-blue-500 shadow-2xl">
            <CurrentIcon size={60} className="text-white animate-spin" style={{ animationDuration: '3s' }} />
          </div>
        </div>

        {/* Название приложения */}
        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-white via-pink-200 to-purple-200 bg-clip-text text-transparent animate-pulse">
          MoonCoon
        </h1>

        {/* Текстовое сообщение с анимацией */}
        <p className="text-xl text-white/90 mb-8 font-light tracking-wide animate-fade-in">
          {steps[currentStep].text}
        </p>

        {/* Прогресс бар */}
        <div className="w-32 h-1 bg-white/20 rounded-full overflow-hidden mb-8">
          <div
            className="h-full bg-gradient-to-r from-pink-400 to-purple-500 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Украшения */}
        <div className="flex gap-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-white/60 animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>

      {/* CSS анимации */}
      <style>{`
        @keyframes drift {
          0% {
            transform: translateY(0px) translateX(0px) rotate(0deg);
          }
          33% {
            transform: translateY(-20px) translateX(15px) rotate(120deg);
          }
          66% {
            transform: translateY(10px) translateX(-10px) rotate(240deg);
          }
          100% {
            transform: translateY(0px) translateX(0px) rotate(360deg);
          }
        }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}
