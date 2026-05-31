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

  // Normalize tg username
  const tgUsername = user?.username?.toLowerCase().replace("@", "") ?? "";
  const isMiky = tgUsername === ADMIN_USERNAME;

  // Auto-try when both username and userId are available via Telegram
  useEffect(() => {
    if (isMiky && user?.id && !done && !loading) {
      attemptLogin(user.username || ADMIN_USERNAME, String(user.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMiky, user?.id]);

  if (!isMiky || done) return null;

  async function attemptLogin(username: string, userId: string) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, userId }),
      });
      const data = await res.json();
      if (res.ok && data.sessionToken) {
        localStorage.setItem("admin_session", data.sessionToken);
        setDone(true);
        onAuthenticated(data.sessionToken);
      } else {
        setError(data.error || "Доступ запрещён");
        setLoading(false);
      }
    } catch {
      setError("Нет связи с сервером");
      setLoading(false);
    }
  }

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
            @{user?.username} · авторизация…
          </p>
        </div>
        {loading && <div className="flex justify-center py-2"><Loader2 className="animate-spin text-primary" size={28} /></div>}
        {error && (
          <div className="text-xs text-destructive text-center bg-destructive/10 rounded-xl px-3 py-2 flex items-center gap-2">
            <AlertTriangle size={13} className="flex-shrink-0" />
            {error}
          </div>
        )}
        {!loading && (
          <button type="button"
            onClick={() => attemptLogin(user?.username || ADMIN_USERNAME, String(user?.id || "admin"))}
            className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
            style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}>
            <LogIn size={15} /> Повторить вход
          </button>
        )}
      </div>
    </div>
  );
}
