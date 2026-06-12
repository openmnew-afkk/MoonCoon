import { Link } from "react-router-dom";
import { ChevronLeft, Bell, Lock, Info, Target, MessageCircle, Palette, Shield, ExternalLink } from "lucide-react";
import { useState } from "react";
import ThemeSelector from "@/components/ThemeSelector";
import { useAppTheme } from "@/hooks/useAppTheme";
import { APP_NAME, APP_TAGLINE } from "@/lib/brand";
import { cn } from "@/lib/utils";

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className="relative w-11 h-6 rounded-full transition-colors"
      style={{ background: checked ? "linear-gradient(135deg, #3b82f6, #8b5cf6)" : "hsl(var(--secondary))" }}>
      <div className={cn("absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all shadow-md",
        checked ? "left-[22px]" : "left-0.5")} />
    </button>
  );
}

export default function SettingsPage() {
  const { mode, setTheme } = useAppTheme();
  const [goalsInFeed, setGoalsInFeed] = useState(
    () => localStorage.getItem("vexora-show-goals-feed") !== "false",
  );
  const [notifications, setNotifications] = useState(true);

  const safeTop = "calc(var(--tg-safe-top, 0px) + var(--tg-chrome-top, 52px))";

  const onGoalsToggle = (v: boolean) => {
    setGoalsInFeed(v);
    localStorage.setItem("vexora-show-goals-feed", String(v));
    window.dispatchEvent(new CustomEvent("vexora-prefs-change", { detail: { showGoalsInFeed: v } }));
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-20 border-b border-border/30"
        style={{ background: "hsl(var(--background) / 0.92)", backdropFilter: "blur(32px)", WebkitBackdropFilter: "blur(32px)", paddingTop: safeTop }}>
        <div className="flex items-center gap-2 px-4 h-12">
          <Link to="/profile" className="w-9 h-9 flex items-center justify-center rounded-xl bg-secondary transition-colors hover:bg-secondary/80">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-lg font-bold">Настройки</h1>
        </div>
      </div>

      <div className="px-4 py-5 space-y-6 max-w-lg mx-auto">
        <section>
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">О приложении</p>
          <div className="rounded-2xl border border-border/50 p-4" style={{ background: "hsl(var(--card))", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(139,92,246,0.08))", border: "1px solid rgba(59,130,246,0.15)" }}>
                <span className="text-lg font-black gradient-text">V</span>
              </div>
              <div>
                <p className="font-bold text-lg">{APP_NAME}</p>
                <p className="text-xs text-muted-foreground">{APP_TAGLINE}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Мини-приложение Telegram: лента, истории, цели со звёздами, AI-помощник Адель.
              Профиль и баланс привязаны к вашему Telegram-аккаунту.
            </p>
            <p className="text-[11px] text-muted-foreground/50 mt-3">Версия 1.2.0</p>
          </div>
        </section>

        <section>
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">Внешний вид</p>
          <div className="rounded-2xl border border-border/50 p-4" style={{ background: "hsl(var(--card))", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
            <div className="flex items-center gap-2 mb-3">
              <Palette size={16} className="text-primary" />
              <span className="text-sm font-semibold">Тема</span>
            </div>
            <ThemeSelector value={mode} onChange={setTheme} />
          </div>
        </section>

        <section>
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">Лента</p>
          <div className="rounded-2xl border border-border/50 overflow-hidden" style={{ background: "hsl(var(--card))", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-3">
                <Target size={18} className="text-primary" />
                <span className="text-[15px]">Цели в ленте</span>
              </div>
              <Toggle checked={goalsInFeed} onChange={onGoalsToggle} />
            </div>
          </div>
        </section>

        <section>
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">Уведомления и приватность</p>
          <div className="rounded-2xl border border-border/50 overflow-hidden" style={{ background: "hsl(var(--card))", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-3">
                <Bell size={18} className="text-primary" />
                <span className="text-[15px]">Push-уведомления</span>
              </div>
              <Toggle checked={notifications} onChange={setNotifications} />
            </div>
            <div className="h-px bg-border/30 mx-4" />
            <div className="flex items-center justify-between px-4 py-3.5 opacity-50">
              <div className="flex items-center gap-3">
                <Lock size={18} />
                <span className="text-[15px]">Приватный аккаунт</span>
              </div>
              <span className="text-xs text-muted-foreground">скоро</span>
            </div>
          </div>
        </section>

        <section>
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">Помощь</p>
          <div className="rounded-2xl border border-border/50 overflow-hidden" style={{ background: "hsl(var(--card))", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
            <a href="https://t.me/VexoraSupport" target="_blank" rel="noreferrer"
              className="flex items-center gap-3 px-4 py-3.5 text-[15px] transition-colors hover:bg-secondary/50">
              <MessageCircle size={18} className="text-primary" />
              <span className="flex-1">Поддержка в Telegram</span>
              <ExternalLink size={14} className="text-muted-foreground" />
            </a>
            <div className="h-px bg-border/30 mx-4" />
            <div className="flex items-center gap-3 px-4 py-3.5 text-[15px] text-muted-foreground">
              <Info size={18} />
              <span>Правила и конфиденциальность — в боте @VexoraSupport</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
