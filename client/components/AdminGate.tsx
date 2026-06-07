import { useEffect, useState } from "react";
import { Shield, Loader2, LogIn, KeyRound, AlertTriangle } from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";

const ADMIN_USERNAME = "mikysauce";

interface AdminGateProps {
  onAuthenticated: (token: string) => void;
}

export default function AdminGate({ onAuthenticated }: AdminGateProps) {
  const { user } = useTelegram();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [needsPassword, setNeedsPassword] = useState(false);
  const [password, setPassword] = useState("");

  const tgUsername = user?.username?.toLowerCase().replace("@", "") ?? "";
  const isMiky = tgUsername === ADMIN_USERNAME;

  // Auto-try login when telegram username matches
  useEffect(() => {
    if (isMiky && user?.id && !done && !loading && !needsPassword) {
      attemptLogin(user.username || ADMIN_USERNAME, String(user.id));
    }
  }, [isMiky, user?.id]);

  if (!isMiky || done) return null;

  async function attemptLogin(username: string, userId: string, pwd?: string) {
    setLoading(true);
    setError("");
    try {
      const body: Record<string, string> = { username, userId };
      if (pwd) body.password = pwd;

      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (data.requiresPassword) {
        // Server says password is needed
        setNeedsPassword(true);
        setLoading(false);
        return;
      }

      if (res.ok && data.sessionToken) {
        localStorage.setItem("admin_session", data.sessionToken);
        setDone(true);
        onAuthenticated(data.sessionToken);
      } else {
        setError(data.error || "Доступ запрещён");
        setLoading(false);
      }
    } catch {
      // Server unavailable — skip silently, don't block the app
      setDone(true);
    }
  }

  // If password is required, show password form
  if (needsPassword) {
    return (
      <div className="fixed inset-0 z-[200] bg-background/95 backdrop-blur-md flex items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-2xl border border-border p-6 space-y-4"
          style={{ background: "hsl(var(--card))" }}>
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "hsl(var(--primary) / 0.15)", border: "1px solid hsl(var(--primary) / 0.3)" }}>
              <Shield className="text-primary" size={30} />
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-lg font-bold">Вход администратора</h2>
            <p className="text-sm text-muted-foreground mt-1">
              @{user?.username} · введите пароль
            </p>
          </div>
          {error && (
            <div className="text-xs text-destructive text-center bg-destructive/10 rounded-xl px-3 py-2 flex items-center gap-2">
              <AlertTriangle size={13} className="flex-shrink-0" />
              {error}
            </div>
          )}
          <form onSubmit={(e) => {
            e.preventDefault();
            if (password.trim()) {
              attemptLogin(user?.username || ADMIN_USERNAME, String(user?.id || "admin"), password);
            }
          }}>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Введите пароль"
              autoFocus
              autoComplete="current-password"
              className="w-full rounded-xl px-4 py-3 text-sm outline-none border border-border bg-background focus:border-primary/60 transition-colors mb-3"
            />
            <button type="submit"
              disabled={!password.trim() || loading}
              className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-40 transition-all active:scale-95"
              style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}>
              {loading ? <Loader2 size={15} className="animate-spin" /> : <LogIn size={15} />}
              {loading ? "Проверка..." : "Войти"}
            </button>
          </form>
          <button onClick={() => { setDone(true); }} className="w-full text-xs text-muted-foreground text-center py-1">
            Пропустить
          </button>
        </div>
      </div>
    );
  }

  // Loading state (auto-login in progress)
  if (loading) return null; // Don't show anything during auto-login

  return null;
}
