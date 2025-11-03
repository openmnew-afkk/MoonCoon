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
    timestamp: "2 min",
    unread: true,
    online: true,
  },
  {
    id: "2",
    name: "Design Squad",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=squad",
    lastMessage: "Check out the new design files",
    timestamp: "1 hour",
    unread: false,
    online: true,
  },
  {
    id: "3",
    name: "Creative Team",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=creative",
    lastMessage: "Let's sync up tomorrow",
    timestamp: "5 hours",
    unread: false,
    online: false,
  },
  {
    id: "4",
    name: "Alex Studio",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
    lastMessage: "Thanks for the feedback!",
    timestamp: "1 day",
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

  // Загружаем сообщения для выбранного диалога
  useEffect(() => {
    if (selectedConversation && user?.id) {
      fetch(`/api/messages/${selectedConversation}?userId=${user.id}`)
        .then(res => res.json())
        .then(data => setMessages(data.messages || []))
        .catch(console.error);
    }
  }, [selectedConversation, user]);

  // Автоскролл к последнему сообщению
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Проверка новых уведомлений
  useEffect(() => {
    if (!user?.id) return;
    const interval = setInterval(() => {
      fetch(`/api/messages/notifications?userId=${user.id}`)
        .then(res => res.json())
        .then(data => setNotifications(data.count || 0))
        .catch(console.error);
    }, 5000); // Проверяем каждые 5 секунд
    return () => clearInterval(interval);
  }, [user]);

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedConversation || !user?.id) return;
    
    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromUserId: user.id.toString(),
          toUserId: selectedConversation,
          text: message,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, data.message]);
        setMessage('');
        
        // Показываем уведомление отправителю
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Сообщение отправлено', {
            body: message.substring(0, 50),
            icon: '/logo.png'
          });
        }
      }
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
      alert('Не удалось отправить сообщение');
    }
  };

  // Запрос разрешения на уведомления
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const filteredConversations = conversations.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 glass-morphism border-b border-glass-light/20 z-30 ios-shadow" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск..."
              className="w-full glass-morphism rounded-full pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto pt-28 h-[calc(100vh-5rem)] flex flex-col pb-24">
        {/* Notification Badge */}
        {notifications > 0 && (
          <div className="fixed top-20 right-4 glass-card px-3 py-2 flex items-center gap-2 animate-pulse z-40">
            <Bell className="text-primary" size={16} />
            <span className="text-sm font-semibold">{notifications} новых</span>
          </div>
        )}

        {selectedConversation ? (
          <div className="flex flex-col h-full">
            {/* Conversation Header */}
            <div className="glass-card border-b border-glass-light/10 mb-4">
              {mockConversations
                .filter((c) => c.id === selectedConversation)
                .map((conversation) => (
                  <div key={conversation.id} className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={conversation.avatar}
                        alt={conversation.name}
                        className="w-12 h-12 rounded-full"
                      />
                      {conversation.online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{conversation.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {conversation.online ? "Active now" : "Active 2h ago"}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedConversation(null)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      ✕
                    </button>
                  </div>
                ))}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 px-4 mb-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageCircle className="text-muted-foreground mb-2" size={48} />
                  <p className="text-muted-foreground">Нет сообщений</p>
                  <p className="text-xs text-muted-foreground">Начните диалог!</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={cn(
                    "flex",
                    msg.senderId === user?.id?.toString() ? "justify-end" : "justify-start"
                  )}>
                    <div className={cn(
                      "glass-card max-w-xs",
                      msg.senderId === user?.id?.toString() && "bg-primary/20 text-primary"
                    )}>
                      <p className="text-sm">{msg.text}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="flex items-center gap-2 px-4">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Напишите сообщение..."
                className="flex-1 glass-morphism rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button 
                onClick={handleSendMessage}
                className="glass-button rounded-full p-2.5 bg-primary/20 text-primary hover:bg-primary/30 transition-all active:scale-95"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2 px-4">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Диалоги не найдены</p>
              </div>
            ) : 
              filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation.id)}
                className="w-full glass-card flex items-center gap-3 hover:bg-glass-light/40 transition-all"
              >
                <div className="relative">
                  <img
                    src={conversation.avatar}
                    alt={conversation.name}
                    className="w-12 h-12 rounded-full"
                  />
                  {conversation.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between">
                    <p
                      className={cn(
                        "font-semibold",
                        conversation.unread && "text-primary"
                      )}
                    >
                      {conversation.name}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {conversation.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {conversation.lastMessage}
                  </p>
                </div>
                {conversation.unread && (
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
