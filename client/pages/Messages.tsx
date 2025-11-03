import { useState } from "react";
import { MessageCircle, Send, Search } from "lucide-react";
import { cn } from "@/lib/utils";

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

export default function Messages() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const handleSendMessage = () => {
    if (!message.trim()) return;
    // TODO: Отправка сообщения на сервер
    console.log('Отправка сообщения:', message);
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 glass-morphism border-b border-glass-light/20 z-30 ios-shadow">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <MessageCircle className="text-primary" size={28} />
            <h1 className="text-2xl font-bold">Messages</h1>
            <div className="flex-1 ml-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full glass-morphism rounded-full pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto pt-20 h-[calc(100vh-5rem)] flex flex-col pb-24">
        {
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
              <div className="flex justify-start">
                <div className="glass-card max-w-xs">
                  <p className="text-sm">Hey! How are you doing?</p>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="glass-card max-w-xs bg-primary/20 text-primary">
                  <p className="text-sm">Great! Just finished the new project</p>
                </div>
              </div>
              <div className="flex justify-start">
                <div className="glass-card max-w-xs">
                  <p className="text-sm">That sounds amazing! Can't wait 🎉</p>
                </div>
              </div>
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
          <div className="space-y-2">
            {mockConversations.map((conversation) => (
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
