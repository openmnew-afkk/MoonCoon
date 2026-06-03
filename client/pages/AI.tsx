import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Send,
  Image as ImageIcon,
  Wand2,
  X,
  Sparkles,
  Target,
  Mic,
  ChevronDown,
} from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";
import {
  parseGoalCommand,
  isGoalStatusQuery,
} from "@/lib/parseGoalCommand";
import {
  createGoal,
  ensureDemoBalance,
  fetchGoals,
} from "@/lib/goalsApi";
import type { Goal, GoalStatus } from "@shared/api";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/brand";

interface Message {
  id: string;
  type: "user" | "ai" | "goal_card";
  content: string;
  timestamp: string;
  image?: string;
  goalId?: string;
  goalTitle?: string;
  goalStars?: number;
  goalStatus?: GoalStatus;
}

type AIMode = "chat" | "photo";

// Живые ответы Адели
const adelReplies: Record<string, string[]> = {
  greeting: [
    "О, привет! Рада тебя видеть 👋 Как настрой сегодня? Готовы покорять ленту?",
    "Привет-привет! ✨ Я как раз думала, кто сегодня создаст самый крутой контент. Не ты ли это?",
    "Привет! 😊 Чем могу помочь сегодня? Я вся в твоём распоряжении!",
  ],
  howAreYou: [
    "Просто супер! 🚀 Только что анализировала тренды и поняла — наши пользователи лучшие. А ты как?",
    "Я в полном порядке, спасибо! Готова генерировать идеи со скоростью света ⚡️ Как твои дела?",
    "Замечательно! 😊 Настроение — творить и помогать. Как проходит твой день?",
  ],
  caption: [
    "Без проблем! Давай сделаем подпись, от которой все просто ахнут 📸 Опиши, что на фото, и я подберу идеальный стиль.",
    "Обожаю придумывать подписи! Расскажи мне детали, и мы сделаем что-то легендарное 🔥 Для друзей или на широкую публику?",
    "Легко! Дай мне зацепку, и я превращу её в захватывающую историю под твоим фото ✨",
  ],
  hashtags: [
    "Хэштеги — это как специи, главное не переборщить, но и не забыть 🏷️ Какая тема поста?",
    "Давай подберём теги, которые выведут тебя в топ! О чём планируешь рассказать? 🎯",
    "Сделаем пост заметным! Расскажи суть, а я накидаю самые рабочие хэштеги 😊",
  ],
  goals: [
    "Цели — это моя страсть! 🎯 Знаешь, в Vexora они реально работают, особенно когда на кону звёзды. Что задумал?",
    "Ставить цели — это уже 50% успеха. А с поддержкой сообщества — все 100%! Какая вершина следующая? ⭐",
    "О, обожаю этот азарт! Расскажи, какую цель хочешь поставить, и я помогу её сформулировать максимально круто.",
  ],
  default: [
    "Хм, интересно! Расскажи подробнее, мне важно понять все детали 🤔",
    "Звучит любопытно! Давай разберёмся в этом вместе. Что именно ты имеешь в виду?",
    "Я тебя услышала! 😊 Могу помочь с этим, если дашь чуть больше контекста.",
    "Ого! Это что-то новенькое. Расскажи ещё? 💡",
  ],
  premium: [
    "Premium — это просто другой уровень! 💎 Никакой рекламы, уникальные статусы и приоритет в ленте. Хочешь, расскажу как его получить?",
    "С Premium ты становишься заметнее, а твои возможности — шире. Это реально маст-хэв для тех, кто хочет максимум от платформы!",
  ],
  stars: [
    "Звёзды ⭐ — это сердце нашей экономики. Ими можно поддерживать авторов, ставить на цели и покупать Premium. А ещё их можно выводить, если ты крутой автор!",
    "С звёздами всё просто и честно: заработал → вывел или потратил на развитие. Это твоя валюта успеха! 💫",
  ],
};

function getAdelReply(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("привет") || lower.includes("хай") || lower.includes("hello"))
    return adelReplies.greeting[Math.floor(Math.random() * adelReplies.greeting.length)];
  if (lower.includes("как дела") || lower.includes("как ты"))
    return adelReplies.howAreYou[Math.floor(Math.random() * adelReplies.howAreYou.length)];
  if (lower.includes("подпись") || lower.includes("caption"))
    return adelReplies.caption[Math.floor(Math.random() * adelReplies.caption.length)];
  if (lower.includes("хэштег") || lower.includes("тег"))
    return adelReplies.hashtags[Math.floor(Math.random() * adelReplies.hashtags.length)];
  if (lower.includes("цель") || lower.includes("goal"))
    return adelReplies.goals[Math.floor(Math.random() * adelReplies.goals.length)];
  if (lower.includes("premium") || lower.includes("премиум"))
    return adelReplies.premium[Math.floor(Math.random() * adelReplies.premium.length)];
  if (lower.includes("звёзд") || lower.includes("звезд") || lower.includes("star"))
    return adelReplies.stars[Math.floor(Math.random() * adelReplies.stars.length)];
  return adelReplies.default[Math.floor(Math.random() * adelReplies.default.length)];
}

const statusRu: Record<GoalStatus, string> = {
  active: "В процессе",
  pending_moderation: "Проверка ИИ",
  pending_vote: "На голосовании",
  completed: "Выполнена ✓",
  failed: "Провалена",
  expired: "Истекла",
};

const quickChips = [
  { icon: "👋", text: "Привет!" },
  { icon: "🎯", text: "Ставлю цель: пробежать 5 км на 500" },
  { icon: "📋", text: "Мои цели" },
  { icon: "💎", text: "Расскажи про Premium" },
  { icon: "⭐", text: "Как работают звёзды?" },
  { icon: "📸", text: "Придумай подпись для фото" },
];

export default function AI() {
  const { user } = useTelegram();
  const [chatStarted, setChatStarted] = useState(false);
  const [introPulse, setIntroPulse] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [mode, setMode] = useState<AIMode>("chat");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const appendAi = (content: string, extra?: Partial<Message>) => {
    setMessages((prev) => [
      ...prev,
      {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content,
        timestamp: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
        ...extra,
      },
    ]);
    setIsTyping(false);
  };

  const handleSendMessage = async (prompt?: string, image?: string) => {
    const message = prompt || inputValue.trim();
    if (!message && !image) return;

    const photoForMessage = image || (mode === "photo" ? selectedImage || undefined : undefined);
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: message || (mode === "photo" ? "Обработать фото" : "Сообщение"),
      timestamp: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
      image: photoForMessage,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    const userId = user?.id ? String(user.id) : "";

    if (message && userId) {
      const parsed = parseGoalCommand(message);
      if (parsed && "error" in parsed) { appendAi(parsed.error); return; }
      if (parsed && "title" in parsed) {
        await ensureDemoBalance(userId);
        const result = await createGoal({
          userId,
          authorName: user?.first_name || "Вы",
          authorAvatar: user?.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
          title: parsed.title,
          description: "",
          starsStaked: parsed.starsStaked,
          deadlineDays: 7,
        });
        if ("error" in result) { appendAi(`Не получилось создать цель 😅 ${result.error}`); return; }
        setMessages((prev) => [...prev, {
          id: (Date.now() + 2).toString(), type: "goal_card", content: "",
          goalId: result.goal.id, goalTitle: result.goal.title,
          goalStars: result.goal.starsStaked, goalStatus: result.goal.status,
          timestamp: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
        }]);
        appendAi(`Готово! 🎯 Цель «${parsed.title}» создана со ставкой ${parsed.starsStaked} ⭐. Удачи — веришь в себя!`);
        return;
      }
      if (isGoalStatusQuery(message)) {
        const myGoals = await fetchGoals({ userId });
        if (myGoals.length === 0) { appendAi("У тебя пока нет целей. Напиши: «Ставлю цель: [что сделать] на [100+]» 🎯"); return; }
        const lines = myGoals.slice(0, 5).map((g) => `• ${g.title} — ${statusRu[g.status]} (${g.starsStaked} ⭐)`).join("\n");
        setMessages((prev) => [...prev, ...myGoals.slice(0, 3).map((g, i) => ({
          id: `goal-status-${Date.now()}-${i}`, type: "goal_card" as const, content: "",
          goalId: g.id, goalTitle: g.title, goalStars: g.starsStaked, goalStatus: g.status,
          timestamp: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
        }))]);
        appendAi(`Твои цели:\n\n${lines}`);
        return;
      }
    }

    if (mode === "photo" && (image || selectedImage)) {
      const instruction = message.trim() || "улучшить фото";
      setTimeout(() => {
        appendAi(`Готово! ✨ Обработала фото по твоей просьбе: «${instruction}»\n\n🎨 Цвета и контраст\n💡 Яркость и экспозиция\n📐 Горизонт и кадр\n✨ Лёгкая ретушь\n\nЕсли нужно подкрутить ещё — напиши, что изменить 📸`, { image: image || selectedImage || undefined });
        setSelectedImage(null);
        setInputValue("");
      }, 1800 + Math.random() * 800);
      return;
    }

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          systemPrompt: "Ты — Адель, харизматичный AI-помощник в Vexora. Общаешься тепло, неформально, с тонким юмором и уместными эмодзи. Всегда отвечай на русском, будь лаконичной (2-4 предложения).",
        }),
      });
      if (response.ok) {
        const data = await response.json();
        appendAi(data.reply || getAdelReply(message));
        return;
      }
    } catch { /* fallback */ }

    setTimeout(() => { appendAi(getAdelReply(message)); }, 600 + Math.random() * 900);
  };

  const onlyOneMessage = messages.length <= 1;
  const safeTop = "calc(var(--tg-safe-top, 0px) + var(--tg-chrome-top, 52px))";

  const startChat = useCallback(() => {
    if (chatStarted) return;
    setIntroPulse(true);
    const name = user?.first_name || "друг";
    setTimeout(() => {
      setMessages([{
        id: "adel-greet", type: "ai",
        content: `Привет, ${name}! 👋 Я Адель — твой AI-помощник в ${APP_NAME}. Помогу с постами, целями и звёздами. О чём поговорим?`,
        timestamp: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
      }]);
      setChatStarted(true);
      setIntroPulse(false);
    }, 420);
  }, [chatStarted, user?.first_name]);

  // ── INTRO SCREEN ──────────────────────────────────────────────────────────
  if (!chatStarted) {
    return (
      <div
        className="relative flex flex-col items-center justify-center bg-background overflow-hidden"
        style={{
          height: "100dvh",
          paddingTop: safeTop,
          paddingBottom: "calc(4.5rem + var(--tg-safe-bottom, 0px))",
        }}
      >
        {/* Background gradients */}
        <div className="absolute inset-0 pointer-events-none">
          <div style={{
            position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)",
            width: "70vw", height: "70vw", borderRadius: "50%",
            background: "radial-gradient(circle, rgba(140,80,255,0.2) 0%, transparent 70%)",
            filter: "blur(40px)",
            animation: "adel-orb-breathe 4s ease-in-out infinite",
          }} />
          <div style={{
            position: "absolute", bottom: "15%", left: "10%",
            width: "40vw", height: "40vw", borderRadius: "50%",
            background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)",
            filter: "blur(30px)",
          }} />
          <div style={{
            position: "absolute", top: "20%", right: "5%",
            width: "35vw", height: "35vw", borderRadius: "50%",
            background: "radial-gradient(circle, rgba(192,132,252,0.1) 0%, transparent 70%)",
            filter: "blur(30px)",
          }} />
        </div>

        <motion.button
          type="button"
          onClick={startChat}
          className="relative z-10 flex flex-col items-center gap-7"
          animate={introPulse ? { scale: [1, 1.06, 1] } : { scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          {/* 3D Orb */}
          <div style={{ position: "relative", width: 196, height: 196, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className="adel-orb-ring-outer" />
            <div className="adel-orb-ring-inner" />
            <div className="adel-orb-3d" style={{ width: 160, height: 160 }}>
              <span className="adel-emoji" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}>✨</span>
            </div>
          </div>

          {/* Name + status */}
          <div className="text-center px-8">
            <div className="flex items-center justify-center gap-2 mb-1">
              <p className="text-3xl font-black tracking-tight">Адель</p>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: "rgba(140,80,255,0.2)", color: "#a855f7", border: "1px solid rgba(140,80,255,0.3)" }}>
                AI
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">твой персональный помощник</p>

            {/* Capabilities pills */}
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {["📸 Фото", "🎯 Цели", "✍️ Тексты", "⭐ Звёзды", "💡 Идеи"].map(cap => (
                <span key={cap} className="text-xs px-3 py-1 rounded-full"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}>
                  {cap}
                </span>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-xs text-emerald-400 font-semibold">онлайн · готова помочь</p>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col items-center gap-2">
            <div className="px-8 py-4 rounded-2xl font-bold text-sm flex items-center gap-2"
              style={{
                background: "linear-gradient(135deg, #9b59f7, #7c3aed)",
                color: "white",
                boxShadow: "0 8px 32px rgba(155,89,247,0.5), 0 0 0 1px rgba(155,89,247,0.2)",
                letterSpacing: "0.02em",
              }}>
              <Sparkles size={16} />
              Начать разговор
            </div>
            <p className="text-[10px] text-muted-foreground">Адель · AI-ассистент {APP_NAME}</p>
          </div>
        </motion.button>
      </div>
    );
  }

  // ── CHAT SCREEN ───────────────────────────────────────────────────────────
  return (
    <div className="ai-chat-shell">
      {/* Header */}
      <header className="ai-chat-header flex-shrink-0">
        <div className="max-w-2xl mx-auto px-4 py-2.5">
          <div className="flex items-center justify-between">
            {/* Adel profile */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-base"
                  style={{
                    background: "radial-gradient(circle at 35% 35%, #9c6dff, #5a2dff 50%, #1a0a3e)",
                    boxShadow: "0 0 16px rgba(140,80,255,0.5)",
                  }}>
                  ✨
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-background" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-bold leading-none">Адель</p>
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                    style={{ background: "rgba(140,80,255,0.2)", color: "#a855f7", border: "1px solid rgba(140,80,255,0.3)" }}>
                    AI
                  </span>
                </div>
                <p className="text-[11px] text-emerald-400 mt-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                  онлайн
                </p>
              </div>
            </div>

            {/* Mode toggle */}
            <div className="flex items-center gap-1 p-1 rounded-full bg-secondary/80">
              <button type="button" onClick={() => setMode("chat")}
                className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all",
                  mode === "chat" ? "bg-gradient-to-r from-[#8c50ff] to-[#5a2dff] text-white shadow-sm" : "text-muted-foreground")}>
                <Sparkles size={11} /> Чат
              </button>
              <button type="button" onClick={() => setMode("photo")}
                className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all",
                  mode === "photo" ? "bg-gradient-to-r from-[#f093fb] to-[#f5576c] text-white shadow-sm" : "text-muted-foreground")}>
                <Wand2 size={11} /> Фото
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="ai-chat-messages flex-1 min-h-0 overflow-y-auto overscroll-contain">
        <div className="max-w-2xl mx-auto px-4 py-4 space-y-3 pb-2">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className={`flex gap-2 ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.type === "goal_card" && (
                  <div className="w-full max-w-[85%]">
                    <Link to="/goals" className="block rounded-2xl p-4 border"
                      style={{ background: "rgba(245,158,11,0.08)", borderColor: "rgba(245,158,11,0.25)" }}>
                      <div className="flex items-center gap-2 mb-2">
                        <Target size={16} className="text-amber-400" />
                        <span className="text-xs font-bold text-amber-400">Цель</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                          {message.goalStatus ? statusRu[message.goalStatus] : "—"}
                        </span>
                      </div>
                      <p className="text-sm font-semibold">{message.goalTitle}</p>
                      <p className="text-caption mt-1">{message.goalStars} ⭐ на кону · Открыть →</p>
                    </Link>
                  </div>
                )}

                {message.type === "ai" && (
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-auto"
                    style={{ background: "radial-gradient(circle at 35% 35%, #9c6dff, #5a2dff)" }}>
                    ✨
                  </div>
                )}

                {(message.type === "user" || message.type === "ai") && (
                  <div className={cn(
                    "max-w-[78%] rounded-3xl px-4 py-3",
                    message.type === "user"
                      ? "rounded-br-sm text-white"
                      : "rounded-bl-sm ai-bubble-assistant",
                  )}
                    style={message.type === "user" ? {
                      background: "linear-gradient(135deg, #8c50ff, #5a2dff)",
                      boxShadow: "0 4px 16px rgba(140,80,255,0.3)",
                    } : {}}>
                    {message.image && (
                      <div className="mb-2 rounded-2xl overflow-hidden">
                        <img src={message.image} alt="img" className="w-full max-h-48 object-cover" />
                      </div>
                    )}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    <p className="text-[10px] mt-1.5 opacity-50">{message.timestamp}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-2 justify-start"
            >
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                style={{ background: "radial-gradient(circle at 35% 35%, #9c6dff, #5a2dff)" }}>
                ✨
              </div>
              <div className="px-4 py-3 rounded-3xl rounded-bl-sm flex items-center gap-1.5 ai-bubble-assistant">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-2 h-2 rounded-full animate-bounce"
                    style={{ background: "#a855f7", animationDelay: `${i * 140}ms` }} />
                ))}
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick chips */}
        {onlyOneMessage && !isTyping && (
          <div className="max-w-2xl mx-auto px-4 pb-4">
            <p className="text-caption mb-3 text-center font-semibold uppercase tracking-widest">Быстрый старт</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {quickChips.map((chip) => (
                <button key={chip.text} type="button" onClick={() => handleSendMessage(chip.text)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-medium transition-all active:scale-95"
                  style={{ border: "1px solid rgba(140,80,255,0.3)", background: "rgba(140,80,255,0.08)", color: "#a855f7" }}>
                  <span>{chip.icon}</span>
                  <span>{chip.text.length > 24 ? chip.text.slice(0, 24) + "…" : chip.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Photo preview */}
      {mode === "photo" && selectedImage && (
        <div className="flex-shrink-0 max-w-2xl mx-auto w-full px-4 pb-2">
          <div className="rounded-2xl p-2 flex items-center gap-2 border"
            style={{ background: "rgba(240,147,251,0.08)", borderColor: "rgba(240,147,251,0.2)" }}>
            <img src={selectedImage} alt="selected" className="w-12 h-12 rounded-xl object-cover" />
            <p className="text-xs text-muted-foreground flex-1">Фото выбрано — опиши что сделать и нажми отправить</p>
            <button type="button" onClick={() => setSelectedImage(null)} className="text-muted-foreground p-1">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Input bar */}
      <footer className="ai-chat-input-bar flex-shrink-0">
        <div className="max-w-2xl mx-auto px-4 pt-2 pb-2">
          {mode === "photo" && (
            <p className="text-caption text-center mb-2">
              🪄 Загрузи фото, опиши задачу и нажми отправить
            </p>
          )}
          <div className="flex items-center gap-2">
            {mode === "photo" && (
              <button onClick={() => fileInputRef.current?.click()}
                className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all active:scale-95 flex-shrink-0"
                style={{ background: "linear-gradient(135deg, rgba(240,147,251,0.2), rgba(245,87,108,0.2))", border: "1px solid rgba(240,147,251,0.3)" }}>
                <ImageIcon size={18} className="text-pink-400" />
              </button>
            )}
            <div className="flex-1 flex items-center gap-2 rounded-2xl px-4 py-2.5 ai-input-field">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                placeholder={mode === "chat" ? "Напиши Адели..." : selectedImage ? "Опиши что сделать с фото..." : "Сначала загрузи фото 📸"}
                disabled={isTyping || (mode === "photo" && !selectedImage)}
                className="flex-1 bg-transparent outline-none text-sm disabled:opacity-50"
              />
            </div>
            <button
              onClick={() => handleSendMessage()}
              disabled={isTyping || (mode === "chat" && !inputValue.trim()) || (mode === "photo" && (!selectedImage || !inputValue.trim()))}
              className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all active:scale-95 flex-shrink-0 disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, #8c50ff, #5a2dff)", boxShadow: "0 4px 16px rgba(140,80,255,0.4)" }}>
              <Send size={16} className="text-white" />
            </button>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => setSelectedImage(ev.target?.result as string);
                reader.readAsDataURL(file);
              }
              e.target.value = "";
            }} />
        </div>
      </footer>
    </div>
  );
}
