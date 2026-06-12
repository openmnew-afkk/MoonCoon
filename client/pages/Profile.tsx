import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Settings, Camera, Crown, Edit3, ChevronRight, Star, ImageIcon, Shield } from "lucide-react";
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
    <div style={{ minHeight: "100dvh", background: "hsl(var(--background))" }}>
      <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", borderBottom: "1px solid hsl(var(--border) / 0.3)" }}>
        <button onClick={() => { setShowStars(false); loadData(); }} style={{ color: "#60a5fa", fontSize: 14, fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>← Назад</button>
      </div>
      <StarsPayment userId={String(user?.id || "")} currentStars={starsBalance} onSuccess={() => { setShowStars(false); loadData(); }} />
    </div>
  );

  if (showPremium) return (
    <div style={{ minHeight: "100dvh", background: "hsl(var(--background))" }}>
      <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", borderBottom: "1px solid hsl(var(--border) / 0.3)" }}>
        <button onClick={() => setShowPremium(false)} style={{ color: "#60a5fa", fontSize: 14, fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>← Назад</button>
      </div>
      <PremiumPurchase userId={String(user?.id || "")} currentStars={starsBalance} onSuccess={() => { setShowPremium(false); loadData(); }} />
    </div>
  );

  return (
    <div style={{
      background: "hsl(var(--background))",
      paddingBottom: 20, maxWidth: 480, margin: "0 auto",
      fontFamily: "Inter, sans-serif",
    }}>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} />

      {/* Top Row */}
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "8px 16px", gap: 8 }}>
        {isAdmin && (
          <Link to="/admin" style={{
            width: 36, height: 36, borderRadius: 12,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.12)", textDecoration: "none",
          }}>
            <Shield size={15} style={{ color: "#60a5fa" }} />
          </Link>
        )}
        <Link to="/settings" style={{
          width: 36, height: 36, borderRadius: 12,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", textDecoration: "none",
        }}>
          <Settings size={15} style={{ color: "rgba(148,163,184,0.5)" }} />
        </Link>
      </div>

      {/* Avatar + Name */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "8px 20px 28px" }}>
        <button type="button" onClick={() => fileRef.current?.click()} style={{ position: "relative", background: "none", border: "none", cursor: "pointer", marginBottom: 16 }}>
          {isPremium && (
            <div style={{
              position: "absolute", inset: -5, borderRadius: "50%",
              background: "conic-gradient(from 0deg, #3b82f6, #8b5cf6, #ec4899, #3b82f6)",
              animation: "profile-ring 4s linear infinite",
              boxShadow: "0 0 24px rgba(59,130,246,0.3)",
            }} />
          )}
          <div style={{
            position: "relative", width: 88, height: 88, borderRadius: "50%",
            border: isPremium ? "3px solid hsl(var(--background))" : "2px solid rgba(59,130,246,0.2)",
            overflow: "hidden",
          }}>
            <img src={avatarSrc} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div style={{
            position: "absolute", bottom: 0, right: -2, width: 28, height: 28, borderRadius: "50%",
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            border: "2.5px solid hsl(var(--background))",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 8px rgba(59,130,246,0.4)",
          }}>
            <Camera size={11} style={{ color: "white" }} />
          </div>
        </button>

        <h1 style={{ fontSize: 24, fontWeight: 800, color: "hsl(var(--foreground))", margin: "0 0 4px", letterSpacing: "-0.02em" }}>{displayName}</h1>
        <p style={{ fontSize: 13, color: "#60a5fa", fontWeight: 500, margin: 0, opacity: 0.8 }}>{username}</p>
        {bio && <p style={{ fontSize: 13, color: "hsl(var(--muted-foreground))", lineHeight: 1.5, maxWidth: 260, margin: "8px 0 0" }}>{bio}</p>}

        {isPremium && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 14px", borderRadius: 20, background: "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.08))", border: "1px solid rgba(59,130,246,0.15)", marginTop: 10 }}>
            <Crown size={12} style={{ color: "#a78bfa" }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#a78bfa" }}>Premium</span>
          </div>
        )}

        <Link to="/settings" style={{
          display: "inline-flex", alignItems: "center", gap: 5, marginTop: 14,
          padding: "8px 18px", borderRadius: 20,
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
          fontSize: 12, fontWeight: 600, color: "hsl(var(--muted-foreground))", textDecoration: "none",
        }}>
          <Edit3 size={11} /> Редактировать
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, margin: "0 16px 20px" }}>
        {[
          { label: "Постов", value: stats.posts, color: "#3b82f6" },
          { label: "Звёзд", value: starsBalance, color: "#f59e0b" },
          { label: "Получено", value: stats.starsReceived, color: "#8b5cf6" },
        ].map((s) => (
          <div key={s.label} style={{
            padding: "16px 10px", textAlign: "center", borderRadius: 16,
            background: "hsl(var(--card))", border: "1px solid hsl(var(--border) / 0.5)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color, letterSpacing: "-0.02em" }}>{s.value}</div>
            <div style={{ fontSize: 10, color: "hsl(var(--muted-foreground))", fontWeight: 500, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 8 }}>
        {/* Stars */}
        <button onClick={() => setShowStars(true)} style={{
          width: "100%", borderRadius: 16, padding: "14px 16px",
          background: "hsl(var(--card))", border: "1px solid hsl(var(--border) / 0.5)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          cursor: "pointer", WebkitTapHighlightColor: "transparent",
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          transition: "background 0.15s, border-color 0.15s",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 14, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⭐</div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "hsl(var(--foreground))" }}>Пополнить звёзды</div>
              <div style={{ fontSize: 12, color: "hsl(var(--muted-foreground))", marginTop: 1 }}>Баланс: {starsBalance} ⭐</div>
            </div>
          </div>
          <ChevronRight size={16} style={{ color: "hsl(var(--muted-foreground))" }} />
        </button>

        {/* Premium */}
        {!isPremium && (
          <button onClick={() => setShowPremium(true)} style={{
            width: "100%", borderRadius: 16, padding: "14px 16px",
            background: "linear-gradient(135deg, rgba(59,130,246,0.06), rgba(139,92,246,0.06))", border: "1px solid rgba(59,130,246,0.12)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            cursor: "pointer", WebkitTapHighlightColor: "transparent",
            boxShadow: "0 2px 12px rgba(59,130,246,0.06)",
            transition: "background 0.15s, border-color 0.15s",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: 14, background: "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(139,92,246,0.12))", border: "1px solid rgba(59,130,246,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Crown size={18} style={{ color: "#a78bfa" }} />
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#a78bfa" }}>Получить Premium</div>
                <div style={{ fontSize: 12, color: "hsl(var(--muted-foreground))", marginTop: 1 }}>Эксклюзивные возможности</div>
              </div>
            </div>
            <ChevronRight size={16} style={{ color: "#a78bfa" }} />
          </button>
        )}

        {/* Create post */}
        <Link to="/create" style={{
          width: "100%", borderRadius: 16, padding: "14px 16px",
          background: "hsl(var(--card))", border: "1px solid hsl(var(--border) / 0.5)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          textDecoration: "none", WebkitTapHighlightColor: "transparent",
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          transition: "background 0.15s, border-color 0.15s",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 14, background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📸</div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "hsl(var(--foreground))" }}>Создать публикацию</div>
              <div style={{ fontSize: 12, color: "hsl(var(--muted-foreground))", marginTop: 1 }}>Пост или история</div>
            </div>
          </div>
          <ChevronRight size={16} style={{ color: "hsl(var(--muted-foreground))" }} />
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
