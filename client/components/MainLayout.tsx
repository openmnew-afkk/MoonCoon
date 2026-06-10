import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Home, Plus, Sparkles, User, Music, Search, TrendingUp, X } from "lucide-react";
import { APP_NAME } from "@/lib/brand";

interface MainLayoutProps { children: React.ReactNode; }

const ACCENT = "#CBFF4D";

const NAV_ITEMS = [
  { path: "/", icon: Home, label: "Лента", exact: true },
  { path: "/ai", icon: Sparkles, label: "Адель", exact: false },
  { path: "/create", icon: Plus, label: "", exact: false, isCreate: true },
  { path: "/music", icon: Music, label: "Музыка", exact: false },
  { path: "/profile", icon: User, label: "Профиль", exact: false },
];

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
          width: 44, height: 44, borderRadius: 14,
          background: `linear-gradient(135deg, ${ACCENT} 0%, #a3e635 100%)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 4px 18px ${ACCENT}44`,
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
      gap: 3, width: 54, padding: "6px 0",
      WebkitTapHighlightColor: "transparent", textDecoration: "none",
    }} className="active:scale-90">
      <Icon
        size={21}
        strokeWidth={isActive ? 2.4 : 1.7}
        style={{
          color: isActive ? ACCENT : "rgba(148,163,184,0.28)",
          filter: isActive ? `drop-shadow(0 0 6px ${ACCENT}55)` : "none",
          transition: "all 0.2s",
        }}
      />
      <span style={{
        fontSize: 10, fontWeight: isActive ? 700 : 500,
        color: isActive ? ACCENT : "rgba(148,163,184,0.2)",
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
      WebkitBackdropFilter: "blur(20px)",
      display: "flex", flexDirection: "column",
    }} onClick={onClose}>
      <div style={{
        flex: 1, maxWidth: 480, width: "100%", margin: "0 auto",
        padding: "80px 20px 20px", display: "flex", flexDirection: "column",
      }} onClick={e => e.stopPropagation()}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10, padding: "12px 16px",
          borderRadius: 16, background: "rgba(255,255,255,0.06)",
          border: `1px solid ${ACCENT}15`, marginBottom: 24,
        }}>
          <Search size={18} style={{ color: `${ACCENT}77` }} />
          <input placeholder="Поиск по Vexora..." autoFocus style={{
            flex: 1, background: "none", border: "none", outline: "none",
            color: "#e2e8f0", fontSize: 15, fontFamily: "inherit",
          }} />
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
            <X size={18} style={{ color: "rgba(148,163,184,0.5)" }} />
          </button>
        </div>

        <h3 style={{
          fontSize: 13, fontWeight: 700, color: ACCENT,
          letterSpacing: "0.06em", textTransform: "uppercase",
          margin: "0 0 12px", display: "flex", alignItems: "center", gap: 6,
        }}>
          <TrendingUp size={14} /> Тренды
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
              <p style={{ flex: 1, fontSize: 14, fontWeight: 600, color: "#e2e8f0", margin: 0 }}>{t.tag}</p>
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
  const hideNav = ["/create", "/messages"].some(p => location.pathname.startsWith(p));

  return (
    <div style={{
      minHeight: "100dvh", background: "#0a0a0f",
      position: "relative",
      display: "flex", flexDirection: "column",
    }}>
      {/* Top Header - uses env() for TG safe area */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        paddingTop: "env(safe-area-inset-top, 0px)",
        background: "rgba(10,10,15,0.85)",
        backdropFilter: "blur(28px) saturate(1.5)",
        WebkitBackdropFilter: "blur(28px) saturate(1.5)",
        borderBottom: `1px solid ${ACCENT}06`,
        flexShrink: 0,
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
            background: `${ACCENT}08`,
            border: `1px solid ${ACCENT}12`,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", WebkitTapHighlightColor: "transparent",
          }} className="active:scale-90">
            <Search size={16} style={{ color: `${ACCENT}88` }} />
          </button>
        </div>
      </header>

      {/* Page Content - scrollable area */}
      <main style={{
        flex: 1,
        overflowY: "auto",
        overflowX: "hidden",
        WebkitOverflowScrolling: "touch",
        overscrollBehavior: "contain",
      }}>
        {children}
      </main>

      {/* Bottom Nav */}
      {!hideNav && (
        <nav style={{
          position: "sticky", bottom: 0,
          zIndex: 50, flexShrink: 0,
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}>
          <div style={{
            maxWidth: 480, margin: "0 auto",
            background: "rgba(8,8,12,0.75)",
            backdropFilter: "blur(36px) saturate(1.8)",
            WebkitBackdropFilter: "blur(36px) saturate(1.8)",
            borderTop: `1px solid ${ACCENT}06`,
            boxShadow: "0 -4px 24px rgba(0,0,0,0.35)",
            padding: "4px 8px 4px",
            display: "flex", alignItems: "center", justifyContent: "space-around",
          }}>
            {NAV_ITEMS.map(item => <NavItem key={item.path} {...item} />)}
          </div>
        </nav>
      )}

      {showExplore && <ExploreOverlay onClose={() => setShowExplore(false)} />}
    </div>
  );
}
