import { useEffect, useState } from 'react';

export default function Splash({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [photos] = useState([
    'https://api.dicebear.com/7.x/avataaars/svg?seed=moon1',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=moon2',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=moon3',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=moon4',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=moon5',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=moon6',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=moon7',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=moon8',
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => onComplete(), 500);
          return 100;
        }
        return prev + 1.5;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/10 overflow-hidden">
      {/* Анимированный фон */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Главный контейнер */}
      <div className="relative z-10 flex flex-col items-center">
        {/* 3D шар с фотками */}
        <div className="relative w-64 h-64 mb-8">
          {/* Центральный шар */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 via-accent/20 to-primary/20 backdrop-blur-xl border border-white/10 shadow-2xl animate-spin" style={{ animationDuration: '20s' }}>
            {/* Внутреннее свечение */}
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 blur-xl" />
          </div>

          {/* Мини-фотки вокруг шара */}
          {photos.map((photo, index) => {
            const angle = (index / photos.length) * 360;
            const delay = index * 0.5;

            return (
              <div
                key={index}
                className="absolute inset-0"
                style={{
                  animation: `orbit 40s linear infinite`,
                  animationDelay: `${delay}s`,
                  transform: `rotate(${angle}deg)`
                }}
              >
                <div 
                  className="absolute top-0 left-1/2 -translate-x-1/2"
                  style={{
                    animation: `float ${4 + index * 0.3}s ease-in-out infinite`,
                    animationDelay: `${delay}s`
                  }}
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 shadow-lg hover:scale-110 transition-transform">
                    <img
                      src={photo}
                      alt=""
                      className="w-full h-full object-cover"
                      style={{ transform: `rotate(-${angle}deg)` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}

        </div>

        {/* Логотип */}
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-pulse">
          🌙 MoonCoon
        </h1>
        <p className="text-sm text-muted-foreground mb-6 animate-pulse">
          Загрузка магии...
        </p>

        {/* Прогресс-бар */}
        <div className="w-64 h-2 bg-glass-light/20 rounded-full overflow-hidden backdrop-blur-sm">
          <div
            className="h-full bg-gradient-to-r from-primary via-accent to-primary rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">{progress}%</p>
      </div>

      {/* CSS анимации */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        @keyframes orbit {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

