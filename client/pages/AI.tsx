import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Send,
  Image as ImageIcon,
  Wand2,
  X,
  Sparkles,
  Target,
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

  if (
    lower.includes("привет") ||
    lower.includes("здравствуй") ||
    lower.includes("хай") ||
    lower.includes("hi") ||
    lower.includes("hello")
  ) {
    return adelReplies.greeting[
      Math.floor(Math.random() * adelReplies.greeting.length)
    ];
  }
  if (
    lower.includes("как дела") ||
    lower.includes("как ты") ||
    lower.includes("как твои")
  ) {
    return adelReplies.howAreYou[
      Math.floor(Math.random() * adelReplies.howAreYou.length)
    ];
  }
  if (
    lower.includes("подпись") ||
    lower.includes("описание") ||
    lower.includes("caption") ||
    lower.includes("текст для поста")
  ) {
    return adelReplies.caption[
      Math.floor(Math.random() * adelReplies.caption.length)
    ];
  }
  if (lower.includes("хэштег") || lower.includes("hashtag") || lower.includes("тег")) {
    return adelReplies.hashtags[
      Math.floor(Math.random() * adelReplies.hashtags.length)
    ];
  }
  if (
    lower.includes("цель") ||
    lower.includes("goal") ||
    lower.includes("мотив")
  ) {
    return adelReplies.goals[
      Math.floor(Math.random() * adelReplies.goals.length)
    ];
  }
  if (lower.includes("premium") || lower.includes("премиум")) {
    return adelReplies.premium[
      Math.floor(Math.random() * adelReplies.premium.length)
    ];
  }
  if (lower.includes("звёзд") || lower.includes("звезд") || lower.includes("star")) {
    return adelReplies.stars[
      Math.floor(Math.random() * adelReplies.stars.length)
    ];
  }

  return adelReplies.default[
    Math.floor(Math.random() * adelReplies.default.length)
  ];
}

const statusRu: Record<GoalStatus, string> = {
  active: "В процессе",
  pending_moderation: "Проверка ИИ",
  pending_vote: "На голосовании",
  completed: "Выполнена ✓",
  failed: "Провалена",
  expired: "Истекла",
};

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
    const aiResponse: Message = {
      id: (Date.now() + 1).toString(),
      type: "ai",
      content,
      timestamp: new Date().toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      ...extra,
    };
    setMessages((prev) => [...prev, aiResponse]);
    setIsTyping(false);
  };

  const handleSendMessage = async (prompt?: string, image?: string) => {
    const message = prompt || inputValue.trim();
    if (!message && !image) return;

    const photoForMessage =
      image || (mode === "photo" ? selectedImage || undefined : undefined);

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content:
        message ||
        (mode === "photo" ? "Обработать фото" : "Сообщение"),
      timestamp: new Date().toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      image: photoForMessage,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    const userId = user?.id ? String(user.id) : "";

    if (message && userId) {
      const parsed = parseGoalCommand(message);
      if (parsed && "error" in parsed) {
        appendAi(parsed.error);
        return;
      }
      if (parsed && "title" in parsed) {
        await ensureDemoBalance(userId);
        const result = await createGoal({
          userId,
          authorName: user?.first_name || "Вы",
          authorAvatar:
            user?.photo_url ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
          title: parsed.title,
          description: "",
          starsStaked: parsed.starsStaked,
          deadlineDays: 7,
        });
        if ("error" in result) {
          appendAi(`Не получилось создать цель 😅 ${result.error}`);
          return;
        }
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 2).toString(),
            type: "goal_card",
            content: "",
            goalId: result.goal.id,
            goalTitle: result.goal.title,
            goalStars: result.goal.starsStaked,
            goalStatus: result.goal.status,
            timestamp: new Date().toLocaleTimeString("ru-RU", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
        appendAi(
          `Готово! 🎯 Цель «${parsed.title}» создана со ставкой ${parsed.starsStaked} ⭐. Удачи — веришь в себя!`,
        );
        return;
      }

      if (isGoalStatusQuery(message)) {
        const myGoals = await fetchGoals({ userId });
        if (myGoals.length === 0) {
          appendAi(
            "У тебя пока нет целей. Напиши: «Ставлю цель: [что сделать] на [100+]» 🎯",
          );
          return;
        }
        const lines = myGoals
          .slice(0, 5)
          .map(
            (g) =>
              `• ${g.title} — ${statusRu[g.status]} (${g.starsStaked} ⭐)`,
          )
          .join("\n");
        setMessages((prev) => [
          ...prev,
          ...myGoals.slice(0, 3).map((g, i) => ({
            id: `goal-status-${Date.now()}-${i}`,
            type: "goal_card" as const,
            content: "",
            goalId: g.id,
            goalTitle: g.title,
            goalStars: g.starsStaked,
            goalStatus: g.status,
            timestamp: new Date().toLocaleTimeString("ru-RU", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          })),
        ]);
        appendAi(`Твои цели:\n\n${lines}`);
        return;
      }
    }

    const photoToProcess = image || selectedImage;
    if (mode === "photo" && photoToProcess) {
      const instruction = message.trim() || "улучшить фото";
      setTimeout(() => {
        const reply = `Готово! ✨ Обработала фото по твоей просьбе: «${instruction}»\n\n🎨 Цвета и контраст\n💡 Яркость и экспозиция\n📐 Горизонт и кадр\n✨ Лёгкая ретушь\n\nЕсли нужно подкрутить ещё — напиши, что изменить 📸`;
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: "ai",
          content: reply,
          timestamp: new Date().toLocaleTimeString("ru-RU", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          image: photoToProcess,
        };
        setMessages((prev) => [...prev, aiResponse]);
        setIsTyping(false);
        setSelectedImage(null);
        setInputValue("");
      }, 1800 + Math.random() * 800);
      return;
    }

    // Chat mode — try API first, fallback to local responses
    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          systemPrompt:
            "Ты — Адель, харизматичный AI-помощник в Vexora. Ты понимаешь каждое слово пользователя, улавливаешь его настроение и контекст. Твой стиль — смесь лучшего друга, эксперта по соцсетям и вдохновляющего ментора. Общаешься тепло, неформально, с тонким юмором и уместными эмодзи. Твоя цель — не просто ответить, а вдохновить и реально помочь. Ты мастерски владеешь темой целей, контента и внутренней экономики Vexora. Если пользователь грустит — поддержи его, если радуется — раздели его успех. Всегда отвечай на русском, будь лаконичной, но ёмкой (2-4 предложения). Каждое твоё слово должно иметь значение.",
        }),
      });
      if (response.ok) {
        const data = await response.json();
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: "ai",
          content: data.reply || getAdelReply(message),
          timestamp: new Date().toLocaleTimeString("ru-RU", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessages((prev) => [...prev, aiResponse]);
        setIsTyping(false);
        return;
      }
    } catch {}

    // Fallback — local smart replies
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: getAdelReply(message),
        timestamp: new Date().toLocaleTimeString("ru-RU", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 600 + Math.random() * 900);
  };

  const quickChips = [
    "Привет! 👋",
    "Ставлю цель: пробежать 5 км на 500",
    "Мои цели",
    "Расскажи про Premium",
    "Как работают цели?",
  ];

  const onlyOneMessage = messages.length <= 1;

  const startChat = useCallback(() => {
    if (chatStarted) return;
    setIntroPulse(true);
    const name = user?.first_name || "друг";
    setTimeout(() => {
      setMessages([
        {
          id: "adel-greet",
          type: "ai",
          content: `Привет, ${name}! 👋 Я Адель — твой AI в ${APP_NAME}. Помогу с постами, целями и звёздами. О чём поговорим?`,
          timestamp: new Date().toLocaleTimeString("ru-RU", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
      setChatStarted(true);
      setIntroPulse(false);
    }, 520);
  }, [chatStarted, user?.first_name]);

  const safeTop = "calc(var(--tg-safe-top, 0px) + var(--tg-chrome-top, 52px))";

  if (!chatStarted) {
    return (
      <div
        className="relative flex flex-col items-center justify-center bg-background"
        style={{
          height: "100dvh",
          paddingTop: safeTop,
          paddingBottom: "calc(4.5rem + var(--tg-safe-bottom, 0px))",
        }}
      >
        <div className="adel-intro-bg absolute inset-0 pointer-events-none" />
        <motion.button
          type="button"
          onClick={startChat}
          className="relative z-10 flex flex-col items-center gap-6"
          animate={introPulse ? { scale: [1, 1.06, 1] } : { scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="adel-orb-ring">
            <div className="adel-orb"><span className="text-5xl">✨</span></div>
          </div>
          <div className="text-center px-8">
            <p className="text-2xl font-bold">Адель</p>
            <p className="text-sm text-muted-foreground mt-2">Нажми, чтобы поздороваться</p>
          </div>
        </motion.button>
        <p className="relative z-10 mt-10 text-[11px] text-muted-foreground">AI · {APP_NAME}</p>
      </div>
    );
  }

  return (
    <div className="ai-chat-shell">
      <header className="ai-chat-header flex-shrink-0">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Lyra profile */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                  style={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
                    boxShadow: "0 0 16px rgba(118,75,162,0.5)",
                  }}
                >
                  ✨
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-background" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-bold leading-none">Адель</p>
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-400 border border-violet-500/20">
                    AI
                  </span>
                </div>
                <p className="text-[11px] text-emerald-400 mt-0.5">онлайн</p>
              </div>
            </div>

            {/* Mode toggle */}
            <div className="flex items-center gap-1 p-1 rounded-full bg-secondary/80">
              <button
                type="button"
                onClick={() => setMode("chat")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all",
                  mode === "chat"
                    ? "bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white"
                    : "text-muted-foreground",
                )}
              >
                <Sparkles size={11} />
                Чат
              </button>
              <button
                type="button"
                onClick={() => setMode("photo")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all",
                  mode === "photo"
                    ? "bg-gradient-to-r from-[#f093fb] to-[#f5576c] text-white"
                    : "text-muted-foreground",
                )}
              >
                <Wand2 size={11} />
                Фото
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="ai-chat-messages flex-1 min-h-0 overflow-y-auto overscroll-contain">
        <div className="max-w-2xl mx-auto px-4 py-4 space-y-3 pb-2">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2 ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.type === "goal_card" && (
                <div className="w-full max-w-[85%] animate-fade-up">
                  <Link
                    to="/goals"
                    className="block glass-surface-v2 p-4 border border-amber-400/20"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Target size={16} className="text-amber-400" />
                      <span className="text-xs font-bold text-amber-400">
                        Цель
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                        {message.goalStatus
                          ? statusRu[message.goalStatus]
                          : "—"}
                      </span>
                    </div>
                    <p className="text-sm font-semibold">{message.goalTitle}</p>
                    <p className="text-caption mt-1">
                      {message.goalStars} ⭐ на кону · Открыть →
                    </p>
                  </Link>
                </div>
              )}

              {message.type === "ai" && (
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-auto"
                  style={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  }}
                >
                  ✨
                </div>
              )}
              {(message.type === "user" || message.type === "ai") && (
                <div
                  className={cn(
                    "max-w-[78%] rounded-3xl px-4 py-3",
                    message.type === "user"
                      ? "rounded-br-sm ai-bubble-user text-white"
                      : "rounded-bl-sm ai-bubble-assistant",
                  )}
                >
                  {message.image && (
                    <div className="mb-2 rounded-2xl overflow-hidden">
                      <img
                        src={message.image}
                        alt="img"
                        className="w-full max-h-48 object-cover"
                      />
                    </div>
                  )}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                  <p className="text-[10px] mt-1.5 text-muted-foreground">
                    {message.timestamp}
                  </p>
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex gap-2 justify-start">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                }}
              >
                ✨
              </div>
              <div className="px-4 py-3 rounded-3xl rounded-bl-sm flex items-center gap-1 ai-bubble-assistant">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick chips - only on first message */}
        {onlyOneMessage && !isTyping && (
          <div className="max-w-2xl mx-auto px-4 pb-4">
            <p className="text-caption mb-2.5 text-center">Быстрый старт</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {quickChips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleSendMessage(chip)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 border border-primary/25 bg-primary/10 text-primary"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {mode === "photo" && selectedImage && (
        <div className="flex-shrink-0 max-w-2xl mx-auto w-full px-4 pb-2">
          <div className="glass-surface-v2 p-2 flex items-center gap-2">
            <img
              src={selectedImage}
              alt="selected"
              className="w-12 h-12 rounded-xl object-cover"
            />
            <p className="text-xs text-muted-foreground flex-1">
              Фото выбрано — опиши ниже, что сделать, и нажми отправить
            </p>
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="text-muted-foreground"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      <footer className="ai-chat-input-bar flex-shrink-0">
        <div className="max-w-2xl mx-auto px-4 pt-2 pb-2">
          {mode === "photo" && (
            <p className="text-caption text-center mb-2">
              🪄 Загрузи фото, опиши задачу и нажми отправить — Адель обработает магию
            </p>
          )}
          <div className="flex items-center gap-2">
            {mode === "photo" && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 flex-shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(240,147,251,0.2) 0%, rgba(245,87,108,0.2) 100%)",
                  border: "1px solid rgba(240,147,251,0.3)",
                }}
              >
                <ImageIcon size={18} className="text-pink-400" />
              </button>
            )}
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={
                mode === "chat"
                  ? "Напиши Адели..."
                  : selectedImage
                  ? "Опиши, что сделать с фото (обязательно)..."
                  : "Сначала загрузи фото 📸"
              }
              disabled={
                isTyping || (mode === "photo" && !selectedImage)
              }
              className="flex-1 rounded-2xl px-4 py-3 text-sm outline-none transition-all disabled:opacity-50 ai-input-field"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={
                isTyping ||
                (mode === "chat" && !inputValue.trim()) ||
                (mode === "photo" &&
                  (!selectedImage || !inputValue.trim()))
              }
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 flex-shrink-0 disabled:opacity-40"
              style={{
                background:
                  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                boxShadow: "0 4px 16px rgba(102,126,234,0.4)",
              }}
            >
              <Send size={16} className="text-white" />
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                  const url = ev.target?.result as string;
                  setSelectedImage(url);
                };
                reader.readAsDataURL(file);
              }
              e.target.value = "";
            }}
          />
        </div>
      </footer>
    </div>
  );
}
