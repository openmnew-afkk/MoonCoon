import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Settings, Camera, Crown, Edit3, ChevronRight, Star, ImageIcon } from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";
import { useAdmin } from "@/hooks/useAdmin";
import { usePremium } from "@/hooks/usePremium";
import StarsPayment from "@/components/StarsPayment";
import PremiumPurchase from "@/components/PremiumPurchase";

const A = "#CBFF4D";

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

  /* ── Stars Sheet ── */
  if (showStars) return (
    <div style={{ minHeight: "100dvh", background: "#0a0a0f" }}>
      <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <button onClick={() => { setShowStars(false); loadData(); }} style={{ color: A, fontSize: 14, fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>← Назад</button>
      </div>
      <StarsPayment userId={String(user?.id || "")} currentStars={starsBalance} onSuccess={() => { setShowStars(false); loadData(); }} />
    </div>
  );

  /* ── Premium Sheet ── */
  if (showPremium) return (
    <div style={{ minHeight: "100dvh", background: "#0a0a0f" }}>
      <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <button onClick={() => setShowPremium(false)} style={{ color: A, fontSize: 14, fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>← Назад</button>
      </div>
      <PremiumPurchase userId={String(user?.id || "")} currentStars={starsBalance} onSuccess={() => { setShowPremium(false); loadData(); }} />
    </div>
  );

  return (
    <div style={{
      background: "#0a0a0f",
      paddingBottom: 20, maxWidth: 480, margin: "0 auto",
      fontFamily: "Inter, sans-serif",
    }}>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} />

      {/* ── Top Row ── */}
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "8px 16px", gap: 8 }}>
        {isAdmin && (
          <Link to="/admin" style={{
            width: 36, height: 36, borderRadius: 12,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: `${A}0c`, border: `1px solid ${A}18`, textDecoration: "none",
          }}>
            <Crown size={15} style={{ color: A }} />
          </Link>
        )}
        <Link to="/settings" style={{
          width: 36, height: 36, borderRadius: 12,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", textDecoration: "none",
        }}>
          <Settings size={15} style={{ color: "rgba(148,163,184,0.5)" }} />
        </Link>
      </div>

      {/* ── Avatar + Name ── */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "8px 20px 24px" }}>
        <button type="button" onClick={() => fileRef.current?.click()} style={{ position: "relative", background: "none", border: "none", cursor: "pointer", marginBottom: 14 }}>
          {isPremium && (
            <div style={{
              position: "absolute", inset: -4, borderRadius: "50%",
              background: `conic-gradient(from 0deg, ${A}, #a3e635, #84cc16, ${A})`,
              animation: "profile-ring 4s linear infinite",
            }} />
          )}
          <div style={{
            position: "relative", width: 84, height: 84, borderRadius: "50%",
            border: isPremium ? "3px solid #0a0a0f" : `2px solid ${A}25`,
            overflow: "hidden",
          }}>
            <img src={avatarSrc} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div style={{
            position: "absolute", bottom: 0, right: -2, width: 26, height: 26, borderRadius: "50%",
            background: `linear-gradient(135deg, ${A}, #a3e635)`,
            border: "2.5px solid #0a0a0f",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Camera size={11} style={{ color: "#0a0a0f" }} />
          </div>
        </button>

        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9", margin: "0 0 3px", letterSpacing: "-0.02em" }}>{displayName}</h1>
        <p style={{ fontSize: 13, color: `${A}88`, fontWeight: 500, margin: 0 }}>{username}</p>
        {bio && <p style={{ fontSize: 13, color: "rgba(148,163,184,0.45)", lineHeight: 1.5, maxWidth: 260, margin: "6px 0 0" }}>{bio}</p>}

        {isPremium && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 12px", borderRadius: 20, background: `${A}0c`, border: `1px solid ${A}20`, marginTop: 8 }}>
            <Crown size={11} style={{ color: A }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: A }}>Premium</span>
          </div>
        )}

        <Link to="/settings" style={{
          display: "inline-flex", alignItems: "center", gap: 5, marginTop: 12,
          padding: "8px 18px", borderRadius: 20,
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
          fontSize: 12, fontWeight: 600, color: "rgba(148,163,184,0.5)", textDecoration: "none",
        }}>
          <Edit3 size={11} /> Редактировать
        </Link>
      </div>

      {/* ── Stats ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, margin: "0 16px 16px" }}>
        {[
          { label: "Постов", value: stats.posts, emoji: "📸" },
          { label: "Звёзд", value: starsBalance, emoji: "⭐" },
          { label: "Получено", value: stats.starsReceived, emoji: "🎁" },
        ].map((s) => (
          <div key={s.label} style={{
            padding: "14px 10px", textAlign: "center", borderRadius: 16,
            background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)",
          }}>
            <div style={{ fontSize: 16, marginBottom: 4 }}>{s.emoji}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.02em" }}>{s.value}</div>
            <div style={{ fontSize: 10, color: "rgba(148,163,184,0.35)", fontWeight: 500, marginTop: 2, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Actions ── */}
      <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 8 }}>
        {/* Stars */}
        <button onClick={() => setShowStars(true)} style={{
          width: "100%", borderRadius: 16, padding: "14px 16px",
          background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          cursor: "pointer", WebkitTapHighlightColor: "transparent",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: `${A}0a`, border: `1px solid ${A}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⭐</div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>Пополнить звёзды</div>
              <div style={{ fontSize: 12, color: "rgba(148,163,184,0.4)", marginTop: 1 }}>Баланс: {starsBalance} ⭐</div>
            </div>
          </div>
          <ChevronRight size={16} style={{ color: `${A}40` }} />
        </button>

        {/* Premium */}
        {!isPremium && (
          <button onClick={() => setShowPremium(true)} style={{
            width: "100%", borderRadius: 16, padding: "14px 16px",
            background: `${A}06`, border: `1px solid ${A}15`,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            cursor: "pointer", WebkitTapHighlightColor: "transparent",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: `${A}10`, border: `1px solid ${A}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Crown size={18} style={{ color: A }} />
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: A }}>Получить Premium</div>
                <div style={{ fontSize: 12, color: "rgba(148,163,184,0.4)", marginTop: 1 }}>Эксклюзивные возможности</div>
              </div>
            </div>
            <ChevronRight size={16} style={{ color: A }} />
          </button>
        )}

        {/* Create post */}
        <Link to="/create" style={{
          width: "100%", borderRadius: 16, padding: "14px 16px",
          background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          textDecoration: "none", WebkitTapHighlightColor: "transparent",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📸</div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>Создать публикацию</div>
              <div style={{ fontSize: 12, color: "rgba(148,163,184,0.4)", marginTop: 1 }}>Пост или история</div>
            </div>
          </div>
          <ChevronRight size={16} style={{ color: "rgba(148,163,184,0.3)" }} />
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
