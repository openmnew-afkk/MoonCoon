import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Home, Plus, Sparkles, User, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/brand";

interface MainLayoutProps { children: React.ReactNode; }

const V = (a: number) => `rgba(155,89,247,${a})`;

const NAV_ITEMS = [
  { path: "/", icon: Home, label: "Главная", exact: true },
  { path: "/explore", icon: Search, label: "Поиск", exact: false },
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
      <Link to={path} style={{ position: "relative", marginTop: -28, flexShrink: 0 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 18,
          background: "linear-gradient(135deg, #9b59f7 0%, #7c3aed 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 8px 28px ${V(0.55)}, 0 0 0 1px ${V(0.3)}, 0 2px 8px rgba(0,0,0,0.4)`,
          transition: "transform 0.15s cubic-bezier(0.34,1.56,0.64,1)",
        }}
          className="active:scale-90"
        >
          <Plus size={26} strokeWidth={2.5} color="white" />
        </div>
        {/* Top glow */}
        <div style={{
          position: "absolute", inset: -8, borderRadius: 26,
          background: `radial-gradient(circle, ${V(0.3)}, transparent 70%)`,
          filter: "blur(10px)", zIndex: -1, pointerEvents: "none",
        }} />
      </Link>
    );
  }

  return (
    <Link to={path} style={{
      position: "relative", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: 3, width: 52, height: 52, borderRadius: 16,
      background: isActive ? `linear-gradient(135deg, ${V(0.18)}, rgba(124,58,237,0.1))` : "transparent",
      border: isActive ? `1px solid ${V(0.25)}` : "1px solid transparent",
      boxShadow: isActive ? `0 0 20px ${V(0.35)}, 0 0 40px ${V(0.1)}` : "none",
      transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
      WebkitTapHighlightColor: "transparent",
    }}
      className="active:scale-90"
    >
      {/* Active top pip */}
      {isActive && (
        <div style={{
          position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)",
          width: 20, height: 2, borderRadius: 2,
          background: "linear-gradient(90deg, #c084fc, #9b59f7)",
          boxShadow: `0 0 8px ${V(0.8)}`,
        }} />
      )}
      <Icon
        size={20}
        strokeWidth={isActive ? 2.5 : 1.8}
        style={{
          color: isActive ? "#c084fc" : V(0.45),
          filter: isActive ? `drop-shadow(0 0 6px ${V(0.7)})` : "none",
          transition: "all 0.2s ease",
        }}
      />
      <span style={{
        fontSize: 9, fontWeight: isActive ? 700 : 500,
        color: isActive ? "#c084fc" : V(0.4),
        letterSpacing: "0.02em",
        transition: "all 0.2s ease",
      }}>{label}</span>
    </Link>
  );
}

export default function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();
  const safeTop = "calc(var(--tg-safe-top, 0px) + var(--tg-chrome-top, 52px))";

  // Hide nav on certain pages
  const hideNav = ["/create", "/messages"].some(p => location.pathname.startsWith(p));

  return (
    <div style={{ minHeight: "100dvh", background: "#070510", position: "relative" }}>

      {/* ── Top Header ─────────────────────────────────────────────── */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        paddingTop: safeTop,
        background: "rgba(7,5,16,0.85)",
        backdropFilter: "blur(32px) saturate(1.8)",
        WebkitBackdropFilter: "blur(32px) saturate(1.8)",
        borderBottom: `1px solid ${V(0.1)}`,
      }}>
        <div style={{
          maxWidth: 480, margin: "0 auto",
          padding: "0 20px",
          height: 52, display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          {/* Logo */}
          <span style={{
            fontSize: 22, fontWeight: 900, letterSpacing: "-0.04em",
            background: "linear-gradient(135deg, #e2d9ff 0%, #c084fc 40%, #9b59f7 80%)",
            WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
          }}>{APP_NAME}</span>

          {/* Right actions */}
          <div style={{ display: "flex", gap: 8 }}>
            <Link to="/messages" style={{
              width: 36, height: 36, borderRadius: 12,
              background: V(0.08),
              border: `1px solid ${V(0.15)}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16,
              WebkitTapHighlightColor: "transparent",
            }}>💬</Link>
          </div>
        </div>
      </header>

      {/* ── Page Content ───────────────────────────────────────────── */}
      <main style={{
        paddingTop: `calc(${safeTop} + 52px)`,
        minHeight: "100dvh",
      }}>
        {children}
      </main>

      {/* ── Bottom Nav ─────────────────────────────────────────────── */}
      {!hideNav && (
        <nav style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
          paddingBottom: "calc(var(--tg-safe-bottom, 0px) + 8px)",
        }}>
          {/* Glass bar */}
          <div style={{
            maxWidth: 480, margin: "0 auto",
            background: "rgba(7,5,16,0.92)",
            backdropFilter: "blur(32px) saturate(1.8)",
            WebkitBackdropFilter: "blur(32px) saturate(1.8)",
            borderTop: `1px solid ${V(0.12)}`,
            borderRadius: "24px 24px 0 0",
            padding: "10px 16px 4px",
            display: "flex", alignItems: "center", justifyContent: "space-around",
            boxShadow: `0 -8px 40px rgba(0,0,0,0.5), 0 -1px 0 ${V(0.08)}`,
          }}>
            {NAV_ITEMS.map(item => (
              <NavItem key={item.path} {...item} />
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}
