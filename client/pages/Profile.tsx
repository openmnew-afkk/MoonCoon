import {
  Settings,
  Sparkles,
  X,
  Camera,
  ChevronRight,
  Star,
  Edit3,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTelegram } from "@/hooks/useTelegram";
import { useAdmin } from "@/hooks/useAdmin";
import { usePremium } from "@/hooks/usePremium";
import { useAppTheme } from "@/hooks/useAppTheme";
import { cn } from "@/lib/utils";
import StarsPayment from "@/components/StarsPayment";
import PremiumPurchase from "@/components/PremiumPurchase";
import Admin from "@/pages/Admin";
import ThemeSelector from "@/components/ThemeSelector";

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className={cn("relative w-11 h-6 rounded-full transition-colors flex-shrink-0", checked ? "bg-primary" : "bg-muted")}>
      <div className={cn("absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all",
        checked ? "left-[22px]" : "left-0.5")} />
    </button>
  );
}

function Sheet({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title?: string; children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative z-10 w-full rounded-t-3xl bg-card profile-sheet-up max-h-[85vh] overflow-hidden"
        onClick={e => e.stopPropagation()}>
        <div className="flex justify-center pt-3 pb-2"><div className="w-10 h-1 rounded-full bg-muted" /></div>
        {title && (
          <div className="flex items-center justify-between px-5 pb-3">
            <span className="text-lg font-semibold">{title}</span>
            <button type="button" onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><X size={16} /></button>
          </div>
        )}
        <div className="overflow-y-auto" style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)" }}>{children}</div>
      </div>
    </div>
  );
}

const PRIVACY_DEFAULTS = [
  { key: "private", label: "Приватный аккаунт", default: false },
  { key: "dms", label: "Разрешить сообщения", default: true },
  { key: "online", label: "Показывать онлайн", default: true },
  { key: "stories", label: "Видимость историй", default: true },
] as const;

function PrivacySheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [values, setValues] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(PRIVACY_DEFAULTS.map(p => [p.key, p.default])),
  );
  return (
    <Sheet open={open} onClose={onClose} title="Приватность">
      {PRIVACY_DEFAULTS.map(item => (
        <div key={item.key} className="flex items-center justify-between px-5 py-4 border-b border-border/60">
          <span className="text-[15px]">{item.label}</span>
          <Toggle checked={values[item.key]} onChange={v => setValues(s => ({ ...s, [item.key]: v }))} />
        </div>
      ))}
      <div className="px-5 py-4">
        <button type="button" onClick={onClose} className="w-full py-3 rounded-xl bg-muted font-medium text-sm">Готово</button>
      </div>
    </Sheet>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const { mode: themeMode, setTheme } = useAppTheme();
  const [showAdmin, setShowAdmin] = useState(false);
  const [showStars, setShowStars] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const { user } = useTelegram();
  const [starsBalance, setStarsBalance] = useState(0);
  const [stats, setStats] = useState({ posts: 0, followers: 0, following: 0, starsReceived: 0 });
  const [bio, setBio] = useState("");
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const { isAdmin } = useAdmin();
  const { premium } = usePremium();
  const [avatarUrl, setAvatarUrl] = useState("");
  const [showGoalsInFeed, setShowGoalsInFeed] = useState(
    () => localStorage.getItem("vexora-show-goals-feed") !== "false",
  );

  const safeTop = "calc(var(--tg-safe-top, 0px) + var(--tg-chrome-top, 52px))";

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    try {
      const [statsRes, balRes, settingsRes] = await Promise.all([
        fetch(`/api/users/${user.id}/stats`),
        fetch(`/api/stars/balance?userId=${user.id}`),
        fetch(`/api/users/${user.id}/settings`),
      ]);
      if (statsRes.ok) {
        const d = await statsRes.json();
        setStats({
          posts: d.posts ?? 0,
          followers: d.followers ?? 0,
          following: d.following ?? 0,
          starsReceived: d.starsReceived ?? 0,
        });
      }
      if (balRes.ok) {
        const d = await balRes.json();
        setStarsBalance(d.balance ?? 0);
      }
      if (settingsRes.ok) {
        const s = await settingsRes.json();
        setAvatarUrl(s.avatarUrl || user.photo_url || "");
        setBio(s.bio || "");
        setEditBio(s.bio || "");
      } else {
        setAvatarUrl(user.photo_url || "");
      }
      setEditName([user.first_name, user.last_name].filter(Boolean).join(" "));
    } catch { /* ignore */ }
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleGoalsToggle = (v: boolean) => {
    setShowGoalsInFeed(v);
    localStorage.setItem("vexora-show-goals-feed", String(v));
    window.dispatchEvent(new CustomEvent("vexora-prefs-change", { detail: { showGoalsInFeed: v } }));
  };

  const saveProfile = async () => {
    if (!user?.id) return;
    try {
      await fetch(`/api/users/${user.id}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio: editBio, displayName: editName }),
      });
      setBio(editBio);
      setShowEdit(false);
    } catch {
      alert("Не удалось сохранить");
    }
  };

  if (showAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <div className="fixed top-0 left-0 right-0 z-30 border-b border-border bg-background/95 backdrop-blur-md"
          style={{ paddingTop: safeTop }}>
          <div className="px-4 h-12 flex items-center">
            <button type="button" onClick={() => setShowAdmin(false)} className="text-primary font-medium text-sm">← Назад</button>
          </div>
        </div>
        <div style={{ paddingTop: `calc(${safeTop} + 3rem)` }}><Admin /></div>
      </div>
    );
  }

  const isPremiumUser = premium.isPremium || (user?.id && parseInt(String(user.id), 10) <= 1000);
  const avatarSrc = avatarUrl || `https://api.dicebear.com/9.x/thumbs/svg?seed=${user?.id || "user"}&backgroundColor=1a1a1a`;
  const displayName = [user?.first_name, user?.last_name].filter(Boolean).join(" ") || "Пользователь";
  const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n));

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="px-5 pt-2 flex items-center justify-between" style={{ paddingTop: `calc(${safeTop} + 8px)` }}>
        <h1 className="text-xl font-semibold tracking-tight">{displayName.split(" ")[0] || "Профиль"}</h1>
        <button type="button" onClick={() => setShowSettings(true)}
          className="w-9 h-9 rounded-full bg-muted/80 flex items-center justify-center">
          <Settings size={18} className="text-muted-foreground" />
        </button>
      </div>

      <div className="px-5 pt-6 pb-5 flex flex-col items-center text-center">
        <input id="avatarInput" type="file" accept="image/*" className="hidden"
          onChange={async e => {
            const file = e.target.files?.[0];
            if (!file || !user?.id) return;
            const reader = new FileReader();
            reader.onload = async () => {
              const dataUrl = reader.result as string;
              setAvatarUrl(dataUrl);
              await fetch(`/api/users/${user.id}/settings`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ avatarUrl: dataUrl }),
              });
            };
            reader.readAsDataURL(file);
          }}
        />
        <button type="button" onClick={() => document.getElementById("avatarInput")?.click()} className="relative group">
          <div className="w-[88px] h-[88px] rounded-full overflow-hidden ring-1 ring-border bg-muted">
            <img src={avatarSrc} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary flex items-center justify-center border-2 border-background">
            <Camera size={13} className="text-primary-foreground" />
          </div>
        </button>

        <p className="mt-4 text-[20px] font-semibold leading-tight">{displayName}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{user?.username ? `@${user.username}` : "@username"}</p>
        {bio && <p className="text-sm text-foreground/70 mt-2 max-w-xs leading-relaxed">{bio}</p>}
        {isPremiumUser && (
          <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-primary/15 text-primary">
            <Sparkles size={10} /> Premium
          </span>
        )}
      </div>

      <div className="mx-5 grid grid-cols-4 gap-px rounded-2xl overflow-hidden bg-border mb-5">
        {[
          { v: fmt(stats.posts), l: "посты" },
          { v: fmt(stats.followers), l: "подписч." },
          { v: fmt(stats.following), l: "подписки" },
          { v: fmt(stats.starsReceived), l: "⭐ получ." },
        ].map(s => (
          <div key={s.l} className="bg-card py-4 flex flex-col items-center">
            <span className="text-lg font-bold tabular-nums">{s.v}</span>
            <span className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wide">{s.l}</span>
          </div>
        ))}
      </div>

      <div className="mx-5 mb-4 flex gap-2">
        <button type="button" onClick={() => setShowEdit(true)}
          className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-border bg-card">
          <Edit3 size={14} className="inline mr-1.5 -mt-0.5" />Редактировать
        </button>
        <button type="button" onClick={() => setShowPremium(true)} className="btn-premium px-4 py-2.5 text-sm">
          <Sparkles size={14} className="inline mr-1" />Premium
        </button>
      </div>

      <button type="button" onClick={() => setShowStars(true)}
        className="mx-5 mb-5 w-[calc(100%-2.5rem)] flex items-center gap-3 p-4 rounded-2xl bg-card border border-border text-left active:scale-[0.99] transition-transform">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Star size={18} className="text-primary fill-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">{starsBalance} звёзд</p>
          <p className="text-xs text-muted-foreground">Пополнить · вывести · история</p>
        </div>
        <ChevronRight size={16} className="text-muted-foreground" />
      </button>

      <div className="mx-5 space-y-2">
        {[
          { label: "Мои публикации", action: () => navigate("/") },
          { label: "Цели", action: () => navigate("/goals") },
          { label: "История звёзд", action: () => navigate("/stars-history") },
          { label: "Приватность", action: () => setShowPrivacy(true) },
        ].map(row => (
          <button key={row.label} type="button" onClick={row.action}
            className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl bg-card border border-border text-[15px] active:bg-muted/50">
            <span>{row.label}</span>
            <ChevronRight size={16} className="text-muted-foreground" />
          </button>
        ))}

        <div className="rounded-xl bg-card border border-border px-4 py-3 flex items-center justify-between">
          <span className="text-[15px]">Цели в ленте</span>
          <Toggle checked={showGoalsInFeed} onChange={handleGoalsToggle} />
        </div>

        <div className="rounded-xl bg-card border border-border p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Тема</p>
          <ThemeSelector value={themeMode} onChange={setTheme} />
        </div>

        {isAdmin && (
          <button type="button" onClick={() => setShowAdmin(true)}
            className="w-full py-3.5 rounded-xl border border-primary/30 text-primary text-sm font-medium">
            Панель администратора
          </button>
        )}
      </div>

      {showStars && (
        <Sheet open onClose={() => { setShowStars(false); loadData(); }} title="Звёзды">
          <div className="px-4 pb-6">
            <StarsPayment userId={user?.id?.toString() || "0"} currentStars={starsBalance}
              onSuccess={() => loadData()} />
          </div>
        </Sheet>
      )}

      {showPremium && (
        <Sheet open onClose={() => setShowPremium(false)} title="Premium">
          <div className="px-4 pb-6">
            <PremiumPurchase userId={user?.id?.toString() || "0"} currentStars={starsBalance}
              onSuccess={() => { setShowPremium(false); loadData(); }} />
          </div>
        </Sheet>
      )}

      <Sheet open={showEdit} onClose={() => setShowEdit(false)} title="Редактировать">
        <div className="px-5 pb-6 space-y-4">
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider">Имя</label>
            <input value={editName} onChange={e => setEditName(e.target.value)}
              className="mt-2 w-full rounded-xl px-4 py-3 text-sm bg-muted border-0 outline-none focus:ring-2 focus:ring-primary/40" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider">О себе</label>
            <textarea value={editBio} onChange={e => setEditBio(e.target.value)} rows={3}
              className="mt-2 w-full rounded-xl px-4 py-3 text-sm bg-muted border-0 outline-none resize-none focus:ring-2 focus:ring-primary/40" />
          </div>
          <button type="button" onClick={saveProfile} className="btn-premium w-full py-3.5 text-sm">Сохранить</button>
        </div>
      </Sheet>

      <PrivacySheet open={showPrivacy} onClose={() => setShowPrivacy(false)} />

      <Sheet open={showSettings} onClose={() => setShowSettings(false)} title="Настройки">
        <div className="px-5 pb-6 space-y-4">
          <div className="flex items-center justify-between py-2">
            <span>Цели в ленте</span>
            <Toggle checked={showGoalsInFeed} onChange={handleGoalsToggle} />
          </div>
          <ThemeSelector value={themeMode} onChange={setTheme} />
          <button type="button" onClick={() => setShowSettings(false)} className="w-full py-3 rounded-xl bg-muted text-sm font-medium">Готово</button>
        </div>
      </Sheet>
    </div>
  );
}
