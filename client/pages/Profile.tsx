import {
  Settings,
  LogOut,
  Sparkles,
  X,
  Camera,
  ChevronRight,
  Bell,
  Star,
  Edit3,
  TrendingUp,
  Heart,
  Grid3X3,
  Shield,
  Wallet,
  Globe,
  MessageCircle,
  BarChart3,
} from "lucide-react";
import { Link } from "react-router-dom";
import ThemeSelector from "@/components/ThemeSelector";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useState, useEffect, useCallback } from "react";
import StarsPayment from "@/components/StarsPayment";
import { useTelegram } from "@/hooks/useTelegram";
import Admin from "@/pages/Admin";
import { useAdmin } from "@/hooks/useAdmin";
import PremiumBadge from "@/components/PremiumBadge";
import PremiumPurchase from "@/components/PremiumPurchase";
import { usePremium } from "@/hooks/usePremium";
import { cn } from "@/lib/utils";

/* ─── Toggle ──────────────────────────────────────────────────────── */
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        "relative w-12 h-7 rounded-full transition-all duration-300 flex-shrink-0",
        checked ? "bg-foreground" : "bg-foreground/20"
      )}
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      <div className={cn(
        "absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all duration-300",
        checked ? "left-[26px]" : "left-1"
      )} />
    </button>
  );
}

/* ─── Privacy row ────────────────────────────────────────────────── */
function PrivacyRow({ label, defaultValue }: { label: string; defaultValue: boolean }) {
  const [val, setVal] = useState(defaultValue);
  return (
    <label className="flex items-center justify-between py-3.5 px-5 border-b border-foreground/[0.06] last:border-0 active:bg-foreground/[0.04] transition-colors">
      <span className="text-[15px] text-foreground/85">{label}</span>
      <Toggle checked={val} onChange={setVal} />
    </label>
  );
}

/* ─── Bottom Sheet ────────────────────────────────────────────────── */
function Sheet({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title?: string; children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[4px]" />
      <div
        className="relative z-10 w-full rounded-t-[24px] overflow-hidden profile-sheet-up"
        style={{ background: "hsl(var(--background))", boxShadow: "0 -8px 40px rgba(0,0,0,0.18)" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-9 h-1 rounded-full bg-foreground/20" />
        </div>
        {title && (
          <div className="flex items-center justify-between px-5 pb-3 border-b border-foreground/[0.07]">
            <span className="text-[17px] font-bold">{title}</span>
            <button onClick={onClose} className="w-7 h-7 rounded-full bg-foreground/[0.08] flex items-center justify-center active:scale-90 transition-transform">
              <X size={14} />
            </button>
          </div>
        )}
        <div className="overflow-y-auto max-h-[78vh]" style={{ paddingBottom: "env(safe-area-inset-bottom, 20px)" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ─── Menu Row ───────────────────────────────────────────────────── */
function MenuRow({ icon: Icon, label, value, onClick, toggle, toggleValue, onToggle, danger, iconEmoji }: {
  icon?: any; label: string; value?: string; onClick?: () => void;
  toggle?: boolean; toggleValue?: boolean; onToggle?: (v: boolean) => void;
  danger?: boolean; iconEmoji?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3.5 px-5 py-3.5 transition-colors",
        "active:bg-foreground/[0.04] border-b border-foreground/[0.06] last:border-0",
        danger && "active:bg-red-500/10"
      )}
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      {iconEmoji ? (
        <span className="text-[20px] w-8 text-center flex-shrink-0">{iconEmoji}</span>
      ) : Icon ? (
        <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0",
          danger ? "bg-red-500/10" : "bg-foreground/[0.07]"
        )}>
          <Icon size={16} className={danger ? "text-red-400" : "text-foreground/60"} />
        </div>
      ) : null}
      <span className={cn("flex-1 text-left text-[15px]", danger ? "text-red-400" : "text-foreground/85")}>{label}</span>
      {value && <span className="text-sm text-muted-foreground mr-1">{value}</span>}
      {toggle ? (
        <Toggle checked={toggleValue ?? false} onChange={onToggle ?? (() => {})} />
      ) : (
        <ChevronRight size={16} className="text-foreground/25 flex-shrink-0" />
      )}
    </button>
  );
}

/* ─── Menu Card wrapper ───────────────────────────────────────────── */
function MenuCard({ children, label }: { children: React.ReactNode; label?: string }) {
  return (
    <div>
      {label && <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5 px-1">{label}</p>}
      <div className="rounded-2xl overflow-hidden border border-foreground/[0.07] bg-foreground/[0.025] divide-y-0">
        {children}
      </div>
    </div>
  );
}

/* ─── Stat pill ──────────────────────────────────────────────────── */
function StatPill({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-[20px] font-black">{value}</span>
      <span className="text-[11px] text-muted-foreground">{label}</span>
    </div>
  );
}

/* ─── Main Profile ────────────────────────────────────────────────── */
export default function Profile() {
  const { mode: themeMode, setTheme } = useAppTheme();
  const [showAdmin, setShowAdmin] = useState(false);
  const [showStars, setShowStars] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const { user } = useTelegram();
  const [starsBalance, setStarsBalance] = useState(0);
  const [stats, setStats] = useState({ posts: 4, followers: 22, following: 15 });
  const { isAdmin } = useAdmin();
  const { premium } = usePremium();
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [showGoalsInFeed, setShowGoalsInFeed] = useState(
    () => localStorage.getItem("vexora-show-goals-feed") !== "false"
  );
  const [showSettingsSheet, setShowSettingsSheet] = useState(false);
  const [showPrivacySheet, setShowPrivacySheet] = useState(false);
  const [showWithdrawSheet, setShowWithdrawSheet] = useState(false);
  const [showEditSheet, setShowEditSheet] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      try {
        const [statsRes, balRes, settingsRes] = await Promise.all([
          fetch(`/api/users/${user.id}/stats`),
          fetch(`/api/stars/balance?userId=${user.id}`),
          fetch(`/api/users/${user.id}/settings`),
        ]);
        if (statsRes.ok) setStats(await statsRes.json());
        if (balRes.ok) { const d = await balRes.json(); setStarsBalance(d.balance || 0); }
        if (settingsRes.ok) { const s = await settingsRes.json(); if (s.avatarUrl) setAvatarUrl(s.avatarUrl); else if (user.photo_url) setAvatarUrl(user.photo_url); }
        else if (user.photo_url) setAvatarUrl(user.photo_url);
      } catch {}
    };
    load();
  }, [user]);

  const handleGoalsToggle = useCallback((v: boolean) => {
    setShowGoalsInFeed(v);
    localStorage.setItem("vexora-show-goals-feed", String(v));
    window.dispatchEvent(new CustomEvent("vexora-prefs-change", { detail: { showGoalsInFeed: v } }));
  }, []);

  if (showAdmin) return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-0 left-0 right-0 nav-glass border-b border-white/[0.06] z-30">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <button onClick={() => setShowAdmin(false)} className="flex items-center gap-2 text-primary font-semibold">← Назад</button>
        </div>
      </div>
      <div className="pt-16"><Admin /></div>
    </div>
  );

  if (showPremium) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowPremium(false)}>
      <div className="glass-card max-w-md w-full max-h-[85vh] overflow-y-auto rounded-2xl" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 glass-morphism border-b border-glass-light/20 p-4 flex items-center justify-between z-10">
          <h1 className="text-xl font-bold flex items-center gap-2"><Sparkles className="text-yellow-400 fill-yellow-400" size={24} />Premium</h1>
          <button onClick={() => setShowPremium(false)} className="glass-button p-2 rounded-full"><X size={20} /></button>
        </div>
        <div className="p-4"><PremiumPurchase userId={user?.id?.toString() || "0"} currentStars={starsBalance} onSuccess={() => { setShowPremium(false); window.location.reload(); }} /></div>
      </div>
    </div>
  );

  if (showStars) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowStars(false)}>
      <div className="glass-card max-w-md w-full max-h-[85vh] overflow-y-auto rounded-2xl" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 glass-morphism border-b border-glass-light/20 p-4 flex items-center justify-between z-10">
          <h1 className="text-xl font-bold flex items-center gap-2"><Star className="text-yellow-400 fill-yellow-400" size={24} />Звёзды</h1>
          <button onClick={() => setShowStars(false)} className="glass-button p-2 rounded-full"><X size={20} /></button>
        </div>
        <div className="p-4"><StarsPayment userId={user?.id?.toString() || "0"} currentStars={starsBalance} onSuccess={() => fetch(`/api/stars/balance?userId=${user?.id}`).then(r => r.json()).then(d => setStarsBalance(d.balance || 0)).catch(console.error)} /></div>
      </div>
    </div>
  );

  const isPremiumUser = premium.isPremium || (user?.id && parseInt(String(user.id)) <= 1000);
  const avatarSrc = avatarUrl || user?.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id || "user"}`;
  const displayName = user?.first_name || "Ваше имя";
  const displayUsername = user?.username ? `@${user.username}` : "@yourprofile";

  return (
    <div className="min-h-screen bg-background pb-32 select-none">

      {/* ── Hero header with gradient ──────────────────────────────── */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          background: "linear-gradient(160deg, hsl(var(--primary) / 0.18) 0%, hsl(var(--background)) 60%)",
          paddingBottom: "0",
        }}
      >
        {/* Subtle background circle */}
        <div
          className="absolute -top-20 -right-20 w-72 h-72 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, hsl(var(--primary) / 0.12) 0%, transparent 70%)",
          }}
        />

        {/* Top bar */}
        <div className="px-5 pt-5 pb-2 flex items-center justify-between relative z-10">
          <h1 className="text-[28px] font-black tracking-tight">Профиль</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettingsSheet(true)}
              className="w-9 h-9 rounded-full bg-foreground/[0.07] flex items-center justify-center active:scale-90 transition-transform"
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              <Settings size={17} className="text-foreground/70" />
            </button>
          </div>
        </div>

        {/* Avatar + Info row */}
        <div className="px-5 py-4 flex items-end gap-4 relative z-10">
          {/* Avatar with gradient ring */}
          <div className="relative flex-shrink-0">
            <input id="avatarInput" type="file" accept="image/*" className="hidden"
              onChange={async e => {
                const file = e.target.files?.[0];
                if (!file || !user?.id) return;
                const reader = new FileReader();
                reader.onload = async () => {
                  const dataUrl = reader.result as string;
                  setAvatarUrl(dataUrl);
                  try {
                    await fetch(`/api/users/${user.id}/settings`, {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ avatarUrl: dataUrl }),
                    });
                  } catch {}
                };
                reader.readAsDataURL(file);
              }}
            />
            <button onClick={() => document.getElementById("avatarInput")?.click()}
              className="relative group active:scale-95 transition-transform block"
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              {/* Gradient ring */}
              <div
                className="rounded-full p-[3px]"
                style={{
                  background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)), #f472b6)",
                  boxShadow: "0 4px 24px hsl(var(--primary) / 0.35)",
                }}
              >
                <div className="w-[86px] h-[86px] rounded-full overflow-hidden border-2 border-background">
                  <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
                </div>
              </div>
              {/* Camera badge */}
              <div
                className="absolute -bottom-0.5 -right-0.5 w-7 h-7 rounded-full flex items-center justify-center shadow-lg"
                style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))" }}
              >
                <Camera size={13} className="text-white" />
              </div>
            </button>
          </div>

          {/* Name + username + badges */}
          <div className="flex-1 min-w-0 pb-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[20px] font-black tracking-tight">{displayName}</span>
              {isPremiumUser && (
                <div
                  className="flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full text-white"
                  style={{ background: "linear-gradient(135deg, #FFD700, #FF8C00)" }}
                >
                  <Sparkles size={9} className="fill-current" /> PREMIUM
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{displayUsername}</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Участник Vexora</p>
          </div>
        </div>

        {/* ── Stats row ─────────────────────────────────────────────── */}
        <div className="mx-5 mb-5 rounded-2xl border border-foreground/[0.07] bg-foreground/[0.03] py-4 px-2 flex items-center justify-around relative z-10">
          <StatPill value={stats.posts} label="Постов" />
          <div className="w-px h-8 bg-foreground/10" />
          <StatPill value={stats.followers} label="Подписчиков" />
          <div className="w-px h-8 bg-foreground/10" />
          <StatPill value={stats.following} label="Подписок" />
        </div>

        {/* ── Action buttons ─────────────────────────────────────────── */}
        <div className="mx-5 mb-6 flex gap-3 relative z-10">
          <button
            onClick={() => setShowEditSheet(true)}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-foreground/[0.12] bg-foreground/[0.05] text-foreground/80 active:bg-foreground/[0.1] transition-colors flex items-center justify-center gap-1.5"
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            <Edit3 size={14} />
            Редактировать
          </button>
          <button
            onClick={() => setShowPremium(true)}
            className="btn-premium flex-shrink-0 py-2.5 px-5 text-sm"
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            <Sparkles size={14} />
            Premium
          </button>
        </div>
      </div>

      {/* ── Stars banner ─────────────────────────────────────────── */}
      <div
        className="mx-5 mb-5 rounded-2xl px-4 py-3.5 flex items-center gap-3"
        style={{
          background: "linear-gradient(135deg, rgba(251,191,36,0.12), rgba(251,191,36,0.06))",
          border: "1px solid rgba(251,191,36,0.25)",
        }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(251,191,36,0.15)" }}
        >
          <Star size={20} className="text-amber-400 fill-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground/90">Баланс звёзд</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {starsBalance > 0 ? `У вас ${starsBalance} ⭐` : "Купить звёзды для авторов"}
          </p>
        </div>
        <button
          onClick={() => setShowStars(true)}
          className="btn-premium text-xs py-2 px-4"
          style={{ WebkitTapHighlightColor: "transparent" }}
        >
          {starsBalance > 0 ? "Вывести" : "Купить"}
        </button>
      </div>

      {/* ── Main menu ─────────────────────────────────────────────── */}
      <div className="px-5 space-y-3">

        <MenuCard>
          <MenuRow iconEmoji="🖼️" label="Мои публикации" onClick={() => {}} />
          <MenuRow iconEmoji="⭐" label="Подписка и Звёзды" onClick={() => setShowStars(true)} />
          <MenuRow iconEmoji="📊" label="Статистика" onClick={() => {}} />
          <MenuRow iconEmoji="⚙️" label="Настройки" onClick={() => setShowSettingsSheet(true)} />
        </MenuCard>

        <MenuCard label="Лента">
          <MenuRow iconEmoji="🎯" label="Цели в ленте" toggle toggleValue={showGoalsInFeed} onToggle={handleGoalsToggle} />
          <MenuRow iconEmoji="📈" label="Рекомендации" toggle toggleValue={true} onToggle={() => {}} />
        </MenuCard>

        <MenuCard label="Аккаунт">
          <MenuRow iconEmoji="🔒" label="Приватность" onClick={() => setShowPrivacySheet(true)} />
          <MenuRow iconEmoji="🛡️" label="Безопасность" onClick={() => {}} />
          <MenuRow iconEmoji="💳" label="Вывод средств" onClick={() => setShowWithdrawSheet(true)} />
          <MenuRow iconEmoji="🌐" label="Правила и условия" onClick={() => {}} />
          <MenuRow iconEmoji="💬" label="Поддержка" onClick={() => window.open("https://t.me/VexoraSupport", "_blank")} />
        </MenuCard>

        <MenuCard label="Внешний вид">
          <div className="px-5 py-3">
            <ThemeSelector value={themeMode} onChange={setTheme} />
          </div>
        </MenuCard>

        {isAdmin && (
          <MenuCard>
            <MenuRow iconEmoji="⚡" label="Панель администратора" onClick={() => setShowAdmin(true)} />
          </MenuCard>
        )}

        <MenuCard>
          <MenuRow icon={LogOut} label="Выйти" danger onClick={() => {}} />
        </MenuCard>

        <p className="text-center text-[11px] text-muted-foreground/40 pt-1 pb-2">Vexora · v1.0.0</p>
      </div>

      {/* ── Edit Sheet ─────────────────────────────────────────────── */}
      <Sheet open={showEditSheet} onClose={() => setShowEditSheet(false)} title="Редактировать профиль">
        <div className="px-5 py-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Имя</label>
            <input type="text" defaultValue={user?.first_name || ""} className="w-full rounded-xl px-4 py-3 text-sm outline-none bg-foreground/[0.05] border border-foreground/[0.1] focus:border-foreground/30 transition-colors" placeholder="Ваше имя" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Биография</label>
            <textarea rows={3} className="w-full rounded-xl px-4 py-3 text-sm outline-none bg-foreground/[0.05] border border-foreground/[0.1] focus:border-foreground/30 transition-colors resize-none" placeholder="Расскажите о себе..." />
          </div>
          <button
            onClick={() => setShowEditSheet(false)}
            className="btn-premium w-full py-3.5 text-sm"
          >
            Сохранить
          </button>
        </div>
      </Sheet>

      {/* ── Privacy Sheet ─────────────────────────────────────────── */}
      <Sheet open={showPrivacySheet} onClose={() => setShowPrivacySheet(false)} title="Приватность">
        <PrivacyRow label="Приватный аккаунт" defaultValue={false} />
        <PrivacyRow label="Разрешить сообщения" defaultValue={true} />
        <PrivacyRow label="Показывать онлайн статус" defaultValue={true} />
        <PrivacyRow label="Видимость историй" defaultValue={true} />
        <div className="px-5 py-4">
          <button onClick={() => setShowPrivacySheet(false)} className="btn-ghost w-full py-3.5 text-sm">Готово</button>
        </div>
      </Sheet>

      {/* ── Withdraw Sheet ─────────────────────────────────────────── */}
      <Sheet open={showWithdrawSheet} onClose={() => setShowWithdrawSheet(false)} title="Вывод средств">
        <div className="px-5 py-4 space-y-4">
          <div
            className="rounded-2xl p-5 text-center"
            style={{ background: "linear-gradient(135deg, rgba(251,191,36,0.15), rgba(251,191,36,0.07))", border: "1px solid rgba(251,191,36,0.2)" }}
          >
            <p className="text-4xl font-black text-amber-400">{starsBalance} ⭐</p>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Доступно к выводу</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Сумма (мин. 100 ⭐)</label>
            <input type="number" min="100" max={starsBalance} defaultValue="100" className="w-full rounded-xl px-4 py-3 text-sm outline-none bg-foreground/[0.05] border border-foreground/[0.1]" />
          </div>
          <p className="text-xs text-muted-foreground">Комиссия: 10% · Обработка: 1–3 дня</p>
          <button
            onClick={() => { alert("Заявка отправлена!"); setShowWithdrawSheet(false); }}
            className="btn-premium w-full py-3.5 text-sm"
          >
            Вывести через Telegram
          </button>
        </div>
      </Sheet>

      {/* ── Settings Sheet ─────────────────────────────────────────── */}
      <Sheet open={showSettingsSheet} onClose={() => setShowSettingsSheet(false)} title="Настройки">
        <div className="px-5 py-4 space-y-4">
          <div className="rounded-2xl border border-foreground/[0.07] bg-foreground/[0.025] overflow-hidden divide-y divide-foreground/[0.06]">
            <label className="flex items-center justify-between px-4 py-3.5">
              <span className="text-[15px]">🎯 Цели в ленте</span>
              <Toggle checked={showGoalsInFeed} onChange={handleGoalsToggle} />
            </label>
            <label className="flex items-center justify-between px-4 py-3.5">
              <span className="text-[15px]">🔔 Уведомления</span>
              <Toggle checked={true} onChange={() => {}} />
            </label>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Тема оформления</p>
            <ThemeSelector value={themeMode} onChange={setTheme} />
          </div>
          <button onClick={() => setShowSettingsSheet(false)} className="btn-ghost w-full py-3.5 text-sm">Готово</button>
        </div>
      </Sheet>

      <style>{`
        @keyframes profile-sheet-up {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        .profile-sheet-up { animation: profile-sheet-up 0.36s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
}
