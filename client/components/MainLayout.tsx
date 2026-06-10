import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Home, Plus, Sparkles, User, Music, Search, TrendingUp, X } from "lucide-react";
import { APP_NAME } from "@/lib/brand";

interface MainLayoutProps { children: React.ReactNode; }

const ACCENT = "#CBFF4D";

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
          width: 44, height: 44, borderRadius: 14,
          background: `linear-gradient(135deg, ${ACCENT}, #a3e635)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 4px 16px ${ACCENT}44`,
        }} className="active:scale-90">
          <Plus size={22} strokeWidth={2.5} color="#0a0a0f" />
        </div>
      </Link>
    );
  }

  return (
    <Link to={path} style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      gap: 3, width: 54, padding: "6px 0",
      textDecoration: "none", WebkitTapHighlightColor: "transparent",
    }} className="active:scale-90">
      <Icon size={21} strokeWidth={active ? 2.4 : 1.7}
        style={{ color: active ? ACCENT : "rgba(148,163,184,0.28)", transition: "color 0.2s" }} />
      <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, color: active ? ACCENT : "rgba(148,163,184,0.2)" }}>{label}</span>
      {active && <div style={{ width: 4, height: 4, borderRadius: "50%", background: ACCENT, boxShadow: `0 0 8px ${ACCENT}` }} />}
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
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }} onClick={onClose}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "80px 20px" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 16, background: "rgba(255,255,255,0.06)", border: `1px solid ${ACCENT}15`, marginBottom: 20 }}>
          <Search size={18} style={{ color: `${ACCENT}77` }} />
          <input placeholder="Поиск..." autoFocus style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#e2e8f0", fontSize: 15, fontFamily: "inherit" }} />
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}><X size={18} style={{ color: "rgba(148,163,184,0.5)" }} /></button>
        </div>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: ACCENT, letterSpacing: "0.05em", textTransform: "uppercase", margin: "0 0 12px", display: "flex", alignItems: "center", gap: 6 }}><TrendingUp size={14} /> Тренды</h3>
        {tags.map(t => (
          <button key={t.tag} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)", cursor: "pointer", textAlign: "left", width: "100%", marginBottom: 6, WebkitTapHighlightColor: "transparent" }}>
            <span style={{ fontSize: 22 }}>{t.emoji}</span>
            <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>{t.tag}</span>
            <span style={{ fontSize: 12, color: "rgba(148,163,184,0.4)" }}>{t.n}</span>
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

  const HEADER_H = 48;
  const NAV_H = 64;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f" }}>
      {/* Fixed Header */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        background: "rgba(10,10,15,0.88)",
        backdropFilter: "blur(28px) saturate(1.5)",
        WebkitBackdropFilter: "blur(28px) saturate(1.5)",
        borderBottom: `1px solid rgba(255,255,255,0.04)`,
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}>
        <div style={{
          maxWidth: 480, margin: "0 auto", padding: "0 20px",
          height: HEADER_H, display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{
            fontSize: 20, fontWeight: 900, letterSpacing: "-0.04em",
            background: `linear-gradient(135deg, #f0fdf4, ${ACCENT}, #84cc16)`,
            WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
          }}>{APP_NAME}</span>
          <button onClick={() => setShowExplore(true)} style={{
            width: 34, height: 34, borderRadius: 11,
            background: `${ACCENT}08`, border: `1px solid ${ACCENT}12`,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", WebkitTapHighlightColor: "transparent",
          }} className="active:scale-90">
            <Search size={16} style={{ color: `${ACCENT}88` }} />
          </button>
        </div>
      </header>

      {/* Content with padding for fixed header/nav */}
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
          background: "rgba(8,8,12,0.8)",
          backdropFilter: "blur(36px) saturate(1.8)",
          WebkitBackdropFilter: "blur(36px) saturate(1.8)",
          borderTop: `1px solid ${ACCENT}06`,
          boxShadow: "0 -2px 20px rgba(0,0,0,0.3)",
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
