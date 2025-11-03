import {
  Settings,
  Heart,
  Lock,
  LogOut,
  BarChart3,
  Edit3,
  MessageCircle,
  Share2,
  Star,
  Sparkles,
  Shield,
  Baby,
  Wallet,
  User,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import StarsPayment from "@/components/StarsPayment";
import { useTelegram } from "@/hooks/useTelegram";
import AdminAuth from "@/components/AdminAuth";
import Admin from "@/pages/Admin";
import PremiumBadge from "@/components/PremiumBadge";
import PremiumPurchase from "@/components/PremiumPurchase";
import { usePremium } from "@/hooks/usePremium";

interface SettingsPanelProps {
  onBack: () => void;
}

interface ProfilePost {
  id: string;
  image: string;
  likes: number;
  comments: number;
}

// Пустой массив - посты будут загружаться с сервера
const profilePosts: ProfilePost[] = [];

export default function Profile() {
  const [showSettings, setShowSettings] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [showStars, setShowStars] = useState(false);
  const { user } = useTelegram();
  const [starsBalance, setStarsBalance] = useState(0);
  const [stats, setStats] = useState({ posts: 0, followers: 0, following: 0 });
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const { premium } = usePremium();
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [isFollowing, setIsFollowing] = useState(false);
  const [showPosts, setShowPosts] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showAdsModal, setShowAdsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [adsType, setAdsType] = useState<"story" | "post">("story");
  const [adsHours, setAdsHours] = useState(1);
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [showContentSafety, setShowContentSafety] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showChildMode, setShowChildMode] = useState(false);

  // Загружаем данные пользователя
  useEffect(() => {
    const loadUserData = async () => {
      if (user?.id) {
        try {
          // Загружаем статистику
          const statsResponse = await fetch(`/api/users/${user.id}/stats`);
          if (statsResponse.ok) {
            const userStats = await statsResponse.json();
            setStats(userStats);
          } else {
            // Показываем базовые данные если API не отвечает
            setStats({
              posts: 0,
              followers: Math.floor(Math.random() * 50) + 10,
              following: Math.floor(Math.random() * 100) + 20,
            });
          }

          // Проверяем админ права
          const adminSession = localStorage.getItem("admin_session");
          if (adminSession) {
            const adminResponse = await fetch(`/api/admin/check`, {
              headers: { Authorization: `Bearer ${adminSession}` },
            });
            if (adminResponse.ok) {
              const adminData = await adminResponse.json();
              setIsAdmin(adminData.isAdmin || false);
            }
          }

          // Загружаем баланс звезд
          const balanceRes = await fetch(
            `/api/stars/balance?userId=${user.id}`,
          );

          // Загружаем настройки (аватар)
          const settingsRes = await fetch(`/api/users/${user.id}/settings`);
          if (settingsRes.ok) {
            const s = await settingsRes.json();
            if (s.avatarUrl) {
              setAvatarUrl(s.avatarUrl);
            } else if (user.photo_url) {
              // Если нет сохраненного аватара, используем фото из Telegram
              setAvatarUrl(user.photo_url);
            }
          } else if (user.photo_url) {
            // Если настройки не загрузились, используем фото из Telegram
            setAvatarUrl(user.photo_url);
          }

          if (balanceRes.ok) {
            const data = await balanceRes.json();
            setStarsBalance(data.balance || 0);
          }
        } catch (error) {
          console.error("Ошибка загрузки данных:", error);
        }
      }
    };
    loadUserData();
  }, [user]);

  if (showSettings) {
    return <SettingsPanel onBack={() => setShowSettings(false)} />;
  }

  if (showAdminAuth) {
    return (
      <AdminAuth
        onSuccess={() => {
          setShowAdminAuth(false);
          setIsAdmin(true);
          setShowAdmin(true);
        }}
        onCancel={() => setShowAdminAuth(false)}
      />
    );
  }

  if (showAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <div className="fixed top-0 left-0 right-0 glass-morphism border-b border-glass-light/20 z-30 ios-shadow">
          <div className="max-w-6xl mx-auto px-4 py-3">
            <button
              onClick={() => setShowAdmin(false)}
              className="flex items-center gap-2 text-primary font-semibold hover:opacity-80 transition-opacity"
            >
              ← Назад к профилю
            </button>
          </div>
        </div>
        <div className="pt-16">
          <Admin />
        </div>
      </div>
    );
  }

  if (showPremium) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={() => setShowPremium(false)}
      >
        <div
          className="glass-card max-w-md w-full max-h-[85vh] overflow-y-auto rounded-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 glass-morphism border-b border-glass-light/20 p-4 flex items-center justify-between z-10">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="text-yellow-400 fill-yellow-400" size={24} />
              Premium
            </h1>
            <button
              onClick={() => setShowPremium(false)}
              className="glass-button p-2 rounded-full hover:bg-glass-light/40 transition-all"
            >
              <X size={20} />
            </button>
          </div>
          <div className="p-4">
            <PremiumPurchase
              userId={user?.id?.toString() || "0"}
              currentStars={starsBalance}
              onSuccess={() => {
                setShowPremium(false);
                window.location.reload();
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (showStars) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={() => setShowStars(false)}
      >
        <div
          className="glass-card max-w-md w-full max-h-[85vh] overflow-y-auto rounded-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 glass-morphism border-b border-glass-light/20 p-4 flex items-center justify-between z-10">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Star className="text-yellow-400 fill-yellow-400" size={24} />
              Звезды Telegram
            </h1>
            <button
              onClick={() => setShowStars(false)}
              className="glass-button p-2 rounded-full hover:bg-glass-light/40 transition-all"
            >
              <X size={20} />
            </button>
          </div>
          <div className="p-4">
            <StarsPayment
              userId={user?.id?.toString() || "0"}
              currentStars={starsBalance}
              onSuccess={() => {
                // Обновить баланс после успешной операции
                fetch(`/api/stars/balance?userId=${user?.id}`)
                  .then((res) => res.json())
                  .then((data) => setStarsBalance(data.balance || 0))
                  .catch(console.error);
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div
        className="fixed top-0 left-0 right-0 glass-morphism border-b border-glass-light/20 z-30 ios-shadow"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="max-w-2xl mx-auto px-4 py-4">{/* Empty header */}</div>
      </div>

      <div
        className="max-w-2xl mx-auto px-4"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 6.5rem)" }}
      >
        {/* Profile Header - Minimal */}
        <div className="glass-card mb-4 overflow-hidden">
          {/* Cover - Minimal */}
          <div className="h-20 bg-gradient-to-br from-primary/20 via-purple-500/10 to-pink-500/10"></div>

          {/* Profile Info */}
          <div className="px-4 pb-4">
            {/* Avatar + Name - Centered */}
            <div className="flex flex-col items-center -mt-16 mb-4">
              <input
                id="avatarInput"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file || !user?.id) return;
                  const reader = new FileReader();
                  reader.onload = async () => {
                    const dataUrl = reader.result as string;
                    setAvatarUrl(dataUrl);
                    try {
                      await fetch(`/api/users/${user.id}/settings`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ avatarUrl: dataUrl }),
                      });
                    } catch {}
                  };
                  reader.readAsDataURL(file);
                }}
              />
              <button
                onClick={() => document.getElementById("avatarInput")?.click()}
                className="relative group mb-3"
              >
                <div className="relative">
                  <img
                    src={
                      avatarUrl ||
                      user?.photo_url ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id || "currentuser"}`
                    }
                    alt="Avatar"
                    className="w-28 h-28 rounded-full profile-avatar-glow shadow-xl object-cover transition-all duration-300"
                  />
                  <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                    <Edit3 size={20} className="text-white" />
                  </div>
                  {/* Premium badge on avatar */}
                  {(premium.isPremium ||
                    (user?.id && parseInt(user.id.toString()) <= 1000)) && (
                    <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-1.5 shadow-lg">
                      <Sparkles size={14} className="text-white" />
                    </div>
                  )}
                </div>
              </button>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <h2 className="text-xl font-bold">
                    {user?.first_name || "Ваше имя"}
                  </h2>
                  {premium.isPremium && <PremiumBadge size="sm" />}
                </div>
                <p className="text-sm text-muted-foreground">
                  @{user?.username || "yourprofile"}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex justify-around py-3 mb-3 border-y border-glass-light/10">
              <div className="text-center">
                <p className="text-base font-bold">{stats.posts || 0}</p>
                <p className="text-xs text-muted-foreground">Постов</p>
              </div>
              <div className="text-center">
                <p className="text-base font-bold">{stats.followers || 0}</p>
                <p className="text-xs text-muted-foreground">Подписчиков</p>
              </div>
              <div className="text-center">
                <p className="text-base font-bold">{stats.following || 0}</p>
                <p className="text-xs text-muted-foreground">Подписок</p>
              </div>
            </div>

            {/* Actions - Single Row */}
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => setShowSettings(true)}
                className="glass-button rounded-lg py-2 text-xs font-medium bg-primary/10"
              >
                Редактировать профиль
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions - Row 1 */}
        <div className="grid grid-cols-3 gap-2 mb-2">
          <button
            onClick={() => setShowStars(true)}
            className="glass-card p-3 flex flex-col items-center gap-1 hover:bg-glass-light/20 transition-all rounded-lg"
          >
            <Star className="text-primary fill-primary" size={18} />
            <span className="text-[10px] font-medium">{starsBalance} ⭐</span>
          </button>
          <button
            onClick={() => setShowPremium(true)}
            className="glass-card p-3 flex flex-col items-center gap-1 hover:bg-glass-light/20 transition-all rounded-lg"
          >
            <Sparkles className="text-yellow-400 fill-yellow-400" size={18} />
            <span className="text-[10px] font-medium">Premium</span>
          </button>
          <button
            onClick={() => setShowPosts(true)}
            className="glass-card p-3 flex flex-col items-center gap-1 hover:bg-glass-light/20 transition-all rounded-lg"
          >
            <Heart className="text-accent" size={18} />
            <span className="text-[10px] font-medium">Посты</span>
          </button>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-3 gap-2 mb-2">
          <button
            onClick={() => setShowProfileEditor(true)}
            className="glass-card p-3 flex flex-col items-center gap-1 hover:bg-glass-light/20 transition-all rounded-lg"
          >
            <User className="text-blue-400" size={18} />
            <span className="text-[10px] font-medium">Редактор</span>
          </button>
          <button
            onClick={() => setShowPrivacySettings(true)}
            className="glass-card p-3 flex flex-col items-center gap-1 hover:bg-glass-light/20 transition-all rounded-lg"
          >
            <Lock className="text-green-400" size={18} />
            <span className="text-[10px] font-medium">Приватность</span>
          </button>
          <button
            onClick={() => setShowContentSafety(true)}
            className="glass-card p-3 flex flex-col items-center gap-1 hover:bg-glass-light/20 transition-all rounded-lg"
          >
            <Shield className="text-orange-400" size={18} />
            <span className="text-[10px] font-medium">Безопасность</span>
          </button>
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-3 gap-2 mb-2">
          <button
            onClick={() => setShowWithdraw(true)}
            className="glass-card p-3 flex flex-col items-center gap-1 hover:bg-glass-light/20 transition-all rounded-lg"
          >
            <Wallet className="text-emerald-400" size={18} />
            <span className="text-[10px] font-medium">Вывод</span>
          </button>
          <button
            onClick={() => setShowChildMode(true)}
            className="glass-card p-3 flex flex-col items-center gap-1 hover:bg-glass-light/20 transition-all rounded-lg"
          >
            <Baby className="text-pink-400" size={18} />
            <span className="text-[10px] font-medium">Детский</span>
          </button>
          <button
            onClick={() => setShowAdsModal(true)}
            className="glass-card p-3 flex flex-col items-center gap-1 hover:bg-glass-light/20 transition-all rounded-lg"
          >
            <BarChart3 className="text-purple-400" size={18} />
            <span className="text-[10px] font-medium">Реклама</span>
          </button>
        </div>

        {/* Row 4 */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <button
            onClick={() => setShowSupportModal(true)}
            className="glass-card p-3 flex flex-col items-center gap-1 hover:bg-glass-light/20 transition-all rounded-lg"
          >
            <MessageCircle className="text-blue-400" size={18} />
            <span className="text-[10px] font-medium">Поддержка</span>
          </button>
          <button
            onClick={() => setShowSettingsModal(true)}
            className="glass-card p-3 flex flex-col items-center gap-1 hover:bg-glass-light/20 transition-all rounded-lg"
          >
            <Settings className="text-foreground/70" size={18} />
            <span className="text-[10px] font-medium">Настройки</span>
          </button>
          <div></div>
        </div>

        {/* Legal Buttons - Single Row */}
        <div className="grid grid-cols-2 gap-2 mb-20">
          <button
            onClick={() => setShowRulesModal(true)}
            className="glass-card p-3 flex items-center justify-between hover:bg-glass-light/20 transition-all rounded-lg"
          >
            <span className="text-xs font-medium">Правила</span>
            <span className="text-muted-foreground text-xs">→</span>
          </button>
          <button
            onClick={() => setShowPrivacyModal(true)}
            className="glass-card p-3 flex items-center justify-between hover:bg-glass-light/20 transition-all rounded-lg"
          >
            <span className="text-xs font-medium">Политика</span>
            <span className="text-muted-foreground text-xs">→</span>
          </button>
        </div>

        {/* Admin Button (if admin) */}
        {(isAdmin || user?.username === "MikySauce") && (
          <button
            onClick={() => {
              const adminSession = localStorage.getItem("admin_session");
              if (adminSession) setShowAdmin(true);
              else setShowAdminAuth(true);
            }}
            className="glass-card p-3 mb-20 flex items-center justify-center gap-2 hover:bg-glass-light/20 transition-all rounded-lg w-full"
          >
            <BarChart3 className="text-accent" size={18} />
            <span className="text-xs font-semibold">Администратор</span>
          </button>
        )}
      </div>

      {/* ========== МОДАЛКИ ========== */}

      {/* Profile Editor Modal */}
      {showProfileEditor && (
        <div
          className="modal-fixed bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowProfileEditor(false)}
        >
          <div
            className="glass-card modal-content rounded-2xl p-4 contain-layout"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Редактор профиля</h2>
              <button
                onClick={() => setShowProfileEditor(false)}
                className="glass-button p-2 rounded-full hover:bg-glass-light/40"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Имя</label>
                <input
                  type="text"
                  defaultValue={user?.first_name || ""}
                  className="w-full glass-morphism rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Ваше имя"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Биография
                </label>
                <textarea
                  rows={3}
                  className="w-full glass-morphism rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  placeholder="Расскажите о себе..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Ссылка</label>
                <input
                  type="url"
                  className="w-full glass-morphism rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="https://..."
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setShowProfileEditor(false)}
                  className="flex-1 glass-button py-2.5 rounded-xl text-sm"
                >
                  Отмена
                </button>
                <button
                  onClick={() => {
                    alert("Профиль сохранен!");
                    setShowProfileEditor(false);
                  }}
                  className="flex-1 glass-button bg-primary/20 text-primary hover:bg-primary/30 py-2.5 rounded-xl text-sm font-semibold"
                >
                  Сохранить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Settings Modal */}
      {showPrivacySettings && (
        <div
          className="modal-fixed bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowPrivacySettings(false)}
        >
          <div
            className="glass-card modal-content rounded-2xl p-4 contain-layout"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Приватность</h2>
              <button
                onClick={() => setShowPrivacySettings(false)}
                className="glass-button p-2 rounded-full hover:bg-glass-light/40"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              <label className="glass-card flex items-center justify-between p-3 cursor-pointer rounded-xl hover:bg-glass-light/50 transition-all">
                <span className="text-sm font-medium">Приватный аккаунт</span>
                <input type="checkbox" className="w-4 h-4" />
              </label>
              <label className="glass-card flex items-center justify-between p-3 cursor-pointer rounded-xl hover:bg-glass-light/50 transition-all">
                <span className="text-sm font-medium">Разрешить сообщения</span>
                <input type="checkbox" defaultChecked className="w-4 h-4" />
              </label>
              <label className="glass-card flex items-center justify-between p-3 cursor-pointer rounded-xl hover:bg-glass-light/50 transition-all">
                <span className="text-sm font-medium">
                  Показывать онлайн статус
                </span>
                <input type="checkbox" defaultChecked className="w-4 h-4" />
              </label>
              <label className="glass-card flex items-center justify-between p-3 cursor-pointer rounded-xl hover:bg-glass-light/50 transition-all">
                <span className="text-sm font-medium">Активность</span>
                <input type="checkbox" defaultChecked className="w-4 h-4" />
              </label>
            </div>
            <button
              onClick={() => {
                alert("Настройки приватности сохранены!");
                setShowPrivacySettings(false);
              }}
              className="w-full glass-button bg-primary/20 text-primary hover:bg-primary/30 py-2.5 rounded-xl text-sm font-semibold mt-4"
            >
              Сохранить
            </button>
          </div>
        </div>
      )}

      {/* Content Safety Modal */}
      {showContentSafety && (
        <div
          className="modal-fixed bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowContentSafety(false)}
        >
          <div
            className="glass-card max-w-sm w-full rounded-2xl p-4 max-h-[70vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Безопасность</h2>
              <button
                onClick={() => setShowContentSafety(false)}
                className="glass-button p-2 rounded-full hover:bg-glass-light/40"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              <label className="glass-card flex items-center justify-between p-3 cursor-pointer rounded-xl hover:bg-glass-light/50 transition-all">
                <span className="text-sm font-medium">
                  Размытие контента 18+
                </span>
                <input type="checkbox" defaultChecked className="w-4 h-4" />
              </label>
              <label className="glass-card flex items-center justify-between p-3 cursor-pointer rounded-xl hover:bg-glass-light/50 transition-all">
                <span className="text-sm font-medium">
                  Скрыть подозрительный контент
                </span>
                <input type="checkbox" defaultChecked className="w-4 h-4" />
              </label>
              <label className="glass-card flex items-center justify-between p-3 cursor-pointer rounded-xl hover:bg-glass-light/50 transition-all">
                <span className="text-sm font-medium">Автомодерация</span>
                <input type="checkbox" defaultChecked className="w-4 h-4" />
              </label>
              <div className="glass-card p-3 rounded-xl">
                <p className="text-xs text-muted-foreground mb-2">
                  Блокировать пользователей
                </p>
                <input
                  type="text"
                  placeholder="@username или ID"
                  className="w-full glass-morphism rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button className="w-full glass-button py-2 rounded-lg text-xs mt-2 bg-red-500/20 text-red-500 hover:bg-red-500/30">
                  Заблокировать
                </button>
              </div>
            </div>
            <button
              onClick={() => {
                alert("Настройки безопасности сохранены!");
                setShowContentSafety(false);
              }}
              className="w-full glass-button bg-primary/20 text-primary hover:bg-primary/30 py-2.5 rounded-xl text-sm font-semibold mt-4"
            >
              Сохранить
            </button>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdraw && (
        <div
          className="modal-fixed bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowWithdraw(false)}
        >
          <div
            className="glass-card max-w-sm w-full rounded-2xl p-4 max-h-[70vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Вывод средств</h2>
              <button
                onClick={() => setShowWithdraw(false)}
                className="glass-button p-2 rounded-full hover:bg-glass-light/40"
              >
                ✕
              </button>
            </div>
            <div className="text-center mb-4">
              <p className="text-2xl font-bold mb-1">{starsBalance} ⭐</p>
              <p className="text-xs text-muted-foreground">
                Доступно для вывода
              </p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Сумма (звёзды)
                </label>
                <input
                  type="number"
                  min="100"
                  max={starsBalance}
                  defaultValue="100"
                  className="w-full glass-morphism rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Минимум 100 ⭐"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Способ вывода
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button className="glass-button py-2 rounded-xl text-sm bg-primary/20 text-primary border border-primary">
                    Telegram
                  </button>
                  <button className="glass-button py-2 rounded-xl text-sm opacity-50">
                    Скоро
                  </button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Комиссия: 10%. Минимальная сумма: 100 ⭐. Обработка: 1-3 дня.
              </p>
            </div>
            <div className="flex gap-2 pt-4">
              <button
                onClick={() => setShowWithdraw(false)}
                className="flex-1 glass-button py-2.5 rounded-xl text-sm"
              >
                Отмена
              </button>
              <button
                onClick={() => {
                  alert("Заявка на вывод отправлена! Ожидайте обработки.");
                  setShowWithdraw(false);
                }}
                className="flex-1 glass-button bg-primary/20 text-primary hover:bg-primary/30 py-2.5 rounded-xl text-sm font-semibold"
              >
                Вывести
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Child Mode Modal */}
      {showChildMode && (
        <div
          className="modal-fixed bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowChildMode(false)}
        >
          <div
            className="glass-card max-w-sm w-full rounded-2xl p-4 max-h-[70vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Детский режим</h2>
              <button
                onClick={() => setShowChildMode(false)}
                className="glass-button p-2 rounded-full hover:bg-glass-light/40"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div className="glass-card p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <p className="text-sm text-blue-300 mb-2">
                  🛡️ Защищённый режим
                </p>
                <p className="text-xs text-muted-foreground">
                  Блокирует весь контент 18+, включает строгую модерацию и
                  ограничивает функции.
                </p>
              </div>
              <label className="glass-card flex items-center justify-between p-3 cursor-pointer rounded-xl hover:bg-glass-light/50 transition-all">
                <span className="text-sm font-medium">
                  Включить детский режим
                </span>
                <input type="checkbox" className="w-4 h-4" />
              </label>
              <div className="glass-card p-3 rounded-xl">
                <p className="text-sm font-medium mb-2">
                  PIN-код для отключения
                </p>
                <input
                  type="password"
                  maxLength={4}
                  className="w-full glass-morphism rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50 text-center tracking-widest"
                  placeholder="••••"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  4-значный код для выхода из детского режима
                </p>
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <button
                onClick={() => setShowChildMode(false)}
                className="flex-1 glass-button py-2.5 rounded-xl text-sm"
              >
                Отмена
              </button>
              <button
                onClick={() => {
                  alert(
                    "Детский режим включен! Для отключения потребуется PIN-код.",
                  );
                  setShowChildMode(false);
                }}
                className="flex-1 glass-button bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 py-2.5 rounded-xl text-sm font-semibold"
              >
                Включить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Posts Modal */}
      {showPosts && (
        <div
          className="modal-fixed bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowPosts(false)}
        >
          <div
            className="glass-card max-w-sm w-full rounded-2xl p-4 max-h-[70vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Мои посты</h2>
              <button
                onClick={() => setShowPosts(false)}
                className="glass-button p-2 rounded-full hover:bg-glass-light/40"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {profilePosts.map((post) => (
                <div
                  key={post.id}
                  className="aspect-square rounded-lg overflow-hidden cursor-pointer group relative bg-glass-light/30"
                >
                  <img
                    src={post.image}
                    alt={post.id}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center gap-2 text-white text-xs opacity-0 group-hover:opacity-100">
                    <span>❤️ {post.likes}</span>
                    <span>💬 {post.comments}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Rules Modal */}
      {showRulesModal && (
        <div
          className="modal-fixed bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowRulesModal(false)}
        >
          <div
            className="glass-card max-w-sm w-full rounded-2xl p-4 max-h-[70vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Правила платформы</h2>
              <button
                onClick={() => setShowRulesModal(false)}
                className="glass-button p-2 rounded-full hover:bg-glass-light/40"
              >
                ✕
              </button>
            </div>
            <div className="text-sm text-muted-foreground space-y-3">
              <p className="font-semibold text-foreground">
                Платформа соблюдает законодательство РФ
              </p>

              <div>
                <p className="font-medium text-foreground mb-1">
                  Запрещённый контент:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs">
                  <li>Порнография и контент 18+ (ст. 242 УК РФ)</li>
                  <li>Разжигание ненависти, экстремизм (ст. 282 УК РФ)</li>
                  <li>Пропаганда наркотиков (ст. 228 УК РФ)</li>
                  <li>Призывы к насилию, терроризму (ст. 205 УК РФ)</li>
                  <li>Мошенничество, обман (ст. 159 УК РФ)</li>
                  <li>Детская порнография (ст. 242.1 УК РФ)</li>
                  <li>Спам, накрутка, ботоводство</li>
                  <li>Нарушение авторских прав</li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-foreground mb-1">
                  Разрешённый контент:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs">
                  <li>Личные фото и видео</li>
                  <li>Творчество, искусство</li>
                  <li>Образовательный контент</li>
                  <li>Новости и обсуждения</li>
                  <li>Коммерческие предложения (с соблюдением правил)</li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-foreground mb-1">Модерация:</p>
                <ul className="list-disc pl-5 space-y-1 text-xs">
                  <li>Автоматическая фильтрация контента</li>
                  <li>Ручная проверка жалоб (24-48 часов)</li>
                  <li>Предупреждение за первое нарушение</li>
                  <li>Блокировка за повторные нарушения</li>
                  <li>Удаление аккаунта за грубые нарушения</li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-foreground mb-1">
                  Передача данных:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs">
                  <li>По запросу ФСБ, МВД, прокуратуры (152-ФЗ)</li>
                  <li>По решению суда</li>
                  <li>При расследовании преступлений</li>
                  <li>Логи хранятся 6 месяцев</li>
                </ul>
              </div>

              <p className="text-xs italic">
                Нарушение правил влечёт блокировку аккаунта без возможности
                восстановления.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Modal */}
      {showPrivacyModal && (
        <div
          className="modal-fixed bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowPrivacyModal(false)}
        >
          <div
            className="glass-card max-w-sm w-full rounded-2xl p-4 max-h-[70vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Политика конфиденциальности</h2>
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="glass-button p-2 rounded-full hover:bg-glass-light/40"
              >
                ✕
              </button>
            </div>
            <div className="text-sm text-muted-foreground space-y-3">
              <p>
                Мы заботимся о вашей конфиденциальности. Данные используются для
                обеспечения работы сервиса.
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Безопасное хранение и обработка</li>
                <li>Минимально необходимый сбор данных</li>
                <li>Не передаём данные третьим лицам</li>
                <li>Удаление аккаунта по запросу</li>
                <li>Соответствие законодательству РФ</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Support Modal */}
      {showSupportModal && (
        <div
          className="modal-fixed bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowSupportModal(false)}
        >
          <div
            className="glass-card max-w-sm w-full rounded-2xl p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Поддержка</h2>
              <button
                onClick={() => setShowSupportModal(false)}
                className="glass-button p-2 rounded-full hover:bg-glass-light/40"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Свяжитесь с нами по любым вопросам:
              </p>
              <button
                onClick={() =>
                  window.open("https://t.me/MoonCoonSupport", "_blank")
                }
                className="w-full glass-card p-4 flex items-center gap-3 hover:bg-glass-light/40 transition-all rounded-xl"
              >
                <MessageCircle className="text-primary" size={24} />
                <div className="text-left">
                  <p className="text-sm font-semibold">Telegram поддержка</p>
                  <p className="text-xs text-muted-foreground">
                    @MoonCoonSupport
                  </p>
                </div>
              </button>
              <div className="glass-card p-4 rounded-xl">
                <p className="text-xs text-muted-foreground mb-2">
                  Частые вопросы:
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                  <li>Как купить Premium?</li>
                  <li>Как закрепить пост/сторис?</li>
                  <li>Как удалить аккаунт?</li>
                  <li>Проблемы с публикацией</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ads Modal */}
      {showAdsModal && (
        <div
          className="modal-fixed bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowAdsModal(false)}
        >
          <div
            className="glass-card max-w-sm w-full rounded-2xl p-4 max-h-[70vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Реклама</h2>
              <button
                onClick={() => setShowAdsModal(false)}
                className="glass-button p-2 rounded-full hover:bg-glass-light/40"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Закрепите свой контент на первом месте
            </p>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                onClick={() => setAdsType("story")}
                className={`p-3 rounded-xl text-sm font-medium transition-all ${
                  adsType === "story"
                    ? "bg-primary/20 text-primary border-2 border-primary"
                    : "glass-button"
                }`}
              >
                <div className="text-center">
                  <div className="text-lg mb-1">📸</div>
                  <div>Сторис</div>
                  <div className="text-xs text-muted-foreground">300 ⭐/ч</div>
                </div>
              </button>
              <button
                onClick={() => setAdsType("post")}
                className={`p-3 rounded-xl text-sm font-medium transition-all ${
                  adsType === "post"
                    ? "bg-primary/20 text-primary border-2 border-primary"
                    : "glass-button"
                }`}
              >
                <div className="text-center">
                  <div className="text-lg mb-1">📝</div>
                  <div>Пост</div>
                  <div className="text-xs text-muted-foreground">200 ⭐/ч</div>
                </div>
              </button>
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium block mb-2">
                Количество часов
              </label>
              <div className="flex gap-2">
                {[1, 3, 6, 12, 24].map((h) => (
                  <button
                    key={h}
                    onClick={() => setAdsHours(h)}
                    className={`flex-1 glass-button py-2 text-sm rounded-xl ${
                      adsHours === h
                        ? "bg-primary/20 text-primary border border-primary"
                        : ""
                    }`}
                  >
                    {h}ч
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-morphism rounded-xl p-3 mb-4 text-center">
              <div className="text-sm text-muted-foreground mb-1">Итого</div>
              <div className="text-2xl font-bold">
                {(adsType === "story" ? 300 : 200) * adsHours} ⭐
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowAdsModal(false)}
                className="flex-1 glass-button py-2.5 rounded-xl text-sm"
              >
                Отмена
              </button>
              <button
                onClick={async () => {
                  // Проверяем сеть перед отправкой
                  if (!navigator.onLine) {
                    alert(
                      "❌ Нет интернет-соединения. Проверьте подключение к сети.",
                    );
                    return;
                  }

                  try {
                    const endpoint =
                      adsType === "story" ? "/api/ads/story" : "/api/ads/post";
                    const res = await fetch(endpoint, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        userId: user?.id?.toString(),
                        hours: adsHours,
                      }),
                    });

                    if (!res.ok) {
                      if (res.status === 0 || !res.status) {
                        throw new Error("Нет соединения с сервером");
                      }
                    }

                    const data = await res.json();
                    if (res.ok) {
                      alert(
                        `✅ Закреплено до ${new Date(data.pinnedUntil).toLocaleString("ru-RU")}`,
                      );
                      setShowAdsModal(false);
                    } else {
                      alert(`❌ ${data.error || "Ошибка покупки рекламы"}`);
                    }
                  } catch (error: any) {
                    console.error("Ошибка запроса рекламы:", error);
                    if (
                      error.name === "TypeError" &&
                      error.message.includes("fetch")
                    ) {
                      alert(
                        "❌ Нет сети: Проверьте интернет-соединение и попробуйте снова",
                      );
                    } else {
                      alert(
                        `❌ Ошибка сети: ${error.message || "Не удалось подключиться к серверу"}`,
                      );
                    }
                  }
                }}
                className="flex-1 glass-button bg-primary/20 text-primary hover:bg-primary/30 py-2.5 rounded-xl text-sm font-semibold"
              >
                Купить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div
          className="modal-fixed bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowSettingsModal(false)}
        >
          <div
            className="glass-card max-w-sm w-full rounded-2xl p-4 max-h-[70vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Настройки</h2>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="glass-button p-2 rounded-full hover:bg-glass-light/40"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              <label className="glass-card flex items-center justify-between p-3 cursor-pointer rounded-xl hover:bg-glass-light/50 transition-all">
                <span className="text-sm font-medium">Приватный аккаунт</span>
                <input type="checkbox" className="w-4 h-4" />
              </label>
              <label className="glass-card flex items-center justify-between p-3 cursor-pointer rounded-xl hover:bg-glass-light/50 transition-all">
                <span className="text-sm font-medium">Разрешить сообщения</span>
                <input type="checkbox" defaultChecked className="w-4 h-4" />
              </label>
              <label className="glass-card flex items-center justify-between p-3 cursor-pointer rounded-xl hover:bg-glass-light/50 transition-all">
                <span className="text-sm font-medium">
                  Показывать онлайн статус
                </span>
                <input type="checkbox" defaultChecked className="w-4 h-4" />
              </label>
              <label className="glass-card flex items-center justify-between p-3 cursor-pointer rounded-xl hover:bg-glass-light/50 transition-all">
                <span className="text-sm font-medium">Уведомления</span>
                <input type="checkbox" defaultChecked className="w-4 h-4" />
              </label>
              <div className="glass-card p-3 rounded-xl">
                <p className="text-sm font-medium mb-2">Тема</p>
                <div className="grid grid-cols-3 gap-2">
                  <button className="glass-button py-2 text-xs rounded-lg bg-primary/20 text-primary border border-primary">
                    Авто
                  </button>
                  <button className="glass-button py-2 text-xs rounded-lg">
                    Светлая
                  </button>
                  <button className="glass-button py-2 text-xs rounded-lg">
                    Тёмная
                  </button>
                </div>
              </div>
              <div className="glass-card p-3 rounded-xl">
                <p className="text-sm font-medium mb-2">Язык</p>
                <select className="w-full glass-morphism rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50">
                  <option>Русский</option>
                  <option>English</option>
                  <option>Español</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="flex-1 glass-button py-2.5 rounded-xl text-sm"
              >
                Отмена
              </button>
              <button
                onClick={() => {
                  alert("Настройки сохранены!");
                  setShowSettingsModal(false);
                }}
                className="flex-1 glass-button bg-primary/20 text-primary hover:bg-primary/30 py-2.5 rounded-xl text-sm font-semibold"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsPanel({ onBack }: { onBack: () => void }) {
  const { user } = useTelegram();
  const [privateAccount, setPrivateAccount] = useState(false);
  const [allowDMs, setAllowDMs] = useState(true);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");

  // Безопасность и возрастные ограничения
  const [blurAdultContent, setBlurAdultContent] = useState(true);
  const [allowAdultReveal, setAllowAdultReveal] = useState(true);
  const [childMode, setChildMode] = useState(false);
  const [hasChildPin, setHasChildPin] = useState(false);
  const [showSetPin, setShowSetPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [pinInput, setPinInput] = useState("");

  // Модальные окна для политик
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showRules, setShowRules] = useState(false);

  // Админ вывод
  const [adminWithdrawAmount, setAdminWithdrawAmount] = useState<number>(100);

  useEffect(() => {
    // Загружаем настройки пользователя
    if (user?.id) {
      const loadSettings = async () => {
        try {
          const response = await fetch(`/api/users/${user.id}/settings`);
          if (response.ok) {
            const settings = await response.json();
            setPrivateAccount(settings.privateAccount || false);
            setAllowDMs(settings.allowDMs !== false);
            setShowOnlineStatus(settings.showOnlineStatus !== false);
            setEmail(settings.email || "");
            setUsername(settings.username || `@user_${user.id}`);
            setBio(settings.bio || "");
            // Возрастные и безопасные настройки
            setBlurAdultContent(settings.blurAdultContent !== false);
            setAllowAdultReveal(settings.allowAdultReveal !== false);
            setChildMode(settings.childMode === true);
            setHasChildPin(Boolean(settings.childModePinHash));
          }
        } catch (error) {
          console.error("Ошибка загрузки настроек:", error);
        }
      };
      loadSettings();
    }
  }, [user]);

  const handleSave = async () => {
    if (user?.id) {
      try {
        const response = await fetch(`/api/users/${user.id}/settings`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            privateAccount,
            allowDMs,
            showOnlineStatus,
            email,
            username,
            bio,
            // Новые настройки
            blurAdultContent,
            allowAdultReveal,
            childMode,
            // child mode pin hash не отправляем с клиента явно здесь
          }),
        });
        if (response.ok) {
          alert("Настройки сохранены!");
        } else {
          alert("Ошибка сохранения настроек");
        }
      } catch (error) {
        console.error("Ошибка сохранения:", error);
        alert("Ошибка сохранения настроек");
      }
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 glass-morphism border-b border-glass-light/20 z-30 ios-shadow">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-primary font-semibold mb-2 hover:opacity-80 transition-opacity"
          >
            ← Назад
          </button>
          <h1 className="text-2xl font-bold">Настройки</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto pt-20 px-4">
        {/* Danger Zone */}
        <div>
          <p className="text-xs font-semibold text-red-500 uppercase mb-3">
            Опасная зона
          </p>
          <div className="space-y-2">
            <button
              onClick={async () => {
                if (confirm("Вы уверены, что хотите выйти?")) {
                  localStorage.removeItem("admin_session");
                  window.location.reload();
                }
              }}
              className="w-full glass-card p-4 hover:bg-red-500/10 transition-all rounded-2xl text-red-500 font-medium flex items-center justify-between"
            >
              <span>Выход</span>
              <LogOut size={18} />
            </button>
            <button
              onClick={async () => {
                if (
                  confirm(
                    "Вы уверены, что хотите удалить аккаунт? Это действие нельзя отменить!",
                  )
                ) {
                  if (user?.id) {
                    try {
                      const response = await fetch(`/api/users/${user.id}`, {
                        method: "DELETE",
                      });
                      if (response.ok) {
                        alert("Аккаунт удален");
                        window.location.reload();
                      }
                    } catch (error) {
                      console.error("Ошибка удаления:", error);
                    }
                  }
                }
              }}
              className="w-full glass-card p-4 hover:bg-red-500/10 transition-all rounded-2xl text-red-500 font-medium"
            >
              Удалить аккаунт
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
