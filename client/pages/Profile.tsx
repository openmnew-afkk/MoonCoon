import { Settings, Heart, Lock, LogOut, BarChart3, Edit3, MessageCircle, Share2, Star, Sparkles } from "lucide-react";
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
  const [adsType, setAdsType] = useState<'story'|'post'>('story');
  const [adsHours, setAdsHours] = useState(1);

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
          const balanceRes = await fetch(`/api/stars/balance?userId=${user.id}`);

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
      <div className="min-h-screen bg-background pb-24">
        <div className="fixed top-0 left-0 right-0 glass-morphism border-b border-glass-light/20 z-30 ios-shadow">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <button
              onClick={() => setShowPremium(false)}
              className="flex items-center gap-2 text-primary font-semibold mb-2 hover:opacity-80 transition-opacity"
            >
              ← Назад
            </button>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="text-yellow-400 fill-yellow-400" size={28} />
              Premium
            </h1>
          </div>
        </div>
        <div className="max-w-2xl mx-auto pt-20 px-4">
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
    );
  }

  if (showStars) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="fixed top-0 left-0 right-0 glass-morphism border-b border-glass-light/20 z-30 ios-shadow">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <button
              onClick={() => setShowStars(false)}
              className="flex items-center gap-2 text-primary font-semibold mb-2 hover:opacity-80 transition-opacity"
            >
              ← Назад
            </button>
            <h1 className="text-2xl font-bold">Звезды Telegram</h1>
          </div>
        </div>
        <div className="max-w-2xl mx-auto pt-20 px-4">
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
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 glass-morphism border-b border-glass-light/20 z-30 ios-shadow" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Профиль</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 5rem)' }}>
        {/* Profile Header - Minimal */}
        <div className="glass-card mb-4 overflow-hidden">
          {/* Cover - Minimal */}
          <div className="h-16 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 relative" />

          {/* Profile Info */}
          <div className="px-4 pb-4">
            {/* Avatar + Name */}
            <div className="flex items-center gap-3 -mt-8 mb-4">
              <input id="avatarInput" type="file" accept="image/*" className="hidden" onChange={async (e)=>{
                const file = e.target.files?.[0];
                if (!file || !user?.id) return;
                const reader = new FileReader();
                reader.onload = async () => {
                  const dataUrl = reader.result as string;
                  setAvatarUrl(dataUrl);
                  try {
                    await fetch(`/api/users/${user.id}/settings`,{
                      method:'PUT',
                      headers:{'Content-Type':'application/json'},
                      body: JSON.stringify({ avatarUrl: dataUrl })
                    });
                  } catch {}
                };
                reader.readAsDataURL(file);
              }} />
              <button onClick={()=>document.getElementById('avatarInput')?.click()} className="relative group">
                <img
                  src={avatarUrl || user?.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id || 'currentuser'}`}
                  alt="Avatar"
                  className="w-16 h-16 rounded-full border-4 border-background shadow-lg object-cover"
                />
                <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Edit3 size={16} className="text-white" />
                </div>
              </button>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold">{user?.first_name || 'Ваше имя'}</h2>
                  {premium.isPremium && <PremiumBadge size="sm" />}
                </div>
                <p className="text-xs text-muted-foreground">@{user?.username || 'yourprofile'}</p>
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
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={()=>{
                  setIsFollowing((prev)=>!prev);
                  setStats((s)=>({ ...s, followers: (s.followers || 0) + (isFollowing ? -1 : 1) }));
                }}
                className={`glass-button rounded-lg py-2 text-xs font-medium ${isFollowing ? 'bg-glass-light/40' : 'bg-primary/10'}`}
              >
                {isFollowing ? 'Отписаться' : 'Подписаться'}
              </button>
              <button
                onClick={()=>{
                  if (user?.username) window.open(`https://t.me/${user.username}`, '_blank');
                  else alert('Нет username');
                }}
                className="glass-button rounded-lg py-2 text-xs font-medium bg-glass-light/20"
              >
                Сообщение
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions - Single Row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <button onClick={() => setShowStars(true)} className="glass-card p-3 flex flex-col items-center gap-1 hover:bg-glass-light/20 transition-all rounded-lg">
            <Star className="text-primary fill-primary" size={18} />
            <span className="text-[10px] font-medium">{starsBalance} ⭐</span>
          </button>
          <button onClick={() => setShowPremium(true)} className="glass-card p-3 flex flex-col items-center gap-1 hover:bg-glass-light/20 transition-all rounded-lg">
            <Sparkles className="text-yellow-400 fill-yellow-400" size={18} />
            <span className="text-[10px] font-medium">Premium</span>
          </button>
          <button onClick={() => setShowSettings(true)} className="glass-card p-3 flex flex-col items-center gap-1 hover:bg-glass-light/20 transition-all rounded-lg">
            <Settings className="text-foreground/70" size={18} />
            <span className="text-[10px] font-medium">Еще</span>
          </button>
        </div>

        {/* Secondary Actions */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <button onClick={() => setShowPosts(true)} className="glass-card p-3 flex flex-col items-center gap-1 hover:bg-glass-light/20 transition-all rounded-lg">
            <Heart className="text-accent" size={18} />
            <span className="text-[10px] font-medium">Посты</span>
          </button>
          <button onClick={() => setShowAdsModal(true)} className="glass-card p-3 flex flex-col items-center gap-1 hover:bg-glass-light/20 transition-all rounded-lg">
            <BarChart3 className="text-purple-400" size={18} />
            <span className="text-[10px] font-medium">Реклама</span>
          </button>
          <button onClick={() => setShowSupportModal(true)} className="glass-card p-3 flex flex-col items-center gap-1 hover:bg-glass-light/20 transition-all rounded-lg">
            <MessageCircle className="text-blue-400" size={18} />
            <span className="text-[10px] font-medium">Поддержка</span>
          </button>
        </div>

        {/* Legal Buttons - Single Row */}
        <div className="grid grid-cols-2 gap-2 mb-20">
          <button onClick={() => setShowRulesModal(true)} className="glass-card p-3 flex items-center justify-between hover:bg-glass-light/20 transition-all rounded-lg">
            <span className="text-xs font-medium">Правила</span>
            <span className="text-muted-foreground text-xs">→</span>
          </button>
          <button onClick={() => setShowPrivacyModal(true)} className="glass-card p-3 flex items-center justify-between hover:bg-glass-light/20 transition-all rounded-lg">
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
      
      {/* Posts Modal */}
      {showPosts && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={()=>setShowPosts(false)}>
          <div className="glass-card max-w-sm w-full rounded-2xl p-4 max-h-[70vh] overflow-y-auto" onClick={(e)=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Мои посты</h2>
              <button onClick={()=>setShowPosts(false)} className="glass-button p-2 rounded-full hover:bg-glass-light/40">✕</button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {profilePosts.map((post) => (
                <div key={post.id} className="aspect-square rounded-lg overflow-hidden cursor-pointer group relative bg-glass-light/30">
                  <img src={post.image} alt={post.id} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={()=>setShowRulesModal(false)}>
          <div className="glass-card max-w-sm w-full rounded-2xl p-4 max-h-[70vh] overflow-y-auto" onClick={(e)=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Правила платформы</h2>
              <button onClick={()=>setShowRulesModal(false)} className="glass-button p-2 rounded-full hover:bg-glass-light/40">✕</button>
            </div>
            <div className="text-sm text-muted-foreground space-y-3">
              <p className="font-semibold text-foreground">Платформа соблюдает законодательство РФ</p>
              
              <div>
                <p className="font-medium text-foreground mb-1">Запрещённый контент:</p>
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
                <p className="font-medium text-foreground mb-1">Разрешённый контент:</p>
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
                <p className="font-medium text-foreground mb-1">Передача данных:</p>
                <ul className="list-disc pl-5 space-y-1 text-xs">
                  <li>По запросу ФСБ, МВД, прокуратуры (152-ФЗ)</li>
                  <li>По решению суда</li>
                  <li>При расследовании преступлений</li>
                  <li>Логи хранятся 6 месяцев</li>
                </ul>
              </div>

              <p className="text-xs italic">Нарушение правил влечёт блокировку аккаунта без возможности восстановления.</p>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={()=>setShowPrivacyModal(false)}>
          <div className="glass-card max-w-sm w-full rounded-2xl p-4 max-h-[70vh] overflow-y-auto" onClick={(e)=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Политика конфиденциальности</h2>
              <button onClick={()=>setShowPrivacyModal(false)} className="glass-button p-2 rounded-full hover:bg-glass-light/40">✕</button>
            </div>
            <div className="text-sm text-muted-foreground space-y-3">
              <p>Мы заботимся о вашей конфиденциальности. Данные используются для обеспечения работы сервиса.</p>
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={()=>setShowSupportModal(false)}>
          <div className="glass-card max-w-sm w-full rounded-2xl p-4 max-h-[70vh] overflow-y-auto" onClick={(e)=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Поддержка</h2>
              <button onClick={()=>setShowSupportModal(false)} className="glass-button p-2 rounded-full hover:bg-glass-light/40">✕</button>
            </div>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Свяжитесь с нами по любым вопросам:</p>
              <button
                onClick={()=>window.open('https://t.me/MoonCoonSupport', '_blank')}
                className="w-full glass-card p-4 flex items-center gap-3 hover:bg-glass-light/40 transition-all rounded-xl"
              >
                <MessageCircle className="text-primary" size={24} />
                <div className="text-left">
                  <p className="text-sm font-semibold">Telegram поддержка</p>
                  <p className="text-xs text-muted-foreground">@MoonCoonSupport</p>
                </div>
              </button>
              <div className="glass-card p-4 rounded-xl">
                <p className="text-xs text-muted-foreground mb-2">Частые вопросы:</p>
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={()=>setShowAdsModal(false)}>
          <div className="glass-card max-w-sm w-full rounded-2xl p-4 max-h-[70vh] overflow-y-auto" onClick={(e)=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Реклама</h2>
              <button onClick={()=>setShowAdsModal(false)} className="glass-button p-2 rounded-full hover:bg-glass-light/40">✕</button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Закрепите свой контент на первом месте</p>
            
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                onClick={()=>setAdsType('story')}
                className={`p-3 rounded-xl text-sm font-medium transition-all ${
                  adsType === 'story' ? 'bg-primary/20 text-primary border-2 border-primary' : 'glass-button'
                }`}
              >
                <div className="text-center">
                  <div className="text-lg mb-1">📸</div>
                  <div>Сторис</div>
                  <div className="text-xs text-muted-foreground">300 ⭐/ч</div>
                </div>
              </button>
              <button
                onClick={()=>setAdsType('post')}
                className={`p-3 rounded-xl text-sm font-medium transition-all ${
                  adsType === 'post' ? 'bg-primary/20 text-primary border-2 border-primary' : 'glass-button'
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
              <label className="text-sm font-medium block mb-2">Количество часов</label>
              <div className="flex gap-2">
                {[1, 3, 6, 12, 24].map(h => (
                  <button
                    key={h}
                    onClick={()=>setAdsHours(h)}
                    className={`flex-1 glass-button py-2 text-sm rounded-xl ${
                      adsHours === h ? 'bg-primary/20 text-primary border border-primary' : ''
                    }`}
                  >
                    {h}ч
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-morphism rounded-xl p-3 mb-4 text-center">
              <div className="text-sm text-muted-foreground mb-1">Итого</div>
              <div className="text-2xl font-bold">{(adsType === 'story' ? 300 : 200) * adsHours} ⭐</div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={()=>setShowAdsModal(false)}
                className="flex-1 glass-button py-2.5 rounded-xl text-sm"
              >Отмена</button>
              <button
                onClick={async ()=>{
                  try {
                    const endpoint = adsType === 'story' ? '/api/ads/story' : '/api/ads/post';
                    const res = await fetch(endpoint, {
                      method: 'POST',
                      headers: {'Content-Type': 'application/json'},
                      body: JSON.stringify({ userId: user?.id?.toString(), hours: adsHours })
                    });
                    const data = await res.json();
                    if (res.ok) {
                      alert(`Закреплено до ${new Date(data.pinnedUntil).toLocaleString('ru-RU')}`);
                      setShowAdsModal(false);
                    } else {
                      alert(data.error || 'Ошибка покупки');
                    }
                  } catch {
                    alert('Ошибка сети');
                  }
                }}
                className="flex-1 glass-button bg-primary/20 text-primary hover:bg-primary/30 py-2.5 rounded-xl text-sm font-semibold"
              >Купить</button>
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
        {/* Profile Editor */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Редактор профиля</p>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Email адрес</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full glass-morphism rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="your@email.com"
              />
              <p className="text-xs text-muted-foreground mt-1">Для восстановления доступа</p>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Имя пользователя</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full glass-morphism rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="@username"
              />
              <p className="text-xs text-muted-foreground mt-1">Уникальный идентификатор</p>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">О себе</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full glass-morphism rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                rows={3}
                placeholder="Расскажите о себе..."
              />
            </div>
          </div>
        </div>

        {/* Privacy & Security */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase mb-3 flex items-center gap-2">
            <Lock className="text-primary" size={16} />
            Приватность и безопасность
          </p>
          <div className="space-y-3">
            <label className="glass-card flex items-center justify-between p-4 cursor-pointer rounded-2xl hover:bg-glass-light/40 transition-all">
              <span className="font-medium">Приватный аккаунт</span>
              <input
                type="checkbox"
                checked={privateAccount}
                onChange={(e) => setPrivateAccount(e.target.checked)}
                className="w-4 h-4 cursor-pointer"
              />
            </label>
            <label className="glass-card flex items-center justify-between p-4 cursor-pointer rounded-2xl hover:bg-glass-light/40 transition-all">
              <span className="font-medium">Разрешить DM от кого угодно</span>
              <input
                type="checkbox"
                checked={allowDMs}
                onChange={(e) => setAllowDMs(e.target.checked)}
                className="w-4 h-4 cursor-pointer"
              />
            </label>
            <label className="glass-card flex items-center justify-between p-4 cursor-pointer rounded-2xl hover:bg-glass-light/40 transition-all">
              <span className="font-medium">Показать статус онлайн</span>
              <input
                type="checkbox"
                checked={showOnlineStatus}
                onChange={(e) => setShowOnlineStatus(e.target.checked)}
                className="w-4 h-4 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Content Safety (RF compliance, +18 blur, Child Mode) */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Безопасность контента</p>
          <div className="space-y-3">
            <div className="glass-card p-4 rounded-2xl">
              <p className="text-xs text-muted-foreground mb-2">
                Мы соблюдаем правила РФ. Запрещён контент 18+. Материалы, которые могут быть откровенными, автоматически скрываются (блюр). Вы можете открыть такие материалы вручную с предупреждением.
              </p>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="font-medium">Блюрить потенциальный 18+ контент</span>
                <input
                  type="checkbox"
                  checked={blurAdultContent}
                  onChange={(e) => setBlurAdultContent(e.target.checked)}
                  className="w-4 h-4 cursor-pointer"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer mt-3">
                <span className="font-medium">Разрешить показ по нажатию (с предупреждением)</span>
                <input
                  type="checkbox"
                  checked={allowAdultReveal}
                  onChange={(e) => setAllowAdultReveal(e.target.checked)}
                  className="w-4 h-4 cursor-pointer"
                />
              </label>
            </div>

            <div className="glass-card p-4 rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Детский режим</p>
                  <p className="text-xs text-muted-foreground">Усиленные ограничения контента, скрытие откровенных материалов, ограничение функций</p>
                </div>
                <input
                  type="checkbox"
                  checked={childMode}
                  onChange={(e) => {
                    const next = e.target.checked;
                    if (!next) {
                      // Выключение: запросить PIN если он установлен
                      if (hasChildPin) {
                        setShowConfirmPin(true);
                        return;
                      }
                    } else {
                      // Включение: если PIN не установлен — предложить установить
                      if (!hasChildPin) {
                        setShowSetPin(true);
                      }
                    }
                    setChildMode(next);
                  }}
                  className="w-4 h-4 cursor-pointer"
                />
              </div>
              {hasChildPin ? (
                <p className="text-[11px] text-muted-foreground mt-2">PIN установлен. Для отключения Детского режима потребуется PIN.</p>
              ) : (
                <button onClick={()=>setShowSetPin(true)} className="mt-3 text-xs text-primary hover:underline">Установить PIN</button>
              )}
            </div>
          </div>
        </div>


        {/* Admin Stars Withdraw (only for @MikySauce) */}
        {user?.username === "MikySauce" && (
          <div className="mb-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Админ</p>
            <div className="glass-card p-4 rounded-2xl space-y-3">
              <p className="text-sm font-semibold">Вывод звёзд без комиссии</p>
              <div>
                <label className="text-sm font-medium mb-1 block">Сумма</label>
                <input
                  type="number"
                  min={1}
                  value={adminWithdrawAmount}
                  onChange={(e)=>setAdminWithdrawAmount(Number(e.target.value))}
                  className="w-full glass-morphism rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <button
                onClick={async ()=>{
                  try {
                    const res = await fetch('/api/stars/withdraw',{
                      method:'POST',
                      headers:{'Content-Type':'application/json'},
                      body: JSON.stringify({ userId: user?.id?.toString(), amount: adminWithdrawAmount })
                    });
                    const data = await res.json();
                    if(res.ok){
                      alert(data.message || 'Вывод оформлен');
                    } else {
                      alert(data.error || 'Ошибка вывода');
                    }
                  } catch(e){
                    alert('Ошибка сети');
                  }
                }}
                className="w-full glass-button bg-primary/20 text-primary hover:bg-primary/30 rounded-xl py-3 text-sm font-semibold"
              >
                Вывести
              </button>
              <p className="text-[11px] text-muted-foreground">Только для администратора @MikySauce. Без минимальной суммы и без комиссии.</p>
            </div>
          </div>
        )}

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full glass-button bg-primary/20 text-primary hover:bg-primary/30 rounded-xl py-3 font-semibold mb-6"
        >
          Сохранить изменения
        </button>

        {/* Danger Zone */}
        <div>
          <p className="text-xs font-semibold text-red-500 uppercase mb-3">Опасная зона</p>
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
                if (confirm("Вы уверены, что хотите удалить аккаунт? Это действие нельзя отменить!")) {
                  if (user?.id) {
                    try {
                      const response = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
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

        {/* PIN Modals inside SettingsPanel */}
        {showSetPin && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={()=>{setShowSetPin(false); setPinInput("");}}>
            <div className="glass-card max-w-sm w-full p-5" onClick={(e)=>e.stopPropagation()}>
              <h2 className="text-lg font-semibold mb-2">Установить PIN для Детского режима</h2>
              <p className="text-xs text-muted-foreground mb-3">Введите 4-6 цифр. PIN потребуется для отключения режима.</p>
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                minLength={4}
                maxLength={6}
                value={pinInput}
                onChange={(e)=>setPinInput(e.target.value.replace(/[^0-9]/g, '').slice(0,6))}
                className="w-full glass-morphism rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Введите PIN"
              />
              <div className="mt-4 flex justify-end gap-2">
                <button className="glass-button px-3 py-2 rounded-xl text-xs" onClick={()=>{setShowSetPin(false); setPinInput("");}}>Отмена</button>
                <button
                  className="glass-button px-3 py-2 rounded-xl text-xs bg-primary/20 text-primary hover:bg-primary/30"
                  onClick={async ()=>{
                    if (pinInput.length < 4) return;
                    try {
                      const res = await fetch(`/api/users/${user?.id}/settings`,{
                        method:'PUT',
                        headers:{'Content-Type':'application/json'},
                        body: JSON.stringify({ setChildModePin: pinInput, childMode: true })
                      });
                      if(res.ok){
                        setHasChildPin(true);
                        setChildMode(true);
                        setShowSetPin(false);
                        setPinInput("");
                      }
                    } catch {}
                  }}
                >Сохранить</button>
              </div>
            </div>
          </div>
        )}

        {showConfirmPin && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={()=>{setShowConfirmPin(false); setPinInput("");}}>
            <div className="glass-card max-w-sm w-full p-5" onClick={(e)=>e.stopPropagation()}>
              <h2 className="text-lg font-semibold mb-2">Введите PIN для отключения</h2>
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                minLength={4}
                maxLength={6}
                value={pinInput}
                onChange={(e)=>setPinInput(e.target.value.replace(/[^0-9]/g, '').slice(0,6))}
                className="w-full glass-morphism rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="PIN"
              />
              <div className="mt-4 flex justify-end gap-2">
                <button className="glass-button px-3 py-2 rounded-xl text-xs" onClick={()=>{setShowConfirmPin(false); setPinInput("");}}>Отмена</button>
                <button
                  className="glass-button px-3 py-2 rounded-xl text-xs bg-primary/20 text-primary hover:bg-primary/30"
                  onClick={async ()=>{
                    try {
                      const res = await fetch(`/api/users/${user?.id}/settings`,{
                        method:'PUT',
                        headers:{'Content-Type':'application/json'},
                        body: JSON.stringify({ verifyChildModePin: pinInput, childMode: false })
                      });
                      const data = await res.json().catch(()=>({}));
                      if(res.ok){
                        setChildMode(false);
                        setShowConfirmPin(false);
                        setPinInput("");
                      } else {
                        alert(data.error || 'Неверный PIN');
                      }
                    } catch {
                      alert('Ошибка сети');
                    }
                  }}
                >Подтвердить</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

