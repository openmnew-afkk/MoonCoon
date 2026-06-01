import { useState, useEffect } from "react";
import {
  BarChart3,
  Users,
  Heart,
  MessageSquare,
  TrendingUp,
  Shield,
  Ban,
  UserCheck,
  Search,
  X,
  Loader2,
  RefreshCw,
  Settings2,
  LogIn,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";
import { cn } from "@/lib/utils";

interface StatCard {
  label: string;
  value: string;
  change: string;
  color: string;
  icon: React.ReactNode;
}

interface AdminUser {
  id: string;
  name: string;
  username: string;
  isAdmin: boolean;
  isBanned: boolean;
  posts: number;
  followers: number;
  createdAt: string;
}

const ADMIN_USERNAME = "mikysauce";

const stats: StatCard[] = [
  { label: "Пользователей", value: "12.5K", change: "+12% неделя", color: "#a855f7", icon: <Users size={20} /> },
  { label: "Активных постов", value: "3.2K", change: "+24% неделя", color: "#CBFF4D", icon: <TrendingUp size={20} /> },
  { label: "Лайков", value: "125K", change: "+18% неделя", color: "#f43f5e", icon: <Heart size={20} /> },
  { label: "Сообщений", value: "45.6K", change: "+31% неделя", color: "#3b82f6", icon: <MessageSquare size={20} /> },
];

/* ─── Auth Screen ─────────────────────────────────────────────────── */
function AdminAuthScreen({ onSuccess }: { onSuccess: (token: string) => void }) {
  const { user } = useTelegram();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [manualMode, setManualMode] = useState(true);
  // Always show manual form — pre-filled with known admin username
  const [manualUsername, setManualUsername] = useState(ADMIN_USERNAME);
  const [manualUserId, setManualUserId] = useState("");

  const tgUsername = user?.username?.toLowerCase().replace("@", "") ?? "";
  const isMiky = tgUsername === ADMIN_USERNAME;

  // Update userId field when Telegram user loads
  useEffect(() => {
    if (user?.id) setManualUserId(String(user.id));
  }, [user?.id]);

  // Auto-try if Telegram user matches
  useEffect(() => {
    if (isMiky && user?.id) {
      attemptLogin(user.username || ADMIN_USERNAME, String(user.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMiky, user?.id]);

  const attemptLogin = async (username: string, userId: string) => {
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
        onSuccess(data.sessionToken);
      } else {
        setError(data.error || "Доступ запрещён");
      }
    } catch {
      setError("Нет связи с сервером");
    } finally {
      setLoading(false);
    }
  };

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualUsername.trim()) return;
    // server only validates username — userId just needs to be non-empty
    attemptLogin(manualUsername.trim(), manualUserId.trim() || String(user?.id || "admin"));
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 pb-28">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div style={{
          position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)",
          width: "60vw", height: "60vw", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(203,255,77,0.06) 0%, transparent 70%)",
          filter: "blur(40px)",
        }} />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Card */}
        <div className="rounded-3xl border border-border p-7 space-y-6"
          style={{ background: "hsl(var(--card))" }}>

          {/* Header */}
          <div className="flex flex-col items-center text-center gap-3">
            <div className="w-18 h-18 w-[72px] h-[72px] rounded-2xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, hsl(var(--primary) / 0.2), hsl(var(--primary) / 0.08))",
                border: "1px solid hsl(var(--primary) / 0.35)",
                boxShadow: "0 0 24px hsl(var(--primary) / 0.15)",
              }}>
              <Shield className="text-primary" size={32} />
            </div>
            <div>
              <h2 className="text-xl font-black">Админ-панель</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {isMiky
                  ? `Обнаружен @${user?.username} · авторизуемся...`
                  : "Проверка прав доступа"}
              </p>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center gap-3 py-2">
              <Loader2 className="animate-spin text-primary" size={32} />
              <p className="text-sm text-muted-foreground">Проверка доступа...</p>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="flex items-start gap-2 rounded-xl px-3 py-2.5 text-xs"
              style={{ background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.25)", color: "#f43f5e" }}>
              <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {!loading && (
            <>
              {/* Auto-retry button if we have a Telegram user */}
              {isMiky && user?.id && (
                <button type="button" onClick={() => attemptLogin(user.username || ADMIN_USERNAME, String(user.id))}
                  className="w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
                  style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))", boxShadow: "0 4px 16px hsl(var(--primary) / 0.35)" }}>
                  <LogIn size={16} />
                  Войти через Telegram
                </button>
              )}

              {/* Manual login toggle */}
              <button type="button" onClick={() => setManualMode(m => !m)}
                className="w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30">
                <KeyRound size={14} />
                {manualMode ? "Скрыть ручной вход" : "Войти вручную"}
              </button>

              {manualMode && (
                <form onSubmit={handleManualLogin} className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                      Username (без @)
                    </label>
                    <input
                      type="text"
                      value={manualUsername}
                      onChange={e => setManualUsername(e.target.value)}
                      placeholder="mikysauce"
                      className="w-full rounded-xl px-4 py-2.5 text-sm outline-none border border-border bg-background focus:border-primary/60 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                      Telegram User ID
                    </label>
                    <input
                      type="text"
                      value={manualUserId}
                      onChange={e => setManualUserId(e.target.value)}
                      placeholder="123456789"
                      className="w-full rounded-xl px-4 py-2.5 text-sm outline-none border border-border bg-background focus:border-primary/60 transition-colors"
                    />
                    {user?.id && (
                      <button type="button" onClick={() => setManualUserId(String(user.id))}
                        className="text-[11px] text-primary mt-1.5 underline underline-offset-2">
                        Вставить мой ID: {user.id}
                      </button>
                    )}
                  </div>
                  <button type="submit"
                    disabled={!manualUsername.trim()}
                    className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-40 transition-all active:scale-95"
                    style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}>
                    <LogIn size={15} />
                    Войти
                  </button>
                </form>
              )}
            </>
          )}
        </div>

        <p className="text-center text-[11px] text-muted-foreground mt-4">
          Доступ только для авторизованных администраторов
        </p>
      </div>
    </div>
  );
}

/* ─── Admin Panel ─────────────────────────────────────────────────── */
export default function Admin() {
  const { user } = useTelegram();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [banReason, setBanReason] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [tab, setTab] = useState<"settings" | "users">("settings");
  const [settings, setSettings] = useState({
    premiumPriceRub: 250,
    premiumPriceStars: 2500,
    premiumPaymentMethods: "both" as "stars" | "card" | "both",
  });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [savedBadge, setSavedBadge] = useState(false);

  const checkSession = async () => {
    const token = localStorage.getItem("admin_session");
    if (!token) { setAuthChecked(true); return; }
    try {
      const res = await fetch("/api/admin/check", { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        if (data.isAdmin) {
          setIsAdmin(true);
          loadUsers(token);
          loadSettings(token);
        }
      }
    } catch { /* ignore */ } finally {
      setAuthChecked(true);
    }
  };

  useEffect(() => { checkSession(); }, [user]);

  const handleAuthSuccess = (token: string) => {
    setIsAdmin(true);
    loadUsers(token);
    loadSettings(token);
  };

  const loadSettings = async (token: string) => {
    try {
      const res = await fetch("/api/admin/settings", { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const data = await res.json(); setSettings(data.settings); }
    } catch { /* ignore */ }
  };

  const saveSettings = async () => {
    const token = localStorage.getItem("admin_session");
    if (!token) return;
    setSettingsSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
        setSavedBadge(true);
        setTimeout(() => setSavedBadge(false), 2000);
      }
    } finally { setSettingsSaving(false); }
  };

  const loadUsers = async (token?: string) => {
    const t = token || localStorage.getItem("admin_session");
    if (!t) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", { headers: { Authorization: `Bearer ${t}` } });
      if (res.ok) { const data = await res.json(); setUsers(data.users || []); }
    } finally { setLoading(false); }
  };

  const handleSetAdmin = async (userId: string, makeAdmin: boolean) => {
    const t = localStorage.getItem("admin_session");
    if (!t) return;
    await fetch("/api/admin/set-admin", {
      method: "POST",
      headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" },
      body: JSON.stringify({ userId, isAdmin: makeAdmin }),
    });
    await loadUsers();
    setSelectedUser(null);
  };

  const handleBanUser = async (userId: string, isBanned: boolean) => {
    const t = localStorage.getItem("admin_session");
    if (!t) return;
    await fetch("/api/admin/ban-user", {
      method: "POST",
      headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" },
      body: JSON.stringify({ userId, isBanned, reason: banReason }),
    });
    await loadUsers();
    setSelectedUser(null);
    setBanReason("");
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.id.includes(searchQuery)
  );

  // Not yet checked
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  // Not authenticated — show auth screen
  if (!isAdmin) {
    return <AdminAuthScreen onSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-border/40"
        style={{ background: "hsl(var(--background) / 0.95)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", paddingTop: "env(safe-area-inset-top)" }}>
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black flex items-center gap-2">
              <BarChart3 className="text-primary" size={22} />
              Админ-панель
            </h1>
            <p className="text-xs text-muted-foreground">@{user?.username ?? "admin"}</p>
          </div>
          <button onClick={() => { localStorage.removeItem("admin_session"); setIsAdmin(false); setAuthChecked(true); }}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg border border-border">
            Выйти
          </button>
        </div>

        {/* Tabs */}
        <div className="max-w-2xl mx-auto px-4 pb-3 flex gap-2">
          {[
            { key: "settings", label: "⚙️ Настройки" },
            { key: "users", label: "👥 Пользователи" },
          ].map(t => (
            <button key={t.key} type="button" onClick={() => setTab(t.key as any)}
              className={cn("flex-1 py-2 rounded-xl text-sm font-semibold transition-all",
                tab === t.key
                  ? "text-primary-foreground"
                  : "text-muted-foreground bg-card border border-border"
              )}
              style={tab === t.key ? { background: "hsl(var(--primary))" } : {}}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, i) => (
            <div key={i} className="rounded-2xl border border-border p-4"
              style={{ background: "hsl(var(--card))" }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: `${stat.color}18`, color: stat.color }}>
                  {stat.icon}
                </div>
              </div>
              <p className="text-2xl font-black tabular-nums">{stat.value}</p>
              <p className="text-[11px] font-semibold mt-0.5" style={{ color: stat.color }}>{stat.change}</p>
            </div>
          ))}
        </div>

        {/* Settings tab */}
        {tab === "settings" && (
          <div className="rounded-2xl border border-border p-5 space-y-5"
            style={{ background: "hsl(var(--card))" }}>
            <div className="flex items-center gap-2">
              <Settings2 size={18} className="text-primary" />
              <h3 className="font-bold">Premium и оплата</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                  Цена Premium (₽/мес)
                </label>
                <input type="number" value={settings.premiumPriceRub}
                  onChange={e => setSettings(s => ({ ...s, premiumPriceRub: Number(e.target.value) }))}
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none border border-border bg-background focus:border-primary/60 transition-colors" />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                  Цена в звёздах (⭐/мес)
                </label>
                <input type="number" value={settings.premiumPriceStars}
                  onChange={e => setSettings(s => ({ ...s, premiumPriceStars: Number(e.target.value) }))}
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none border border-border bg-background focus:border-primary/60 transition-colors" />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                  Способы оплаты
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {([["both", "Карта + ⭐"], ["card", "Только карта"], ["stars", "Только ⭐"]] as const).map(([id, label]) => (
                    <button key={id} type="button"
                      onClick={() => setSettings(s => ({ ...s, premiumPaymentMethods: id }))}
                      className={cn("py-2 px-2 rounded-xl text-xs font-semibold border transition-all",
                        settings.premiumPaymentMethods === id
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-border text-muted-foreground")}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <button type="button" onClick={saveSettings} disabled={settingsSaving}
                className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-95"
                style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}>
                {savedBadge ? <><CheckCircle2 size={16} /> Сохранено!</> : settingsSaving ? <><Loader2 size={16} className="animate-spin" /> Сохранение…</> : "Сохранить настройки"}
              </button>
            </div>
          </div>
        )}

        {/* Users tab */}
        {tab === "users" && (
          <div className="rounded-2xl border border-border overflow-hidden"
            style={{ background: "hsl(var(--card))" }}>
            {/* Search */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
                  <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Поиск пользователей..."
                    className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none border border-border bg-background focus:border-primary/60 transition-colors" />
                </div>
                <button onClick={() => loadUsers()} className="w-10 h-10 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                  <RefreshCw size={15} />
                </button>
              </div>
            </div>

            {/* List */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-primary" size={28} />
              </div>
            ) : filteredUsers.length === 0 ? (
              <p className="text-center py-10 text-muted-foreground text-sm">Пользователи не найдены</p>
            ) : (
              <div className="divide-y divide-border">
                {filteredUsers.map(u => (
                  <div key={u.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
                      style={{ background: "hsl(var(--primary) / 0.15)", color: "hsl(var(--primary))" }}>
                      {u.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-sm truncate">{u.name}</p>
                        {u.isAdmin && <Shield className="text-primary flex-shrink-0" size={12} />}
                        {u.isBanned && <Ban className="text-destructive flex-shrink-0" size={12} />}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{u.username}</p>
                    </div>
                    <div className="text-[11px] text-muted-foreground text-right mr-2">
                      <p>{u.posts} постов</p>
                      <p>{u.followers} подп.</p>
                    </div>
                    <button onClick={() => setSelectedUser(u)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-border font-medium hover:bg-muted transition-colors flex-shrink-0">
                      Изменить
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* User modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedUser(null)}>
          <div className="w-full max-w-sm rounded-3xl border border-border p-5 space-y-4"
            style={{ background: "hsl(var(--card))" }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base">Управление</h3>
              <button onClick={() => { setSelectedUser(null); setBanReason(""); }}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                style={{ background: "hsl(var(--primary) / 0.15)", color: "hsl(var(--primary))" }}>
                {selectedUser.name[0]}
              </div>
              <div>
                <p className="font-semibold text-sm">{selectedUser.name}</p>
                <p className="text-xs text-muted-foreground">{selectedUser.username}</p>
              </div>
              <div className="flex gap-1 ml-auto">
                {selectedUser.isAdmin && <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-semibold">Админ</span>}
                {selectedUser.isBanned && <span className="text-[10px] px-2 py-0.5 rounded-full bg-destructive/15 text-destructive font-semibold">Забанен</span>}
              </div>
            </div>

            <div className="space-y-2">
              <button onClick={() => handleSetAdmin(selectedUser.id, !selectedUser.isAdmin)}
                className={cn("w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 border",
                  selectedUser.isAdmin
                    ? "border-destructive/30 bg-destructive/10 text-destructive"
                    : "border-primary/30 bg-primary/10 text-primary")}>
                {selectedUser.isAdmin ? <><Shield size={16} /> Отозвать права Admin</> : <><UserCheck size={16} /> Выдать права Admin</>}
              </button>

              {selectedUser.isBanned ? (
                <button onClick={() => handleBanUser(selectedUser.id, false)}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 transition-all active:scale-95">
                  <UserCheck size={16} /> Разбанить
                </button>
              ) : (
                <div className="space-y-2">
                  <input type="text" value={banReason} onChange={e => setBanReason(e.target.value)}
                    placeholder="Причина бана (необязательно)"
                    className="w-full rounded-xl px-4 py-2.5 text-sm outline-none border border-border bg-background focus:border-destructive/50 transition-colors" />
                  <button onClick={() => handleBanUser(selectedUser.id, true)}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 border border-destructive/30 bg-destructive/10 text-destructive transition-all active:scale-95">
                    <Ban size={16} /> Забанить
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
