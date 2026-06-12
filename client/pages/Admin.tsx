import { useState, useEffect } from "react";
import {
  BarChart3, Users, Heart, MessageSquare, TrendingUp, Shield, Ban, UserCheck,
  Search, X, Loader2, RefreshCw, Settings2, LogIn, CheckCircle2, AlertTriangle,
} from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";
import { cn } from "@/lib/utils";

interface StatCard { label: string; value: string; change: string; color: string; icon: React.ReactNode; }
interface AdminUser { id: string; name: string; username: string; isAdmin: boolean; isBanned: boolean; posts: number; followers: number; createdAt: string; }

const ADMIN_USERNAME = "mikysauce";

const stats: StatCard[] = [
  { label: "Пользователей", value: "12.5K", change: "+12% неделя", color: "#60a5fa", icon: <Users size={20} /> },
  { label: "Активных постов", value: "3.2K", change: "+24% неделя", color: "#a78bfa", icon: <TrendingUp size={20} /> },
  { label: "Лайков", value: "125K", change: "+18% неделя", color: "#f43f5e", icon: <Heart size={20} /> },
  { label: "Сообщений", value: "45.6K", change: "+31% неделя", color: "#06b6d4", icon: <MessageSquare size={20} /> },
];

function AdminAuthScreen({ onSuccess }: { onSuccess: (token: string) => void }) {
  const { user } = useTelegram();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: ADMIN_USERNAME, password, userId: String(user?.id || "admin") }),
      });
      const data = await res.json();
      if (res.ok && data.sessionToken) { localStorage.setItem("admin_session", data.sessionToken); onSuccess(data.sessionToken); }
      else setError(data.error || "Неверный пароль");
    } catch { setError("Нет связи с сервером"); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 pb-28">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div style={{ position: "absolute", top: "15%", left: "50%", transform: "translateX(-50%)", width: "70vw", height: "70vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)", filter: "blur(50px)" }} />
        <div style={{ position: "absolute", bottom: "10%", right: "10%", width: "40vw", height: "40vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)", filter: "blur(40px)" }} />
      </div>
      <div className="relative z-10 w-full max-w-sm">
        <form onSubmit={handleLogin}>
          <div className="rounded-3xl p-7 space-y-5" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border) / 0.5)", boxShadow: "0 24px 80px rgba(0,0,0,0.25)" }}>
            <div className="flex flex-col items-center text-center gap-3 pb-1">
              <div className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center relative"
                style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.06))", border: "1px solid rgba(59,130,246,0.2)", boxShadow: "0 0 32px rgba(59,130,246,0.15)" }}>
                <Shield className="text-primary" size={32} />
                <div style={{ position: "absolute", inset: -3, borderRadius: "18px", background: "conic-gradient(from 0deg, rgba(59,130,246,0.4), transparent, rgba(59,130,246,0.4))", animation: "adel-ring-spin 4s linear infinite", zIndex: -1 }} />
              </div>
              <div>
                <h2 className="text-xl font-black">Админ-панель</h2>
                <p className="text-sm text-muted-foreground mt-0.5">{user?.username ? `@${user.username} · введите пароль` : "Введите пароль для входа"}</p>
              </div>
            </div>
            {error && (
              <div className="flex items-start gap-2 rounded-xl px-3 py-2.5 text-xs"
                style={{ background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)", color: "#f43f5e" }}>
                <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" /><span>{error}</span>
              </div>
            )}
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-3">
                <Loader2 className="animate-spin text-primary" size={22} /><span className="text-sm text-muted-foreground">Проверка...</span>
              </div>
            ) : (
              <>
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Аккаунт</label>
                  <div className="w-full rounded-xl px-4 py-2.5 text-sm flex items-center gap-2"
                    style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border) / 0.3)" }}>
                    <Shield size={13} className="text-primary/60 flex-shrink-0" /><span className="font-medium">{ADMIN_USERNAME}</span>
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Пароль</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Введите пароль" autoFocus autoComplete="current-password"
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                    style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border) / 0.5)" }} />
                </div>
                <button type="submit" disabled={!password.trim()}
                  className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-40 transition-all active:scale-95"
                  style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", color: "white", boxShadow: "0 6px 20px rgba(59,130,246,0.35)" }}>
                  <LogIn size={16} /> Войти в панель
                </button>
              </>
            )}
          </div>
        </form>
        <p className="text-center text-[11px] text-muted-foreground mt-4">Сессия действует 12 часов · только для @{ADMIN_USERNAME}</p>
      </div>
    </div>
  );
}

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
  const [settings, setSettings] = useState({ premiumPriceRub: 250, premiumPriceStars: 2500, premiumPaymentMethods: "both" as "stars" | "card" | "both" });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [savedBadge, setSavedBadge] = useState(false);

  const checkSession = async () => {
    const token = localStorage.getItem("admin_session");
    if (!token) { setAuthChecked(true); return; }
    try {
      const res = await fetch("/api/admin/check", { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const data = await res.json(); if (data.isAdmin) { setIsAdmin(true); loadUsers(token); loadSettings(token); } }
    } catch {} finally { setAuthChecked(true); }
  };

  useEffect(() => { checkSession(); }, [user]);

  const handleAuthSuccess = (token: string) => { setIsAdmin(true); loadUsers(token); loadSettings(token); };

  const loadSettings = async (token: string) => {
    try { const res = await fetch("/api/admin/settings", { headers: { Authorization: `Bearer ${token}` } }); if (res.ok) { const data = await res.json(); setSettings(data.settings); } } catch {}
  };

  const saveSettings = async () => {
    const token = localStorage.getItem("admin_session");
    if (!token) return; setSettingsSaving(true);
    try {
      const res = await fetch("/api/admin/settings", { method: "PUT", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(settings) });
      if (res.ok) { const data = await res.json(); setSettings(data.settings); setSavedBadge(true); setTimeout(() => setSavedBadge(false), 2000); }
    } finally { setSettingsSaving(false); }
  };

  const loadUsers = async (token?: string) => {
    const t = token || localStorage.getItem("admin_session");
    if (!t) return; setLoading(true);
    try { const res = await fetch("/api/admin/users", { headers: { Authorization: `Bearer ${t}` } }); if (res.ok) { const data = await res.json(); setUsers(data.users || []); } } finally { setLoading(false); }
  };

  const handleSetAdmin = async (userId: string, makeAdmin: boolean) => {
    const t = localStorage.getItem("admin_session"); if (!t) return;
    await fetch("/api/admin/set-admin", { method: "POST", headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" }, body: JSON.stringify({ userId, isAdmin: makeAdmin }) });
    await loadUsers(); setSelectedUser(null);
  };

  const handleBanUser = async (userId: string, isBanned: boolean) => {
    const t = localStorage.getItem("admin_session"); if (!t) return;
    await fetch("/api/admin/ban-user", { method: "POST", headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" }, body: JSON.stringify({ userId, isBanned, reason: banReason }) });
    await loadUsers(); setSelectedUser(null); setBanReason("");
  };

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.username.toLowerCase().includes(searchQuery.toLowerCase()) || u.id.includes(searchQuery));

  if (!authChecked) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  if (!isAdmin) return <AdminAuthScreen onSuccess={handleAuthSuccess} />;

  const cardStyle = { background: "hsl(var(--card))", border: "1px solid hsl(var(--border) / 0.5)", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" };

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="sticky top-0 z-30 border-b border-border/30"
        style={{ background: "hsl(var(--background) / 0.92)", backdropFilter: "blur(32px)", paddingTop: "env(safe-area-inset-top)" }}>
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black flex items-center gap-2">
              <BarChart3 className="text-primary" size={22} /> Админ-панель
            </h1>
            <p className="text-xs text-muted-foreground">@{user?.username ?? "admin"}</p>
          </div>
          <button onClick={() => { localStorage.removeItem("admin_session"); setIsAdmin(false); setAuthChecked(true); }}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg"
            style={{ border: "1px solid hsl(var(--border) / 0.5)" }}>Выйти</button>
        </div>
        <div className="max-w-2xl mx-auto px-4 pb-3 flex gap-2">
          {[{ key: "settings", label: "Настройки" }, { key: "users", label: "Пользователи" }].map(t => (
            <button key={t.key} type="button" onClick={() => setTab(t.key as any)}
              className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
              style={tab === t.key ? { background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", color: "white", boxShadow: "0 2px 12px rgba(59,130,246,0.3)" } : { ...cardStyle }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, i) => (
            <div key={i} className="rounded-2xl p-4" style={cardStyle}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${stat.color}15`, color: stat.color }}>{stat.icon}</div>
              </div>
              <p className="text-2xl font-black tabular-nums">{stat.value}</p>
              <p className="text-[11px] font-semibold mt-0.5" style={{ color: stat.color }}>{stat.change}</p>
            </div>
          ))}
        </div>

        {tab === "settings" && (
          <div className="rounded-2xl p-5 space-y-5" style={cardStyle}>
            <div className="flex items-center gap-2"><Settings2 size={18} className="text-primary" /><h3 className="font-bold">Premium и оплата</h3></div>
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Цена Premium (₽/мес)</label>
                <input type="number" value={settings.premiumPriceRub} onChange={e => setSettings(s => ({ ...s, premiumPriceRub: Number(e.target.value) }))}
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all" style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border) / 0.5)" }} />
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Цена в звёздах (⭐/мес)</label>
                <input type="number" value={settings.premiumPriceStars} onChange={e => setSettings(s => ({ ...s, premiumPriceStars: Number(e.target.value) }))}
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all" style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border) / 0.5)" }} />
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Способы оплаты</label>
                <div className="grid grid-cols-3 gap-2">
                  {([["both", "Карта + ⭐"], ["card", "Только карта"], ["stars", "Только ⭐"]] as const).map(([id, label]) => (
                    <button key={id} type="button" onClick={() => setSettings(s => ({ ...s, premiumPaymentMethods: id }))}
                      className="py-2 px-2 rounded-xl text-xs font-semibold border transition-all"
                      style={{
                        borderColor: settings.premiumPaymentMethods === id ? "rgba(59,130,246,0.3)" : "hsl(var(--border) / 0.5)",
                        background: settings.premiumPaymentMethods === id ? "rgba(59,130,246,0.1)" : "hsl(var(--card))",
                        color: settings.premiumPaymentMethods === id ? "#60a5fa" : "hsl(var(--muted-foreground))",
                      }}>{label}</button>
                  ))}
                </div>
              </div>
              <button type="button" onClick={saveSettings} disabled={settingsSaving}
                className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-95"
                style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", color: "white" }}>
                {savedBadge ? <><CheckCircle2 size={16} /> Сохранено!</> : settingsSaving ? <><Loader2 size={16} className="animate-spin" /> Сохранение…</> : "Сохранить настройки"}
              </button>
            </div>
          </div>
        )}

        {tab === "users" && (
          <div className="rounded-2xl overflow-hidden" style={cardStyle}>
            <div className="p-4 border-b border-border/30">
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
                  <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Поиск пользователей..."
                    className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none transition-all" style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border) / 0.5)" }} />
                </div>
                <button onClick={() => loadUsers()} className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  style={{ border: "1px solid hsl(var(--border) / 0.5)" }}><RefreshCw size={15} /></button>
              </div>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin text-primary" size={28} /></div>
            ) : filteredUsers.length === 0 ? (
              <p className="text-center py-10 text-muted-foreground text-sm">Пользователи не найдены</p>
            ) : (
              <div className="divide-y divide-border/30">
                {filteredUsers.map(u => (
                  <div key={u.id} className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/30 transition-colors">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
                      style={{ background: "rgba(59,130,246,0.1)", color: "#60a5fa" }}>{u.name[0]}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-sm truncate">{u.name}</p>
                        {u.isAdmin && <Shield className="text-primary flex-shrink-0" size={12} />}
                        {u.isBanned && <Ban className="text-destructive flex-shrink-0" size={12} />}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{u.username}</p>
                    </div>
                    <div className="text-[11px] text-muted-foreground text-right mr-2">
                      <p>{u.posts} постов</p><p>{u.followers} подп.</p>
                    </div>
                    <button onClick={() => setSelectedUser(u)}
                      className="text-xs px-3 py-1.5 rounded-lg font-medium hover:bg-secondary transition-colors flex-shrink-0"
                      style={{ border: "1px solid hsl(var(--border) / 0.5)" }}>Изменить</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedUser(null)}>
          <div className="w-full max-w-sm rounded-3xl p-5 space-y-4" style={cardStyle} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base">Управление</h3>
              <button onClick={() => { setSelectedUser(null); setBanReason(""); }} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"><X size={16} /></button>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "hsl(var(--secondary))" }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: "rgba(59,130,246,0.1)", color: "#60a5fa" }}>{selectedUser.name[0]}</div>
              <div className="flex-1"><p className="font-semibold text-sm">{selectedUser.name}</p><p className="text-xs text-muted-foreground">{selectedUser.username}</p></div>
              <div className="flex gap-1 ml-auto">
                {selectedUser.isAdmin && <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: "rgba(59,130,246,0.1)", color: "#60a5fa" }}>Админ</span>}
                {selectedUser.isBanned && <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: "rgba(244,63,94,0.1)", color: "#f43f5e" }}>Забанен</span>}
              </div>
            </div>
            <div className="space-y-2">
              <button onClick={() => handleSetAdmin(selectedUser.id, !selectedUser.isAdmin)}
                className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 border"
                style={{ borderColor: selectedUser.isAdmin ? "rgba(244,63,94,0.3)" : "rgba(59,130,246,0.3)", background: selectedUser.isAdmin ? "rgba(244,63,94,0.08)" : "rgba(59,130,246,0.08)", color: selectedUser.isAdmin ? "#f43f5e" : "#60a5fa" }}>
                {selectedUser.isAdmin ? <><Shield size={16} /> Отозвать права Admin</> : <><UserCheck size={16} /> Выдать права Admin</>}
              </button>
              {selectedUser.isBanned ? (
                <button onClick={() => handleBanUser(selectedUser.id, false)}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 border transition-all active:scale-95"
                  style={{ borderColor: "rgba(34,197,94,0.3)", background: "rgba(34,197,94,0.08)", color: "#22c55e" }}>
                  <UserCheck size={16} /> Разбанить
                </button>
              ) : (
                <div className="space-y-2">
                  <input type="text" value={banReason} onChange={e => setBanReason(e.target.value)} placeholder="Причина бана (необязательно)"
                    className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all" style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border) / 0.5)" }} />
                  <button onClick={() => handleBanUser(selectedUser.id, true)}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 border transition-all active:scale-95"
                    style={{ borderColor: "rgba(244,63,94,0.3)", background: "rgba(244,63,94,0.08)", color: "#f43f5e" }}>
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
