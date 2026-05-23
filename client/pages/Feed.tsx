import { useState, useEffect, useCallback } from "react";
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
import HorizontalPostViewer from "@/components/HorizontalPostViewer";
import { useTelegram } from "@/hooks/useTelegram";
import { usePremium } from "@/hooks/usePremium";
import { fetchGoals } from "@/lib/goalsApi";
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
  authorId?: string;
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
}

const SEED_POSTS: Post[] = [
  {
    id: "f1", authorId: "101", liked: false, starred: false, stars: 12,
    likes: 284, comments: 31, timestamp: "2 ч",
    caption: "Городские огни никогда не засыпают 🌃",
    image: "https://images.unsplash.com/photo-1520106212299-d99c443e4568?w=800&q=80",
    author: { name: "Алексей", username: "@agromov", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alexey" },
  },
  {
    id: "f2", authorId: "102", liked: true, starred: false, stars: 5,
    likes: 1203, comments: 87, timestamp: "5 ч",
    caption: "Уютный уголок в центре города ☕️",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80",
    author: { name: "Мария", username: "@mlesova", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=maria" },
  },
  {
    id: "f3", authorId: "103", liked: false, starred: false, stars: 0,
    likes: 562, comments: 44, timestamp: "Вчера",
    caption: "Закат над морем 🌅",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
    author: { name: "Денис", username: "@dvolkov", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=denis" },
  },
];

function ActionBtn({
  icon: Icon, count, active, activeClass, onClick, filled,
}: {
  icon: React.ComponentType<{ size?: number | string; className?: string; fill?: string }>;
  count?: number; active?: boolean; activeClass?: string;
  onClick: () => void; filled?: boolean;
}) {
  const [bouncing, setBouncing] = useState(false);
  return (
    <button
      onClick={() => { setBouncing(true); setTimeout(() => setBouncing(false), 400); onClick(); }}
      className="flex flex-col items-center gap-1 select-none"
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      <div className={cn(
        "w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 bg-black/30 backdrop-blur-sm",
        bouncing && "action-bounce", active && "bg-white/20",
      )}>
        <Icon size={22} className={cn("transition-all", active ? activeClass : "text-white drop-shadow")} fill={active && filled ? "currentColor" : "none"} />
      </div>
      {count !== undefined && (
        <span className="text-white text-[11px] font-bold drop-shadow">
          {count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count}
        </span>
      )}
    </button>
  );
}

function PostCard({
  post, onLike, onComment, onStar, onShare,
}: {
  post: Post;
  onLike: () => void;
  onComment: () => void;
  onStar: () => void;
  onShare: () => void;
}) {
  const [heartAnim, setHeartAnim] = useState(false);

  const handleDoubleTap = () => {
    if (!post.liked) {
      onLike();
      setHeartAnim(true);
      setTimeout(() => setHeartAnim(false), 900);
    }
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {post.image && (
        <img src={post.image} alt="" className="absolute inset-0 w-full h-full object-cover" draggable={false}
          onContextMenu={e => e.preventDefault()} onDoubleClick={handleDoubleTap} />
      )}
      {post.video && (
        <video src={post.video} className="absolute inset-0 w-full h-full object-cover" playsInline loop muted autoPlay />
      )}
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-black/70 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none" />

      {heartAnim && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <Heart size={100} className="text-white fill-white heart-pop" />
        </div>
      )}

      <div className="absolute right-3 bottom-28 flex flex-col items-center gap-4 z-10">
        <div className="w-11 h-11 rounded-full ring-2 ring-white overflow-hidden mb-2">
          <img src={post.author.avatar} alt="" className="w-full h-full object-cover" />
        </div>
        <ActionBtn icon={Heart} count={post.likes} active={post.liked} activeClass="text-red-500" filled onClick={onLike} />
        <ActionBtn icon={MessageCircle} count={post.comments} onClick={onComment} />
        <ActionBtn icon={Star} count={post.stars > 0 ? post.stars : undefined} active={post.starred} activeClass="text-amber-400" filled onClick={onStar} />
        <ActionBtn icon={Share2} onClick={onShare} />
        <ActionBtn icon={Bookmark} onClick={() => {}} />
      </div>

      <div className="absolute bottom-24 left-4 right-16 z-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-white font-bold text-[15px]">{post.author.name}</span>
          <span className="text-white/60 text-[12px]">{post.author.username}</span>
        </div>
        <p className="text-white text-[14px] leading-snug line-clamp-3">{post.caption}</p>
        <p className="text-white/50 text-[11px] mt-1">{post.timestamp}</p>
      </div>
    </div>
  );
}

export default function Feed() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>(SEED_POSTS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [starsBalance, setStarsBalance] = useState(0);
  const [liveGoals, setLiveGoals] = useState<Goal[]>([]);
  const [showStarModal, setShowStarModal] = useState<string | null>(null);
  const [starAmount, setStarAmount] = useState(1);
  const [showCommentSheet, setShowCommentSheet] = useState<string | null>(null);
  const { user } = useTelegram();
  const { premium } = usePremium();
  const [showGoalsInFeed, setShowGoalsInFeed] = useState(
    () => localStorage.getItem("vexora-show-goals-feed") !== "false",
  );

  const safeTop = "calc(var(--tg-safe-top, 0px) + var(--tg-chrome-top, 52px))";

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (typeof detail?.showGoalsInFeed === "boolean") setShowGoalsInFeed(detail.showGoalsInFeed);
    };
    window.addEventListener("vexora-prefs-change", handler);
    return () => window.removeEventListener("vexora-prefs-change", handler);
  }, []);

  const loadLiveGoals = useCallback(async () => {
    try {
      const all = await fetchGoals({ status: "active" });
      const now = Date.now();
      setLiveGoals(all.filter(g => now - new Date(g.createdAt).getTime() < 10 * 60 * 1000));
    } catch { /* empty */ }
  }, []);

  useEffect(() => {
    loadLiveGoals();
    const interval = setInterval(loadLiveGoals, 30000);
    return () => clearInterval(interval);
  }, [loadLiveGoals]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/posts");
        if (!res.ok) return;
        const data = await res.json();
        if (data.posts?.length > 0) {
          const real: Post[] = data.posts.map((p: {
            id: string; userId: string; caption?: string; media?: string;
            mediaType?: string; createdAt: string; likes?: number; comments?: number; stars?: number;
          }) => ({
            id: p.id,
            authorId: String(p.userId),
            liked: false,
            starred: false,
            stars: p.stars || 0,
            likes: p.likes || 0,
            comments: p.comments || 0,
            timestamp: new Date(p.createdAt).toLocaleDateString("ru-RU"),
            caption: p.caption || "",
            image: p.mediaType === "image" ? p.media : undefined,
            video: p.mediaType === "video" ? p.media : undefined,
            author: {
              name: "Автор",
              username: `@user${p.userId}`,
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.userId}`,
            },
          }));
          setPosts(real);
        }
      } catch { /* keep seed */ }
    };
    load();
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetch(`/api/stars/balance?userId=${user.id}`)
        .then(r => r.json())
        .then(d => setStarsBalance(d.balance || 0))
        .catch(() => {});
    }
  }, [user]);

  const toggleLike = (postId: string) => {
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p,
    ));
  };

  const handleShare = (post: Post) => {
    const url = `https://mooncoon.app/post/${post.id}`;
    if (navigator.share) navigator.share({ title: post.caption, url }).catch(() => {});
    else navigator.clipboard.writeText(url);
  };

  const handleSendStar = async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (starsBalance < starAmount) { alert("Недостаточно звёзд"); return; }
    try {
      const res = await fetch("/api/stars/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromUserId: user?.id?.toString(),
          toPostId: postId,
          toUserId: post?.authorId,
          amount: starAmount,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setStarsBalance(data.balance ?? starsBalance - starAmount);
        setPosts(prev => prev.map(p =>
          p.id === postId ? { ...p, starred: true, stars: p.stars + starAmount } : p,
        ));
        setShowStarModal(null);
      } else {
        const err = await res.json();
        alert(err.error || "Ошибка отправки");
      }
    } catch {
      alert("Ошибка сети");
    }
  };

  const currentPost = posts[currentIndex];

  return (
    <div className="fixed inset-0 bg-black z-0" style={{ top: 0 }}>
      <div className="absolute inset-0">
        <HorizontalPostViewer
          items={posts}
          index={currentIndex}
          onIndexChange={setCurrentIndex}
          renderItem={(post, _active) => (
            <PostCard
              post={post}
              onLike={() => toggleLike(post.id)}
              onComment={() => setShowCommentSheet(post.id)}
              onStar={() => setShowStarModal(post.id)}
              onShare={() => handleShare(post)}
            />
          )}
        />
      </div>

      {/* Stories + top bar */}
      <div className="absolute top-0 left-0 right-0 z-30 pointer-events-none"
        style={{ paddingTop: `calc(${safeTop} + 8px)` }}>
        <div className="pointer-events-auto px-1">
          <Stories />
        </div>
        <div className="pointer-events-auto flex items-center justify-between px-4 pt-2 pb-1">
          <span className="text-white text-lg font-black drop-shadow-lg">MoonCoon</span>
          <div className="flex items-center gap-2">
            {showGoalsInFeed && liveGoals.length > 0 && (
              <button onClick={() => navigate("/goals")}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-red-500/90 text-white text-xs font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Цели
              </button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                  <Settings size={18} className="text-white" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-black/90 backdrop-blur-xl border-white/10 text-white">
                <DropdownMenuItem onClick={() => navigate("/goals")} className="gap-3 py-3 cursor-pointer text-white focus:bg-white/10">
                  <Target size={16} className="text-orange-400" /><span>Цели</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/stars-history")} className="gap-3 py-3 cursor-pointer text-white focus:bg-white/10">
                  <Trophy size={16} className="text-amber-400" /><span>Рейтинг</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem onClick={() => navigate("/profile")} className="gap-3 py-3 cursor-pointer text-white focus:bg-white/10">
                  <Settings size={16} /><span>Профиль</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Progress dots */}
      <div className="absolute bottom-24 left-0 right-0 z-20 flex justify-center gap-1 pointer-events-none">
        {posts.map((_, idx) => (
          <div key={idx} className={cn(
            "h-1 rounded-full transition-all duration-300",
            idx === currentIndex ? "w-5 bg-white" : "w-1 bg-white/35",
          )} />
        ))}
      </div>

      {showCommentSheet && (
        <div className="fixed inset-0 z-50 flex items-end" onClick={() => setShowCommentSheet(null)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative z-10 w-full rounded-t-3xl overflow-hidden bg-card sheet-slide-up max-h-[70vh]"
            onClick={e => e.stopPropagation()}>
            <div className="flex justify-center pt-3 pb-1"><div className="w-9 h-1 rounded-full bg-foreground/20" /></div>
            <div className="px-4 pb-2 border-b border-border font-bold text-[15px]">Комментарии</div>
            <div className="overflow-y-auto max-h-[55vh]" style={{ paddingBottom: "env(safe-area-inset-bottom, 16px)" }}>
              <Comments postId={showCommentSheet} onClose={() => setShowCommentSheet(null)} />
            </div>
          </div>
        </div>
      )}

      {showStarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowStarModal(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-sm rounded-3xl p-6 bg-card" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Отправить звезду ⭐</h3>
            <p className="text-sm text-muted-foreground mb-4">Баланс: {starsBalance} ⭐</p>
            <div className="flex gap-2 flex-wrap mb-5">
              {[1, 5, 10, 50, 100].map(amt => (
                <button key={amt} onClick={() => setStarAmount(amt)}
                  className={cn("px-4 py-2 rounded-xl text-sm font-semibold",
                    starAmount === amt ? "bg-primary text-primary-foreground" : "bg-foreground/10")}
                  disabled={starsBalance < amt}>
                  {amt} ⭐
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowStarModal(null)} className="flex-1 py-3 rounded-2xl bg-foreground/10 font-semibold text-sm">Отмена</button>
              <button onClick={() => handleSendStar(showStarModal)} disabled={starsBalance < starAmount}
                className="flex-1 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-50">
                Отправить {starAmount} ⭐
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        @keyframes heart-pop {
          0% { transform: scale(0); opacity: 0; }
          40% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        .heart-pop { animation: heart-pop 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .action-bounce { animation: action-bounce 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
        @keyframes action-bounce {
          0% { transform: scale(1); } 30% { transform: scale(0.8); } 60% { transform: scale(1.15); } 100% { transform: scale(1); }
        }
        @keyframes sheet-slide-up {
          from { transform: translateY(100%); } to { transform: translateY(0); }
        }
        .sheet-slide-up { animation: sheet-slide-up 0.38s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
}
