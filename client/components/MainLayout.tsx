import React, { useState, useRef, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { Home, Plus, Sparkles, User, Search, X, Bell, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface MainLayoutProps { children: React.ReactNode; }

function NavItem({ path, icon: Icon, label, exact, isCreate }: {
  path: string; icon: any; label: string; exact?: boolean; isCreate?: boolean;
}) {
  const location = useLocation();
  const isActive = exact ? location.pathname === path : location.pathname.startsWith(path);
  const [wasActive, setWasActive] = useState(isActive);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    if (isActive && !wasActive) {
      setAnimKey(k => k + 1);
    }
    setWasActive(isActive);
  }, [isActive]);

  if (isCreate) {
    return (
      <Link to={path} className="relative -mt-5 group flex-shrink-0">
        <div className={cn(
          "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300",
          "bg-gradient-to-br from-primary via-accent to-primary",
          "shadow-lg shadow-primary/30 dark:shadow-primary/20",
          "group-active:scale-90 group-hover:shadow-xl group-hover:shadow-primary/40",
        )}>
          <Plus size={26} className="text-white" strokeWidth={2.5} />
        </div>
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary via-accent to-primary opacity-40 blur-xl -z-10 group-hover:opacity-60 transition-opacity" />
      </Link>
    );
  }

  return (
    <Link to={path}
      className={cn(
        "relative flex flex-col items-center justify-center gap-0.5 w-16 h-14 rounded-2xl transition-all duration-300 select-none",
        isActive ? "text-primary" : "text-muted-foreground hover:text-foreground/80"
      )}
    >
      {/* Top indicator pill */}
      <span
        key={animKey}
        className={cn(
          "nav-top-indicator",
          isActive ? "nav-top-indicator--active" : "nav-top-indicator--inactive"
        )}
      />

      <Icon
        size={22}
        className={cn(
          "transition-all duration-300 relative z-10",
          isActive && "nav-icon--active drop-shadow-[0_0_8px_hsl(var(--primary)/0.6)]"
        )}
        strokeWidth={isActive ? 2.5 : 1.8}
      />
      <span className={cn(
        "text-[10px] font-medium transition-all duration-300 relative z-10",
        isActive && "font-semibold"
      )}>
        {label}
      </span>
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

  // Sync --tg-safe-top from Telegram WebApp if available
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.safeAreaInset?.top != null) {
      document.documentElement.style.setProperty(
        "--tg-safe-area-inset-top",
        tg.safeAreaInset.top + "px"
      );
    }
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchOpen(false);
    navigate("/explore" + (searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ""));
  };

  return (
    <div className="flex flex-col h-screen app-shell">
      {/* Top Bar */}
      {showTopBar && (
        <header className="fixed top-0 left-0 right-0 z-40 nav-glass border-b border-white/[0.06]"
          style={{ paddingTop: "var(--tg-safe-top, env(safe-area-inset-top, 0px))" }}>
          <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
            <Link to="/" className="flex items-center gap-2 select-none">
              <span className="text-lg font-black gradient-text tracking-tight leading-none">Vexora</span>
            </Link>
            <div className="flex items-center gap-1.5">
              <button id="global-search-btn" onClick={() => setSearchOpen(true)}
                className={cn("w-9 h-9 rounded-xl flex items-center justify-center transition-all bounce-tap",
                  "bg-glass-light/30 dark:bg-white/[0.06] hover:bg-glass-light/50 dark:hover:bg-white/[0.1]",
                  location.pathname === "/explore" && "bg-primary/15 text-primary"
                )} aria-label="Поиск">
                <Search size={18} className={cn(location.pathname === "/explore" && "text-primary")} />
              </button>
              <button className="w-9 h-9 rounded-xl flex items-center justify-center transition-all bounce-tap bg-glass-light/30 dark:bg-white/[0.06] hover:bg-glass-light/50 relative" aria-label="Уведомления">
                <Bell size={18} />
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ paddingTop: "var(--tg-safe-top, env(safe-area-inset-top, 0px))" }}>
          <div className="absolute inset-0 bg-background/85 backdrop-blur-xl" onClick={() => setSearchOpen(false)} />
          <div className="relative z-10 nav-glass border-b border-white/[0.06] px-4 py-3 flex items-center gap-3">
            <Search size={18} className="text-muted-foreground flex-shrink-0" />
            <form onSubmit={handleSearchSubmit} className="flex-1">
              <input ref={searchInputRef} type="search" value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Поиск по Vexora..."
                className="w-full bg-transparent outline-none text-base placeholder:text-muted-foreground"
                autoComplete="off" />
            </form>
            <button onClick={() => setSearchOpen(false)}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-muted/60 hover:bg-muted transition-colors flex-shrink-0">
              <X size={16} />
            </button>
          </div>
          <div className="relative z-10 max-w-2xl w-full mx-auto px-4 pt-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Популярные темы</p>
            <div className="flex flex-wrap gap-2">
              {["#Дизайн", "#Фотография", "#Путешествие", "#Искусство", "#Веб", "#Мода"].map(tag => (
                <button key={tag} onClick={() => { setSearchQuery(tag); handleSearchSubmit({ preventDefault: () => {} } as React.FormEvent); }}
                  className="px-3 py-1.5 rounded-full text-sm font-medium border border-primary/25 bg-primary/10 text-primary transition-all hover:bg-primary/20 active:scale-95">
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className={cn("flex-1 overflow-y-auto min-h-0 pb-24")}
        style={showTopBar ? { paddingTop: `calc(var(--tg-safe-top, env(safe-area-inset-top, 0px)) + 3.5rem)` } : {}}>
        {children}
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40">
        <div className="h-6 bg-gradient-to-t from-background/80 to-transparent pointer-events-none" />
        <div className="nav-glass border-t border-white/[0.08] dark:border-white/[0.06]">
          <div className="max-w-2xl mx-auto h-[4.5rem] flex items-center justify-around px-3"
            style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)", paddingTop: "4px" }}>
            <NavItem path="/" icon={Home} label="Лента" exact />
            <NavItem path="/goals" icon={Target} label="Цели" />
            <NavItem path="/create" icon={Plus} label="" isCreate />
            <NavItem path="/ai" icon={Sparkles} label="Адель" />
            <NavItem path="/profile" icon={User} label="Профиль" />
          </div>
        </div>
      </nav>

      <style>{`
        /* Top indicator pill */
        .nav-top-indicator {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          height: 3px;
          border-radius: 0 0 4px 4px;
          pointer-events: none;
          transition: width 0.3s, opacity 0.3s;
        }
        .nav-top-indicator--inactive {
          width: 0;
          opacity: 0;
          background: transparent;
        }
        .nav-top-indicator--active {
          width: 28px;
          opacity: 1;
          background: linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent, var(--primary))));
          box-shadow: 0 0 10px 2px hsl(var(--primary) / 0.55), 0 0 3px 0 hsl(var(--primary) / 0.8);
          animation: nav-pill-drop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @keyframes nav-pill-drop {
          0%   { transform: translateX(-50%) scaleX(0.3) translateY(-6px); opacity: 0; }
          55%  { transform: translateX(-50%) scaleX(1.15) translateY(1px); opacity: 1; }
          75%  { transform: translateX(-50%) scaleX(0.95) translateY(-0.5px); }
          100% { transform: translateX(-50%) scaleX(1) translateY(0); opacity: 1; }
        }

        /* Icon bounce when tab becomes active */
        .nav-icon--active {
          animation: nav-icon-bounce 0.42s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes nav-icon-bounce {
          0%   { transform: scale(1) translateY(0); }
          35%  { transform: scale(1.25) translateY(-3px); }
          65%  { transform: scale(1.05) translateY(1px); }
          100% { transform: scale(1.1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
