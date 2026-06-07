import React from "react";
import { useLocation, Link } from "react-router-dom";
import { Home, Plus, Sparkles, User, Music } from "lucide-react";
import { APP_NAME } from "@/lib/brand";

interface MainLayoutProps { children: React.ReactNode; }

const NAV_ITEMS = [
  { path: "/", icon: Home, label: "Главная", exact: true },
  { path: "/music", icon: Music, label: "Музыка", exact: false },
  { path: "/create", icon: Plus, label: "Создать", exact: false, isCreate: true },
  { path: "/ai", icon: Sparkles, label: "Адель", exact: false },
  { path: "/profile", icon: User, label: "Профиль", exact: false },
];

function NavItem({ path, icon: Icon, label, exact, isCreate }: {
  path: string; icon: any; label: string; exact?: boolean; isCreate?: boolean;
}) {
  const location = useLocation();
  const isActive = exact ? location.pathname === path : location.pathname.startsWith(path);

  if (isCreate) {
    return (
      <Link to={path} style={{ position: "relative", marginTop: -24, flexShrink: 0, textDecoration: "none" }}>
        <div style={{
          width: 52, height: 52, borderRadius: 16,
          background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 8px 24px rgba(99,102,241,0.45), 0 0 0 1px rgba(99,102,241,0.2)",
          transition: "transform 0.15s cubic-bezier(0.34,1.56,0.64,1)",
        }} className="active:scale-90">
          <Plus size={24} strokeWidth={2.5} color="white" />
        </div>
      </Link>
    );
  }

  return (
    <Link to={path} style={{
      position: "relative", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: 3, width: 48, height: 48, borderRadius: 14,
      background: isActive ? "rgba(99,102,241,0.1)" : "transparent",
      border: isActive ? "1px solid rgba(99,102,241,0.15)" : "1px solid transparent",
      boxShadow: isActive ? "0 0 16px rgba(99,102,241,0.2)" : "none",
      transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
      WebkitTapHighlightColor: "transparent", textDecoration: "none",
    }} className="active:scale-90">
      {isActive && (
        <div style={{
          position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)",
          width: 18, height: 2, borderRadius: 2,
          background: "linear-gradient(90deg, #818cf8, #6366f1)",
          boxShadow: "0 0 6px rgba(99,102,241,0.6)",
        }} />
      )}
      <Icon
        size={19}
        strokeWidth={isActive ? 2.5 : 1.8}
        style={{
          color: isActive ? "#a5b4fc" : "rgba(148,163,184,0.35)",
          filter: isActive ? "drop-shadow(0 0 4px rgba(99,102,241,0.5))" : "none",
          transition: "all 0.2s",
        }}
      />
      <span style={{
        fontSize: 9, fontWeight: isActive ? 700 : 500,
        color: isActive ? "#a5b4fc" : "rgba(148,163,184,0.3)",
        letterSpacing: "0.02em", transition: "all 0.2s",
      }}>{label}</span>
    </Link>
  );
}

export default function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();
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
        borderBottom: "1px solid rgba(99,102,241,0.06)",
      }}>
        <div style={{
          maxWidth: 480, margin: "0 auto", padding: "0 20px",
          height: 52, display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{
            fontSize: 22, fontWeight: 900, letterSpacing: "-0.04em",
            background: "linear-gradient(135deg, #e0e7ff 0%, #a5b4fc 40%, #6366f1 80%)",
            WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
          }}>{APP_NAME}</span>
          <div style={{ display: "flex", gap: 8 }}>
            <Link to="/messages" style={{
              width: 36, height: 36, borderRadius: 12,
              background: "rgba(99,102,241,0.06)",
              border: "1px solid rgba(99,102,241,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, WebkitTapHighlightColor: "transparent", textDecoration: "none",
            }}>💬</Link>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main style={{ paddingTop: `calc(${safeTop} + 52px)`, minHeight: "100dvh" }}>
        {children}
      </main>

      {/* Bottom Nav */}
      {!hideNav && (
        <nav style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
          paddingBottom: "calc(var(--tg-safe-bottom, 0px) + 8px)",
        }}>
          <div style={{
            maxWidth: 480, margin: "0 auto",
            background: "rgba(10,10,15,0.94)",
            backdropFilter: "blur(32px) saturate(1.6)",
            WebkitBackdropFilter: "blur(32px) saturate(1.6)",
            borderTop: "1px solid rgba(99,102,241,0.06)",
            borderRadius: "22px 22px 0 0",
            padding: "8px 16px 4px",
            display: "flex", alignItems: "center", justifyContent: "space-around",
            boxShadow: "0 -8px 40px rgba(0,0,0,0.5)",
          }}>
            {NAV_ITEMS.map(item => <NavItem key={item.path} {...item} />)}
          </div>
        </nav>
      )}
    </div>
  );
}
