import { useState, useEffect, useRef } from "react";
import { MessageCircle, Send, Search, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTelegram } from "@/hooks/useTelegram";

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  online: boolean;
}

const mockConversations: Conversation[] = [
  {
    id: "1",
    name: "Sarah Chen",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
    lastMessage: "That sounds amazing! Can't wait 🎉",
    timestamp: "2 мин",
    unread: true,
    online: true,
  },
  {
    id: "2",
    name: "Design Squad",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=squad",
    lastMessage: "Check out the new design files",
    timestamp: "1 час",
    unread: false,
    online: true,
  },
  {
    id: "3",
    name: "Creative Team",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=creative",
    lastMessage: "Let's sync up tomorrow",
    timestamp: "5 часов",
    unread: false,
    online: false,
  },
  {
    id: "4",
    name: "Alex Studio",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
    lastMessage: "Thanks for the feedback!",
    timestamp: "1 день",
    unread: false,
    online: false,
  },
];

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export default function Messages() {
  const { user } = useTelegram();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedConversation && user?.id) {
      fetch(`/api/messages/${selectedConversation}?userId=${user.id}`)
        .then((res) => res.json())
        .then((data) => setMessages(data.messages || []))
        .catch(console.error);
    }
  }, [selectedConversation, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!user?.id) return;
    const interval = setInterval(() => {
      fetch(`/api/messages/notifications?userId=${user.id}`)
        .then((res) => res.json())
        .then((data) => setNotifications(data.count || 0))
        .catch(console.error);
    }, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedConversation || !user?.id) return;
    try {
      const response = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromUserId: user.id.toString(),
          toUserId: selectedConversation,
          text: message,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [...prev, data.message]);
        setMessage("");
      }
    } catch (error) {
      console.error("Ошибка отправки:", error);
    }
  };

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const filteredConversations = conversations.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const activeConvo = mockConversations.find((c) => c.id === selectedConversation);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <div
        className="fixed top-0 left-0 right-0 z-30 ios-blur"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="relative">
            <Search
              className="absolute left-3.5 top-1/2 transform -translate-y-1/2"
              size={16}
              style={{ color: "var(--text-tertiary)" }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск..."
              className="ios-input"
              style={{ paddingLeft: "2.5rem" }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto pt-28 h-[calc(100vh-5rem)] flex flex-col pb-24">
        {notifications > 0 && (
          <div
            className="fixed top-20 right-4 ios-card px-3 py-2 flex items-center gap-2 animate-pulse z-40"
          >
            <Bell size={16} style={{ color: "var(--blue)" }} />
            <span className="ios-headline">{notifications} новых</span>
          </div>
        )}

        {selectedConversation ? (
          <div className="flex flex-col h-full">
            <div className="ios-card mb-4 mx-4 overflow-hidden">
              {activeConvo && (
                <div className="flex items-center gap-3 p-4">
                  <div className="relative">
                    <img
                      src={activeConvo.avatar}
                      alt={activeConvo.name}
                      className="w-12 h-12 rounded-full"
                    />
                    {activeConvo.online && (
                      <div
                        className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
                        style={{ background: "var(--green)", borderColor: "var(--bg-secondary)" }}
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="ios-headline" style={{ color: "var(--text-primary)" }}>{activeConvo.name}</p>
                    <p className="ios-caption">
                      {activeConvo.online ? "Онлайн" : "Был(а) недавно"}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="ios-icon-btn"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 px-4 mb-4 scrollbar-hide">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
                    style={{ background: "var(--bg-tertiary)" }}
                  >
                    <MessageCircle size={24} style={{ color: "var(--text-tertiary)" }} />
                  </div>
                  <p className="ios-headline" style={{ color: "var(--text-secondary)" }}>Нет сообщений</p>
                  <p className="ios-caption">Начните диалог!</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex",
                      msg.senderId === user?.id?.toString() ? "justify-end" : "justify-start",
                    )}
                  >
                    <div
                      className="max-w-xs rounded-2xl px-4 py-2.5"
                      style={{
                        background:
                          msg.senderId === user?.id?.toString()
                            ? "var(--blue)"
                            : "var(--bg-secondary)",
                        color:
                          msg.senderId === user?.id?.toString()
                            ? "#fff"
                            : "var(--text-primary)",
                      }}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <p
                        className="text-[10px] mt-1"
                        style={{
                          color:
                            msg.senderId === user?.id?.toString()
                              ? "rgba(255,255,255,0.6)"
                              : "var(--text-tertiary)",
                        }}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString("ru-RU", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="flex items-center gap-2 px-4">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Напишите сообщение..."
                className="ios-input flex-1"
              />
              <button
                onClick={handleSendMessage}
                className={cn(
                  "rounded-full p-3 flex items-center justify-center",
                  message.trim() ? "ios-btn" : "ios-btn-ghost",
                )}
                style={{
                  width: "44px",
                  height: "44px",
                  padding: 0,
                }}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2 px-4">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-12">
                <p className="ios-body" style={{ color: "var(--text-secondary)" }}>Диалоги не найдены</p>
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation.id)}
                  className="ios-card-row touch-manipulation text-left"
                  style={{ width: "100%" }}
                >
                  <div className="relative">
                    <img
                      src={conversation.avatar}
                      alt={conversation.name}
                      className="w-12 h-12 rounded-full"
                    />
                    {conversation.online && (
                      <div
                        className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
                        style={{ background: "var(--green)", borderColor: "var(--bg-secondary)" }}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p
                        className={cn("ios-headline", conversation.unread && "font-bold")}
                        style={{ color: conversation.unread ? "var(--text-primary)" : "var(--text-secondary)" }}
                      >
                        {conversation.name}
                      </p>
                      <span className="ios-caption">{conversation.timestamp}</span>
                    </div>
                    <p className="ios-body truncate" style={{ color: "var(--text-secondary)" }}>
                      {conversation.lastMessage}
                    </p>
                  </div>
                  {conversation.unread && (
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--blue)" }} />
                  )}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
