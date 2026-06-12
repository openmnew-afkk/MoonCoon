import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Home, Plus, Sparkles, User, Music, Search, X } from "lucide-react";
import { APP_NAME } from "@/lib/brand";

interface MainLayoutProps {
  children: React.ReactNode;
}

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
      <Link to={path} style={{ textDecoration: "none" }}>
        <button className="ios-fab">
          <Plus size={24} strokeWidth={2.5} color="#fff" />
        </button>
      </Link>
    );
  }

  return (
    <Link
      to={path}
      className="flex flex-col items-center gap-0.5 w-14 py-1.5 touch-manipulation"
      style={{ textDecoration: "none" }}
    >
      <div className="relative">
        <Icon
          size={22}
          strokeWidth={active ? 2.2 : 1.6}
          className={`transition-all duration-200 ${
            active ? "text-[var(--blue)]" : "text-[var(--text-tertiary)]"
          }`}
        />
        {active && (
          <div
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
            style={{ background: "var(--blue)" }}
          />
        )}
      </div>
      <span
        className={`text-[10px] font-medium transition-colors duration-200 ${
          active ? "text-[var(--blue)]" : "text-[var(--text-tertiary)]"
        }`}
      >
        {label}
      </span>
    </Link>
  );
}

function ExploreOverlay({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col"
      style={{
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
      onClick={onClose}
    >
      <div
        className="max-w-lg mx-auto w-full px-4 pt-14"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ios-input flex items-center gap-3 mb-5">
          <Search size={16} className="text-[var(--text-tertiary)]" />
          <input
            placeholder="Поиск..."
            autoFocus
            className="flex-1 bg-transparent border-none outline-none text-[var(--text-primary)] text-[15px]"
          />
          <button onClick={onClose} className="ios-icon-btn" style={{ width: 28, height: 28 }}>
            <X size={14} className="text-[var(--text-tertiary)]" />
          </button>
        </div>

        <h3 className="ios-section-header px-0 pt-0">Тренды</h3>

        {[
          { emoji: "\uD83D\uDD25", tag: "#закат", n: "12.3K" },
          { emoji: "\uD83D\uDCF8", tag: "#портрет", n: "8.7K" },
          { emoji: "\uD83C\uDF03", tag: "#ночной", n: "6.1K" },
          { emoji: "☕", tag: "#кофе", n: "5.4K" },
          { emoji: "\uD83C\uDFA8", tag: "#дизайн", n: "4.9K" },
        ].map((t) => (
          <button
            key={t.tag}
            className="ios-card flex items-center gap-3 w-full py-3 px-4 rounded-xl cursor-pointer text-left mb-1 touch-manipulation"
          >
            <span className="text-xl">{t.emoji}</span>
            <span className="flex-1 text-[15px] font-medium text-[var(--text-primary)]">
              {t.tag}
            </span>
            <span className="text-[13px] text-[var(--text-tertiary)]">{t.n}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { pathname } = useLocation();
  const [showExplore, setShowExplore] = useState(false);
  const hideNav = ["/create", "/messages"].some((p) => pathname.startsWith(p));

  const HEADER_H = 52;
  const NAV_H = 72;

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <header
        className="fixed top-0 left-0 right-0 z-50 ios-blur"
        style={{
          height: HEADER_H,
          paddingTop: "env(safe-area-inset-top, 0px)",
          borderBottom: "0.5px solid var(--separator)",
        }}
      >
        <div className="max-w-lg mx-auto px-5 h-full flex items-center justify-between">
          <span
            className="text-[17px] font-bold tracking-[-0.02em] text-[var(--text-primary)]"
            style={{ fontFamily: "Inter, -apple-system, sans-serif" }}
          >
            {APP_NAME}
          </span>
          <button onClick={() => setShowExplore(true)} className="ios-icon-btn">
            <Search size={18} className="text-[var(--text-secondary)]" />
          </button>
        </div>
      </header>

      <main
        style={{
          paddingTop: `calc(env(safe-area-inset-top, 0px) + ${HEADER_H}px)`,
          paddingBottom: hideNav
            ? "env(safe-area-inset-bottom, 0px)"
            : `calc(env(safe-area-inset-bottom, 0px) + ${NAV_H}px)`,
          minHeight: "100vh",
        }}
      >
        {children}
      </main>

      {!hideNav && (
        <nav
          className="fixed bottom-0 left-0 right-0 z-50 ios-blur"
          style={{
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
            height: NAV_H,
            borderTop: "0.5px solid var(--separator)",
          }}
        >
          <div className="max-w-lg mx-auto h-full px-2 flex items-center justify-around">
            {NAV.map((item) => (
              <NavItem key={item.path} {...item} />
            ))}
          </div>
        </nav>
      )}

      {showExplore && <ExploreOverlay onClose={() => setShowExplore(false)} />}
    </div>
  );
}
