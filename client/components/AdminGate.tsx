import { useEffect, useState } from "react";
import { Shield } from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";

const ADMIN_USERNAME = "mikysauce";

interface AdminGateProps {
  onAuthenticated: (token: string) => void;
}

export default function AdminGate({ onAuthenticated }: AdminGateProps) {
  const { user } = useTelegram();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [authed, setAuthed] = useState(false);

  const isTargetAdmin =
    user?.username?.toLowerCase().replace("@", "") === ADMIN_USERNAME;

  useEffect(() => {
    if (!isTargetAdmin || !user?.id) return;
    // Auto-login by username, no password needed
    handleLogin();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTargetAdmin, user?.id]);

  if (!isTargetAdmin || authed) return null;

  const handleLogin = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user.username || "MikySauce",
          userId: String(user.id),
        }),
      });
      const data = await res.json();
      if (res.ok && data.sessionToken) {
        localStorage.setItem("admin_session", data.sessionToken);
        setAuthed(true);
        onAuthenticated(data.sessionToken);
      } else {
        setError(data.error || "Ошибка доступа");
      }
    } catch {
      setError("Ошибка подключения");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-background/95 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-surface-v2 w-full max-w-sm p-6">
        <div className="flex items-center justify-center mb-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center">
            <Shield className="text-primary" size={28} />
          </div>
        </div>
        <h2 className="text-lg font-bold text-center mb-1">Вход администратора</h2>
        <p className="text-caption text-center mb-5">
          @{user?.username} · проверка доступа…
        </p>
        {loading && (
          <div className="flex justify-center mb-4">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        )}
        {error && (
          <p className="text-xs text-destructive mb-3 text-center">{error}</p>
        )}
        {!loading && error && (
          <button
            type="button"
            onClick={handleLogin}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm"
          >
            Повторить
          </button>
        )}
      </div>
    </div>
  );
}
