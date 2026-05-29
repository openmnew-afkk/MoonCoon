import { useEffect, useState } from "react";
import { Shield, Loader2, RefreshCw, KeyRound, CheckCircle2 } from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";

const ADMIN_USERNAME = "mikysauce";

interface AdminGateProps {
  onAuthenticated: (token: string) => void;
}

export default function AdminGate({ onAuthenticated }: AdminGateProps) {
  const { user } = useTelegram();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // Normalize: strip @ and lowercase
  const tgUsername = user?.username?.toLowerCase().replace("@", "") ?? "";
  const isTargetAdmin = tgUsername === ADMIN_USERNAME;

  // Auto-attempt when Telegram user matches
  useEffect(() => {
    if (isTargetAdmin && user?.id && !done) {
      handleLogin();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTargetAdmin, user?.id]);

  // Don't render if not the target admin or already done
  if (!isTargetAdmin || done) return null;

  const handleLogin = async () => {
    if (!user?.id) {
      setError("userId недоступен. Откройте через Telegram.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user.username || ADMIN_USERNAME,
          userId: String(user.id),
        }),
      });
      const data = await res.json();
      if (res.ok && data.sessionToken) {
        localStorage.setItem("admin_session", data.sessionToken);
        setDone(true);
        onAuthenticated(data.sessionToken);
      } else {
        setError(data.error || "Ошибка доступа");
      }
    } catch {
      setError("Нет связи с сервером");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-background/95 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl border border-border p-6 space-y-4"
        style={{ background: "hsl(var(--card))" }}>

        {/* Icon */}
        <div className="flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "hsl(var(--primary) / 0.15)", border: "1px solid hsl(var(--primary) / 0.3)" }}>
            <Shield className="text-primary" size={30} />
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-lg font-bold">Вход администратора</h2>
          <p className="text-sm text-muted-foreground mt-1">
            @{user?.username ?? ADMIN_USERNAME} · проверка доступа...
          </p>
        </div>

        {loading && (
          <div className="flex justify-center py-2">
            <Loader2 className="animate-spin text-primary" size={28} />
          </div>
        )}

        {error && (
          <div className="text-xs text-destructive text-center bg-destructive/10 rounded-xl px-3 py-2">
            {error}
          </div>
        )}

        {!loading && (error || !user?.id) && (
          <button type="button" onClick={handleLogin}
            className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
            style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}>
            <RefreshCw size={15} />
            Повторить попытку
          </button>
        )}
      </div>
    </div>
  );
}
