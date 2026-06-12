import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Home, Plus, Sparkles, User, Music, Search, TrendingUp, X, Compass } from "lucide-react";
import { APP_NAME } from "@/lib/brand";

interface MainLayoutProps { children: React.ReactNode; }

const NAV = [
  { path: "/", icon: Home, label: "Лента", exact: true },
  { path: "/ai", icon: Sparkles, label: "Адель" },
  { path: "/create", icon: Plus, label: "", isCreate: true },
  { path: "/music", icon: Music, label: "Музыка" },
  { path: "/profile", icon: User, label: "Профиль" },
];

function NavItem({ path, icon: Icon, label, exact, isCreate }: any) {
  const { pathname } = useLocation();
  const active = exact ? pathname === path : pathname.startsWith(path);

  if (isCreate) {
    return (
      <Link to={path} style={{ textDecoration: "none", WebkitTapHighlightColor: "transparent" }}>
        <div style={{
          width: 48, height: 48, borderRadius: 16,
          background: "linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 20px rgba(59,130,246,0.4), 0 0 40px rgba(139,92,246,0.15)",
          transition: "transform 0.15s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s",
        }} className="active:scale-90">
          <Plus size={22} strokeWidth={2.5} color="white" />
        </div>
      </Link>
    );
  }

  return (
    <Link to={path} style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      gap: 2, width: 56, padding: "6px 0",
      textDecoration: "none", WebkitTapHighlightColor: "transparent",
    }} className="active:scale-90">
      <div style={{
        position: "relative",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={22} strokeWidth={active ? 2.5 : 1.8}
          style={{ color: active ? "#60a5fa" : "rgba(148,163,184,0.3)", transition: "color 0.2s, filter 0.2s", filter: active ? "drop-shadow(0 0 8px rgba(96,165,250,0.5))" : "none" }} />
        {active && (
          <div style={{
            position: "absolute", bottom: -6, left: "50%", transform: "translateX(-50%)",
            width: 4, height: 4, borderRadius: "50%",
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            boxShadow: "0 0 8px rgba(59,130,246,0.6)",
          }} />
        )}
      </div>
      <span style={{
        fontSize: 10, fontWeight: active ? 700 : 500,
        color: active ? "#60a5fa" : "rgba(148,163,184,0.25)",
        transition: "color 0.2s",
      }}>{label}</span>
    </Link>
  );
}

function ExploreOverlay({ onClose }: { onClose: () => void }) {
  const tags = [
    { emoji: "🔥", tag: "#закат", n: "12.3K" },
    { emoji: "📸", tag: "#портрет", n: "8.7K" },
    { emoji: "🌃", tag: "#ночной", n: "6.1K" },
    { emoji: "☕", tag: "#кофе", n: "5.4K" },
    { emoji: "🎨", tag: "#дизайн", n: "4.9K" },
  ];

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }} onClick={onClose}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "80px 20px" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderRadius: 16, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(59,130,246,0.12)", marginBottom: 20 }}>
          <Search size={18} style={{ color: "rgba(96,165,250,0.6)" }} />
          <input placeholder="Поиск..." autoFocus style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#e2e8f0", fontSize: 15, fontFamily: "inherit" }} />
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}><X size={18} style={{ color: "rgba(148,163,184,0.5)" }} /></button>
        </div>
        <h3 style={{ fontSize: 12, fontWeight: 700, color: "#60a5fa", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 12px", display: "flex", alignItems: "center", gap: 6 }}><TrendingUp size={14} /> Тренды</h3>
        {tags.map(t => (
          <button key={t.tag} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 16, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", cursor: "pointer", textAlign: "left", width: "100%", marginBottom: 6, WebkitTapHighlightColor: "transparent", transition: "background 0.15s, border-color 0.15s" }}>
            <span style={{ fontSize: 22 }}>{t.emoji}</span>
            <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>{t.tag}</span>
            <span style={{ fontSize: 12, color: "rgba(148,163,184,0.35)" }}>{t.n}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { pathname } = useLocation();
  const [showExplore, setShowExplore] = useState(false);
  const hideNav = ["/create", "/messages"].some(p => pathname.startsWith(p));

  const HEADER_H = 52;
  const NAV_H = 68;

  return (
    <div style={{ minHeight: "100vh", background: "hsl(var(--background))" }}>
      {/* Fixed Header */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        background: "hsl(var(--background) / 0.88)",
        backdropFilter: "blur(40px) saturate(1.8)",
        WebkitBackdropFilter: "blur(40px) saturate(1.8)",
        borderBottom: "1px solid hsl(var(--border) / 0.4)",
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}>
        <div style={{
          maxWidth: 480, margin: "0 auto", padding: "0 20px",
          height: HEADER_H, display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{
            fontSize: 22, fontWeight: 900, letterSpacing: "-0.04em",
            background: "linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #ec4899 100%)",
            WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
          }}>{APP_NAME}</span>
          <button onClick={() => setShowExplore(true)} style={{
            width: 36, height: 36, borderRadius: 12,
            background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", WebkitTapHighlightColor: "transparent",
            transition: "background 0.15s, border-color 0.15s",
          }} className="active:scale-90">
            <Search size={16} style={{ color: "rgba(96,165,250,0.6)" }} />
          </button>
        </div>
      </header>

      {/* Content */}
      <main style={{
        paddingTop: `calc(env(safe-area-inset-top, 0px) + ${HEADER_H}px)`,
        paddingBottom: hideNav ? "env(safe-area-inset-bottom, 0px)" : `calc(env(safe-area-inset-bottom, 0px) + ${NAV_H}px)`,
        minHeight: "100vh",
      }}>
        {children}
      </main>

      {/* Fixed Bottom Nav */}
      {!hideNav && (
        <nav style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
          background: "hsl(var(--background) / 0.82)",
          backdropFilter: "blur(40px) saturate(2)",
          WebkitBackdropFilter: "blur(40px) saturate(2)",
          borderTop: "1px solid hsl(var(--border) / 0.3)",
          boxShadow: "0 -4px 24px rgba(0,0,0,0.25)",
        }}>
          <div style={{
            maxWidth: 480, margin: "0 auto",
            height: NAV_H, padding: "0 8px",
            display: "flex", alignItems: "center", justifyContent: "space-around",
          }}>
            {NAV.map(item => <NavItem key={item.path} {...item} />)}
          </div>
        </nav>
      )}

      {showExplore && <ExploreOverlay onClose={() => setShowExplore(false)} />}
    </div>
  );
}
