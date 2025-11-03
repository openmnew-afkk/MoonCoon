import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

export default function Splash({ onComplete }: { onComplete: () => void }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Запускаем fade out через 2.5 секунды
    const timer = setTimeout(() => {
      setFadeOut(true);
      // Завершаем через 0.5 секунд после начала fade out
      setTimeout(() => onComplete(), 500);
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#0a0e1a] via-[#0f1419] to-[#1a1f2e] overflow-hidden transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Анимированные частицы фона */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Градиентные круги на фоне */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary rounded-full blur-[120px]"
          style={{ animation: 'pulse 4s ease-in-out infinite' }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent rounded-full blur-[120px]"
          style={{ animation: 'pulse 4s ease-in-out infinite', animationDelay: '2s' }}
        />
      </div>

      {/* Главный контент */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Луна с анимацией */}
        <div className="relative mb-8">
          {/* Внешнее свечение */}
          <div className="absolute inset-0 -m-8">
            <div className="w-48 h-48 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 blur-2xl animate-pulse" />
          </div>
          
          {/* Луна */}
          <div 
            className="relative w-32 h-32 rounded-full bg-gradient-to-br from-primary via-primary/80 to-accent shadow-2xl"
            style={{ animation: 'float 3s ease-in-out infinite' }}
          >
            {/* Кратеры */}
            <div className="absolute top-4 left-6 w-4 h-4 rounded-full bg-primary-foreground/10" />
            <div className="absolute top-8 right-8 w-6 h-6 rounded-full bg-primary-foreground/10" />
            <div className="absolute bottom-6 left-10 w-3 h-3 rounded-full bg-primary-foreground/10" />
            
            {/* Блеск */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent" />
            
            {/* Звездочки вокруг */}
            {[...Array(8)].map((_, i) => {
              const angle = (i / 8) * 360;
              const radius = 80;
              const x = Math.cos((angle * Math.PI) / 180) * radius;
              const y = Math.sin((angle * Math.PI) / 180) * radius;
              
              return (
                <Sparkles
                  key={i}
                  size={16}
                  className="absolute text-primary/60"
                  style={{
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                    transform: 'translate(-50%, -50%)',
                    animation: `twinkle ${1.5 + (i * 0.2)}s ease-in-out infinite`,
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Название приложения */}
        <div className="text-center mb-6">
          <h1 
            className="text-5xl font-bold mb-2 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent"
            style={{ animation: 'fadeInUp 0.8s ease-out' }}
          >
            MoonCoon
          </h1>
          <p 
            className="text-sm text-muted-foreground tracking-wider"
            style={{ animation: 'fadeInUp 0.8s ease-out 0.2s both' }}
          >
            Социальная сеть нового поколения
          </p>
        </div>

        {/* Анимированные точки загрузки */}
        <div 
          className="flex gap-2"
          style={{ animation: 'fadeInUp 0.8s ease-out 0.4s both' }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-primary"
              style={{
                animation: `bounce 1.4s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* CSS анимации */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-15px) scale(1.05);
          }
        }
        
        @keyframes twinkle {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.5);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes bounce {
          0%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </div>
  );
}

