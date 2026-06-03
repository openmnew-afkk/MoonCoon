import { useEffect, useState, useRef } from "react";
import { Heart, Sparkles, Gift, Star } from "lucide-react";

interface FloatingHeart {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
}

export default function BirthdayGreeting({ onComplete }: { onComplete: () => void }) {
  const fullText = "с днем рождения дорогая и любимая Ася.";
  const [typedText, setTypedText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const [animationStep, setAnimationStep] = useState(0); // 0: typing, 1: completed, showing button
  const [hearts, setHearts] = useState<FloatingHeart[]>([]);
  const greetingRef = useRef<HTMLDivElement>(null);

  // Typing effect
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < fullText.length) {
        setTypedText((prev) => prev + fullText.charAt(index));
        index++;
      } else {
        clearInterval(interval);
        // Fade in button and extra sparkles after typing finishes
        setTimeout(() => {
          setAnimationStep(1);
        }, 800);
      }
    }, 110); // slow typing as requested (110ms per char)

    return () => clearInterval(interval);
  }, []);

  // Blinking cursor
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);
    return () => clearInterval(cursorInterval);
  }, []);

  // Generate floating hearts
  useEffect(() => {
    const colors = ["#ec4899", "#f43f5e", "#a855f7", "#d946ef", "#fb7185"];
    const initialHearts = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: 100 + Math.random() * 20,
      size: 12 + Math.random() * 24,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 5,
      duration: 6 + Math.random() * 8,
    }));
    setHearts(initialHearts);
  }, []);

  // Allow manual heart spawning on screen tap/click
  const handleTap = (e: React.MouseEvent) => {
    if (!greetingRef.current) return;
    const rect = greetingRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const colors = ["#ec4899", "#f43f5e", "#a855f7", "#d946ef", "#ffffff"];
    const newHeart: FloatingHeart = {
      id: Date.now(),
      x,
      y,
      size: 16 + Math.random() * 20,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: 0,
      duration: 3 + Math.random() * 3,
    };

    setHearts((prev) => [...prev, newHeart]);
  };

  return (
    <div
      ref={greetingRef}
      onClick={handleTap}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(ellipse at 50% 30%, #120422 0%, #080112 60%, #030007 100%)",
        color: "#ffffff",
        overflow: "hidden",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        userSelect: "none",
      }}
    >
      {/* Background radial soft light blobs */}
      <div style={{
        position: "absolute",
        top: "20%",
        width: "80vw",
        height: "80vw",
        background: "radial-gradient(circle, rgba(236,72,153,0.12) 0%, rgba(155,89,247,0.06) 50%, transparent 100%)",
        filter: "blur(40px)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute",
        bottom: "10%",
        width: "60vw",
        height: "60vw",
        background: "radial-gradient(circle, rgba(168,85,247,0.1) 0%, rgba(59,130,246,0.05) 50%, transparent 100%)",
        filter: "blur(30px)",
        pointerEvents: "none",
      }} />

      {/* Floating Hearts in background */}
      {hearts.map((h) => (
        <div
          key={h.id}
          style={{
            position: "absolute",
            left: `${h.x}%`,
            top: `${h.y}%`,
            transform: "translateY(0)",
            color: h.color,
            opacity: 0.6,
            filter: "drop-shadow(0 0 8px rgba(236,72,153,0.3))",
            animation: `floatUp ${h.duration}s linear infinite`,
            animationDelay: `${h.delay}s`,
            pointerEvents: "none",
          }}
        >
          <Heart size={h.size} fill={h.color} strokeWidth={1} />
        </div>
      ))}

      {/* Greeting card container */}
      <div
        className="w-full max-w-[90%] md:max-w-md p-8 rounded-3xl border border-pink-500/20 backdrop-blur-2xl flex flex-col items-center text-center relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(20,10,35,0.7) 0%, rgba(10,5,20,0.85) 100%)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.5), inset 0 1px 3px rgba(255,255,255,0.07)",
          transform: "translateY(-10px)",
          animation: "cardEntrance 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        }}
        onClick={(e) => e.stopPropagation()} // Prevent spawning heart exactly under buttons when clicking container
      >
        {/* Decorative corner glows */}
        <div style={{
          position: "absolute", top: 0, left: 0, width: "30%", height: "2px",
          background: "linear-gradient(90deg, transparent, rgba(236,72,153,0.5), transparent)"
        }} />
        
        {/* Animated Sparkles Header */}
        <div className="relative mb-6">
          <div className="absolute -inset-2 rounded-full bg-pink-500/25 blur-xl animate-pulse" />
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center border border-pink-400/30"
               style={{ boxShadow: "0 8px 32px rgba(236,72,153,0.4)" }}>
            <Sparkles size={28} className="text-white animate-spin-slow" />
          </div>
        </div>

        {/* Typed Birthday Text */}
        <div className="w-full min-h-[96px] flex items-center justify-center px-2">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-relaxed"
              style={{
                background: "linear-gradient(135deg, #ffffff 10%, #f472b6 60%, #c084fc 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.3))",
              }}>
            {typedText}
            <span
              style={{
                marginLeft: "2px",
                borderRight: "3px solid #f472b6",
                animation: "none",
                opacity: showCursor ? 1 : 0,
                display: "inline-block",
                width: "2px",
                height: "1.4em",
                verticalAlign: "middle",
              }}
            />
          </h1>
        </div>

        {/* Beautiful Birthday Poem / Wish (Fades in slowly after typedText finishes) */}
        <div
          style={{
            opacity: animationStep >= 1 ? 1 : 0,
            transform: animationStep >= 1 ? "translateY(0)" : "translateY(15px)",
            transition: "opacity 1s ease, transform 1s ease",
            marginTop: "1.5rem",
          }}
          className="space-y-4"
        >
          <p className="text-sm text-pink-200/80 leading-relaxed font-medium">
            Пусть каждый день будет наполнен волшебством, улыбками, теплом и самыми заветными мечтами. Ты заслуживаешь всего самого прекрасного в этом мире! 💖
          </p>

          <div className="flex items-center justify-center gap-3 py-1">
            <Gift className="text-pink-400 animate-bounce" size={18} />
            <span className="h-px w-12 bg-pink-500/30" />
            <Heart className="text-purple-400 fill-purple-400/20 animate-pulse" size={18} />
            <span className="h-px w-12 bg-pink-500/30" />
            <Star className="text-yellow-400 animate-pulse" size={18} />
          </div>
        </div>

        {/* Action Button (Fades in at step 1) */}
        <div
          style={{
            opacity: animationStep >= 1 ? 1 : 0,
            transform: animationStep >= 1 ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 1.2s ease 0.3s, transform 1.2s ease 0.3s",
            width: "100%",
            marginTop: "2rem",
          }}
        >
          <button
            type="button"
            onClick={onComplete}
            className="w-full py-4 px-6 rounded-2xl font-bold text-base flex items-center justify-center gap-2 relative overflow-hidden transition-all active:scale-[0.97]"
            style={{
              background: "linear-gradient(135deg, #ec4899 0%, #a855f7 100%)",
              boxShadow: "0 8px 24px rgba(236,72,153,0.35), 0 0 0 1px rgba(255,255,255,0.15)",
              color: "#ffffff",
            }}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer" />
            Открыть приложение ✨
          </button>
        </div>
      </div>

      {/* Styled animation helper block */}
      <style>{`
        @keyframes floatUp {
          0% {
            transform: translateY(120vh) rotate(0deg) scale(0.8);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          90% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(-20vh) rotate(360deg) scale(1.2);
            opacity: 0;
          }
        }
        @keyframes cardEntrance {
          from {
            opacity: 0;
            transform: translateY(40px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2.5s infinite;
        }
      `}</style>
    </div>
  );
}
