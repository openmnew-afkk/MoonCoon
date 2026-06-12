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
  Settings2,
  LogIn,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";

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
  { label: "Пользователей", value: "12.5K", change: "+12% неделя", color: "var(--blue)", icon: <Users size={20} /> },
  { label: "Активных постов", value: "3.2K", change: "+24% неделя", color: "var(--purple)", icon: <TrendingUp size={20} /> },
  { label: "Лайков", value: "125K", change: "+18% неделя", color: "var(--pink)", icon: <Heart size={20} /> },
  { label: "Сообщений", value: "45.6K", change: "+31% неделя", color: "var(--green)", icon: <MessageSquare size={20} /> },
];

function AdminAuthScreen({ onSuccess }: { onSuccess: (token: string) => void }) {
  const { user } = useTelegram();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: ADMIN_USERNAME,
          password,
          userId: String(user?.id || "admin"),
        }),
      });
      const data = await res.json();
      if (res.ok && data.sessionToken) {
        localStorage.setItem("admin_session", data.sessionToken);
        onSuccess(data.sessionToken);
      } else {
        setError(data.error || "Неверный пароль");
      }
    } catch {
      setError("Нет связи с сервером");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 pb-28" style={{ background: "var(--bg)" }}>
      <div className="relative z-10 w-full max-w-sm">
        <form onSubmit={handleLogin}>
          <div className="ios-card space-y-5" style={{ padding: "1.75rem" }}>
            <div className="flex flex-col items-center text-center gap-3 pb-1">
              <div
                className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center"
                style={{ background: "var(--bg-tertiary)" }}
              >
                <Shield size={32} style={{ color: "var(--blue)" }} />
              </div>
              <div>
                <h2 className="ios-title-large">Админ-панель</h2>
                <p className="ios-subhead">
                  {user?.username ? `@${user.username} · введите пароль` : "Введите пароль для входа"}
                </p>
              </div>
            </div>
            {error && (
              <div
                className="flex items-start gap-2 rounded-xl px-3 py-2.5 ios-caption"
                style={{ background: "rgba(255,69,58,0.08)", color: "var(--red)" }}
              >
                <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-3">
                <Loader2 className="animate-spin" size={22} style={{ color: "var(--text-secondary)" }} />
                <span className="ios-body" style={{ color: "var(--text-secondary)" }}>
                  Проверка...
                </span>
              </div>
            ) : (
              <>
                <div>
                  <label className="ios-caption block mb-1.5">Аккаунт</label>
                  <div className="ios-input flex items-center gap-2">
                    <Shield size={13} style={{ color: "var(--text-tertiary)" }} className="flex-shrink-0" />
                    <span className="font-medium">{ADMIN_USERNAME}</span>
                  </div>
                </div>
                <div>
                  <label className="ios-caption block mb-1.5">Пароль</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Введите пароль"
                    autoFocus
                    autoComplete="current-password"
                    className="ios-input"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!password.trim()}
                  className="ios-btn w-full disabled:opacity-40"
                >
                  <LogIn size={16} /> Войти в панель
                </button>
              </>
            )}
          </div>
        </form>
        <p className="text-center ios-caption mt-4">
          Сессия действует 12 часов · только для @{ADMIN_USERNAME}
        </p>
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
  const [settings, setSettings] = useState({
    premiumPriceRub: 250,
    premiumPriceStars: 2500,
    premiumPaymentMethods: "both" as "stars" | "card" | "both",
  });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [savedBadge, setSavedBadge] = useState(false);

  const checkSession = async () => {
    const token = localStorage.getItem("admin_session");
    if (!token) {
      setAuthChecked(true);
      return;
    }
    try {
      const res = await fetch("/api/admin/check", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.isAdmin) {
          setIsAdmin(true);
          loadUsers(token);
          loadSettings(token);
        }
      }
    } catch {
    } finally {
      setAuthChecked(true);
    }
  };

  useEffect(() => {
    checkSession();
  }, [user]);

  const handleAuthSuccess = (token: string) => {
    setIsAdmin(true);
    loadUsers(token);
    loadSettings(token);
  };

  const loadSettings = async (token: string) => {
    try {
      const res = await fetch("/api/admin/settings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
      }
    } catch {}
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
    } finally {
      setSettingsSaving(false);
    }
  };

  const loadUsers = async (token?: string) => {
    const t = token || localStorage.getItem("admin_session");
    if (!t) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } finally {
      setLoading(false);
    }
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

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.id.includes(searchQuery),
  );

  if (!authChecked)
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <Loader2 className="animate-spin" size={32} style={{ color: "var(--text-tertiary)" }} />
      </div>
    );
  if (!isAdmin) return <AdminAuthScreen onSuccess={handleAuthSuccess} />;

  return (
    <div className="min-h-screen pb-28" style={{ background: "var(--bg)" }}>
      <div className="sticky top-0 z-30 ios-blur" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="ios-title-large flex items-center gap-2">
              <BarChart3 size={22} style={{ color: "var(--blue)" }} /> Админ-панель
            </h1>
            <p className="ios-caption">@{user?.username ?? "admin"}</p>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("admin_session");
              setIsAdmin(false);
              setAuthChecked(true);
            }}
            className="ios-btn-ghost text-xs"
          >
            Выйти
          </button>
        </div>
        <div className="max-w-2xl mx-auto px-4 pb-3 flex gap-2">
          {[
            { key: "settings", label: "Настройки" },
            { key: "users", label: "Пользователи" },
          ].map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key as any)}
              className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: tab === t.key ? "var(--blue)" : "var(--bg-secondary)",
                color: tab === t.key ? "#fff" : "var(--text-secondary)",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, i) => (
            <div key={i} className="ios-card p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="ios-caption">{stat.label}</p>
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: `${stat.color}15`, color: stat.color }}
                >
                  {stat.icon}
                </div>
              </div>
              <p className="text-2xl font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>{stat.value}</p>
              <p className="ios-caption" style={{ color: stat.color }}>{stat.change}</p>
            </div>
          ))}
        </div>

        {tab === "settings" && (
          <div className="ios-card p-5 space-y-5">
            <div className="flex items-center gap-2">
              <Settings2 size={18} style={{ color: "var(--blue)" }} />
              <h3 className="ios-headline" style={{ color: "var(--text-primary)" }}>Premium и оплата</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="ios-caption block mb-2">Цена Premium (₽/мес)</label>
                <input
                  type="number"
                  value={settings.premiumPriceRub}
                  onChange={(e) => setSettings((s) => ({ ...s, premiumPriceRub: Number(e.target.value) }))}
                  className="ios-input"
                />
              </div>
              <div>
                <label className="ios-caption block mb-2">Цена в звёздах (⭐/мес)</label>
                <input
                  type="number"
                  value={settings.premiumPriceStars}
                  onChange={(e) => setSettings((s) => ({ ...s, premiumPriceStars: Number(e.target.value) }))}
                  className="ios-input"
                />
              </div>
              <div>
                <label className="ios-caption block mb-2">Способы оплаты</label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      ["both", "Карта + ⭐"],
                      ["card", "Только карта"],
                      ["stars", "Только ⭐"],
                    ] as const
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setSettings((s) => ({ ...s, premiumPaymentMethods: id }))}
                      className="py-2 px-2 rounded-xl text-xs font-semibold transition-all"
                      style={{
                        background: settings.premiumPaymentMethods === id ? "var(--bg-quaternary)" : "var(--bg-tertiary)",
                        color: settings.premiumPaymentMethods === id ? "var(--blue)" : "var(--text-secondary)",
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={saveSettings}
                disabled={settingsSaving}
                className="ios-btn w-full disabled:opacity-50"
              >
                {savedBadge ? (
                  <>
                    <CheckCircle2 size={16} /> Сохранено!
                  </>
                ) : settingsSaving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Сохранение...
                  </>
                ) : (
                  "Сохранить настройки"
                )}
              </button>
            </div>
          </div>
        )}

        {tab === "users" && (
          <div className="ios-card-grouped overflow-hidden">
            <div className="p-4" style={{ borderBottom: "1px solid var(--separator)" }}>
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    size={15}
                    style={{ color: "var(--text-tertiary)" }}
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Поиск пользователей..."
                    className="ios-input"
                    style={{ paddingLeft: "2.25rem" }}
                  />
                </div>
                <button
                  onClick={() => loadUsers()}
                  className="ios-icon-btn"
                >
                  <span className="sr-only">Обновить</span>
                  <Settings2 size={15} />
                </button>
              </div>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin" size={28} style={{ color: "var(--text-tertiary)" }} />
              </div>
            ) : filteredUsers.length === 0 ? (
              <p className="text-center py-10 ios-body" style={{ color: "var(--text-secondary)" }}>
                Пользователи не найдены
              </p>
            ) : (
              <div>
                {filteredUsers.map((u, i) => (
                  <div
                    key={u.id}
                    className="ios-card-row"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
                        style={{ background: "var(--bg-tertiary)", color: "var(--blue)" }}
                      >
                        {u.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="ios-headline truncate" style={{ color: "var(--text-primary)" }}>{u.name}</p>
                          {u.isAdmin && <Shield size={12} style={{ color: "var(--blue)" }} className="flex-shrink-0" />}
                          {u.isBanned && <Ban size={12} className="flex-shrink-0" style={{ color: "var(--red)" }} />}
                        </div>
                        <p className="ios-caption truncate">{u.username}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="ios-caption text-right mr-2">
                        <p>{u.posts} постов</p>
                        <p>{u.followers} подп.</p>
                      </div>
                      <button
                        onClick={() => setSelectedUser(u)}
                        className="ios-btn-ghost text-xs"
                      >
                        Изменить
                      </button>
                    </div>
                    {i < filteredUsers.length - 1 && (
                      <div className="ios-separator" style={{ position: "absolute", bottom: 0, left: 56, right: 0 }} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="ios-card w-full max-w-sm space-y-4"
            style={{ padding: "1.25rem" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="ios-headline" style={{ color: "var(--text-primary)" }}>Управление</h3>
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setBanReason("");
                }}
                className="ios-icon-btn"
                style={{ width: "2rem", height: "2rem" }}
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "var(--bg-tertiary)" }}>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                style={{ background: "var(--bg-quaternary)", color: "var(--blue)" }}
              >
                {selectedUser.name[0]}
              </div>
              <div className="flex-1">
                <p className="ios-headline" style={{ color: "var(--text-primary)" }}>{selectedUser.name}</p>
                <p className="ios-caption">{selectedUser.username}</p>
              </div>
              <div className="flex gap-1 ml-auto">
                {selectedUser.isAdmin && <span className="ios-badge" style={{ color: "var(--blue)" }}>Админ</span>}
                {selectedUser.isBanned && (
                  <span className="ios-badge" style={{ color: "var(--red)" }}>Забанен</span>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => handleSetAdmin(selectedUser.id, !selectedUser.isAdmin)}
                className="ios-btn-secondary w-full"
                style={{ color: selectedUser.isAdmin ? "var(--red)" : "var(--blue)" }}
              >
                {selectedUser.isAdmin ? (
                  <>
                    <Shield size={16} /> Отозвать права Admin
                  </>
                ) : (
                  <>
                    <UserCheck size={16} /> Выдать права Admin
                  </>
                )}
              </button>
              {selectedUser.isBanned ? (
                <button
                  onClick={() => handleBanUser(selectedUser.id, false)}
                  className="ios-btn-secondary w-full"
                  style={{ color: "var(--green)" }}
                >
                  <UserCheck size={16} /> Разбанить
                </button>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                    placeholder="Причина бана (необязательно)"
                    className="ios-input"
                  />
                  <button
                    onClick={() => handleBanUser(selectedUser.id, true)}
                    className="ios-btn-destructive w-full"
                  >
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
