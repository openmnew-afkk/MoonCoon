import { useEffect, useState } from "react";
import { Shield, Lock } from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";

const ADMIN_USERNAME = "mikysauce";

interface AdminGateProps {
  onAuthenticated: (token: string) => void;
}

export default function AdminGate({ onAuthenticated }: AdminGateProps) {
  const { user } = useTelegram();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [authed, setAuthed] = useState(false);

  const isTargetAdmin =
    user?.username?.toLowerCase().replace("@", "") === ADMIN_USERNAME;

  useEffect(() => {
    if (!isTargetAdmin || !user?.id) return;
    const token = localStorage.getItem("admin_session");
    if (!token) return;
    fetch("/api/admin/check", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.isAdmin) {
          setAuthed(true);
          onAuthenticated(token);
        }
      })
      .catch(() => {});
  }, [isTargetAdmin, user?.id, onAuthenticated]);

  if (!isTargetAdmin || authed) return null;

  const handleLogin = async () => {
    if (!user?.id || !password.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user.username || "MikySauce",
          password,
          userId: String(user.id),
        }),
      });
      const data = await res.json();
      if (res.ok && data.sessionToken) {
        localStorage.setItem("admin_session", data.sessionToken);
        setAuthed(true);
        onAuthenticated(data.sessionToken);
        setPassword("");
      } else {
        setError(data.error || "Неверный пароль");
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
          @{user?.username} · введите пароль
        </p>
        <div className="relative mb-3">
          <Lock
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="Пароль"
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-input border border-border text-sm outline-none focus:ring-2 focus:ring-primary/40"
            autoComplete="current-password"
          />
        </div>
        {error && (
          <p className="text-xs text-destructive mb-3 text-center">{error}</p>
        )}
        <button
          type="button"
          onClick={handleLogin}
          disabled={loading || !password.trim()}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-50"
        >
          {loading ? "Проверка…" : "Войти"}
        </button>
      </div>
    </div>
  );
}
