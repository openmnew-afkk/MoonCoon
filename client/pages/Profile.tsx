import { Camera, ChevronRight, Star, Sparkles, Settings } from "lucide-react";
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
  const username = user?.username ? `@${user.username}` : "Telegram";
  const avatarSrc = avatarUrl || `https://api.dicebear.com/9.x/thumbs/svg?seed=${user?.id || "u"}`;
  const isPremium = premium.isPremium;

  return (
    <div className="min-h-screen bg-background pb-28 max-w-lg mx-auto">
      <div className="flex justify-end px-4 pt-2" style={{ paddingTop: `calc(${safeTop} + 4px)` }}>
        <Link to="/settings" className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
          <Settings size={18} />
        </Link>
      </div>

      <div className="px-5 pb-6 flex flex-col items-center text-center">
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
        <button type="button" onClick={() => document.getElementById("avatarInput")?.click()} className="relative">
          <img src={avatarSrc} alt="" className="w-[88px] h-[88px] rounded-full object-cover ring-2 ring-border" />
          <span className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary flex items-center justify-center border-2 border-background">
            <Camera size={13} className="text-primary-foreground" />
          </span>
        </button>
        <h1 className="mt-3 text-xl font-semibold">{displayName}</h1>
        <p className="text-sm text-muted-foreground">{username}</p>
        {bio && <p className="text-sm text-foreground/70 mt-2 max-w-xs">{bio}</p>}
        {isPremium && (
          <span className="mt-2 text-[10px] font-bold uppercase tracking-wide text-primary flex items-center gap-1">
            <Sparkles size={10} /> Premium
          </span>
        )}
        {!user && (
          <p className="mt-3 text-xs text-amber-500">Откройте приложение через Telegram для синхронизации аккаунта</p>
        )}
      </div>

      <div className="mx-5 grid grid-cols-3 gap-2 mb-5">
        {[
          { v: stats.posts, l: "постов" },
          { v: starsBalance, l: "звёзд" },
          { v: stats.starsReceived, l: "получено ⭐" },
        ].map(s => (
          <div key={s.l} className="rounded-xl bg-card border border-border py-3 text-center">
            <p className="text-lg font-bold tabular-nums">{s.v}</p>
            <p className="text-[10px] text-muted-foreground uppercase">{s.l}</p>
          </div>
        ))}
      </div>

      <div className="mx-5 space-y-2">
        <button type="button" onClick={() => setShowStars(true)}
          className="w-full flex items-center gap-3 p-4 rounded-xl bg-card border border-border text-left">
          <Star className="text-primary fill-primary" size={20} />
          <div className="flex-1">
            <p className="font-medium text-sm">Звёзды Telegram</p>
            <p className="text-xs text-muted-foreground">Купить · вывести · история</p>
          </div>
          <ChevronRight size={16} className="text-muted-foreground" />
        </button>

        <button type="button" onClick={() => setShowPremium(true)}
          className="w-full flex items-center gap-3 p-4 rounded-xl bg-card border border-border text-left">
          <Sparkles size={20} className="text-primary" />
          <div className="flex-1">
            <p className="font-medium text-sm">Premium</p>
            <p className="text-xs text-muted-foreground">Расширенные возможности {APP_NAME}</p>
          </div>
          <ChevronRight size={16} className="text-muted-foreground" />
        </button>

        <button type="button" onClick={() => navigate("/")}
          className="w-full flex items-center justify-between p-4 rounded-xl bg-card border border-border text-[15px]">
          Мои публикации
          <ChevronRight size={16} className="text-muted-foreground" />
        </button>

        <button type="button" onClick={() => navigate("/stars-history")}
          className="w-full flex items-center justify-between p-4 rounded-xl bg-card border border-border text-[15px]">
          История операций
          <ChevronRight size={16} className="text-muted-foreground" />
        </button>

        {isAdmin && (
          <button type="button" onClick={() => setShowAdmin(true)}
            className="w-full py-3 rounded-xl border border-primary/30 text-primary text-sm font-medium">
            Админ-панель
          </button>
        )}
      </div>

      {showStars && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/50" onClick={() => { setShowStars(false); loadData(); }}>
          <div className="w-full rounded-t-3xl bg-card max-h-[90vh] overflow-y-auto p-4" onClick={e => e.stopPropagation()}>
            <StarsPayment userId={String(user?.id || "0")} currentStars={starsBalance} onSuccess={loadData} />
          </div>
        </div>
      )}

      {showPremium && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/50" onClick={() => setShowPremium(false)}>
          <div className="w-full rounded-t-3xl bg-card max-h-[90vh] overflow-y-auto p-4" onClick={e => e.stopPropagation()}>
            <PremiumPurchase userId={String(user?.id || "0")} currentStars={starsBalance}
              onSuccess={() => { setShowPremium(false); loadData(); }} />
          </div>
        </div>
      )}
    </div>
  );
}
