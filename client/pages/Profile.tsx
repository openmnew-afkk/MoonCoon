import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Settings, Camera, Grid3X3, Bookmark, Star,
  Crown, Edit3, ChevronRight, TrendingUp
} from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";
import { useAdmin } from "@/hooks/useAdmin";
import { usePremium } from "@/hooks/usePremium";
import StarsPayment from "@/components/StarsPayment";
import PremiumPurchase from "@/components/PremiumPurchase";

const VIOLET = "rgba(155,89,247,";
const V = (a: number) => `${VIOLET}${a})`;

export default function Profile() {
  const { user } = useTelegram();
  const { isAdmin } = useAdmin();
  const { premium } = usePremium();
  const [showStars, setShowStars] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const [tab, setTab] = useState<"posts" | "saved">("posts");
  const [starsBalance, setStarsBalance] = useState(0);
  const [stats, setStats] = useState({ posts: 0, starsReceived: 0 });
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bio, setBio] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

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
      if (statsRes.ok) { const d = await statsRes.json(); setStats({ posts: d.posts ?? 0, starsReceived: d.starsReceived ?? 0 }); }
      if (balRes.ok) { const d = await balRes.json(); setStarsBalance(d.balance ?? 0); }
      if (settingsRes.ok) { const s = await settingsRes.json(); setAvatarUrl(s.avatarUrl || user.photo_url || ""); setBio(s.bio || ""); }
      else setAvatarUrl(user.photo_url || "");
    } catch { /* ignore */ }
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
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: dataUrl }),
      });
    };
    reader.readAsDataURL(file);
  };

  if (showStars) return (
    <div className="min-h-screen bg-background">
      <div className="px-4 h-14 flex items-center border-b border-border" style={{ paddingTop: safeTop }}>
        <button onClick={() => setShowStars(false)} className="text-primary text-sm font-semibold">← Назад</button>
      </div>
      <StarsPayment userId={String(user?.id || "")} currentStars={starsBalance} onSuccess={() => { setShowStars(false); loadData(); }} />
    </div>
  );

  if (showPremium) return (
    <div className="min-h-screen bg-background">
      <div className="px-4 h-14 flex items-center border-b border-border" style={{ paddingTop: safeTop }}>
        <button onClick={() => setShowPremium(false)} className="text-primary text-sm font-semibold">← Назад</button>
      </div>
      <PremiumPurchase userId={String(user?.id || "")} currentStars={starsBalance} onSuccess={() => { setShowPremium(false); loadData(); }} />
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-32 max-w-lg mx-auto" style={{ fontFamily: "Inter, sans-serif" }}>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />

      {/* ─── Hero Section ─────────────────────────────────────────────── */}
      <div className="relative" style={{ paddingTop: safeTop }}>
        {/* Ambient violet blobs behind */}
        <div style={{
          position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
          width: "140%", height: 260,
          background: `radial-gradient(ellipse 70% 80% at 50% 0%, ${V(0.18)} 0%, transparent 70%)`,
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", top: 40, right: -40,
          width: 200, height: 200, borderRadius: "50%",
          background: `radial-gradient(circle, ${V(0.1)}, transparent 70%)`,
          filter: "blur(40px)", pointerEvents: "none",
        }} />

        {/* Top bar */}
        <div className="relative flex items-center justify-between px-5 pt-3 pb-2 z-10">
          <div />
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link to="/admin" className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: `${V(0.15)}`, border: `1px solid ${V(0.3)}` }}>
                <Crown size={16} style={{ color: "#c084fc" }} />
              </Link>
            )}
            <Link to="/settings" className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(155,89,247,0.15)" }}>
              <Settings size={16} className="text-muted-foreground" />
            </Link>
          </div>
        </div>

        {/* Avatar + Identity */}
        <div className="relative flex flex-col items-center text-center px-5 pt-4 pb-8 z-10">
          {/* Avatar */}
          <button type="button" onClick={() => fileRef.current?.click()} className="relative group mb-4">
            {/* Premium ring */}
            {isPremium && (
              <div style={{
                position: "absolute", inset: -3, borderRadius: "50%",
                background: "conic-gradient(from 0deg, #c084fc, #9b59f7, #7c3aed, #c084fc)",
                animation: "adel-ring-spin 4s linear infinite",
              }} />
            )}
            <div style={{
              position: "relative",
              width: 96, height: 96,
              borderRadius: "50%",
              border: isPremium ? "3px solid #070510" : `2px solid ${V(0.3)}`,
              boxShadow: isPremium
                ? `0 0 30px ${V(0.5)}, 0 8px 32px rgba(0,0,0,0.4)`
                : `0 0 20px ${V(0.25)}, 0 8px 24px rgba(0,0,0,0.3)`,
              overflow: "hidden",
            }}>
              <img src={avatarSrc} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            {/* Camera badge */}
            <div style={{
              position: "absolute", bottom: 0, right: 0,
              width: 28, height: 28, borderRadius: "50%",
              background: "linear-gradient(135deg, #9b59f7, #7c3aed)",
              border: "2px solid #070510",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 4px 12px ${V(0.5)}`,
            }} className="transition-transform group-active:scale-90">
              <Camera size={12} style={{ color: "white" }} />
            </div>
          </button>

          {/* Name */}
          <h1 style={{
            fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em",
            background: "linear-gradient(135deg, #ffffff 0%, #e2d9ff 100%)",
            WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
            marginBottom: 2,
          }}>{displayName}</h1>
          <p style={{ fontSize: 13, color: "rgba(155,89,247,0.7)", fontWeight: 500, marginBottom: 4 }}>{username}</p>
          {bio && <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.5, maxWidth: 260, marginBottom: 4 }}>{bio}</p>}

          {/* Premium badge */}
          {isPremium && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "4px 12px", borderRadius: 20,
              background: `linear-gradient(135deg, ${V(0.2)}, rgba(124,58,237,0.15))`,
              border: `1px solid ${V(0.35)}`,
              marginTop: 6,
            }}>
              <Crown size={11} style={{ color: "#c084fc" }} />
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#c084fc" }}>Premium</span>
            </div>
          )}

          {/* Edit bio link */}
          <Link to="/settings" style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            marginTop: 10, padding: "6px 14px", borderRadius: 20,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)",
          }}>
            <Edit3 size={11} /> Редактировать профиль
          </Link>
        </div>
      </div>

      {/* ─── Stats Row ────────────────────────────────────────────────── */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
        gap: 1, margin: "0 16px 20px",
        background: `${V(0.1)}`,
        border: `1px solid ${V(0.15)}`,
        borderRadius: 20, overflow: "hidden",
      }}>
        {[
          { label: "Постов", value: stats.posts },
          { label: "⭐ Звёзд", value: starsBalance },
          { label: "Получено", value: stats.starsReceived },
        ].map((s, i) => (
          <div key={i} style={{
            padding: "16px 12px", textAlign: "center",
            background: "rgba(7,5,16,0.6)",
            borderRight: i < 2 ? `1px solid ${V(0.12)}` : "none",
          }}>
            <div style={{
              fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em",
              background: "linear-gradient(135deg, #e2d9ff, #9b59f7)",
              WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
            }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 500, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ─── Action Cards ─────────────────────────────────────────────── */}
      <div style={{ padding: "0 16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Stars card */}
        <button onClick={() => setShowStars(true)} style={{
          width: "100%", borderRadius: 18, padding: "16px 18px",
          background: `linear-gradient(135deg, rgba(16,12,30,0.95), rgba(20,14,38,0.9))`,
          border: `1px solid ${V(0.2)}`,
          boxShadow: `0 4px 20px rgba(0,0,0,0.3), 0 0 0 0 ${V(0.2)}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          cursor: "pointer", transition: "all 0.2s",
          WebkitTapHighlightColor: "transparent",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14,
              background: `linear-gradient(135deg, ${V(0.25)}, rgba(124,58,237,0.2))`,
              border: `1px solid ${V(0.3)}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20,
            }}>⭐</div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "white" }}>Пополнить звёзды</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 1 }}>Баланс: {starsBalance} ⭐</div>
            </div>
          </div>
          <ChevronRight size={18} style={{ color: V(0.6) }} />
        </button>

        {/* Premium card */}
        {!isPremium && (
          <button onClick={() => setShowPremium(true)} style={{
            width: "100%", borderRadius: 18, padding: "16px 18px",
            background: `linear-gradient(135deg, rgba(155,89,247,0.15), rgba(124,58,237,0.08))`,
            border: `1px solid ${V(0.3)}`,
            boxShadow: `0 4px 24px ${V(0.15)}`,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            cursor: "pointer", transition: "all 0.2s",
            WebkitTapHighlightColor: "transparent",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 14,
                background: `linear-gradient(135deg, ${V(0.4)}, rgba(124,58,237,0.3))`,
                border: `1px solid ${V(0.5)}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Crown size={20} style={{ color: "#c084fc" }} />
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{
                  fontSize: 15, fontWeight: 700,
                  background: "linear-gradient(135deg, #c084fc, #9b59f7)",
                  WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
                }}>Получить Premium</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 1 }}>Эксклюзивные возможности</div>
              </div>
            </div>
            <ChevronRight size={18} style={{ color: "#9b59f7" }} />
          </button>
        )}
      </div>

      {/* ─── Tab Switcher ─────────────────────────────────────────────── */}
      <div style={{
        display: "flex", margin: "0 16px 16px",
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${V(0.1)}`,
        borderRadius: 16, padding: 4, gap: 4,
      }}>
        {[
          { key: "posts", icon: <Grid3X3 size={15} />, label: "Посты" },
          { key: "saved", icon: <Bookmark size={15} />, label: "Сохранено" },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)} style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            padding: "10px 0", borderRadius: 12,
            background: tab === t.key ? `linear-gradient(135deg, ${V(0.25)}, rgba(124,58,237,0.15))` : "transparent",
            border: tab === t.key ? `1px solid ${V(0.3)}` : "1px solid transparent",
            color: tab === t.key ? "#c084fc" : "rgba(255,255,255,0.35)",
            fontSize: 13, fontWeight: tab === t.key ? 700 : 500,
            transition: "all 0.2s cubic-bezier(0.34,1.56,0.64,1)",
            boxShadow: tab === t.key ? `0 4px 16px ${V(0.2)}` : "none",
            cursor: "pointer", WebkitTapHighlightColor: "transparent",
          }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ─── Content Grid ─────────────────────────────────────────────── */}
      <div style={{ padding: "0 16px" }}>
        {stats.posts === 0 ? (
          <div style={{
            textAlign: "center", padding: "48px 24px",
            borderRadius: 24,
            background: "rgba(255,255,255,0.02)",
            border: `1px dashed ${V(0.15)}`,
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>{tab === "posts" ? "📸" : "🔖"}</div>
            <p style={{ fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.6)", marginBottom: 6 }}>
              {tab === "posts" ? "Нет публикаций" : "Нет сохранённых"}
            </p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>
              {tab === "posts" ? "Создай первый пост и поделись моментом" : "Сохраняй понравившиеся посты"}
            </p>
            {tab === "posts" && (
              <Link to="/create" style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                marginTop: 20, padding: "10px 20px", borderRadius: 20,
                background: `linear-gradient(135deg, #9b59f7, #7c3aed)`,
                color: "white", fontSize: 13, fontWeight: 700,
                boxShadow: `0 6px 20px ${V(0.4)}`,
                textDecoration: "none",
              }}>
                Создать пост
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 3 }}>
            {Array.from({ length: stats.posts }, (_, i) => (
              <div key={i} style={{
                aspectRatio: "1", borderRadius: i === 0 ? "16px 0 0 0" : i === 2 ? "0 16px 0 0" : 0,
                background: `linear-gradient(135deg, ${V(0.1)}, rgba(124,58,237,0.05))`,
                border: `1px solid ${V(0.08)}`,
              }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
