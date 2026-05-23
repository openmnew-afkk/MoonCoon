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
      <Link to={path} className="relative -mt-4 group flex-shrink-0">
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300",
          "shadow-lg",
          "group-active:scale-90",
        )} style={{ background: "hsl(var(--primary))" }}>
          <Plus size={24} strokeWidth={2.5} style={{ color: "hsl(var(--primary-foreground))" }} />
        </div>
        <div className="absolute inset-0 rounded-2xl opacity-40 blur-xl -z-10 group-hover:opacity-60 transition-opacity"
          style={{ background: "hsl(var(--primary))" }} />
      </Link>
    );
  }

  return (
    <Link to={path} className={cn(
      "relative flex flex-col items-center justify-center gap-0.5 w-14 h-14 rounded-2xl transition-all duration-300 select-none",
      isActive ? "text-primary" : "text-muted-foreground"
    )}>
      <span key={animKey} className={cn(
        "nav-top-indicator",
        isActive ? "nav-top-indicator--active" : "nav-top-indicator--inactive"
      )} />
      <Icon size={22} className={cn(
        "transition-all duration-300 relative z-10",
        isActive && "nav-icon--active"
      )} strokeWidth={isActive ? 2.5 : 1.8} />
      {label && (
        <span className={cn(
          "text-[10px] font-medium transition-all duration-300 relative z-10",
          isActive && "font-semibold"
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
  const searchInputRef = useRef<HTMLInputElement>(null);

  const pagesWithOwnHeader = ["/ai", "/create"];
  const showTopBar = !pagesWithOwnHeader.some(p => location.pathname.startsWith(p));

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 80);
    else setSearchQuery("");
  }, [searchOpen]);

  // Sync Telegram safe area insets
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (!tg) return;

    const updateSafeArea = () => {
      const top = tg.contentSafeAreaInset?.top ?? tg.safeAreaInset?.top ?? 0;
      const bottom = tg.safeAreaInset?.bottom ?? 0;
      document.documentElement.style.setProperty("--tg-safe-top", `${top}px`);
      document.documentElement.style.setProperty("--tg-safe-bottom", `${bottom}px`);
      // Extra offset so app header clears Telegram native chrome
      const chrome =
        top > 0 ? Math.max(44, 56 - top) : 52;
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
      {/* Top Bar */}
      {showTopBar && (
        <header
          className="fixed top-0 left-0 right-0 z-40 nav-glass border-b border-border/40"
          style={{ paddingTop: safeTop }}
        >
          <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
            <Link to="/" className="flex items-center gap-2 select-none">
              <span className="text-xl font-black gradient-text tracking-tight leading-none">{APP_NAME}</span>
            </Link>
            <div className="flex items-center gap-1.5">
              <button
                id="global-search-btn"
                onClick={() => setSearchOpen(true)}
                className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center transition-all bounce-tap",
                  "bg-white/[0.06] hover:bg-white/[0.1]",
                  location.pathname === "/explore" && "bg-primary/15 text-primary"
                )}
                aria-label="Поиск"
              >
                <Search size={18} className={cn(location.pathname === "/explore" && "text-primary")} />
              </button>
              <button
                className="w-9 h-9 rounded-xl flex items-center justify-center bounce-tap bg-white/[0.06] hover:bg-white/[0.1]"
                aria-label="Уведомления"
              >
                <Bell size={18} />
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ paddingTop: safeTop }}>
          <div className="absolute inset-0 bg-background/85 backdrop-blur-xl" onClick={() => setSearchOpen(false)} />
          <div className="relative z-10 nav-glass border-b border-border/40 px-4 py-3 flex items-center gap-3">
            <Search size={18} className="text-muted-foreground flex-shrink-0" />
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
              className="w-8 h-8 rounded-full flex items-center justify-center bg-white/[0.08] hover:bg-white/[0.12] transition-colors flex-shrink-0"
            >
              <X size={16} />
            </button>
          </div>
          <div className="relative z-10 max-w-2xl w-full mx-auto px-4 pt-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Популярные темы</p>
            <div className="flex flex-wrap gap-2">
              {["#Дизайн", "#Фотография", "#Путешествие", "#Искусство", "#Мода", "#Цели"].map(tag => (
                <button
                  key={tag}
                  onClick={() => { setSearchQuery(tag); handleSearchSubmit({ preventDefault: () => {} } as React.FormEvent); }}
                  className="px-3 py-1.5 rounded-full text-sm font-medium border border-primary/30 bg-primary/10 text-primary transition-all hover:bg-primary/20 active:scale-95"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div
        className="flex-1 overflow-y-auto min-h-0 pb-24"
        style={showTopBar ? { paddingTop: topBarHeight } : {}}
      >
        {children}
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40">
        <div className="nav-glass border-t border-border/40">
          <div
            className="max-w-2xl mx-auto h-[4.25rem] flex items-center justify-around px-3"
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
