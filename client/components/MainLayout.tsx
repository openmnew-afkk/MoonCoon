import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Home, Plus, Sparkles, User, Music, Search, TrendingUp, X } from "lucide-react";
import { APP_NAME } from "@/lib/brand";

interface MainLayoutProps { children: React.ReactNode; }

/* Nav order: Home, Adel, Create, Music, Profile */
const NAV_ITEMS = [
  { path: "/", icon: Home, label: "Лента", exact: true },
  { path: "/ai", icon: Sparkles, label: "Адель", exact: false },
  { path: "/create", icon: Plus, label: "", exact: false, isCreate: true },
  { path: "/music", icon: Music, label: "Музыка", exact: false },
  { path: "/profile", icon: User, label: "Профиль", exact: false },
];

const ACCENT = "#CBFF4D"; // lime-green accent

function NavItem({ path, icon: Icon, label, exact, isCreate }: {
  path: string; icon: any; label: string; exact?: boolean; isCreate?: boolean;
}) {
  const location = useLocation();
  const isActive = exact ? location.pathname === path : location.pathname.startsWith(path);

  if (isCreate) {
    return (
      <Link to={path} style={{
        position: "relative", flexShrink: 0, textDecoration: "none",
        WebkitTapHighlightColor: "transparent",
      }}>
        <div style={{
          width: 46, height: 46, borderRadius: 15,
          background: `linear-gradient(135deg, ${ACCENT} 0%, #a3e635 100%)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 4px 20px ${ACCENT}55, inset 0 1px 0 rgba(255,255,255,0.25)`,
          transition: "transform 0.2s cubic-bezier(0.34,1.56,0.64,1)",
        }} className="active:scale-90">
          <Plus size={22} strokeWidth={2.5} color="#0a0a0f" />
        </div>
      </Link>
    );
  }

  return (
    <Link to={path} style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: 3, width: 56, padding: "6px 0",
      WebkitTapHighlightColor: "transparent", textDecoration: "none",
    }} className="active:scale-90">
      <Icon
        size={21}
        strokeWidth={isActive ? 2.4 : 1.7}
        style={{
          color: isActive ? ACCENT : "rgba(148,163,184,0.3)",
          filter: isActive ? `drop-shadow(0 0 6px ${ACCENT}66)` : "none",
          transition: "all 0.2s",
        }}
      />
      <span style={{
        fontSize: 10, fontWeight: isActive ? 700 : 500,
        color: isActive ? ACCENT : "rgba(148,163,184,0.22)",
        transition: "all 0.2s",
      }}>{label}</span>
      {isActive && (
        <div style={{
          width: 4, height: 4, borderRadius: "50%",
          background: ACCENT, boxShadow: `0 0 8px ${ACCENT}`,
          marginTop: -1,
        }} />
      )}
    </Link>
  );
}

/* Explore overlay */
function ExploreOverlay({ onClose }: { onClose: () => void }) {
  const trending = [
    { emoji: "🔥", tag: "#закат", count: "12.3K" },
    { emoji: "📸", tag: "#портрет", count: "8.7K" },
    { emoji: "🌃", tag: "#ночнойгород", count: "6.1K" },
    { emoji: "☕", tag: "#кофе", count: "5.4K" },
    { emoji: "🎨", tag: "#дизайн", count: "4.9K" },
    { emoji: "🏔️", tag: "#путешествие", count: "4.2K" },
  ];

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(0,0,0,0.7)", backdropFilter: "blur(20px)",
      display: "flex", flexDirection: "column",
    }} onClick={onClose}>
      <div style={{
        flex: 1, maxWidth: 480, width: "100%", margin: "0 auto",
        padding: "80px 20px 20px", display: "flex", flexDirection: "column",
      }} onClick={e => e.stopPropagation()}>
        {/* Search bar */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10, padding: "12px 16px",
          borderRadius: 16, background: "rgba(255,255,255,0.06)",
          border: `1px solid ${ACCENT}22`, marginBottom: 24,
        }}>
          <Search size={18} style={{ color: `${ACCENT}88` }} />
          <input placeholder="Поиск по Vexora..." autoFocus style={{
            flex: 1, background: "none", border: "none", outline: "none",
            color: "#e2e8f0", fontSize: 15,
          }} />
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
            <X size={18} style={{ color: "rgba(148,163,184,0.5)" }} />
          </button>
        </div>

        {/* Trending */}
        <h3 style={{
          fontSize: 14, fontWeight: 700, color: ACCENT,
          letterSpacing: "0.05em", textTransform: "uppercase",
          margin: "0 0 12px", display: "flex", alignItems: "center", gap: 6,
        }}>
          <TrendingUp size={14} /> Тренды сейчас
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {trending.map(t => (
            <button key={t.tag} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "12px 14px", borderRadius: 14,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.04)",
              cursor: "pointer", textAlign: "left",
              WebkitTapHighlightColor: "transparent",
            }} className="active:scale-[0.98]">
              <span style={{ fontSize: 22 }}>{t.emoji}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0", margin: 0 }}>{t.tag}</p>
              </div>
              <span style={{ fontSize: 12, color: "rgba(148,163,184,0.4)", fontWeight: 500 }}>{t.count}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();
  const [showExplore, setShowExplore] = useState(false);
  const safeTop = "calc(var(--tg-safe-top, 0px) + var(--tg-chrome-top, 52px))";
  const hideNav = ["/create", "/messages"].some(p => location.pathname.startsWith(p));

  return (
    <div style={{ minHeight: "100dvh", background: "#0a0a0f", position: "relative" }}>
      {/* Top Header */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        paddingTop: safeTop,
        background: "rgba(10,10,15,0.88)",
        backdropFilter: "blur(32px) saturate(1.6)",
        WebkitBackdropFilter: "blur(32px) saturate(1.6)",
        borderBottom: "1px solid rgba(203,255,77,0.04)",
      }}>
        <div style={{
          maxWidth: 480, margin: "0 auto", padding: "0 20px",
          height: 48, display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{
            fontSize: 20, fontWeight: 900, letterSpacing: "-0.04em",
            background: `linear-gradient(135deg, #f0fdf4 0%, ${ACCENT} 50%, #84cc16 100%)`,
            WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
          }}>{APP_NAME}</span>
          <button onClick={() => setShowExplore(true)} style={{
            width: 34, height: 34, borderRadius: 11,
            background: `rgba(203,255,77,0.06)`,
            border: `1px solid ${ACCENT}15`,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", WebkitTapHighlightColor: "transparent",
            transition: "all 0.15s",
          }} className="active:scale-90">
            <Search size={16} style={{ color: `${ACCENT}99` }} />
          </button>
        </div>
      </header>

      {/* Page Content */}
      <main style={{ paddingTop: `calc(${safeTop} + 48px)`, minHeight: "100dvh" }}>
        {children}
      </main>

      {/* Bottom Nav — Glass + Blur */}
      {!hideNav && (
        <nav style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
          paddingBottom: "var(--tg-safe-bottom, 0px)",
        }}>
          <div style={{
            maxWidth: 480, margin: "0 auto",
            background: "rgba(8,8,12,0.65)",
            backdropFilter: "blur(40px) saturate(2)",
            WebkitBackdropFilter: "blur(40px) saturate(2)",
            borderTop: `1px solid ${ACCENT}08`,
            boxShadow: `0 -4px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)`,
            padding: "4px 8px 6px",
            display: "flex", alignItems: "center", justifyContent: "space-around",
          }}>
            {NAV_ITEMS.map(item => <NavItem key={item.path} {...item} />)}
          </div>
        </nav>
      )}

      {/* Explore Overlay */}
      {showExplore && <ExploreOverlay onClose={() => setShowExplore(false)} />}
    </div>
  );
}
