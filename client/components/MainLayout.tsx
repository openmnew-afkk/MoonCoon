import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Home, Plus, Sparkles, User, Music, Search, TrendingUp, X } from "lucide-react";
import { APP_NAME } from "@/lib/brand";

interface MainLayoutProps { children: React.ReactNode; }

const NAV = [
  { path: "/", icon: Home, label: "Лента", exact: true },
  { path: "/ai", icon: Sparkles, label: "AI" },
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
        <div className="fab-create">
          <Plus size={24} strokeWidth={2.5} color="white" />
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
          style={{
            color: active
              ? "hsl(var(--primary))"
              : "hsl(var(--muted-foreground) / 0.4)",
            transition: "color 0.2s, filter 0.2s",
            filter: active ? "drop-shadow(0 0 8px hsl(var(--primary) / 0.5))" : "none"
          }} />
        {active && (
          <div style={{
            position: "absolute", bottom: -6, left: "50%", transform: "translateX(-50%)",
            width: 4, height: 4, borderRadius: "50%",
            background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))",
            boxShadow: "0 0 8px hsl(var(--primary) / 0.6)",
          }} />
        )}
      </div>
      <span style={{
        fontSize: 10, fontWeight: active ? 700 : 500,
        color: active
          ? "hsl(var(--primary))"
          : "hsl(var(--muted-foreground) / 0.3)",
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
    <div
      className="animate-fade-up"
      style={{ position: "fixed", inset: 0, zIndex: 200, background: "hsl(var(--background) / 0.92)", backdropFilter: "blur(32px)", WebkitBackdropFilter: "blur(32px)" }}
      onClick={onClose}
    >
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "80px 20px" }} onClick={e => e.stopPropagation()}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "14px 16px", borderRadius: 16,
          background: "hsl(var(--card) / 0.6)",
          border: "1.5px solid hsl(var(--border) / 0.4)",
          marginBottom: 20,
        }}>
          <Search size={18} style={{ color: "hsl(var(--primary) / 0.6)" }} />
          <input placeholder="Поиск..." autoFocus className="flex-1 bg-transparent border-none outline-none text-foreground text-[15px]" style={{ fontFamily: "inherit" }} />
          <button onClick={onClose} className="btn-icon !w-8 !h-8">
            <X size={16} style={{ color: "hsl(var(--muted-foreground) / 0.5)" }} />
          </button>
        </div>
        <h3 style={{
          fontSize: 11, fontWeight: 700,
          color: "hsl(var(--primary))",
          letterSpacing: "0.08em", textTransform: "uppercase",
          margin: "0 0 12px", display: "flex", alignItems: "center", gap: 6,
        }}><TrendingUp size={14} /> Тренды</h3>
        {tags.map(t => (
          <button key={t.tag} className="w-full text-left" style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "14px 16px", borderRadius: 16,
            background: "hsl(var(--card) / 0.4)",
            border: "1px solid hsl(var(--border) / 0.25)",
            cursor: "pointer", marginBottom: 6,
            WebkitTapHighlightColor: "transparent",
            transition: "background 0.15s, border-color 0.15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = "hsl(var(--secondary) / 0.5)"; e.currentTarget.style.borderColor = "hsl(var(--primary) / 0.15)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "hsl(var(--card) / 0.4)"; e.currentTarget.style.borderColor = "hsl(var(--border) / 0.25)"; }}
          >
            <span style={{ fontSize: 22 }}>{t.emoji}</span>
            <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: "hsl(var(--foreground))" }}>{t.tag}</span>
            <span style={{ fontSize: 12, color: "hsl(var(--muted-foreground) / 0.3)" }}>{t.n}</span>
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
    <div className="app-shell">
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        background: "hsl(var(--background) / 0.78)",
        backdropFilter: "blur(48px) saturate(2)",
        WebkitBackdropFilter: "blur(48px) saturate(2)",
        borderBottom: "1px solid hsl(var(--border) / 0.3)",
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}>
        <div style={{
          maxWidth: 480, margin: "0 auto", padding: "0 20px",
          height: HEADER_H, display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span className="gradient-text" style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.04em" }}>
            {APP_NAME}
          </span>
          <button onClick={() => setShowExplore(true)} className="btn-icon !w-9 !h-9" style={{
            background: "hsl(var(--primary) / 0.06)",
            border: "1px solid hsl(var(--primary) / 0.1)",
          }}>
            <Search size={16} style={{ color: "hsl(var(--primary) / 0.6)" }} />
          </button>
        </div>
      </header>

      <main style={{
        paddingTop: `calc(env(safe-area-inset-top, 0px) + ${HEADER_H}px)`,
        paddingBottom: hideNav ? "env(safe-area-inset-bottom, 0px)" : `calc(env(safe-area-inset-bottom, 0px) + ${NAV_H}px)`,
        minHeight: "100vh",
      }}>
        {children}
      </main>

      {!hideNav && (
        <nav style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
          className="nav-glass"
        >
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
