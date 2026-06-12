import { Link } from "react-router-dom";
import { ChevronLeft, Bell, Lock, Info, Target, MessageCircle, Palette, Shield, ExternalLink } from "lucide-react";
import { useState } from "react";
import ThemeSelector from "@/components/ThemeSelector";
import { useAppTheme } from "@/hooks/useAppTheme";
import { APP_NAME, APP_TAGLINE } from "@/lib/brand";

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="ios-toggle">
      <div className="ios-toggle-knob" data-state={checked ? "checked" : "unchecked"} />
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
    <div style={{ minHeight: "100dvh", background: "var(--bg)", paddingBottom: 96 }}>
      <div className="ios-blur" style={{ position: "sticky", top: 0, zIndex: 20, borderBottom: "0.5px solid var(--separator)", paddingTop: safeTop }}>
        <div className="flex items-center gap-2 px-4 h-12">
          <Link to="/profile" className="ios-icon-btn">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="ios-title" style={{ margin: 0 }}>Настройки</h1>
        </div>
      </div>

      <div className="px-4 py-5 space-y-6 max-w-lg mx-auto">
        <section>
          <p className="ios-section-header">О приложении</p>
          <div className="ios-card-grouped">
            <div className="ios-card" style={{ padding: 16 }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "var(--bg-tertiary)" }}>
                  <span className="ios-title" style={{ color: "var(--text-primary)" }}>V</span>
                </div>
                <div>
                  <p className="ios-body" style={{ fontWeight: 600, margin: 0 }}>{APP_NAME}</p>
                  <p className="ios-caption" style={{ color: "var(--text-tertiary)", margin: 0 }}>{APP_TAGLINE}</p>
                </div>
              </div>
              <p className="ios-caption" style={{ color: "var(--text-tertiary)", lineHeight: 1.5, margin: 0 }}>
                Мини-приложение Telegram: лента, истории, цели со звёздами, AI-помощник Адель.
                Профиль и баланс привязаны к вашему Telegram-аккаунту.
              </p>
              <p className="ios-caption" style={{ color: "var(--text-tertiary)", marginTop: 8, opacity: 0.5, margin: "8px 0 0" }}>Версия 1.2.0</p>
            </div>
          </div>
        </section>

        <section>
          <p className="ios-section-header">Внешний вид</p>
          <div className="ios-card-grouped">
            <div className="ios-card" style={{ padding: 16 }}>
              <div className="flex items-center gap-2 mb-3">
                <Palette size={16} style={{ color: "var(--text-secondary)" }} />
                <span className="ios-body" style={{ fontWeight: 500 }}>Тема</span>
              </div>
              <ThemeSelector value={mode} onChange={setTheme} />
            </div>
          </div>
        </section>

        <section>
          <p className="ios-section-header">Лента</p>
          <div className="ios-card-grouped">
            <div className="ios-card-row">
              <div className="flex items-center gap-3">
                <Target size={18} style={{ color: "var(--text-secondary)" }} />
                <span className="ios-body">Цели в ленте</span>
              </div>
              <Toggle checked={goalsInFeed} onChange={onGoalsToggle} />
            </div>
          </div>
        </section>

        <section>
          <p className="ios-section-header">Уведомления и приватность</p>
          <div className="ios-card-grouped">
            <div className="ios-card-row">
              <div className="flex items-center gap-3">
                <Bell size={18} style={{ color: "var(--text-secondary)" }} />
                <span className="ios-body">Push-уведомления</span>
              </div>
              <Toggle checked={notifications} onChange={setNotifications} />
            </div>
            <div className="ios-separator" />
            <div className="ios-card-row" style={{ opacity: 0.4 }}>
              <div className="flex items-center gap-3">
                <Lock size={18} style={{ color: "var(--text-secondary)" }} />
                <span className="ios-body">Приватный аккаунт</span>
              </div>
              <span className="ios-caption" style={{ color: "var(--text-tertiary)" }}>скоро</span>
            </div>
          </div>
        </section>

        <section>
          <p className="ios-section-header">Помощь</p>
          <div className="ios-card-grouped">
            <a href="https://t.me/VexoraSupport" target="_blank" rel="noreferrer"
              className="ios-card-row"
              style={{ textDecoration: "none", color: "inherit" }}>
              <div className="flex items-center gap-3">
                <MessageCircle size={18} style={{ color: "var(--text-secondary)" }} />
                <span className="ios-body">Поддержка в Telegram</span>
              </div>
              <ExternalLink size={14} style={{ color: "var(--text-tertiary)" }} />
            </a>
            <div className="ios-separator" />
            <div className="ios-card-row">
              <div className="flex items-center gap-3">
                <Info size={18} style={{ color: "var(--text-secondary)" }} />
                <span className="ios-body">Правила и конфиденциальность — в боте @VexoraSupport</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
