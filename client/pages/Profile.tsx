import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Settings, Camera, Grid3X3, Bookmark, Crown, Edit3, ChevronRight } from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";
import { useAdmin } from "@/hooks/useAdmin";
import { usePremium } from "@/hooks/usePremium";
import StarsPayment from "@/components/StarsPayment";
import PremiumPurchase from "@/components/PremiumPurchase";

const ACCENT = "#CBFF4D";

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
    <div style={{ minHeight: "100vh", background: "#0a0a0f" }}>
      <div style={{ padding: "0 16px", height: 56, display: "flex", alignItems: "center", borderBottom: `1px solid ${ACCENT}08`, paddingTop: safeTop }}>
        <button onClick={() => setShowStars(false)} style={{ color: ACCENT, fontSize: 14, fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>← Назад</button>
      </div>
      <StarsPayment userId={String(user?.id || "")} currentStars={starsBalance} onSuccess={() => { setShowStars(false); loadData(); }} />
    </div>
  );

  if (showPremium) return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f" }}>
      <div style={{ padding: "0 16px", height: 56, display: "flex", alignItems: "center", borderBottom: `1px solid ${ACCENT}08`, paddingTop: safeTop }}>
        <button onClick={() => setShowPremium(false)} style={{ color: ACCENT, fontSize: 14, fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>← Назад</button>
      </div>
      <PremiumPurchase userId={String(user?.id || "")} currentStars={starsBalance} onSuccess={() => { setShowPremium(false); loadData(); }} />
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", paddingBottom: 120, maxWidth: 480, margin: "0 auto", fontFamily: "Inter, sans-serif" }}>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} />

      {/* Hero */}
      <div style={{ position: "relative", paddingTop: safeTop }}>
        {/* Ambient glow */}
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "120%", height: 220, background: `radial-gradient(ellipse 70% 80% at 50% 0%, rgba(203,255,77,0.08) 0%, transparent 70%)`, pointerEvents: "none" }} />

        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", position: "relative", zIndex: 10 }}>
          <div />
          <div style={{ display: "flex", gap: 8 }}>
            {isAdmin && (
              <Link to="/admin" style={{ width: 36, height: 36, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: `rgba(203,255,77,0.08)`, border: `1px solid ${ACCENT}20`, textDecoration: "none" }}>
                <Crown size={15} style={{ color: ACCENT }} />
              </Link>
            )}
            <Link to="/settings" style={{ width: 36, height: 36, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", textDecoration: "none" }}>
              <Settings size={15} style={{ color: "rgba(148,163,184,0.6)" }} />
            </Link>
          </div>
        </div>

        {/* Avatar + Identity */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "16px 20px 32px", position: "relative", zIndex: 10 }}>
          <button type="button" onClick={() => fileRef.current?.click()} style={{ position: "relative", background: "none", border: "none", cursor: "pointer", marginBottom: 16 }}>
            {isPremium && <div style={{ position: "absolute", inset: -3, borderRadius: "50%", background: `conic-gradient(from 0deg, ${ACCENT}, #a3e635, #84cc16, ${ACCENT})`, animation: "adel-ring-spin 4s linear infinite" }} />}
            <div style={{
              position: "relative", width: 88, height: 88, borderRadius: "50%",
              border: isPremium ? "3px solid #0a0a0f" : `2px solid ${ACCENT}30`,
              boxShadow: `0 0 24px ${ACCENT}15`, overflow: "hidden",
            }}>
              <img src={avatarSrc} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ position: "absolute", bottom: 0, right: 0, width: 26, height: 26, borderRadius: "50%", background: `linear-gradient(135deg, ${ACCENT}, #a3e635)`, border: "2px solid #0a0a0f", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Camera size={11} style={{ color: "#0a0a0f" }} />
            </div>
          </button>

          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", background: "linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", margin: "0 0 4px" }}>{displayName}</h1>
          <p style={{ fontSize: 13, color: `${ACCENT}99`, fontWeight: 500, margin: "0 0 4px" }}>{username}</p>
          {bio && <p style={{ fontSize: 13, color: "rgba(148,163,184,0.5)", lineHeight: 1.5, maxWidth: 260, margin: "4px 0 0" }}>{bio}</p>}

          {isPremium && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 12px", borderRadius: 20, background: `rgba(203,255,77,0.08)`, border: `1px solid ${ACCENT}25`, marginTop: 8 }}>
              <Crown size={11} style={{ color: ACCENT }} />
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: ACCENT }}>Premium</span>
            </div>
          )}

          <Link to="/settings" style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 12, padding: "7px 16px", borderRadius: 20, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", fontSize: 12, fontWeight: 600, color: "rgba(148,163,184,0.5)", textDecoration: "none" }}>
            <Edit3 size={11} /> Редактировать профиль
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, margin: "0 16px 20px", background: `rgba(203,255,77,0.04)`, border: `1px solid ${ACCENT}0a`, borderRadius: 18, overflow: "hidden" }}>
        {[{ label: "Постов", value: stats.posts }, { label: "⭐ Звёзд", value: starsBalance }, { label: "Получено", value: stats.starsReceived }].map((s, i) => (
          <div key={i} style={{ padding: "16px 12px", textAlign: "center", background: "rgba(10,10,15,0.8)", borderRight: i < 2 ? `1px solid ${ACCENT}08` : "none" }}>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", background: `linear-gradient(135deg, #f0fdf4, ${ACCENT})`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "rgba(148,163,184,0.4)", fontWeight: 500, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Action Cards */}
      <div style={{ padding: "0 16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        <button onClick={() => setShowStars(true)} style={{ width: "100%", borderRadius: 16, padding: "14px 16px", background: "rgba(15,15,25,0.9)", border: `1px solid ${ACCENT}0c`, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", WebkitTapHighlightColor: "transparent" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: `rgba(203,255,77,0.08)`, border: `1px solid ${ACCENT}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⭐</div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>Пополнить звёзды</div>
              <div style={{ fontSize: 12, color: "rgba(148,163,184,0.4)", marginTop: 1 }}>Баланс: {starsBalance} ⭐</div>
            </div>
          </div>
          <ChevronRight size={16} style={{ color: `${ACCENT}50` }} />
        </button>

        {!isPremium && (
          <button onClick={() => setShowPremium(true)} style={{ width: "100%", borderRadius: 16, padding: "14px 16px", background: `rgba(203,255,77,0.04)`, border: `1px solid ${ACCENT}18`, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", WebkitTapHighlightColor: "transparent" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: `rgba(203,255,77,0.12)`, border: `1px solid ${ACCENT}25`, display: "flex", alignItems: "center", justifyContent: "center" }}><Crown size={18} style={{ color: ACCENT }} /></div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 14, fontWeight: 700, background: `linear-gradient(135deg, ${ACCENT}, #a3e635)`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>Получить Premium</div>
                <div style={{ fontSize: 12, color: "rgba(148,163,184,0.4)", marginTop: 1 }}>Эксклюзивные возможности</div>
              </div>
            </div>
            <ChevronRight size={16} style={{ color: ACCENT }} />
          </button>
        )}
      </div>

      {/* Tab Switcher */}
      <div style={{ display: "flex", margin: "0 16px 16px", background: "rgba(255,255,255,0.02)", border: `1px solid ${ACCENT}08`, borderRadius: 14, padding: 3, gap: 3 }}>
        {[
          { key: "posts", icon: <Grid3X3 size={14} />, label: "Посты" },
          { key: "saved", icon: <Bookmark size={14} />, label: "Сохранено" },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)} style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            padding: "10px 0", borderRadius: 11,
            background: tab === t.key ? `rgba(203,255,77,0.08)` : "transparent",
            border: tab === t.key ? `1px solid ${ACCENT}18` : "1px solid transparent",
            color: tab === t.key ? ACCENT : "rgba(148,163,184,0.35)",
            fontSize: 13, fontWeight: tab === t.key ? 700 : 500,
            cursor: "pointer", transition: "all 0.2s", WebkitTapHighlightColor: "transparent",
          }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Content Grid */}
      <div style={{ padding: "0 16px" }}>
        {stats.posts === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 24px", borderRadius: 20, background: "rgba(255,255,255,0.01)", border: `1px dashed ${ACCENT}12` }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>{tab === "posts" ? "📸" : "🔖"}</div>
            <p style={{ fontSize: 15, fontWeight: 600, color: "rgba(226,232,240,0.6)", marginBottom: 6 }}>{tab === "posts" ? "Нет публикаций" : "Нет сохранённых"}</p>
            <p style={{ fontSize: 13, color: "rgba(148,163,184,0.3)" }}>{tab === "posts" ? "Создай первый пост и поделись моментом" : "Сохраняй понравившиеся посты"}</p>
            {tab === "posts" && (
              <Link to="/create" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 20, padding: "10px 20px", borderRadius: 14, background: `linear-gradient(135deg, ${ACCENT}, #a3e635)`, color: "#0a0a0f", fontSize: 13, fontWeight: 700, boxShadow: `0 6px 20px ${ACCENT}40`, textDecoration: "none" }}>Создать пост</Link>
            )}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2 }}>
            {Array.from({ length: stats.posts }, (_, i) => (
              <div key={i} style={{ aspectRatio: "1", borderRadius: i === 0 ? "12px 0 0 0" : i === 2 ? "0 12px 0 0" : 0, background: `rgba(203,255,77,0.03)`, border: `1px solid ${ACCENT}06` }} />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes adel-ring-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
