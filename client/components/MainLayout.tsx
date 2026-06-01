import React, { useState, useRef, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { Home, Plus, Sparkles, User, Search, X, Bell, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/brand";

interface MainLayoutProps { children: React.ReactNode; }

function NavItem({ path, icon: Icon, label, exact, isCreate }: {
  path: string; icon: any; label: string; exact?: boolean; isCreate?: boolean;
}) {
  const location = useLocation();
  const isActive = exact ? location.pathname === path : location.pathname.startsWith(path);
  const [wasActive, setWasActive] = useState(isActive);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    if (isActive && !wasActive) setAnimKey(k => k + 1);
    setWasActive(isActive);
  }, [isActive]);

  if (isCreate) {
    return (
      <Link to={path} className="relative -mt-5 group flex-shrink-0">
        {/* Outer glow ring */}
        <div className="absolute inset-[-6px] rounded-[22px] opacity-0 group-active:opacity-60 transition-opacity"
          style={{ background: "hsl(var(--primary))", filter: "blur(12px)", zIndex: -1 }} />
        <div
          className="w-14 h-14 rounded-[20px] flex items-center justify-center transition-all duration-200 group-active:scale-90 shadow-xl"
          style={{
            background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.8))",
            boxShadow: "0 8px 24px hsl(var(--primary) / 0.45), 0 0 0 1px hsl(var(--primary) / 0.2)",
          }}
        >
          <Plus size={26} strokeWidth={2.5} style={{ color: "hsl(var(--primary-foreground))" }} />
        </div>
      </Link>
    );
  }

  return (
    <Link to={path} className={cn(
      "relative flex flex-col items-center justify-center gap-0.5 w-14 h-14 rounded-2xl transition-all duration-300 select-none",
      isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
    )}>
      {/* Active indicator dot at top */}
      <span key={animKey} className={cn(
        "nav-top-indicator",
        isActive ? "nav-top-indicator--active" : "nav-top-indicator--inactive"
      )} />

      {/* Active background pill */}
      {isActive && (
        <span className="absolute inset-x-1 inset-y-1 rounded-xl transition-all"
          style={{ background: "hsl(var(--primary) / 0.12)" }} />
      )}

      <Icon size={22} className={cn(
        "transition-all duration-300 relative z-10",
        isActive && "nav-icon--active"
      )} strokeWidth={isActive ? 2.5 : 1.8} />

      {label && (
        <span className={cn(
          "text-[10px] font-medium transition-all duration-300 relative z-10 leading-none",
          isActive && "font-bold"
        )}>{label}</span>
      )}
    </Link>
  );
}

export default function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifPulse, setNotifPulse] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const pagesWithOwnHeader = ["/ai", "/create"];
  const showTopBar = !pagesWithOwnHeader.some(p => location.pathname.startsWith(p));

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 80);
    else setSearchQuery("");
  }, [searchOpen]);

  // Simulate a notification badge after load
  useEffect(() => {
    const t = setTimeout(() => setNotifPulse(true), 3000);
    return () => clearTimeout(t);
  }, []);

  // Sync Telegram safe area insets
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (!tg) return;
    const updateSafeArea = () => {
      const top = tg.contentSafeAreaInset?.top ?? tg.safeAreaInset?.top ?? 0;
      const bottom = tg.safeAreaInset?.bottom ?? 0;
      document.documentElement.style.setProperty("--tg-safe-top", `${top}px`);
      document.documentElement.style.setProperty("--tg-safe-bottom", `${bottom}px`);
      const chrome = top > 0 ? Math.max(44, 56 - top) : 52;
      document.documentElement.style.setProperty("--tg-chrome-top", `${chrome}px`);
    };
    updateSafeArea();
    tg.onEvent?.("safeAreaChanged", updateSafeArea);
    tg.onEvent?.("contentSafeAreaChanged", updateSafeArea);
    return () => {
      tg.offEvent?.("safeAreaChanged", updateSafeArea);
      tg.offEvent?.("contentSafeAreaChanged", updateSafeArea);
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchOpen(false);
    navigate("/explore" + (searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ""));
  };

  const safeTop = "calc(var(--tg-safe-top, 0px) + var(--tg-chrome-top, 52px))";
  const topBarHeight = `calc(${safeTop} + 3.5rem)`;

  return (
    <div className="flex flex-col h-screen app-shell">

      {/* ── Top Bar ──────────────────────────────────────────────────── */}
      {showTopBar && (
        <header
          className="fixed top-0 left-0 right-0 z-40 nav-glass border-b border-border/30"
          style={{ paddingTop: safeTop }}
        >
          <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 select-none group">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
                style={{
                  background: "linear-gradient(135deg, hsl(var(--primary) / 0.2), hsl(var(--primary) / 0.1))",
                  border: "1px solid hsl(var(--primary) / 0.25)",
                  boxShadow: "0 0 12px hsl(var(--primary) / 0.15)",
                }}>
                🌙
              </div>
              <span className="text-xl font-black gradient-text tracking-tight leading-none">
                {APP_NAME}
              </span>
            </Link>

            {/* Actions */}
            <div className="flex items-center gap-1.5">
              <button
                id="global-search-btn"
                onClick={() => setSearchOpen(true)}
                className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center transition-all bounce-tap",
                  "border border-border/40",
                  location.pathname === "/explore"
                    ? "bg-primary/15 text-primary border-primary/30"
                    : "bg-card/60 hover:bg-card"
                )}
                aria-label="Поиск"
              >
                <Search size={17} className={cn(location.pathname === "/explore" && "text-primary")} />
              </button>

              <button
                className="relative w-9 h-9 rounded-xl flex items-center justify-center bounce-tap bg-card/60 hover:bg-card border border-border/40 transition-all"
                aria-label="Уведомления"
                onClick={() => setNotifPulse(false)}
              >
                <Bell size={17} />
                {notifPulse && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary animate-pulse"
                    style={{ boxShadow: "0 0 6px hsl(var(--primary))" }} />
                )}
              </button>
            </div>
          </div>
        </header>
      )}

      {/* ── Search Overlay ────────────────────────────────────────────── */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ paddingTop: safeTop }}>
          <div className="absolute inset-0 bg-background/90 backdrop-blur-2xl" onClick={() => setSearchOpen(false)} />
          <div className="relative z-10 nav-glass border-b border-border/40 px-4 py-3 flex items-center gap-3">
            <Search size={18} className="text-primary flex-shrink-0" />
            <form onSubmit={handleSearchSubmit} className="flex-1">
              <input
                ref={searchInputRef}
                type="search"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={`Поиск в ${APP_NAME}...`}
                className="w-full bg-transparent outline-none text-base placeholder:text-muted-foreground"
                autoComplete="off"
              />
            </form>
            <button
              onClick={() => setSearchOpen(false)}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-card hover:bg-muted transition-colors flex-shrink-0"
            >
              <X size={15} />
            </button>
          </div>
          <div className="relative z-10 max-w-2xl w-full mx-auto px-4 pt-6">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Популярные темы</p>
            <div className="flex flex-wrap gap-2">
              {["#Дизайн", "#Фотография", "#Путешествие", "#Искусство", "#Мода", "#Цели"].map(tag => (
                <button
                  key={tag}
                  onClick={() => { setSearchQuery(tag); handleSearchSubmit({ preventDefault: () => {} } as React.FormEvent); }}
                  className="px-3 py-1.5 rounded-full text-sm font-semibold transition-all hover:scale-105 active:scale-95"
                  style={{ border: "1px solid hsl(var(--primary) / 0.35)", background: "hsl(var(--primary) / 0.1)", color: "hsl(var(--primary))" }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Content ───────────────────────────────────────────────────── */}
      <div
        className="flex-1 overflow-y-auto min-h-0 pb-24"
        style={showTopBar ? { paddingTop: topBarHeight } : {}}
      >
        {children}
      </div>

      {/* ── Bottom Nav ────────────────────────────────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40">
        {/* Top glow accent line */}
        <div className="h-px w-full" style={{
          background: "linear-gradient(90deg, transparent 5%, hsl(var(--primary) / 0.3) 30%, hsl(var(--primary) / 0.5) 50%, hsl(var(--primary) / 0.3) 70%, transparent 95%)",
        }} />
        <div className="nav-glass">
          <div
            className="max-w-2xl mx-auto h-[4.5rem] flex items-center justify-around px-3"
            style={{ paddingBottom: "var(--tg-safe-bottom, env(safe-area-inset-bottom, 0px))" }}
          >
            <NavItem path="/" icon={Home} label="Лента" exact />
            <NavItem path="/goals" icon={Target} label="Цели" />
            <NavItem path="/create" icon={Plus} label="" isCreate />
            <NavItem path="/ai" icon={Sparkles} label="Адель" />
            <NavItem path="/profile" icon={User} label="Профиль" />
          </div>
        </div>
      </nav>
    </div>
  );
}
