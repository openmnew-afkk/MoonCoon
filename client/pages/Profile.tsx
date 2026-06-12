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
    <div style={{ minHeight: "100dvh", background: "var(--bg)" }}>
      <div className="ios-blur" style={{ position: "sticky", top: 0, zIndex: 20, borderBottom: "0.5px solid var(--separator)", paddingTop: "calc(var(--tg-safe-top, 0px) + var(--tg-chrome-top, 52px))" }}>
        <div className="flex items-center gap-2 px-4 h-12">
          <button onClick={() => { setShowStars(false); loadData(); }} className="ios-btn-text" style={{ padding: "6px 12px", fontSize: 15 }}>
            ← Назад
          </button>
        </div>
      </div>
      <StarsPayment userId={String(user?.id || "")} currentStars={starsBalance} onSuccess={() => { setShowStars(false); loadData(); }} />
    </div>
  );

  if (showPremium) return (
    <div style={{ minHeight: "100dvh", background: "var(--bg)" }}>
      <div className="ios-blur" style={{ position: "sticky", top: 0, zIndex: 20, borderBottom: "0.5px solid var(--separator)", paddingTop: "calc(var(--tg-safe-top, 0px) + var(--tg-chrome-top, 52px))" }}>
        <div className="flex items-center gap-2 px-4 h-12">
          <button onClick={() => setShowPremium(false)} className="ios-btn-text" style={{ padding: "6px 12px", fontSize: 15 }}>
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

      <div className="flex justify-end gap-2 px-4 pt-3 pb-1">
        {isAdmin && (
          <Link to="/admin" className="ios-icon-btn">
            <Shield size={16} style={{ color: "var(--text-secondary)" }} />
          </Link>
        )}
        <Link to="/settings" className="ios-icon-btn">
          <Settings size={16} style={{ color: "var(--text-secondary)" }} />
        </Link>
      </div>

      <div className="flex flex-col items-center text-center px-5 pt-4 pb-8">
        <button type="button" onClick={() => fileRef.current?.click()} className="relative bg-transparent border-none cursor-pointer mb-5">
          <div className="w-24 h-24 rounded-full overflow-hidden" style={{ border: "2px solid var(--bg-tertiary)" }}>
            <img src={avatarSrc} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "var(--bg-tertiary)", border: "2px solid var(--bg)" }}>
            <Camera size={11} style={{ color: "var(--text-secondary)" }} />
          </div>
        </button>

        <h1 className="ios-title-large" style={{ margin: "0 0 4px" }}>{displayName}</h1>
        <p className="ios-subhead" style={{ color: "var(--text-secondary)" }}>{username}</p>
        {bio && <p className="ios-caption" style={{ color: "var(--text-tertiary)", marginTop: 8, maxWidth: 260 }}>{bio}</p>}

        {isPremium && (
          <div className="ios-badge ios-badge-gold" style={{ marginTop: 12 }}>
            <Crown size={12} />
            <span>Premium</span>
          </div>
        )}

        <Link to="/settings" className="ios-btn-ghost" style={{ marginTop: 16, padding: "6px 16px", fontSize: 13 }}>
          <Edit3 size={12} /> Редактировать
        </Link>
      </div>

      <div className="ios-card-grouped mx-4 mb-6">
        <div className="grid grid-cols-3">
          {[
            { label: "Постов", value: stats.posts },
            { label: "Звёзд", value: starsBalance },
            { label: "Получено", value: stats.starsReceived },
          ].map((s, i) => (
            <div key={s.label} className="ios-card-row" style={{ justifyContent: "center", padding: "16px 12px" }}>
              <div className="ios-title" style={{ color: "var(--text-primary)" }}>{s.value}</div>
              <div className="ios-caption" style={{ color: "var(--text-tertiary)", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="ios-card-grouped mx-4">
        <button onClick={() => setShowStars(true)} className="ios-card-row w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "var(--bg-tertiary)" }}>
              <span style={{ fontSize: 18 }}>⭐</span>
            </div>
            <div>
              <div className="ios-body" style={{ fontWeight: 500 }}>Пополнить звёзды</div>
              <div className="ios-caption" style={{ color: "var(--text-tertiary)", marginTop: 2 }}>Баланс: {starsBalance} ⭐</div>
            </div>
          </div>
          <ChevronRight size={16} style={{ color: "var(--text-tertiary)" }} />
        </button>

        {!isPremium && (
          <button onClick={() => setShowPremium(true)} className="ios-card-row w-full">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "var(--bg-tertiary)" }}>
                <Crown size={16} style={{ color: "var(--yellow)" }} />
              </div>
              <div>
                <div className="ios-body" style={{ fontWeight: 500, color: "var(--yellow)" }}>Получить Premium</div>
                <div className="ios-caption" style={{ color: "var(--text-tertiary)", marginTop: 2 }}>Эксклюзивные возможности</div>
              </div>
            </div>
            <ChevronRight size={16} style={{ color: "var(--text-tertiary)" }} />
          </button>
        )}

        <Link to="/create" className="ios-card-row" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "var(--bg-tertiary)" }}>
              <span style={{ fontSize: 18 }}>📸</span>
            </div>
            <div>
              <div className="ios-body" style={{ fontWeight: 500 }}>Создать публикацию</div>
              <div className="ios-caption" style={{ color: "var(--text-tertiary)", marginTop: 2 }}>Пост или история</div>
            </div>
          </div>
          <ChevronRight size={16} style={{ color: "var(--text-tertiary)" }} />
        </Link>
      </div>
    </div>
  );
}
