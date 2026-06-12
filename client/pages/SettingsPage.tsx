import { Link } from "react-router-dom";
import { ChevronLeft, Bell, Lock, Info, Target, MessageCircle, Palette, Shield, ExternalLink } from "lucide-react";
import { useState } from "react";
import ThemeSelector from "@/components/ThemeSelector";
import { useAppTheme } from "@/hooks/useAppTheme";
import { APP_NAME, APP_TAGLINE } from "@/lib/brand";

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className="toggle-luxe"
      data-state={checked ? "checked" : "unchecked"}>
      <div className="toggle-luxe-thumb" />
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
      <div className="glass sticky top-0 z-20 border-b border-white/5"
        style={{ paddingTop: safeTop }}>
        <div className="flex items-center gap-2 px-4 h-12">
          <Link to="/profile" className="btn-icon-luxe !w-9 !h-9">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-lg font-bold">Настройки</h1>
        </div>
      </div>

      <div className="px-4 py-5 space-y-6 max-w-lg mx-auto">
        <section>
          <p className="section-label">О приложении</p>
          <div className="section-card p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, hsl(280 60% 75% / 0.1), rgba(251,191,36,0.06))",
                  border: "1px solid hsl(280 60% 75% / 0.12)",
                }}>
                <span className="text-lg font-black text-gradient">V</span>
              </div>
              <div>
                <p className="font-bold text-lg">{APP_NAME}</p>
                <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{APP_TAGLINE}</p>
              </div>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "hsl(var(--muted-foreground))" }}>
              Мини-приложение Telegram: лента, истории, цели со звёздами, AI-помощник Адель.
              Профиль и баланс привязаны к вашему Telegram-аккаунту.
            </p>
            <p className="text-[11px] mt-3" style={{ color: "hsl(var(--muted-foreground) / 0.4)" }}>Версия 1.2.0</p>
          </div>
        </section>

        <section>
          <p className="section-label">Внешний вид</p>
          <div className="section-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Palette size={16} style={{ color: "#E8B4F8" }} />
              <span className="text-sm font-semibold">Тема</span>
            </div>
            <ThemeSelector value={mode} onChange={setTheme} />
          </div>
        </section>

        <section>
          <p className="section-label">Лента</p>
          <div className="section-card">
            <div className="setting-row">
              <div className="flex items-center gap-3">
                <Target size={18} style={{ color: "#E8B4F8" }} />
                <span className="text-[15px]">Цели в ленте</span>
              </div>
              <Toggle checked={goalsInFeed} onChange={onGoalsToggle} />
            </div>
          </div>
        </section>

        <section>
          <p className="section-label">Уведомления и приватность</p>
          <div className="section-card">
            <div className="setting-row">
              <div className="flex items-center gap-3">
                <Bell size={18} style={{ color: "#E8B4F8" }} />
                <span className="text-[15px]">Push-уведомления</span>
              </div>
              <Toggle checked={notifications} onChange={setNotifications} />
            </div>
            <div className="setting-row opacity-40">
              <div className="flex items-center gap-3">
                <Lock size={18} />
                <span className="text-[15px]">Приватный аккаунт</span>
              </div>
              <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>скоро</span>
            </div>
          </div>
        </section>

        <section>
          <p className="section-label">Помощь</p>
          <div className="section-card">
            <a href="https://t.me/VexoraSupport" target="_blank" rel="noreferrer"
              className="setting-row transition-colors"
              style={{ textDecoration: "none", color: "inherit" }}
              onMouseEnter={e => { e.currentTarget.style.background = "hsl(var(--secondary) / 0.5)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            >
              <div className="flex items-center gap-3">
                <MessageCircle size={18} style={{ color: "#E8B4F8" }} />
                <span className="text-[15px]">Поддержка в Telegram</span>
              </div>
              <ExternalLink size={14} style={{ color: "hsl(var(--muted-foreground))" }} />
            </a>
            <div className="setting-row">
              <div className="flex items-center gap-3">
                <Info size={18} />
                <span className="text-[15px]">Правила и конфиденциальность — в боте @VexoraSupport</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
