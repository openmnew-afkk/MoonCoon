import { useEffect, useState } from "react";
import { Sparkles, Moon, Star, Heart, Zap, Rocket, Crown, Shield, Palette } from "lucide-react";

export default function Splash({ onComplete }: { onComplete: () => void }) {
  const [fadeOut, setFadeOut] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showFeatures, setShowFeatures] = useState(false);

  const steps = [
    { icon: Moon, text: "Добро пожаловать в MoonCoon", color: "from-blue-400 to-purple-500" },
    { icon: Star, text: "Загружаем звёздную магию", color: "from-yellow-400 to-pink-500" },
    { icon: Heart, text: "Подготавливаем твой опыт", color: "from-pink-400 to-red-500" },
    { icon: Rocket, text: "Запускаем инновации", color: "from-green-400 to-blue-500" },
  ];

  const features = [
    { icon: Crown, text: "Premium возможности", desc: "Расширенные функции для креативов" },
    { icon: Shield, text: "Защищённая платформа", desc: "Твоя приватность важна" },
    { icon: Palette, text: "Креативные инструменты", desc: "AI-ассистент и эффекты" },
    { icon: Zap, text: "Мгновенные публикации", desc: "Делись моментом быстро" },
  ];

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 1200);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setShowFeatures(true);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    const fadeTimer = setTimeout(() => {
      clearInterval(stepInterval);
      setFadeOut(true);
      setTimeout(() => onComplete(), 800);
    }, 6000);

    return () => {
      clearTimeout(fadeTimer);
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, [onComplete]);

  const CurrentIcon = steps[currentStep].icon;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden transition-all duration-700 ${
        fadeOut ? "opacity-0 scale-105" : "opacity-100 scale-100"
      }`}
    >
      {/* Animated background with multiple gradients */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-500/20 to-pink-500/10 animate-pulse" />
        <div className="absolute inset-0 bg-gradient-to-tl from-indigo-600/15 via-transparent to-cyan-500/10 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Enhanced floating elements */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-white/20 to-white/5 backdrop-blur-sm animate-bounce"
            style={{
              width: `${15 + Math.random() * 25}px`,
              height: `${15 + Math.random() * 25}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${8 + Math.random() * 12}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 8}s`,
            }}
          />
        ))}
      </div>

      {/* Geometric patterns */}
      <div className="absolute inset-0 opacity-10">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute border border-white/20 rounded-lg animate-spin"
            style={{
              width: `${100 + i * 20}px`,
              height: `${100 + i * 20}px`,
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              animationDuration: `${20 + i * 5}s`,
              animationDirection: i % 2 === 0 ? 'normal' : 'reverse',
            }}
          />
        ))}
      </div>

      {/* Central content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg mx-auto">
        {/* Main logo with enhanced effects */}
        <div className="relative mb-8">
          {/* Outer glow rings */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-400/30 to-purple-600/30 blur-2xl animate-pulse scale-150" />
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/20 to-cyan-500/20 blur-xl animate-pulse scale-125" style={{ animationDelay: '0.5s' }} />

          {/* Central icon with gradient */}
          <div className={`relative p-8 rounded-full bg-gradient-to-br ${steps[currentStep].color} shadow-2xl animate-pulse`}>
            <CurrentIcon size={72} className="text-white drop-shadow-lg animate-pulse" style={{ animationDuration: '2s' }} />
          </div>

          {/* Sparkle effects */}
          {[...Array(6)].map((_, i) => (
            <Sparkles
              key={i}
              size={16}
              className="absolute text-yellow-300 animate-ping"
              style={{
                top: `${20 + Math.sin(i * 60 * Math.PI / 180) * 60}px`,
                left: `${20 + Math.cos(i * 60 * Math.PI / 180) * 60}px`,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </div>

        {/* App name with enhanced styling */}
        <h1 className="text-7xl font-black mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent animate-pulse drop-shadow-2xl">
          MoonCoon
        </h1>

        {/* Dynamic text */}
        <p className="text-2xl text-white/95 mb-8 font-medium tracking-wide animate-fade-in drop-shadow-lg">
          {steps[currentStep].text}
        </p>

        {/* Progress bar with gradient */}
        <div className="w-80 h-2 bg-white/20 rounded-full overflow-hidden mb-8 shadow-inner">
          <div
            className={`h-full bg-gradient-to-r ${steps[currentStep].color} rounded-full transition-all duration-300 shadow-lg`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Features showcase */}
        {showFeatures && (
          <div className="animate-fade-in">
            <h3 className="text-xl text-white/90 mb-6 font-semibold">Что тебя ждёт:</h3>
            <div className="grid grid-cols-2 gap-4 mb-8">
              {features.map((feature, index) => (
                <div
                  key={feature.text}
                  className="glass-card p-4 rounded-2xl hover:bg-white/10 transition-all duration-300 animate-slide-up border border-white/10"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <feature.icon className="text-purple-300 mb-2" size={24} />
                  <div className="text-sm font-medium text-white/90 mb-1">{feature.text}</div>
                  <div className="text-xs text-white/70">{feature.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading dots */}
        <div className="flex gap-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 animate-pulse shadow-lg"
              style={{
                animationDelay: `${i * 0.15}s`,
                animationDuration: '1.5s',
              }}
            />
          ))}
        </div>
      </div>

      {/* Custom animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out forwards;
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
