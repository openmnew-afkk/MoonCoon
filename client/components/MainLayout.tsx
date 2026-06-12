import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Home, Plus, Sparkles, User, Music, Search, TrendingUp, X } from "lucide-react";
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
      <Link to={path} style={{ textDecoration: "none" }}>
        <div className="fab-luxe">
          <Plus size={24} strokeWidth={2.5} color="#000" />
        </div>
      </Link>
    );
  }

  return (
    <Link to={path} className="flex flex-col items-center gap-1 w-14 py-1.5"
      style={{ WebkitTapHighlightColor: "transparent", textDecoration: "none" }}>
      <div className="relative">
        <Icon size={22} strokeWidth={active ? 2.5 : 1.7}
          className={`transition-all duration-200 ${active ? "text-[var(--accent)] drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" : "text-white/20"}`} />
        {active && (
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
        )}
      </div>
      <span className={`text-[10px] font-semibold transition-colors duration-200 ${active ? "text-[var(--accent)]" : "text-white/18"}`}>
        {label}
      </span>
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
    <div className="fixed inset-0 z-200 bg-black/80 backdrop-blur-xl" onClick={onClose}>
      <div className="max-w-lg mx-auto px-5 pt-20" onClick={e => e.stopPropagation()}>
        <div className="input-luxe flex items-center gap-3 mb-5">
          <Search size={18} className="text-[var(--primary)]" style={{ opacity: 0.6 }} />
          <input placeholder="Поиск..." autoFocus className="flex-1 bg-transparent border-none outline-none text-white text-[15px]" />
          <button onClick={onClose} className="btn-icon-luxe !w-7 !h-7">
            <X size={14} />
          </button>
        </div>
        <h3 className="section-label flex items-center gap-1.5 text-[var(--accent)]">
          <TrendingUp size={14} /> Тренды
        </h3>
        {tags.map(t => (
          <button key={t.tag}
            className="flex items-center gap-3 w-full py-3.5 px-4 rounded-xl cursor-pointer text-left mb-1.5 active:scale-[0.98] transition-all border-none"
            style={{ background: "hsl(var(--card) / 0.5)", borderColor: "hsl(240 12% 20% / 0.3)", WebkitTapHighlightColor: "transparent" }}>
            <span className="text-xl">{t.emoji}</span>
            <span className="flex-1 text-sm font-semibold text-white/90">{t.tag}</span>
            <span className="text-xs text-white/25">{t.n}</span>
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
  const NAV_H = 72;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass"
        style={{
          height: HEADER_H,
          paddingTop: "env(safe-area-inset-top, 0px)",
          borderBottom: "1px solid hsl(240 12% 20% / 0.5)",
        }}>
        <div className="max-w-lg mx-auto px-5 h-full flex items-center justify-between">
          <span className="text-[22px] font-bold tracking-[-0.04em] text-gradient"
            style={{ fontFamily: "Space Grotesk, sans-serif" }}>
            {APP_NAME}
          </span>
          <button onClick={() => setShowExplore(true)}
            className="btn-icon-luxe">
            <Search size={16} className="text-[var(--primary)]" style={{ opacity: 0.6 }} />
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

      {/* Bottom Nav */}
      {!hideNav && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 glass"
          style={{
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
            height: NAV_H,
            borderTop: "1px solid hsl(240 12% 20% / 0.5)",
          }}>
          <div className="max-w-lg mx-auto h-full px-2 flex items-center justify-around">
            {NAV.map(item => <NavItem key={item.path} {...item} />)}
          </div>
        </nav>
      )}

      {showExplore && <ExploreOverlay onClose={() => setShowExplore(false)} />}
    </div>
  );
}
