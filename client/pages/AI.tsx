import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Sparkles, ArrowDown, Volume2 } from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";
import { APP_NAME } from "@/lib/brand";

interface Message {
  id: string;
  role: "user" | "ai";
  text: string;
  time: string;
}

/* ── Sound effect ─────────────────────────────────────────── */
function playIntroSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.12);
      gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + i * 0.12 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.5);
    });
  } catch {}
}

function playMessageSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch {}
}

/* ── Smart AI ─────────────────────────────────────────────── */
const KB: Record<string, string[]> = {
  greeting: [
    "Привет! 👋 Рада видеть тебя. Чем помочь сегодня?",
    "Привет! ✨ Готова к работе — задавай любые вопросы!",
    "О, привет! Давай создадим что-то крутое вместе 🚀",
  ],
  howAreYou: [
    "Супер! Генерирую идеи со скоростью света ⚡ А у тебя как?",
    "Прекрасно! Вся в работе — давай творить 😊",
  ],
  caption: [
    "📸 Давай сделаем крутую подпись!\n\nРасскажи:\n• Что на фото?\n• Какое настроение?\n• Стиль: дерзкий, нежный, минималистичный?\n\nИ я придумаю 3 варианта на выбор!",
  ],
  captionGenerate: [
    "Вот 3 варианта подписи:\n\n✨ «Моменты, которые стоит запомнить»\n🌟 «Жизнь слишком коротка для обычных фото»\n💫 «Между небом и мечтой»\n\nКакой нравится? Или опиши фото подробнее — сделаю точнее!",
  ],
  hashtags: [
    "🏷️ Для точных хэштегов расскажи тему. А пока — универсальный набор:\n\n📈 Охват: #инстаграм #тренды #вирусное\n🎨 Стиль: #эстетика #минимализм #mood\n📸 Фото: #фотодня #portrait #photography\n🌍 Гео: #москва #россия #travel\n\nДай тему — подберу точнее!",
  ],
  premium: [
    "💎 Premium в Vexora — это:\n\n✦ Без рекламы навсегда\n✦ Золотой статус в профиле\n✦ Приоритет в ленте и рекомендациях\n✦ Видео до 5 минут (вместо 1 мин)\n✦ Эксклюзивные фильтры\n✦ Ранний доступ к новым функциям\n\n👉 Купить: Профиль → Premium",
  ],
  stars: [
    "⭐ Звёзды — валюта Vexora:\n\n💰 Как получить:\n• Получай от подписчиков за контент\n• Покупай в разделе Профиль\n\n🛍️ Как потратить:\n• Поддержи любимых авторов\n• Купи Premium-подписку\n• Продвигай свои посты\n\nЧем больше звёзд — тем выше в рейтинге!",
  ],
  post: [
    "📱 Создать пост за 30 секунд:\n\n1️⃣ Нажми ➕ внизу экрана\n2️⃣ Выбери фото/видео из галереи\n3️⃣ Добавь описание + хэштеги\n4️⃣ Нажми «Готово» ✓\n\n💡 Лайфхак: первые 2 строки подписи — самые важные, их видно без раскрытия!",
  ],
  music: [
    "🎵 Раздел Музыка:\n\n• Нажми на трек для воспроизведения\n• ❤️ Лайкай любимые треки\n• 🔍 Ищи по названию или исполнителю\n• ⏭️ Переключай в плеере внизу\n\nМузыка создаёт настроение для контента!",
  ],
  help: [
    "Я могу помочь с:\n\n📸 Подписи к фото (расскажи что на снимке)\n🏷️ Хэштеги (скажи тему поста)\n💎 Premium и звёзды (объясню всё)\n📱 Навигация по приложению\n💡 Идеи для контента\n🎯 Стратегия роста аудитории\n\nПросто спроси! Я всегда рядом ✨",
  ],
  content: [
    "💡 10 советов для вирусного контента:\n\n1. Снимай при золотом часе (утро/вечер)\n2. Первые 3 сек видео решают всё\n3. Используй 8-12 хэштегов\n4. Публикуй в 12:00 и 19:00\n5. Задавай вопросы в подписях\n6. Отвечай на все комментарии\n7. Делай серии постов (часть 1, 2...)\n8. Используй тренды, но по-своему\n9. Будь аутентичным — люди чувствуют\n10. Качество > количество",
  ],
  growth: [
    "📈 Как набрать аудиторию:\n\n🔥 Быстро:\n• Коллаборации с другими авторами\n• Участвуй в челленджах\n• Используй трендовые хэштеги\n\n🌱 Стабильно:\n• Публикуй 1-2 раза в день\n• Держи единый стиль ленты\n• Общайся в комментариях\n• Делись экспертизой\n\nГлавное — регулярность!",
  ],
  joke: [
    "Хочешь шутку? 😄\n\nПочему программист пошёл в спортзал?\nПотому что ему сказали, что нужно качать пресс... кнопок! 💪⌨️\n\nИли вот ещё:\nЧто сказал один пиксель другому?\n— Не приближайся, ты слишком зернистый! 📸",
  ],
  default: [
    "Интересно! 🤔 Расскажи подробнее — постараюсь помочь максимально.",
    "Хм, давай разберёмся! Уточни вопрос, и я дам развёрнутый ответ.",
    "Услышала! Могу помочь с контентом, хэштегами, Premium — просто спроси 😊",
    "Спасибо за вопрос! Дай больше деталей — так ответ будет точнее 💡",
    "Ого, интересная тема! Давай углубимся. Что конкретно хочешь узнать?",
  ],
};

function getSmartReply(msg: string): string {
  const l = msg.toLowerCase();
  if (/привет|хай|hello|здравс|добр/.test(l)) return pick(KB.greeting);
  if (/как (ты|дела|жизнь|настр)/.test(l)) return pick(KB.howAreYou);
  if (/придумай подпис|напиши подпис|генер.+подпис/.test(l)) return pick(KB.captionGenerate);
  if (/подпис|caption|опис/.test(l)) return pick(KB.caption);
  if (/хэштег|хештег|тег|hashtag/.test(l)) return pick(KB.hashtags);
  if (/premium|премиум|подписк/.test(l)) return pick(KB.premium);
  if (/звёзд|звезд|star|балан/.test(l)) return pick(KB.stars);
  if (/пост|публик|создать|разместить|стори/.test(l)) return pick(KB.post);
  if (/музык|трек|плейлист|song/.test(l)) return pick(KB.music);
  if (/помо|умеешь|можешь|функци|help|что ты/.test(l)) return pick(KB.help);
  if (/контент|совет|tip|рекоменд|идеи/.test(l)) return pick(KB.content);
  if (/рост|аудитор|подписчик|набрать|раскрут/.test(l)) return pick(KB.growth);
  if (/шутк|смеш|анекдот|весел/.test(l)) return pick(KB.joke);
  return pick(KB.default);
}

function pick(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

const QUICK_CHIPS = [
  { emoji: "👋", text: "Привет!" },
  { emoji: "📸", text: "Придумай подпись для фото" },
  { emoji: "🏷️", text: "Подбери хэштеги" },
  { emoji: "💎", text: "Что даёт Premium?" },
  { emoji: "💡", text: "Советы по контенту" },
  { emoji: "📈", text: "Как набрать аудиторию?" },
];

/* ── Component ──────────────────────────────────────────────── */
export default function AI() {
  const { user } = useTelegram();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [introStep, setIntroStep] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, typing, scrollToBottom]);

  // Intro animation sequence
  useEffect(() => {
    if (!showIntro) return;
    const timers = [
      setTimeout(() => setIntroStep(1), 300),
      setTimeout(() => setIntroStep(2), 800),
      setTimeout(() => { setIntroStep(3); playIntroSound(); }, 1200),
      setTimeout(() => setIntroStep(4), 2000),
      setTimeout(() => setShowIntro(false), 2800),
    ];
    return () => timers.forEach(clearTimeout);
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
          systemPrompt: `Ты — Адель, дружелюбный AI-помощник в ${APP_NAME}. Отвечай на русском, подробно но структурировано (используй списки и эмодзи). Помогай с подписями, хэштегами, контент-стратегией. Будь тёплой и профессиональной.`,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.reply) reply = data.reply;
      }
    } catch {}

    if (!reply) reply = getSmartReply(msg);

    const delay = 500 + Math.min(reply.length * 5, 1500);
    await new Promise(r => setTimeout(r, delay));

    playMessageSound();
    const aiMsg: Message = { id: `a-${Date.now()}`, role: "ai", text: reply, time: now() };
    setMessages(p => [...p, aiMsg]);
    setTyping(false);
  }, [input]);

  const name = user?.first_name || "друг";
  const ACCENT = "#CBFF4D";

  /* ── Intro overlay ── */
  if (showIntro) {
    return (
      <div style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "#0a0a0f",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        fontFamily: "Inter, sans-serif",
      }}>
        {/* Ambient glow */}
        <div style={{
          position: "absolute", top: "35%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 200, height: 200, borderRadius: "50%",
          background: `radial-gradient(circle, ${ACCENT}15 0%, transparent 70%)`,
          filter: "blur(60px)", pointerEvents: "none",
          opacity: introStep >= 1 ? 1 : 0,
          transition: "opacity 0.8s ease",
        }} />

        {/* Icon */}
        <div style={{
          width: 64, height: 64, borderRadius: 20,
          background: `linear-gradient(135deg, ${ACCENT}20, ${ACCENT}08)`,
          border: `1px solid ${ACCENT}25`,
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: introStep >= 1 ? 1 : 0,
          transform: introStep >= 2 ? "scale(1) translateY(0)" : "scale(0.8) translateY(20px)",
          transition: "all 0.6s cubic-bezier(0.16,1,0.3,1)",
        }}>
          <Sparkles size={28} style={{ color: ACCENT }} />
        </div>

        {/* Name */}
        <h1 style={{
          fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em",
          background: `linear-gradient(135deg, #f0fdf4, ${ACCENT})`,
          WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
          margin: "16px 0 6px",
          opacity: introStep >= 2 ? 1 : 0,
          transform: introStep >= 3 ? "translateY(0)" : "translateY(10px)",
          transition: "all 0.5s cubic-bezier(0.16,1,0.3,1) 0.1s",
        }}>Адель</h1>

        <p style={{
          fontSize: 13, color: "rgba(148,163,184,0.5)",
          opacity: introStep >= 3 ? 1 : 0,
          transition: "opacity 0.5s ease 0.2s",
        }}>AI-помощник • {APP_NAME}</p>

        {/* Particles */}
        {introStep >= 3 && [0,1,2,3,4].map(i => (
          <div key={i} style={{
            position: "absolute",
            top: "50%", left: "50%",
            width: 3, height: 3, borderRadius: "50%",
            background: ACCENT,
            animation: `adel-particle-${i} 1s ease-out forwards`,
          }} />
        ))}

        <style>{`
          ${[0,1,2,3,4].map(i => {
            const angle = (i / 5) * Math.PI * 2;
            const x = Math.cos(angle) * 80;
            const y = Math.sin(angle) * 80;
            return `@keyframes adel-particle-${i} {
              0% { transform: translate(0, 0) scale(1); opacity: 1; }
              100% { transform: translate(${x}px, ${y}px) scale(0); opacity: 0; }
            }`;
          }).join('\n')}
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      height: "calc(100dvh - var(--tg-safe-top, 0px) - var(--tg-chrome-top, 52px) - 48px - 4.5rem)",
      maxWidth: 480, margin: "0 auto", fontFamily: "Inter, sans-serif",
    }}>
      {/* Messages area */}
      <div ref={scrollRef} style={{
        flex: 1, overflowY: "auto", padding: "16px 16px 8px",
        WebkitOverflowScrolling: "touch",
      }}>
        {messages.length === 0 ? (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", height: "100%", textAlign: "center",
            padding: "0 20px",
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16,
              background: `linear-gradient(135deg, ${ACCENT}12, ${ACCENT}06)`,
              border: `1px solid ${ACCENT}15`,
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 14,
            }}>
              <Sparkles size={22} style={{ color: ACCENT }} />
            </div>

            <h2 style={{
              fontSize: 18, fontWeight: 800,
              background: `linear-gradient(135deg, #f0fdf4, ${ACCENT})`,
              WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
              margin: "0 0 6px",
            }}>Привет, {name}!</h2>
            <p style={{ fontSize: 12, color: "rgba(148,163,184,0.45)", lineHeight: 1.5, maxWidth: 260, margin: "0 0 24px" }}>
              Я Адель — AI-помощник {APP_NAME}. Помогу с контентом, подписями и стратегией.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", maxWidth: 320 }}>
              {QUICK_CHIPS.map(chip => (
                <button key={chip.text} onClick={() => send(chip.text)} style={{
                  padding: "7px 12px", borderRadius: 18,
                  background: `${ACCENT}08`, border: `1px solid ${ACCENT}12`,
                  color: `${ACCENT}cc`, fontSize: 11, fontWeight: 500,
                  cursor: "pointer", WebkitTapHighlightColor: "transparent",
                }} className="active:scale-95">{chip.emoji} {chip.text}</button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {messages.map(msg => (
              <div key={msg.id} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: "84%", padding: "10px 14px", borderRadius: 18,
                  ...(msg.role === "user" ? {
                    background: `linear-gradient(135deg, ${ACCENT}, #a3e635)`,
                    borderBottomRightRadius: 6, color: "#0a0a0f",
                  } : {
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(203,255,77,0.06)",
                    borderBottomLeftRadius: 6, color: "#e2e8f0",
                  }),
                }}>
                  <p style={{ fontSize: 13, lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{msg.text}</p>
                  <p style={{
                    fontSize: 10, margin: "4px 0 0", textAlign: "right",
                    color: msg.role === "user" ? "rgba(0,0,0,0.4)" : "rgba(148,163,184,0.25)",
                  }}>{msg.time}</p>
                </div>
              </div>
            ))}
            {typing && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div style={{
                  padding: "12px 18px", borderRadius: 18, borderBottomLeftRadius: 6,
                  background: "rgba(255,255,255,0.04)", border: `1px solid ${ACCENT}08`,
                  display: "flex", gap: 5, alignItems: "center",
                }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{
                      width: 6, height: 6, borderRadius: "50%", background: ACCENT,
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

      {/* Input */}
      <div style={{ padding: "8px 12px 12px", borderTop: `1px solid ${ACCENT}06`, background: "rgba(10,10,15,0.95)" }}>
        <form onSubmit={e => { e.preventDefault(); send(); }} style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "6px 6px 6px 16px", borderRadius: 24,
          background: "rgba(255,255,255,0.04)", border: `1px solid ${ACCENT}08`,
        }}>
          <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
            placeholder="Напишите Адели..."
            style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#e2e8f0", fontSize: 14 }}
          />
          <button type="submit" disabled={!input.trim()} style={{
            width: 36, height: 36, borderRadius: "50%",
            background: input.trim() ? `linear-gradient(135deg, ${ACCENT}, #a3e635)` : `${ACCENT}10`,
            border: "none", display: "flex", alignItems: "center", justifyContent: "center",
            cursor: input.trim() ? "pointer" : "default", transition: "all 0.2s",
          }}>
            <Send size={15} style={{ color: input.trim() ? "#0a0a0f" : "rgba(148,163,184,0.2)", marginLeft: 1 }} />
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
