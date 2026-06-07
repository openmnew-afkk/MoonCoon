import React from "react";
import { useLocation, Link } from "react-router-dom";
import { Home, Plus, Sparkles, User, Music } from "lucide-react";
import { APP_NAME } from "@/lib/brand";

interface MainLayoutProps { children: React.ReactNode; }

const NAV_ITEMS = [
  { path: "/", icon: Home, label: "Лента", exact: true },
  { path: "/music", icon: Music, label: "Музыка", exact: false },
  { path: "/create", icon: Plus, label: "", exact: false, isCreate: true },
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
      <Link to={path} style={{
        position: "relative", flexShrink: 0, textDecoration: "none",
        WebkitTapHighlightColor: "transparent",
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 16,
          background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 20px rgba(99,102,241,0.5), inset 0 1px 0 rgba(255,255,255,0.15)",
          transition: "transform 0.2s cubic-bezier(0.34,1.56,0.64,1)",
        }} className="active:scale-90">
          <Plus size={22} strokeWidth={2.5} color="white" />
        </div>
      </Link>
    );
  }

  return (
    <Link to={path} style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: 2, width: 56, padding: "6px 0",
      WebkitTapHighlightColor: "transparent", textDecoration: "none",
      transition: "all 0.2s",
    }} className="active:scale-90">
      <div style={{
        position: "relative",
        display: "flex", alignItems: "center", justifyContent: "center",
        width: 32, height: 32, borderRadius: 10,
        background: isActive ? "rgba(99,102,241,0.12)" : "transparent",
        transition: "all 0.25s",
      }}>
        {isActive && (
          <div style={{
            position: "absolute", top: -4, left: "50%", transform: "translateX(-50%)",
            width: 4, height: 4, borderRadius: "50%",
            background: "#818cf8",
            boxShadow: "0 0 8px rgba(99,102,241,0.8)",
          }} />
        )}
        <Icon
          size={20}
          strokeWidth={isActive ? 2.5 : 1.8}
          style={{
            color: isActive ? "#a5b4fc" : "rgba(148,163,184,0.35)",
            transition: "all 0.2s",
          }}
        />
      </div>
      <span style={{
        fontSize: 10, fontWeight: isActive ? 700 : 500,
        color: isActive ? "#a5b4fc" : "rgba(148,163,184,0.25)",
        letterSpacing: "0.01em", transition: "all 0.2s",
      }}>{label}</span>
    </Link>
  );
}

export default function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();
  const safeTop = "calc(var(--tg-safe-top, 0px) + var(--tg-chrome-top, 52px))";
  const hideNav = ["/create", "/messages"].some(p => location.pathname.startsWith(p));

  return (
    <div style={{ minHeight: "100dvh", background: "#0a0a0f", position: "relative", overflow: "hidden" }}>
      {/* Top Header */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        paddingTop: safeTop,
        background: "rgba(10,10,15,0.92)",
        backdropFilter: "blur(32px) saturate(1.6)",
        WebkitBackdropFilter: "blur(32px) saturate(1.6)",
        borderBottom: "1px solid rgba(99,102,241,0.04)",
      }}>
        <div style={{
          maxWidth: 480, margin: "0 auto", padding: "0 20px",
          height: 48, display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{
            fontSize: 20, fontWeight: 900, letterSpacing: "-0.04em",
            background: "linear-gradient(135deg, #e0e7ff 0%, #a5b4fc 50%, #6366f1 100%)",
            WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
          }}>{APP_NAME}</span>
          <div style={{ display: "flex", gap: 6 }}>
            <Link to="/messages" style={{
              width: 34, height: 34, borderRadius: 11,
              background: "rgba(99,102,241,0.06)",
              border: "1px solid rgba(99,102,241,0.08)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, WebkitTapHighlightColor: "transparent", textDecoration: "none",
              transition: "all 0.15s",
            }} className="active:scale-90">💬</Link>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main style={{ paddingTop: `calc(${safeTop} + 48px)`, minHeight: "100dvh" }}>
        {children}
      </main>

      {/* Bottom Nav */}
      {!hideNav && (
        <nav style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
          paddingBottom: "var(--tg-safe-bottom, 0px)",
        }}>
          <div style={{
            maxWidth: 480, margin: "0 auto",
            background: "rgba(8,8,12,0.96)",
            backdropFilter: "blur(32px) saturate(1.8)",
            WebkitBackdropFilter: "blur(32px) saturate(1.8)",
            borderTop: "1px solid rgba(99,102,241,0.05)",
            padding: "4px 8px 6px",
            display: "flex", alignItems: "center", justifyContent: "space-around",
          }}>
            {NAV_ITEMS.map(item => <NavItem key={item.path} {...item} />)}
          </div>
        </nav>
      )}
    </div>
  );
}
