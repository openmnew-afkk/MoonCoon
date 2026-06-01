import { Camera, ChevronRight, Star, Sparkles, Settings, Crown, Zap, TrendingUp, Image as ImageIcon } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTelegram } from "@/hooks/useTelegram";
import { useAdmin } from "@/hooks/useAdmin";
import { usePremium } from "@/hooks/usePremium";
import StarsPayment from "@/components/StarsPayment";
import PremiumPurchase from "@/components/PremiumPurchase";
import Admin from "@/pages/Admin";
import { APP_NAME } from "@/lib/brand";

export default function Profile() {
  const navigate = useNavigate();
  const [showAdmin, setShowAdmin] = useState(false);
  const [showStars, setShowStars] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const { user, webApp } = useTelegram();
  const [starsBalance, setStarsBalance] = useState(0);
  const [stats, setStats] = useState({ posts: 0, starsReceived: 0 });
  const { isAdmin } = useAdmin();
  const { premium } = usePremium();
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bio, setBio] = useState("");

  const safeTop = "calc(var(--tg-safe-top, 0px) + var(--tg-chrome-top, 52px))";

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    const uid = String(user.id);
    try {
      const [statsRes, balRes, settingsRes] = await Promise.all([
        fetch(`/api/users/${uid}/stats`),
        fetch(`/api/stars/balance?userId=${uid}`),
        fetch(`/api/users/${uid}/settings`),
      ]);
      if (statsRes.ok) {
        const d = await statsRes.json();
        setStats({ posts: d.posts ?? 0, starsReceived: d.starsReceived ?? 0 });
      }
      if (balRes.ok) {
        const d = await balRes.json();
        setStarsBalance(d.balance ?? 0);
      }
      if (settingsRes.ok) {
        const s = await settingsRes.json();
        setAvatarUrl(s.avatarUrl || user.photo_url || "");
        setBio(s.bio || "");
      } else {
        setAvatarUrl(user.photo_url || "");
      }
    } catch { /* ignore */ }
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  if (showAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <div className="px-4 h-12 flex items-center border-b border-border" style={{ paddingTop: safeTop }}>
          <button type="button" onClick={() => setShowAdmin(false)} className="text-primary text-sm font-medium">← Назад</button>
        </div>
        <Admin />
      </div>
    );
  }

  const displayName = [user?.first_name, user?.last_name].filter(Boolean).join(" ") || "Пользователь";
  const username = user?.username ? `@${user.username}` : "Telegram User";
  const avatarSrc = avatarUrl || `https://api.dicebear.com/9.x/thumbs/svg?seed=${user?.id || "u"}`;
  const isPremium = premium.isPremium;

  return (
    <div className="min-h-screen bg-background pb-28 max-w-lg mx-auto">
      {/* Hero gradient header */}
      <div className="relative overflow-hidden" style={{ paddingTop: safeTop }}>
        <div className="absolute inset-0" style={{
          background: "linear-gradient(145deg, hsl(var(--primary) / 0.15) 0%, transparent 50%, rgba(168,85,247,0.08) 100%)",
        }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-40 rounded-b-[50%]" style={{
          background: "radial-gradient(ellipse at center, hsl(var(--primary) / 0.12) 0%, transparent 70%)",
          filter: "blur(30px)",
        }} />

        {/* Settings icon */}
        <div className="relative flex justify-end px-4 pt-2">
          <Link to="/settings" className="w-10 h-10 rounded-2xl bg-card/80 backdrop-blur-md border border-border/50 flex items-center justify-center transition-all active:scale-90"
            style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
            <Settings size={18} className="text-muted-foreground" />
          </Link>
        </div>

        {/* Avatar + Name */}
        <div className="relative px-5 pb-6 flex flex-col items-center text-center">
          <input id="avatarInput" type="file" accept="image/*" className="hidden"
            onChange={e => {
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
            {/* Glow ring behind avatar */}
            <div className="absolute -inset-1.5 rounded-full opacity-60" style={{
              background: isPremium
                ? "conic-gradient(from 0deg, #CBFF4D, #a855f7, #ec4899, #3b82f6, #CBFF4D)"
                : "linear-gradient(135deg, hsl(var(--primary) / 0.4), hsl(var(--primary) / 0.1))",
              animation: isPremium ? "adel-ring-spin 4s linear infinite" : "none",
              filter: "blur(3px)",
            }} />
            <img src={avatarSrc} alt="" className="relative w-24 h-24 rounded-full object-cover border-[3px] border-background" style={{
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            }} />
            <span className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center border-2 border-background transition-transform group-active:scale-90"
              style={{ background: "hsl(var(--primary))", boxShadow: "0 4px 12px hsl(var(--primary) / 0.5)" }}>
              <Camera size={14} className="text-primary-foreground" />
            </span>
          </button>

          <h1 className="mt-4 text-2xl font-black tracking-tight">{displayName}</h1>
          <p className="text-sm text-muted-foreground font-medium">{username}</p>
          {bio && <p className="text-sm text-foreground/60 mt-2 max-w-xs leading-relaxed">{bio}</p>}
          {isPremium && (
            <span className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider"
              style={{
                background: "linear-gradient(135deg, hsl(var(--primary) / 0.2), rgba(168,85,247,0.15))",
                border: "1px solid hsl(var(--primary) / 0.3)",
                color: "hsl(var(--primary))",
                boxShadow: "0 0 16px hsl(var(--primary) / 0.2)",
              }}>
              <Crown size={12} /> Premium
            </span>
          )}
          {!user && (
            <p className="mt-3 text-xs text-amber-500/80 bg-amber-500/10 px-3 py-1.5 rounded-lg">Откройте через Telegram для синхронизации</p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="mx-5 grid grid-cols-3 gap-2.5 mb-5">
        {[
          { v: stats.posts, l: "Постов", icon: <ImageIcon size={14} />, color: "#a855f7" },
          { v: starsBalance, l: "Звёзд", icon: <Star size={14} />, color: "#CBFF4D" },
          { v: stats.starsReceived, l: "Получено", icon: <TrendingUp size={14} />, color: "#3b82f6" },
        ].map(s => (
          <div key={s.l} className="rounded-2xl border border-border/60 py-3.5 text-center relative overflow-hidden"
            style={{ background: "hsl(var(--card))" }}>
            <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(90deg, transparent, ${s.color}40, transparent)` }} />
            <div className="flex items-center justify-center gap-1 mb-1" style={{ color: s.color }}>
              {s.icon}
            </div>
            <p className="text-xl font-black tabular-nums">{s.v}</p>
            <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">{s.l}</p>
          </div>
        ))}
      </div>

      {/* Action cards */}
      <div className="mx-5 space-y-2.5">
        <button type="button" onClick={() => setShowStars(true)}
          className="w-full flex items-center gap-3.5 p-4 rounded-2xl border border-border/60 text-left transition-all active:scale-[0.98]"
          style={{ background: "hsl(var(--card))" }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, rgba(203,255,77,0.2), rgba(203,255,77,0.05))", border: "1px solid rgba(203,255,77,0.2)" }}>
            <Star className="text-primary fill-primary" size={18} />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">Звёзды Telegram</p>
            <p className="text-xs text-muted-foreground">Купить · вывести · история</p>
          </div>
          <ChevronRight size={16} className="text-muted-foreground" />
        </button>

        <button type="button" onClick={() => setShowPremium(true)}
          className="w-full flex items-center gap-3.5 p-4 rounded-2xl border text-left transition-all active:scale-[0.98] relative overflow-hidden"
          style={{
            background: "hsl(var(--card))",
            borderColor: isPremium ? "hsl(var(--primary) / 0.3)" : "hsl(var(--border) / 0.6)",
          }}>
          {isPremium && <div className="absolute inset-0 opacity-[0.04]" style={{ background: "linear-gradient(135deg, #CBFF4D, #a855f7)" }} />}
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, rgba(168,85,247,0.2), rgba(168,85,247,0.05))", border: "1px solid rgba(168,85,247,0.2)" }}>
            <Sparkles size={18} className="text-purple-400" />
          </div>
          <div className="flex-1 relative z-10">
            <p className="font-semibold text-sm">{isPremium ? "Premium активен" : "Premium"}</p>
            <p className="text-xs text-muted-foreground">Расширенные возможности {APP_NAME}</p>
          </div>
          <ChevronRight size={16} className="text-muted-foreground relative z-10" />
        </button>

        <button type="button" onClick={() => navigate("/")}
          className="w-full flex items-center gap-3.5 p-4 rounded-2xl border border-border/60 text-left transition-all active:scale-[0.98]"
          style={{ background: "hsl(var(--card))" }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(59,130,246,0.05))", border: "1px solid rgba(59,130,246,0.15)" }}>
            <ImageIcon size={18} className="text-blue-400" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">Мои публикации</p>
            <p className="text-xs text-muted-foreground">Все посты и истории</p>
          </div>
          <ChevronRight size={16} className="text-muted-foreground" />
        </button>

        <button type="button" onClick={() => navigate("/stars-history")}
          className="w-full flex items-center gap-3.5 p-4 rounded-2xl border border-border/60 text-left transition-all active:scale-[0.98]"
          style={{ background: "hsl(var(--card))" }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, rgba(236,72,153,0.2), rgba(236,72,153,0.05))", border: "1px solid rgba(236,72,153,0.15)" }}>
            <Zap size={18} className="text-pink-400" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">История операций</p>
            <p className="text-xs text-muted-foreground">Транзакции и переводы</p>
          </div>
          <ChevronRight size={16} className="text-muted-foreground" />
        </button>

        {isAdmin && (
          <button type="button" onClick={() => setShowAdmin(true)}
            className="w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
            style={{
              background: "linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(var(--primary) / 0.05))",
              border: "1px solid hsl(var(--primary) / 0.3)",
              color: "hsl(var(--primary))",
            }}>
            <Crown size={16} /> Админ-панель
          </button>
        )}
      </div>

      {showStars && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/60 backdrop-blur-sm" onClick={() => { setShowStars(false); loadData(); }}>
          <div className="w-full rounded-t-3xl bg-card max-h-[90vh] overflow-y-auto p-4" onClick={e => e.stopPropagation()}
            style={{ boxShadow: "0 -8px 40px rgba(0,0,0,0.3)" }}>
            <StarsPayment userId={String(user?.id || "0")} currentStars={starsBalance} onSuccess={loadData} />
          </div>
        </div>
      )}

      {showPremium && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/60 backdrop-blur-sm" onClick={() => setShowPremium(false)}>
          <div className="w-full rounded-t-3xl bg-card max-h-[90vh] overflow-y-auto p-4" onClick={e => e.stopPropagation()}
            style={{ boxShadow: "0 -8px 40px rgba(0,0,0,0.3)" }}>
            <PremiumPurchase userId={String(user?.id || "0")} currentStars={starsBalance}
              onSuccess={() => { setShowPremium(false); loadData(); }} />
          </div>
        </div>
      )}
    </div>
  );
}
