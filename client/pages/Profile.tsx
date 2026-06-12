import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Settings, Camera, Crown, Edit3, ChevronRight, Star, Shield } from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";
import { useAdmin } from "@/hooks/useAdmin";
import { usePremium } from "@/hooks/usePremium";
import StarsPayment from "@/components/StarsPayment";
import PremiumPurchase from "@/components/PremiumPurchase";

export default function Profile() {
  const { user } = useTelegram();
  const { isAdmin } = useAdmin();
  const { premium } = usePremium();
  const [showStars, setShowStars] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const [starsBalance, setStarsBalance] = useState(0);
  const [stats, setStats] = useState({ posts: 0, starsReceived: 0 });
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bio, setBio] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    const uid = String(user.id);
    try {
      const [statsRes, balRes, settingsRes] = await Promise.all([
        fetch(`/api/users/${uid}/stats`),
        fetch(`/api/stars/balance?userId=${uid}`),
        fetch(`/api/users/${uid}/settings`),
      ]);
      if (statsRes.ok) { const d = await statsRes.json(); setStats({ posts: d.posts ?? 0, starsReceived: d.starsReceived ?? 0 }); }
      if (balRes.ok) { const d = await balRes.json(); setStarsBalance(d.balance ?? 0); }
      if (settingsRes.ok) { const s = await settingsRes.json(); setAvatarUrl(s.avatarUrl || user.photo_url || ""); setBio(s.bio || ""); }
      else setAvatarUrl(user.photo_url || "");
    } catch {}
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  const displayName = [user?.first_name, user?.last_name].filter(Boolean).join(" ") || "Пользователь";
  const username = user?.username ? `@${user.username}` : "Telegram User";
  const avatarSrc = avatarUrl || `https://api.dicebear.com/9.x/thumbs/svg?seed=${user?.id || "u"}`;
  const isPremium = premium.isPremium;

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setAvatarUrl(dataUrl);
      await fetch(`/api/users/${user.id}/settings`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: dataUrl }),
      });
    };
    reader.readAsDataURL(file);
  };

  if (showStars) return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-20 border-b border-border/30"
        style={{ background: "hsl(var(--background) / 0.88)", backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)" }}>
        <div className="flex items-center gap-2 px-4 h-12">
          <button onClick={() => { setShowStars(false); loadData(); }} className="btn-ghost !px-3 !py-1.5 !text-sm !gap-1 !rounded-xl">
            ← Назад
          </button>
        </div>
      </div>
      <StarsPayment userId={String(user?.id || "")} currentStars={starsBalance} onSuccess={() => { setShowStars(false); loadData(); }} />
    </div>
  );

  if (showPremium) return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-20 border-b border-border/30"
        style={{ background: "hsl(var(--background) / 0.88)", backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)" }}>
        <div className="flex items-center gap-2 px-4 h-12">
          <button onClick={() => setShowPremium(false)} className="btn-ghost !px-3 !py-1.5 !text-sm !gap-1 !rounded-xl">
            ← Назад
          </button>
        </div>
      </div>
      <PremiumPurchase userId={String(user?.id || "")} currentStars={starsBalance} onSuccess={() => { setShowPremium(false); loadData(); }} />
    </div>
  );

  return (
    <div className="max-w-lg mx-auto pb-20">
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />

      <div className="flex justify-end gap-2 px-4 pt-2 pb-1">
        {isAdmin && (
          <Link to="/admin" className="btn-icon !w-9 !h-9">
            <Shield size={15} style={{ color: "hsl(var(--primary))" }} />
          </Link>
        )}
        <Link to="/settings" className="btn-icon !w-9 !h-9">
          <Settings size={15} style={{ color: "hsl(var(--muted-foreground) / 0.5)" }} />
        </Link>
      </div>

      <div className="flex flex-col items-center text-center px-5 pt-2 pb-7">
        <button type="button" onClick={() => fileRef.current?.click()} className="relative bg-transparent border-none cursor-pointer mb-4">
          {isPremium && (
            <div className="absolute -inset-1.5 rounded-full"
              style={{
                background: "conic-gradient(from 0deg, #3b82f6, #8b5cf6, #ec4899, #3b82f6)",
                animation: "profile-ring 4s linear infinite",
                boxShadow: "0 0 28px hsl(var(--primary) / 0.3)",
              }} />
          )}
          <div className="relative w-24 h-24 rounded-full overflow-hidden"
            style={{
              border: isPremium ? "3px solid hsl(var(--background))" : "2px solid hsl(var(--primary) / 0.2)",
            }}>
            <img src={avatarSrc} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-7 h-7 rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))",
              border: "2.5px solid hsl(var(--background))",
              boxShadow: "0 2px 10px hsl(var(--primary) / 0.4)",
            }}>
            <Camera size={11} style={{ color: "white" }} />
          </div>
        </button>

        <h1 className="text-2xl font-extrabold tracking-tight mb-1">{displayName}</h1>
        <p className="text-[13px] font-medium" style={{ color: "hsl(var(--primary) / 0.8)" }}>{username}</p>
        {bio && <p className="text-[13px] text-muted-foreground leading-relaxed max-w-[260px] mt-2">{bio}</p>}

        {isPremium && (
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full mt-3"
            style={{
              background: "linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(var(--accent) / 0.06))",
              border: "1px solid hsl(var(--primary) / 0.12)",
            }}>
            <Crown size={12} style={{ color: "hsl(var(--accent))" }} />
            <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "hsl(var(--accent))" }}>Premium</span>
          </div>
        )}

        <Link to="/settings" className="btn-ghost !px-4 !py-2 !text-xs !rounded-full mt-4">
          <Edit3 size={11} /> Редактировать
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-2 mx-4 mb-5">
        {[
          { label: "Постов", value: stats.posts, color: "hsl(var(--primary))" },
          { label: "Звёзд", value: starsBalance, color: "hsl(38,92%,50%)" },
          { label: "Получено", value: stats.starsReceived, color: "hsl(var(--accent))" },
        ].map((s) => (
          <div key={s.label} className="glass-card !p-4 !rounded-2xl text-center">
            <div className="text-2xl font-extrabold tracking-tight" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[10px] font-semibold uppercase tracking-wider mt-1" style={{ color: "hsl(var(--muted-foreground) / 0.7)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="px-4 flex flex-col gap-2">
        <button onClick={() => setShowStars(true)} className="section-card press-scale">
          <div className="setting-row">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                style={{ background: "hsl(38,92%,50%,0.08)", border: "1px solid hsl(38,92%,50%,0.12)" }}>⭐</div>
              <div className="text-left">
                <div className="text-sm font-bold">Пополнить звёзды</div>
                <div className="text-xs text-muted-foreground mt-0.5">Баланс: {starsBalance} ⭐</div>
              </div>
            </div>
            <ChevronRight size={16} className="text-muted-foreground" />
          </div>
        </button>

        {!isPremium && (
          <button onClick={() => setShowPremium(true)} className="press-scale" style={{
            width: "100%", borderRadius: 16, padding: "14px 16px",
            background: "linear-gradient(135deg, hsl(var(--primary) / 0.06), hsl(var(--accent) / 0.04))",
            border: "1px solid hsl(var(--primary) / 0.1)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            cursor: "pointer", WebkitTapHighlightColor: "transparent",
            boxShadow: "0 2px 16px hsl(var(--primary) / 0.04)",
            transition: "background 0.15s, border-color 0.15s",
          }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, hsl(var(--primary) / 0.1), hsl(var(--accent) / 0.08))",
                  border: "1px solid hsl(var(--primary) / 0.15)",
                }}>
                <Crown size={18} style={{ color: "hsl(var(--accent))" }} />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold" style={{ color: "hsl(var(--accent))" }}>Получить Premium</div>
                <div className="text-xs text-muted-foreground mt-0.5">Эксклюзивные возможности</div>
              </div>
            </div>
            <ChevronRight size={16} style={{ color: "hsl(var(--accent))" }} />
          </button>
        )}

        <Link to="/create" className="section-card press-scale" style={{ textDecoration: "none" }}>
          <div className="setting-row">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                style={{ background: "hsl(var(--primary),0.08)", border: "1px solid hsl(var(--primary) / 0.1)" }}>📸</div>
              <div className="text-left">
                <div className="text-sm font-bold">Создать публикацию</div>
                <div className="text-xs text-muted-foreground mt-0.5">Пост или история</div>
              </div>
            </div>
            <ChevronRight size={16} className="text-muted-foreground" />
          </div>
        </Link>
      </div>

      <style>{`
        @keyframes profile-ring {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
