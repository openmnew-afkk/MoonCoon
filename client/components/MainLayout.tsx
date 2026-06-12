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
        <div className="fab-create active:scale-90">
          <Plus size={24} strokeWidth={2.5} color="#000" />
        </div>
      </Link>
    );
  }

  return (
    <Link to={path} className="flex flex-col items-center gap-1 w-14 py-1.5 no-underline active:scale-90"
      style={{ WebkitTapHighlightColor: "transparent", textDecoration: "none" }}>
      <div className="relative">
        <Icon size={22} strokeWidth={active ? 2.5 : 1.7}
          className={`transition-all duration-200 ${active ? "text-[#FBBF24] drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" : "text-white/20"}`} />
        {active && (
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gradient-to-r from-[#F59E0B] to-[#F97316] shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
        )}
      </div>
      <span className={`text-[10px] font-semibold transition-colors duration-200 ${active ? "text-[#FBBF24]" : "text-white/18"}`}>
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
        <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.06] mb-5">
          <Search size={18} className="text-[#F59E0B]/50" />
          <input placeholder="Поиск..." autoFocus className="flex-1 bg-transparent border-none outline-none text-white text-[15px]" />
          <button onClick={onClose} className="bg-transparent border-none cursor-pointer p-1">
            <X size={18} className="text-white/30" />
          </button>
        </div>
        <h3 className="text-[11px] font-bold text-[#FBBF24] tracking-[0.1em] uppercase mb-3 flex items-center gap-1.5">
          <TrendingUp size={14} /> Тренды
        </h3>
        {tags.map(t => (
          <button key={t.tag}
            className="flex items-center gap-3 w-full py-3.5 px-4 rounded-xl bg-white/[0.02] border border-white/[0.03] cursor-pointer text-left mb-1.5 active:scale-[0.98] transition-all hover:bg-white/[0.04] hover:border-white/[0.06]"
            style={{ WebkitTapHighlightColor: "transparent" }}>
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
      <header className="fixed top-0 left-0 right-0 z-50"
        style={{
          height: HEADER_H,
          paddingTop: "env(safe-area-inset-top, 0px)",
          background: "hsl(30 15% 3% / 0.88)",
          backdropFilter: "blur(40px) saturate(1.8)",
          WebkitBackdropFilter: "blur(40px) saturate(1.8)",
          borderBottom: "1px solid hsl(40 20% 50% / 0.06)",
        }}>
        <div className="max-w-lg mx-auto px-5 h-full flex items-center justify-between">
          <span className="text-[22px] font-bold tracking-[-0.04em] gradient-text"
            style={{ fontFamily: "Space Grotesk, sans-serif" }}>
            {APP_NAME}
          </span>
          <button onClick={() => setShowExplore(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center active:scale-90 transition-all"
            style={{
              background: "rgba(245,158,11,0.06)",
              border: "1px solid rgba(245,158,11,0.1)",
              WebkitTapHighlightColor: "transparent",
            }}>
            <Search size={16} className="text-[#F59E0B]/50" />
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
        <nav className="fixed bottom-0 left-0 right-0 z-50 nav-glass"
          style={{
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
            height: NAV_H,
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
