import { useEffect, useState, useMemo } from "react";
import { Sparkles, Gift } from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";

const greetings = [
  "Пусть этот день принесёт тебе столько радости, сколько звёзд на небе! ✨ Ты заслуживаешь самого лучшего.",
  "Сегодня весь мир крутится вокруг тебя! 🌍 Пусть каждый миг будет наполнен счастьем и теплом.",
  "В этот особенный день желаем, чтобы мечты сбывались быстрее, чем ты успеваешь их загадать! 🌟",
  "Ты — уникальная звезда в нашей вселенной! 💫 Пусть этот год будет самым ярким и незабываемым.",
  "Каждый день рождения — это новая глава. Пусть твоя будет наполнена приключениями и любовью! 📖💜",
  "Сегодня мы празднуем тебя и всё прекрасное, что ты приносишь в этот мир! 🎉 С днём рождения!",
  "Пусть удача будет твоим верным спутником, а улыбка никогда не сходит с лица! 😊🍀",
  "В день рождения загадай самое смелое желание — вселенная сегодня слушает именно тебя! 🌌",
  "Пусть каждый новый год жизни будет ещё лучше предыдущего! Ты — невероятный человек! 🚀",
  "Желаем океан вдохновения, горы счастья и бесконечное небо возможностей! 🏔️🌊",
];

interface Confetti { id: number; x: number; size: number; color: string; delay: number; duration: number; rotation: number; }

function makeConfetti(n: number): Confetti[] {
  const colors = ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#f472b6", "#fbbf24", "#34d399"];
  return Array.from({ length: n }, (_, i) => ({
    id: i, x: Math.random() * 100, size: 4 + Math.random() * 8,
    color: colors[Math.floor(Math.random() * colors.length)],
    delay: Math.random() * 3, duration: 3 + Math.random() * 4,
    rotation: Math.random() * 360,
  }));
}

export default function BirthdayGreeting({ onComplete }: { onComplete: () => void }) {
  const { user } = useTelegram();
  const [show, setShow] = useState(false);
  const [cardShow, setCardShow] = useState(false);
  const [isBirthday, setIsBirthday] = useState<boolean | null>(null);
  const confetti = useMemo(() => makeConfetti(30), []);
  const greeting = useMemo(() => greetings[Math.floor(Math.random() * greetings.length)], []);

  useEffect(() => {
    if (!user?.id) { setIsBirthday(false); return; }
    fetch(`/api/users/${user.id}/birthday-check`)
      .then(r => r.ok ? r.json() : { isBirthday: false })
      .then(d => setIsBirthday(d.isBirthday ?? false))
      .catch(() => setIsBirthday(false));
  }, [user?.id]);

  useEffect(() => {
    if (isBirthday === false) { onComplete(); return; }
    if (isBirthday === true) {
      setTimeout(() => setShow(true), 200);
      setTimeout(() => setCardShow(true), 600);
    }
  }, [isBirthday, onComplete]);

  if (isBirthday === null || isBirthday === false) return null;

  const handleClaim = async () => {
    if (user?.id) {
      try { await fetch(`/api/users/${user.id}/birthday-claim`, { method: "POST" }); } catch {}
    }
    onComplete();
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,0.85)",
      backdropFilter: "blur(20px)",
      opacity: show ? 1 : 0, transition: "opacity 0.5s ease",
      fontFamily: "Inter, system-ui, sans-serif",
    }}>
      {/* Confetti */}
      {confetti.map(c => (
        <div key={c.id} style={{
          position: "absolute", top: -20, left: `${c.x}%`,
          width: c.size, height: c.size * 1.5, borderRadius: 2,
          background: c.color, transform: `rotate(${c.rotation}deg)`,
          animationName: "bd-confetti-fall", animationDuration: `${c.duration}s`,
          animationDelay: `${c.delay}s`, animationTimingFunction: "linear",
          animationIterationCount: "infinite", animationFillMode: "both",
          opacity: 0,
        }} />
      ))}

      {/* Ambient glow */}
      <div style={{ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%,-50%)", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)", filter: "blur(60px)", pointerEvents: "none" }} />

      {/* Card */}
      <div style={{
        position: "relative", width: "88%", maxWidth: 380, borderRadius: 28,
        background: "linear-gradient(145deg, rgba(15,15,25,0.95), rgba(10,10,18,0.98))",
        border: "1px solid rgba(99,102,241,0.2)",
        boxShadow: "0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)",
        padding: "40px 28px 32px", textAlign: "center",
        transform: cardShow ? "translateY(0) scale(1)" : "translateY(40px) scale(0.9)",
        opacity: cardShow ? 1 : 0, transition: "all 0.6s cubic-bezier(0.16,1,0.3,1)",
      }}>
        {/* Top accent line */}
        <div style={{ position: "absolute", top: 0, left: "20%", right: "20%", height: 2, borderRadius: 2, background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent)" }} />

        {/* Emoji */}
        <div style={{ fontSize: 48, marginBottom: 16, animation: "bd-bounce 2s ease-in-out infinite" }}>🎂</div>

        {/* Title */}
        <h1 style={{
          fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 8px",
          background: "linear-gradient(135deg, #e0e7ff, #a5b4fc)",
          WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
        }}>С днём рождения! 🎉</h1>

        <p style={{ fontSize: 13, color: "rgba(148,163,184,0.7)", lineHeight: 1.6, margin: "0 0 20px" }}>
          {greeting}
        </p>

        {/* Premium gift */}
        <div style={{
          borderRadius: 16, padding: "16px 20px", marginBottom: 20,
          background: "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))",
          border: "1px solid rgba(99,102,241,0.2)",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 6 }}>
            <Gift size={16} style={{ color: "#a5b4fc" }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: "#c7d2fe" }}>Подарок для вас</span>
          </div>
          <p style={{ fontSize: 12, color: "rgba(148,163,184,0.6)", margin: 0 }}>Premium на 3 дня — бесплатно!</p>
        </div>

        {/* CTA button */}
        <button onClick={handleClaim} style={{
          width: "100%", padding: "14px 24px", borderRadius: 14, border: "none",
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          color: "white", fontSize: 15, fontWeight: 700, cursor: "pointer",
          boxShadow: "0 8px 24px rgba(99,102,241,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          transition: "transform 0.15s", WebkitTapHighlightColor: "transparent",
        }} className="active:scale-95">
          <Sparkles size={16} /> Забрать подарок
        </button>

        <button onClick={onComplete} style={{
          background: "none", border: "none", color: "rgba(148,163,184,0.4)",
          fontSize: 12, marginTop: 16, cursor: "pointer",
        }}>Пропустить</button>
      </div>

      <style>{`
        @keyframes bd-confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.8; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
        @keyframes bd-bounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-8px) scale(1.05); }
        }
      `}</style>
    </div>
  );
}
