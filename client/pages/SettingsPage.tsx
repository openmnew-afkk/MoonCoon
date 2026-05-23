import { Link } from "react-router-dom";
import { ChevronLeft, Bell, Lock, Info, Target, MessageCircle } from "lucide-react";
import { useState } from "react";
import ThemeSelector from "@/components/ThemeSelector";
import { useAppTheme } from "@/hooks/useAppTheme";
import { APP_NAME, APP_TAGLINE } from "@/lib/brand";
import { cn } from "@/lib/utils";

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className={cn("relative w-11 h-6 rounded-full", checked ? "bg-primary" : "bg-muted")}>
      <div className={cn("absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all",
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
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-md border-b border-border"
        style={{ paddingTop: safeTop }}>
        <div className="flex items-center gap-2 px-4 h-12">
          <Link to="/profile" className="w-9 h-9 flex items-center justify-center rounded-full bg-muted">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-lg font-semibold">Настройки</h1>
        </div>
      </div>

      <div className="px-4 py-5 space-y-6 max-w-lg mx-auto">
        <section>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">О приложении</p>
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="font-bold text-lg">{APP_NAME}</p>
            <p className="text-sm text-muted-foreground mt-1">{APP_TAGLINE}</p>
            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
              Мини-приложение Telegram: лента, истории, цели со звёздами, AI-помощник Адель.
              Профиль и баланс привязаны к вашему Telegram-аккаунту.
            </p>
            <p className="text-[11px] text-muted-foreground/60 mt-3">Версия 1.1.0</p>
          </div>
        </section>

        <section>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Внешний вид</p>
          <div className="rounded-2xl border border-border bg-card p-4">
            <ThemeSelector value={mode} onChange={setTheme} />
          </div>
        </section>

        <section>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Лента</p>
          <div className="rounded-2xl border border-border bg-card divide-y divide-border">
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
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Уведомления и приватность</p>
          <div className="rounded-2xl border border-border bg-card divide-y divide-border">
            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-3">
                <Bell size={18} className="text-muted-foreground" />
                <span className="text-[15px]">Push-уведомления</span>
              </div>
              <Toggle checked={notifications} onChange={setNotifications} />
            </div>
            <div className="flex items-center justify-between px-4 py-3.5 opacity-60">
              <div className="flex items-center gap-3">
                <Lock size={18} />
                <span className="text-[15px]">Приватный аккаунт</span>
              </div>
              <span className="text-xs text-muted-foreground">скоро</span>
            </div>
          </div>
        </section>

        <section>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Помощь</p>
          <div className="rounded-2xl border border-border bg-card divide-y divide-border">
            <a href="https://t.me/VexoraSupport" target="_blank" rel="noreferrer"
              className="flex items-center gap-3 px-4 py-3.5 text-[15px]">
              <MessageCircle size={18} className="text-primary" />
              Поддержка в Telegram
            </a>
            <div className="flex items-center gap-3 px-4 py-3.5 text-[15px] text-muted-foreground">
              <Info size={18} />
              Правила и конфиденциальность — в боте @VexoraSupport
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
