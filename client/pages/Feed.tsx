import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  MessageCircle,
  Share2,
  Star,
  MoreVertical,
  Target,
  Trophy,
  Camera,
  Settings,
  Bookmark,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Stories from "@/components/Stories";
import Comments from "@/components/Comments";
import { useTelegram } from "@/hooks/useTelegram";
import PremiumBadge from "@/components/PremiumBadge";
import { usePremium } from "@/hooks/usePremium";
import GoalCard from "@/components/goals/GoalCard";
import { fetchGoals, backGoal } from "@/lib/goalsApi";
import type { Goal } from "@shared/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface Post {
  id: string;
  author: { name: string; avatar: string; username: string; verified?: boolean };
  image?: string;
  video?: string;
  caption: string;
  likes: number;
  comments: number;
  stars: number;
  timestamp: string;
  liked: boolean;
  starred: boolean;
  showComments: boolean;
}

const FAKE_POSTS: Post[] = [
  {
    id: "f1", liked: false, starred: false, showComments: false, stars: 12,
    likes: 284, comments: 31, timestamp: "2 часа назад",
    caption: "Городские огни никогда не засыпают 🌃 Ночная Москва — это отдельный мир.",
    image: "https://images.unsplash.com/photo-1520106212299-d99c443e4568?w=800&q=80",
    author: { name: "Алексей Громов", username: "@agromov", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alexey" },
  },
  {
    id: "f2", liked: true, starred: false, showComments: false, stars: 5,
    likes: 1203, comments: 87, timestamp: "5 часов назад",
    caption: "Нашёл этот уютный уголок в центре города ☕️ Идеальное место для работы.",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80",
    author: { name: "Мария Лесова", username: "@mlesova", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=maria" },
  },
  {
    id: "f3", liked: false, starred: false, showComments: false, stars: 0,
    likes: 562, comments: 44, timestamp: "Вчера",
    caption: "Закат над морем — лучший момент дня 🌅 Ялта, крымское лето.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
    author: { name: "Денис Волков", username: "@dvolkov", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=denis" },
  },
  {
    id: "f4", liked: false, starred: true, showComments: false, stars: 34,
    likes: 891, comments: 62, timestamp: "Вчера",
    caption: "Горы зовут 🏔️ Каждый раз поднимаясь выше, понимаешь как мало тебе нужно для счастья.",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80",
    author: { name: "Ирина Сова", username: "@isova", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=irina" },
  },
  {
    id: "f5", liked: false, starred: false, showComments: false, stars: 2,
    likes: 417, comments: 19, timestamp: "2 дня назад",
    caption: "Новый проект, новые возможности 💻 Люблю момент когда идея превращается в продукт.",
    image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&q=80",
    author: { name: "Вадим Кузин", username: "@vkuzin", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=vadim" },
  },
  {
    id: "f6", liked: false, starred: false, showComments: false, stars: 8,
    likes: 735, comments: 53, timestamp: "3 дня назад",
    caption: "Осень в Петербурге — это магия 🍂 Такие цвета бывают только здесь.",
    image: "https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=800&q=80",
    author: { name: "Соня Белова", username: "@sbelova", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sonya" },
  },
  {
    id: "f7", liked: false, starred: false, showComments: false, stars: 0,
    likes: 328, comments: 28, timestamp: "4 дня назад",
    caption: "Утренняя пробежка — лучший старт дня 🏃‍♂️ 10 км и ты уже герой.",
    image: "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=800&q=80",
    author: { name: "Игорь Попов", username: "@ipopov", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=igor" },
  },
  {
    id: "f8", liked: false, starred: false, showComments: false, stars: 21,
    likes: 1547, comments: 114, timestamp: "Неделю назад",
    caption: "Это блюдо готовится 3 часа, но того стоит 🍜 Рецепт в следующем посте!",
    image: "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=800&q=80",
    author: { name: "Катя Орлова", username: "@korlova", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=katya" },
  },
];

/* ─── Action button (TikTok right sidebar style) ──────────────────────── */
function ActionBtn({
  icon: Icon, count, active, activeClass, onClick, filled,
}: {
  icon: any; count?: number; active?: boolean; activeClass?: string;
  onClick: () => void; filled?: boolean;
}) {
  const [bouncing, setBouncing] = useState(false);

  const handleClick = () => {
    setBouncing(true);
    setTimeout(() => setBouncing(false), 400);
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      className="flex flex-col items-center gap-1 select-none"
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      <div className={cn(
        "w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200",
        "bg-black/30 backdrop-blur-sm",
        bouncing && "action-bounce",
        active && "bg-white/20"
      )}>
        <Icon
          size={22}
          className={cn(
            "transition-all duration-200",
            active ? activeClass : "text-white drop-shadow"
          )}
          fill={active && filled ? "currentColor" : "none"}
        />
      </div>
      {count !== undefined && (
        <span className="text-white text-[11px] font-bold drop-shadow leading-none">
          {count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count}
        </span>
      )}
    </button>
  );
}

/* ─── Single full-screen post card ────────────────────────────────────── */
function PostCard({
  post, onLike, onComment, onStar, onShare, isCurrent,
}: {
  post: Post;
  onLike: () => void;
  onComment: () => void;
  onStar: () => void;
  onShare: () => void;
  isCurrent: boolean;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [heartAnim, setHeartAnim] = useState(false);

  const handleDoubleTap = () => {
    if (!post.liked) {
      onLike();
      setHeartAnim(true);
      setTimeout(() => setHeartAnim(false), 900);
    }
  };

  return (
    <div className="relative w-full h-full flex-shrink-0 bg-black overflow-hidden">
      {/* Background image */}
      {post.image && (
        <img
          src={post.image}
          alt={post.caption}
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
          onContextMenu={e => e.preventDefault()}
          onDoubleClick={handleDoubleTap}
        />
      )}

      {/* Gradient overlays */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

      {/* Double-tap heart animation */}
      {heartAnim && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <Heart
            size={100}
            className="text-white fill-white heart-pop"
            style={{ filter: "drop-shadow(0 0 20px rgba(255,100,100,0.8))" }}
          />
        </div>
      )}

      {/* ── Right action bar ────────────────────────────── */}
      <div className="absolute right-3 bottom-28 flex flex-col items-center gap-4 z-10">
        {/* Avatar */}
        <div className="relative mb-2">
          <div className="w-11 h-11 rounded-full ring-2 ring-white overflow-hidden">
            <img src={post.author.avatar} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-primary flex items-center justify-center border-2 border-black">
            <span className="text-white text-[9px] font-black leading-none">+</span>
          </div>
        </div>

        <ActionBtn
          icon={Heart}
          count={post.likes}
          active={post.liked}
          activeClass="text-red-500"
          filled
          onClick={onLike}
        />
        <ActionBtn
          icon={MessageCircle}
          count={post.comments}
          onClick={onComment}
        />
        <ActionBtn
          icon={Star}
          count={post.stars > 0 ? post.stars : undefined}
          active={post.starred}
          activeClass="text-amber-400"
          filled
          onClick={onStar}
        />
        <ActionBtn
          icon={Share2}
          onClick={onShare}
        />
        <ActionBtn
          icon={Bookmark}
          onClick={() => {}}
        />
      </div>

      {/* ── Bottom info ─────────────────────────────────── */}
      <div className="absolute bottom-24 left-4 right-16 z-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-white font-bold text-[15px] drop-shadow">{post.author.name}</span>
          <span className="text-white/60 text-[12px]">{post.author.username}</span>
        </div>
        <p className="text-white text-[14px] leading-snug drop-shadow line-clamp-3">
          {post.caption}
        </p>
        <p className="text-white/50 text-[11px] mt-1">{post.timestamp}</p>
      </div>

      {/* ── Three-dot menu ──────────────────────────────── */}
      {showMenu && (
        <div
          className="absolute inset-0 z-30"
          onClick={() => setShowMenu(false)}
        >
          <div
            className="absolute right-3 top-16 rounded-2xl overflow-hidden shadow-2xl w-48"
            style={{ background: "rgba(30,30,30,0.95)", backdropFilter: "blur(20px)" }}
            onClick={e => e.stopPropagation()}
          >
            {[
              { emoji: "🚩", label: "Пожаловаться", action: () => { alert("Жалоба отправлена"); setShowMenu(false); } },
              { emoji: "🔗", label: "Скопировать ссылку", action: () => { navigator.clipboard.writeText(`https://vexora.app/post/${post.id}`); alert("Скопировано"); setShowMenu(false); } },
              { emoji: "🚫", label: "Не интересно", action: () => setShowMenu(false) },
            ].map(item => (
              <button key={item.label} onClick={item.action}
                className="flex items-center gap-3 w-full px-4 py-3 text-[14px] text-white text-left border-b border-white/10 last:border-0 active:bg-white/10 transition-colors"
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                <span>{item.emoji}</span><span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main Feed ────────────────────────────────────────────────────────── */
export default function Feed() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>(FAKE_POSTS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [starsBalance, setStarsBalance] = useState(0);
  const [liveGoals, setLiveGoals] = useState<Goal[]>([]);
  const [showStarModal, setShowStarModal] = useState<string | null>(null);
  const [starAmount, setStarAmount] = useState(1);
  const [showCommentSheet, setShowCommentSheet] = useState<string | null>(null);
  const { user } = useTelegram();
  const userId = user?.id ? String(user.id) : "";
  const { premium } = usePremium();
  const [showGoalsInFeed, setShowGoalsInFeed] = useState(
    () => localStorage.getItem("vexora-show-goals-feed") !== "false"
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);

  // Listen for prefs change
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      if (typeof e.detail?.showGoalsInFeed === "boolean")
        setShowGoalsInFeed(e.detail.showGoalsInFeed);
    };
    window.addEventListener("vexora-prefs-change", handler as EventListener);
    return () => window.removeEventListener("vexora-prefs-change", handler as EventListener);
  }, []);

  // Load live goals
  const loadLiveGoals = useCallback(async () => {
    try {
      const all = await fetchGoals({ status: "active" });
      const now = Date.now();
      const tenMins = 10 * 60 * 1000;
      setLiveGoals(all.filter(g => now - new Date(g.createdAt).getTime() < tenMins));
    } catch {}
  }, []);

  useEffect(() => {
    loadLiveGoals();
    const interval = setInterval(loadLiveGoals, 30000);
    return () => clearInterval(interval);
  }, [loadLiveGoals]);

  // Try load real posts from API, merge with fake
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/posts");
        if (!res.ok) return;
        const data = await res.json();
        if (data.posts?.length > 0) {
          const real: Post[] = data.posts.map((p: any) => ({
            id: p.id, liked: false, starred: false, showComments: false, stars: 0,
            likes: p.likes || 0, comments: p.comments || 0, timestamp: new Date(p.createdAt).toLocaleDateString("ru-RU"),
            caption: p.caption || "", image: p.mediaType === "image" ? p.media : undefined,
            video: p.mediaType === "video" ? p.media : undefined,
            author: { name: "Пользователь", username: `@user${p.userId}`, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.userId}` },
          }));
          setPosts([...real, ...FAKE_POSTS]);
        }
      } catch {}
    };
    load();
  }, []);

  // Stars balance
  useEffect(() => {
    if (user?.id) {
      fetch(`/api/stars/balance?userId=${user.id}`)
        .then(r => r.json())
        .then(d => setStarsBalance(d.balance || 0))
        .catch(() => {});
    }
  }, [user]);

  // Track current post via IntersectionObserver
  useEffect(() => {
    const items = containerRef.current?.querySelectorAll(".snap-item");
    if (!items) return;
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const idx = parseInt((entry.target as HTMLElement).dataset.index || "0");
            setCurrentIndex(idx);
          }
        });
      },
      { threshold: 0.6 }
    );
    items.forEach(item => observer.observe(item));
    return () => observer.disconnect();
  }, [posts]);

  const toggleLike = (postId: string) => {
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p
    ));
  };

  const handleShare = (post: Post) => {
    if (navigator.share) {
      navigator.share({ title: post.caption, url: `https://vexora.app/post/${post.id}` }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`https://vexora.app/post/${post.id}`);
    }
  };

  const handleSendStar = async (postId: string) => {
    if (starsBalance < starAmount) { alert("Недостаточно звёзд"); return; }
    try {
      const res = await fetch("/api/stars/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromUserId: user?.id?.toString(), toPostId: postId, amount: starAmount }),
      });
      if (res.ok) {
        setStarsBalance(prev => prev - starAmount);
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, starred: true, stars: p.stars + starAmount } : p));
        setShowStarModal(null);
      }
    } catch {}
  };

  const allPosts = posts;

  return (
    <div className="fixed inset-0 bg-black z-0">
      {/* ── Snap scroll container ─────────────────────── */}
      <div
        ref={containerRef}
        className="w-full h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        style={{ scrollSnapType: "y mandatory", overscrollBehavior: "contain" }}
      >
        {allPosts.map((post, idx) => (
          <div
            key={post.id}
            data-index={idx}
            className="snap-item w-full flex-shrink-0"
            style={{
              height: "100svh",
              scrollSnapAlign: "start",
              scrollSnapStop: "always",
            }}
          >
            <PostCard
              post={post}
              isCurrent={idx === currentIndex}
              onLike={() => toggleLike(post.id)}
              onComment={() => setShowCommentSheet(post.id)}
              onStar={() => setShowStarModal(post.id)}
              onShare={() => handleShare(post)}
            />
          </div>
        ))}
      </div>

      {/* ── Top bar (transparent, over first post) ───── */}
      <div
        className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-4 pt-3"
        style={{ paddingTop: "calc(var(--tg-safe-top, env(safe-area-inset-top, 0px)) + 12px)" }}
      >
        <span className="text-white text-lg font-black tracking-tight drop-shadow-lg" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}>
          Vexora
        </span>
        <div className="flex items-center gap-2">
          {showGoalsInFeed && liveGoals.length > 0 && (
            <button onClick={() => navigate("/goals")}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-red-500/90 backdrop-blur-sm text-white text-xs font-bold"
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse inline-block" />
              Цели
            </button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center" style={{ WebkitTapHighlightColor: "transparent" }}>
                <Settings size={18} className="text-white" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-black/90 backdrop-blur-xl border-white/10 text-white">
              <DropdownMenuItem onClick={() => navigate("/goals")} className="gap-3 py-3 cursor-pointer text-white focus:text-white focus:bg-white/10">
                <Target size={16} className="text-orange-400" /><span>Цели</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/stars-history")} className="gap-3 py-3 cursor-pointer text-white focus:text-white focus:bg-white/10">
                <Trophy size={16} className="text-amber-400" /><span>Рейтинг</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem onClick={() => navigate("/profile")} className="gap-3 py-3 cursor-pointer text-white focus:text-white focus:bg-white/10">
                <Settings size={16} className="text-white/70" /><span>Настройки</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ── Post counter dots ─────────────────────────── */}
      <div className="fixed right-1.5 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-1.5 pointer-events-none">
        {allPosts.map((_, idx) => (
          <div key={idx} className={cn(
            "rounded-full transition-all duration-300",
            idx === currentIndex
              ? "w-1 h-4 bg-white"
              : "w-1 h-1 bg-white/30"
          )} />
        ))}
      </div>

      {/* ── Comments sheet ────────────────────────────── */}
      {showCommentSheet && (
        <div className="fixed inset-0 z-50 flex items-end" onClick={() => setShowCommentSheet(null)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[4px]" />
          <div
            className="relative z-10 w-full rounded-t-[24px] overflow-hidden bg-card sheet-slide-up"
            style={{ maxHeight: "70vh" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-9 h-1 rounded-full bg-foreground/20" />
            </div>
            <div className="px-4 pb-2 border-b border-foreground/[0.07]">
              <span className="text-[15px] font-bold">Комментарии</span>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: "calc(70vh - 80px)", paddingBottom: "env(safe-area-inset-bottom,16px)" }}>
              <Comments
                postId={showCommentSheet}
                onClose={() => setShowCommentSheet(null)}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Star modal ────────────────────────────────── */}
      {showStarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowStarModal(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative z-10 w-full max-w-sm rounded-3xl p-6"
            style={{ background: "hsl(var(--card))" }}
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-4">Отправить звезду ⭐</h3>
            <p className="text-sm text-muted-foreground mb-4">Баланс: {starsBalance} ⭐</p>
            <div className="flex gap-2 flex-wrap mb-5">
              {[1, 5, 10, 50, 100].map(amt => (
                <button key={amt} onClick={() => setStarAmount(amt)}
                  className={cn("px-4 py-2 rounded-xl text-sm font-semibold transition-all",
                    starAmount === amt ? "bg-primary text-primary-foreground scale-105" : "bg-foreground/[0.07]"
                  )}
                  disabled={starsBalance < amt}
                  style={{ WebkitTapHighlightColor: "transparent" }}
                >
                  {amt} ⭐
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowStarModal(null)}
                className="flex-1 py-3 rounded-2xl bg-foreground/[0.07] font-semibold text-sm"
                style={{ WebkitTapHighlightColor: "transparent" }}
              >Отмена</button>
              <button onClick={() => handleSendStar(showStarModal!)}
                disabled={starsBalance < starAmount}
                className="flex-1 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-50"
                style={{ WebkitTapHighlightColor: "transparent" }}
              >Отправить {starAmount} ⭐</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* Hide scrollbar */
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

        /* Heart pop animation on double tap */
        @keyframes heart-pop {
          0%   { transform: scale(0) rotate(-10deg); opacity: 0; }
          30%  { transform: scale(1.3) rotate(5deg); opacity: 1; }
          60%  { transform: scale(1.1) rotate(-2deg); opacity: 1; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        .heart-pop { animation: heart-pop 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }

        /* Action button bounce */
        @keyframes action-bounce {
          0%   { transform: scale(1); }
          30%  { transform: scale(0.75); }
          60%  { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        .action-bounce { animation: action-bounce 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }

        /* Sheet slide up */
        @keyframes sheet-slide-up {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        .sheet-slide-up { animation: sheet-slide-up 0.38s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
}
