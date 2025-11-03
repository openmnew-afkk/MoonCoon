import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Brain, Image as ImageIcon, MessageSquare, Wand2, ToggleLeft, ToggleRight } from "lucide-react";
import { usePremium } from "@/hooks/usePremium";

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: string;
  image?: string; // Для изображений от NanoBonano
}

type AIMode = "openai" | "nanobonano";

export default function AI() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "ai",
      content: "👋 Привет! Я ваш AI помощник на базе OpenAI GPT-3.5.\n\nЯ могу помочь вам:\n✨ Создавать описания для постов\n🎨 Генерировать идеи контента\n🏷️ Подбирать хештеги\n📊 Анализировать тренды\n💡 Улучшать тексты\n\nПереключитесь на NanoBonano для редактирования фото!",
      timestamp: "Сейчас",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [mode, setMode] = useState<AIMode>("openai");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { premium } = usePremium();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (prompt?: string, image?: string) => {
    const message = prompt || inputValue.trim();
    if (!message && !image) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: message || "Обработать изображение",
      timestamp: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
      image: image || undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Интеграция с OpenAI API
    if (mode === "openai") {
      await callOpenAIAPI(message, image);
    } else {
      await callNanoBonanoAPI(image || selectedImage);
    }
  };

  const callOpenAIAPI = async (prompt: string, image?: string) => {
    try {
      // Реальный вызов к серверу
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt })
      });

      if (!response.ok) {
        throw new Error('AI недоступен');
      }

      const data = await response.json();
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: data.reply || 'Извините, не могу ответить',
        timestamp: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    } catch (error) {
      console.error("Ошибка OpenAI API:", error);
      // Fallback на демо-ответ
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: `❌ Ошибка подключения к OpenAI.\n\nПроверьте API ключ в .env файле.\n\nДля OpenAI нужен ключ формата: sk-...`,
        timestamp: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }
  };

  const callNanoBonanoAPI = async (imageUrl: string | null) => {
    if (!imageUrl) return;

    try {
      // В продакшене здесь должен быть реальный вызов NanoBonano API
      // const response = await fetch('https://api.nanobonano.ai/edit', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ image: imageUrl, task: 'enhance' })
      // });

      // Демо-ответ
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: "ai",
          content: "✅ Фото обработано с помощью NanoBonano!\n\nПрименены улучшения:\n✨ Автокоррекция экспозиции\n🎨 Улучшение цветов\n📐 Выравнивание горизонта\n🔍 Умное кадрирование",
          timestamp: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
          image: imageUrl, // Обработанное изображение
        };
        setMessages((prev) => [...prev, aiResponse]);
        setIsTyping(false);
        setSelectedImage(null);
      }, 2000);
    } catch (error) {
      console.error("Ошибка NanoBonano API:", error);
      setIsTyping(false);
    }
  };

  const generateGeminiResponse = (prompt: string): string => {
    const lowerPrompt = prompt.toLowerCase();

    if (lowerPrompt.includes("описание") || lowerPrompt.includes("описать")) {
      return `🌟 Вот отличное описание для вашего поста (сгенерировано Gemini):

Сегодня прекрасный день для новых возможностей! Поделюсь с вами моментом из моей жизни. 

Каждый день - это шанс стать лучше, узнать что-то новое и вдохновиться. 

#мотивация #вдохновение #жизнь #позитив #успех #мечты #цели #развитие #growth #inspiration`;
    }

    if (lowerPrompt.includes("иде") || lowerPrompt.includes("контент")) {
      return `Вот 5 идей контента (от Gemini):

1. 📸 "День из моей жизни" - покажите свой обычный день с момента пробуждения
2. 💡 Полезные советы по вашей теме - поделитесь экспертным мнением
3. ❓ Задайте вопрос аудитории для вовлечения - "Что вы думаете о...?"
4. 🎨 Покажите процесс создания чего-то - behind the scenes контент
5. 🙌 Мотивационная цитата с вашим комментарием - вдохновите аудиторию

Какая идея вам больше нравится?`;
    }

    if (lowerPrompt.includes("хештег")) {
      return `Вот релевантные хештеги (подобрано Gemini):

#тренды2024 #популярно #вирусныйконтент #инстаграм #соцсети #лайки #подписчики #контент #креатив #интересное #мотивация #вдохновение #успех #развитие #growth #contentcreator #socialmedia`;
    }

    if (lowerPrompt.includes("тренд") || lowerPrompt.includes("популярн")) {
      return `Актуальные тренды в социальных сетях (анализ Gemini):

🔥 Короткие видео форматы (Reels, Shorts) - до 60 секунд
💬 Интерактивные истории и опросы
🎭 Аутентичный контент "за кадром"
🌍 Экологичная тематика и sustainability
💪 Мотивационный контент
📚 Образовательный контент с добавленной стоимостью
🎨 AI-генерация контента

Рекомендую использовать короткие форматы видео для лучшего охвата!`;
    }

    return `Я обработал ваш запрос с помощью Google Gemini: "${prompt}"

В продакшене здесь будет подключение к реальному Gemini API. Пока это демонстрационный ответ.

Попробуйте спросить:
- Создать описание для поста
- Предложить идеи контента
- Подобрать хештеги
- Проанализировать тренды`;
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        setSelectedImage(imageUrl);
        if (mode === "nanobonano") {
          handleSendMessage("", imageUrl);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 glass-morphism border-b border-glass-light/20 z-30 ios-shadow">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">AI</h1>
            
            {/* Mode Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">OpenAI</span>
              <button
                onClick={() => {
                  setMode(mode === "openai" ? "nanobonano" : "openai");
                  setSelectedImage(null);
                  setInputValue("");
                }}
                className="relative w-12 h-6 rounded-full bg-glass-light/30 p-1 transition-all"
              >
                <div
                  className={`absolute top-1 w-4 h-4 rounded-full bg-primary transition-all ${
                    mode === "nanobonano" ? "left-7" : "left-1"
                  }`}
                />
              </button>
              <span className="text-xs text-muted-foreground">NanoBonano</span>
            </div>
          </div>
          
          {/* Mode Description */}
          <p className="text-xs text-muted-foreground mt-1">
            {mode === "openai"
              ? "Чат с OpenAI GPT-3.5 - создание контента и текстов"
              : "NanoBonano - редактирование и улучшение фото"}
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto pt-16 h-[calc(100vh-5rem)] flex flex-col pb-24">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 px-4 py-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`glass-card max-w-[85%] ${
                  message.type === "user"
                    ? "bg-primary/20 text-primary"
                    : "bg-glass-light/40"
                }`}
              >
                {message.image && (
                  <div className="mb-3 rounded-xl overflow-hidden">
                    <img
                      src={message.image}
                      alt="Processed"
                      className="w-full h-auto max-h-64 object-contain"
                    />
                  </div>
                )}
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {message.timestamp}
                </p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="glass-card bg-glass-light/40">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-75"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Image Preview for NanoBonano */}
        {mode === "nanobonano" && selectedImage && !isTyping && (
          <div className="px-4 mb-4">
            <div className="glass-card p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium">Изображение выбрано</span>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="text-xs text-red-500 hover:text-red-400"
                >
                  Убрать
                </button>
              </div>
              <img
                src={selectedImage}
                alt="Selected"
                className="w-full h-32 object-contain rounded-lg"
              />
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="fixed bottom-20 left-0 right-0 glass-morphism border-t border-glass-light/20 ios-shadow z-40">
          <div className="max-w-2xl mx-auto px-4 py-3">
            <div className="flex items-center gap-2">
              {mode === "nanobonano" && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="glass-button rounded-full p-2.5 bg-accent/20 text-accent hover:bg-accent/30 transition-all"
                  title="Загрузить фото"
                >
                  <ImageIcon size={20} />
                </button>
              )}
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={
                  mode === "openai"
                    ? "Спросите меня что угодно... ✨"
                    : "Загрузите фото для обработки..."
                }
                disabled={mode === "nanobonano" && !selectedImage}
                className="flex-1 glass-morphism rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={(!inputValue.trim() && !selectedImage) || isTyping}
                className="glass-button rounded-full p-2.5 bg-primary/20 text-primary hover:bg-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Send size={20} />
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
            />
            {mode === "nanobonano" && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Загрузите фото для автоматической обработки с помощью NanoBonano
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
