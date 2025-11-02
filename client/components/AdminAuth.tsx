import { useState, useEffect } from "react";
import { Shield, AlertCircle } from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";

interface AdminAuthProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AdminAuth({ onSuccess, onCancel }: AdminAuthProps) {
  const { user } = useTelegram();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Автоматически пытаемся авторизоваться при монтировании
    if (user?.id) {
      handleAuth();
    }
  }, [user]);

  const handleAuth = async () => {
    if (!user?.id) {
      setError("Требуется авторизация через Telegram");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id.toString() }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Сохраняем сессию администратора
          localStorage.setItem("admin_session", data.sessionToken);
          onSuccess();
        } else {
          setError("У вас нет прав администратора");
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Ошибка авторизации");
      }
    } catch (error) {
      console.error("Ошибка авторизации:", error);
      setError("Ошибка подключения к серверу");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24 flex items-center justify-center px-4">
      <div className="glass-card max-w-md w-full p-6">
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
            <Shield className="text-primary" size={32} />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center mb-2">Админ-панель</h2>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Проверка прав администратора
        </p>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
            <p className="text-sm text-muted-foreground">Проверка прав доступа...</p>
          </div>
        ) : error ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-red-500 text-sm bg-red-500/10 p-4 rounded-xl">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
            <button
              onClick={handleAuth}
              className="w-full glass-button bg-primary/20 text-primary hover:bg-primary/30 rounded-xl py-3 text-sm font-medium"
            >
              Попробовать снова
            </button>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground mb-4">
              Подключение к админ-панели...
            </p>
            <button
              onClick={handleAuth}
              className="w-full glass-button bg-primary/20 text-primary hover:bg-primary/30 rounded-xl py-3 text-sm font-medium"
            >
              Войти в админ-панель
            </button>
          </div>
        )}

        <button
          onClick={onCancel}
          className="w-full mt-4 glass-button rounded-xl py-2 text-sm font-medium hover:bg-glass-light/40 transition-all opacity-70"
        >
          Отмена
        </button>
      </div>
    </div>
  );
}

