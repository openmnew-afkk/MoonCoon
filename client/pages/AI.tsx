import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Sparkles, ArrowDown } from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";
import { APP_NAME } from "@/lib/brand";

interface Message {
  id: string;
  role: "user" | "ai";
  text: string;
  time: string;
}

/* ── Smart reply engine ─────────────────────────────────────── */
const KB: Record<string, string[]> = {
  greeting: [
    "Привет! 👋 Рада видеть тебя. Чем помочь?",
    "Привет! ✨ Готова помочь — спрашивай что угодно!",
    "О, привет! Давай поговорим. Что на уме?",
  ],
  howAreYou: [
    "Супер! Готова помогать 24/7 ⚡ А у тебя как?",
    "Прекрасно! Вся в работе — жду твоих вопросов 😊",
  ],
  caption: [
    "📸 Давай сделаем крутую подпись! Опиши фото:\n\n• Что на снимке?\n• Какое настроение?\n• Для кого пост — друзья или публика?\n\nИ я придумаю что-то цепляющее!",
    "✍️ Обожаю писать подписи! Расскажи детали фото — локация, настроение, стиль — и я подберу идеальный текст.",
  ],
  hashtags: [
    "🏷️ Для точных хэштегов мне нужна тема поста. Расскажи о чём — подберу микс из популярных и нишевых тегов для максимального охвата.",
    "Хэштеги — моя сильная сторона! Скажи тему, и я дам 15-20 рабочих тегов, разбитых по категориям 📊",
  ],
  premium: [
    "💎 Premium в Vexora — это:\n\n✦ Без рекламы\n✦ Уникальный статус в профиле\n✦ Приоритет в ленте\n✦ Расширенные видео до 5 мин\n✦ Эксклюзивные фильтры\n\nМожно купить за звёзды или рубли в разделе Профиль → Premium.",
  ],
  stars: [
    "⭐ Звёзды — валюта Vexora:\n\n• Отправляй авторам за крутой контент\n• Получай от подписчиков\n• Покупай Premium\n• Пополняй в Профиль → Звёзды\n\nЧем больше звёзд получаешь — тем выше в ленте!",
  ],
  post: [
    "📱 Чтобы создать пост:\n\n1. Нажми ➕ внизу экрана\n2. Выбери фото или видео\n3. Добавь описание и хэштеги\n4. Нажми «Готово»\n\nСовет: первые 2 строки подписи — самые важные!",
  ],
  music: [
    "🎵 Раздел Музыка — это плейлисты для настроения. Нажми на трек чтобы начать проигрывание. Можно лайкать и искать по названию!",
  ],
  help: [
    "Я могу помочь с:\n\n📸 Подписи к фото\n🏷️ Хэштеги\n💎 Вопросы о Premium\n⭐ Звёзды и баланс\n📱 Как пользоваться приложением\n🎯 Советы по контенту\n\nПросто спроси!",
  ],
  content: [
    "💡 Советы для крутого контента:\n\n1. Снимай при естественном свете\n2. Первые 3 сек видео — самые важные\n3. Используй 5-10 релевантных хэштегов\n4. Публикуй регулярно, 1-2 раза в день\n5. Общайся с аудиторией в комментариях\n6. Расскажи историю, а не просто покажи фото",
  ],
  default: [
    "Интересный вопрос! 🤔 Расскажи подробнее — постараюсь помочь.",
    "Хм, давай разберёмся! Что именно тебя интересует?",
    "Услышала тебя! Могу помочь с подписями, хэштегами, Premium — просто спроси 😊",
    "Спасибо за вопрос! Дай чуть больше деталей, и я помогу 💡",
  ],
};

function getSmartReply(msg: string): string {
  const l = msg.toLowerCase();
  if (/привет|хай|hello|здравс|добр/.test(l)) return pick(KB.greeting);
  if (/как (ты|дела|жизнь|настр)/.test(l)) return pick(KB.howAreYou);
  if (/подпис|caption|опис/.test(l)) return pick(KB.caption);
  if (/хэштег|хештег|тег|hashtag/.test(l)) return pick(KB.hashtags);
  if (/premium|премиум|подписк/.test(l)) return pick(KB.premium);
  if (/звёзд|звезд|star|балан/.test(l)) return pick(KB.stars);
  if (/пост|публик|создать|разместить/.test(l)) return pick(KB.post);
  if (/музык|трек|плейлист|song/.test(l)) return pick(KB.music);
  if (/помо|умеешь|можешь|функци|help/.test(l)) return pick(KB.help);
  if (/контент|совет|tip|рекоменд|идеи/.test(l)) return pick(KB.content);
  return pick(KB.default);
}

function pick(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

const QUICK_CHIPS = [
  "👋 Привет!",
  "📸 Подпись к фото",
  "🏷️ Подбери хэштеги",
  "💎 Что даёт Premium?",
  "⭐ Как работают звёзды?",
  "💡 Советы по контенту",
];

/* ── Component ──────────────────────────────────────────────── */
export default function AI() {
  const { user } = useTelegram();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [showScroll, setShowScroll] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, typing, scrollToBottom]);

  // Handle scroll indicator
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const gap = el.scrollHeight - el.scrollTop - el.clientHeight;
      setShowScroll(gap > 120);
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const now = () => new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });

  const send = useCallback(async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg) return;
    setInput("");

    const userMsg: Message = { id: `u-${Date.now()}`, role: "user", text: msg, time: now() };
    setMessages(p => [...p, userMsg]);
    setTyping(true);

    // Try server AI first
    let reply: string | null = null;
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          systemPrompt: `Ты — Адель, дружелюбный AI-помощник в ${APP_NAME}. Отвечай на русском, кратко (2-4 предложения), тепло и с эмодзи. Помогай с подписями, хэштегами, контентом.`,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.reply) reply = data.reply;
      }
    } catch {}

    if (!reply) reply = getSmartReply(msg);

    // Simulate typing delay
    const delay = 400 + Math.min(reply.length * 8, 1200);
    await new Promise(r => setTimeout(r, delay));

    const aiMsg: Message = { id: `a-${Date.now()}`, role: "ai", text: reply, time: now() };
    setMessages(p => [...p, aiMsg]);
    setTyping(false);
  }, [input]);

  const isEmpty = messages.length === 0;
  const name = user?.first_name || "друг";

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      height: "calc(100dvh - var(--tg-safe-top, 0px) - var(--tg-chrome-top, 52px) - 52px - 5.5rem)",
      maxWidth: 480, margin: "0 auto", fontFamily: "Inter, sans-serif",
    }}>
      {/* Messages area */}
      <div ref={scrollRef} style={{
        flex: 1, overflowY: "auto", padding: "16px 16px 8px",
        scrollbarWidth: "none",
      }}>
        {isEmpty ? (
          /* Welcome screen */
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", height: "100%", textAlign: "center",
            padding: "0 20px",
          }}>
            {/* Minimal icon */}
            <div style={{
              width: 56, height: 56, borderRadius: 18,
              background: "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))",
              border: "1px solid rgba(99,102,241,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 16,
            }}>
              <Sparkles size={24} style={{ color: "#818cf8" }} />
            </div>

            <h2 style={{
              fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em",
              background: "linear-gradient(135deg, #e0e7ff, #a5b4fc)",
              WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
              margin: "0 0 6px",
            }}>Привет, {name}!</h2>
            <p style={{ fontSize: 13, color: "rgba(148,163,184,0.5)", lineHeight: 1.5, maxWidth: 280, margin: "0 0 28px" }}>
              Я Адель — твой AI-помощник в {APP_NAME}. Помогу с подписями, хэштегами и контентом.
            </p>

            {/* Quick chips */}
            <div style={{
              display: "flex", flexWrap: "wrap", gap: 8,
              justifyContent: "center", maxWidth: 340,
            }}>
              {QUICK_CHIPS.map(chip => (
                <button key={chip} onClick={() => send(chip.replace(/^.+\s/, ""))} style={{
                  padding: "8px 14px", borderRadius: 20,
                  background: "rgba(99,102,241,0.06)",
                  border: "1px solid rgba(99,102,241,0.1)",
                  color: "rgba(165,180,252,0.8)", fontSize: 12, fontWeight: 500,
                  cursor: "pointer", transition: "all 0.15s",
                  WebkitTapHighlightColor: "transparent",
                }} className="active:scale-95">{chip}</button>
              ))}
            </div>
          </div>
        ) : (
          /* Chat messages */
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {messages.map(msg => (
              <div key={msg.id} style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              }}>
                <div style={{
                  maxWidth: "82%", padding: "10px 14px", borderRadius: 18,
                  ...(msg.role === "user" ? {
                    background: "linear-gradient(135deg, #6366f1, #7c3aed)",
                    borderBottomRightRadius: 6,
                    color: "white",
                  } : {
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(99,102,241,0.08)",
                    borderBottomLeftRadius: 6,
                    color: "#e2e8f0",
                  }),
                }}>
                  <p style={{
                    fontSize: 13, lineHeight: 1.55, margin: 0,
                    whiteSpace: "pre-wrap", wordBreak: "break-word",
                  }}>{msg.text}</p>
                  <p style={{
                    fontSize: 10, margin: "4px 0 0",
                    color: msg.role === "user" ? "rgba(255,255,255,0.5)" : "rgba(148,163,184,0.3)",
                    textAlign: "right",
                  }}>{msg.time}</p>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div style={{
                  padding: "12px 18px", borderRadius: 18, borderBottomLeftRadius: 6,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(99,102,241,0.08)",
                  display: "flex", gap: 4, alignItems: "center",
                }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: "#818cf8",
                      animation: `adel-dot 1.2s ease-in-out infinite ${i * 0.15}s`,
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Scroll to bottom */}
      {showScroll && (
        <button onClick={scrollToBottom} style={{
          position: "absolute", bottom: 80, right: 16,
          width: 36, height: 36, borderRadius: "50%",
          background: "rgba(99,102,241,0.15)",
          border: "1px solid rgba(99,102,241,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", zIndex: 10,
        }}>
          <ArrowDown size={16} style={{ color: "#818cf8" }} />
        </button>
      )}

      {/* Input bar */}
      <div style={{
        padding: "8px 12px 12px", borderTop: "1px solid rgba(99,102,241,0.06)",
        background: "rgba(10,10,15,0.95)",
      }}>
        <form onSubmit={e => { e.preventDefault(); send(); }} style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "6px 6px 6px 16px", borderRadius: 24,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(99,102,241,0.08)",
        }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Напишите сообщение..."
            style={{
              flex: 1, background: "none", border: "none", outline: "none",
              color: "#e2e8f0", fontSize: 14,
            }}
          />
          <button type="submit" disabled={!input.trim()} style={{
            width: 36, height: 36, borderRadius: "50%",
            background: input.trim() ? "linear-gradient(135deg, #6366f1, #7c3aed)" : "rgba(99,102,241,0.08)",
            border: "none", display: "flex", alignItems: "center", justifyContent: "center",
            cursor: input.trim() ? "pointer" : "default",
            transition: "all 0.2s",
          }}>
            <Send size={15} style={{ color: input.trim() ? "white" : "rgba(148,163,184,0.25)", marginLeft: 1 }} />
          </button>
        </form>
      </div>

      <style>{`
        @keyframes adel-dot {
          0%, 60%, 100% { opacity: 0.3; transform: scale(0.8); }
          30% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
