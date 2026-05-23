import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Heart,
  MessageCircle,
  Share2,
  Star,
  Target,
  Plus,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Stories from "@/components/Stories";
import Comments from "@/components/Comments";
import FeedCardStack from "@/components/FeedCardStack";
import { useTelegram } from "@/hooks/useTelegram";
import { APP_NAME } from "@/lib/brand";
import type { Goal } from "@shared/api";
import { fetchGoals } from "@/lib/goalsApi";

interface Post {
  id: string;
  authorId: string;
  author: { name: string; avatar: string; username: string };
  image?: string;
  video?: string;
  caption: string;
  likes: number;
  comments: number;
  stars: number;
  timestamp: string;
  liked: boolean;
}

export default function Feed() {
  const navigate = useNavigate();
  const { user, webApp } = useTelegram();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [starsBalance, setStarsBalance] = useState(0);
  const [showStarModal, setShowStarModal] = useState<string | null>(null);
  const [starAmount, setStarAmount] = useState(1);
  const [showCommentSheet, setShowCommentSheet] = useState<string | null>(null);
  const [liveGoals, setLiveGoals] = useState<Goal[]>([]);

  const loadBalance = useCallback(async () => {
    if (!user?.id) return;
    try {
      const r = await fetch(`/api/stars/balance?userId=${user.id}`);
      if (r.ok) {
        const d = await r.json();
        setStarsBalance(d.balance ?? 0);
      }
    } catch { /* ignore */ }
  }, [user?.id]);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/posts");
      if (!res.ok) return;
      const data = await res.json();
      const mapped: Post[] = (data.posts || []).map((p: {
        id: string;
        userId: string;
        caption?: string;
        media?: string;
        mediaType?: string;
        createdAt: string;
        likes?: number;
        comments?: number;
        stars?: number;
        authorName?: string;
        authorAvatar?: string;
        authorUsername?: string;
      }) => ({
        id: p.id,
        authorId: String(p.userId),
        liked: false,
        likes: p.likes ?? 0,
        comments: p.comments ?? 0,
        stars: p.stars ?? 0,
        timestamp: new Date(p.createdAt).toLocaleDateString("ru-RU", {
          day: "numeric",
          month: "short",
        }),
        caption: p.caption || "",
        image: p.mediaType === "image" ? p.media : undefined,
        video: p.mediaType === "video" ? p.media : undefined,
        author: {
          name: p.authorName || "Автор",
          username: p.authorUsername || `@user${p.userId}`,
          avatar:
            p.authorAvatar ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.userId}`,
        },
      }));
      setPosts(mapped);
      setCurrentIndex(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
    loadBalance();
  }, [loadPosts, loadBalance]);

  useEffect(() => {
    if (!user?.id) return;
    fetch(`/api/users/${user.id}/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName: [user.first_name, user.last_name].filter(Boolean).join(" "),
        username: user.username ? `@${user.username}` : "",
        avatarUrl: user.photo_url || "",
        bio: "",
      }),
    }).catch(() => {});
  }, [user]);

  useEffect(() => {
    fetchGoals({ status: "active" })
      .then(all => {
        const now = Date.now();
        setLiveGoals(
          all.filter(g => now - new Date(g.createdAt).getTime() < 10 * 60 * 1000),
        );
      })
      .catch(() => {});
  }, []);

  const toggleLike = (postId: string) => {
    setPosts(prev =>
      prev.map(p =>
        p.id === postId
          ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
          : p,
      ),
    );
  };

  const handleSendStar = async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!user?.id || starsBalance < starAmount) {
      webApp?.showAlert?.("Недостаточно звёзд. Купите в профиле.");
      return;
    }
    const res = await fetch("/api/stars/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fromUserId: String(user.id),
        toPostId: postId,
        toUserId: post?.authorId,
        amount: starAmount,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setStarsBalance(data.balance ?? starsBalance - starAmount);
      setPosts(prev =>
        prev.map(p =>
          p.id === postId ? { ...p, stars: p.stars + starAmount } : p,
        ),
      );
      setShowStarModal(null);
      webApp?.HapticFeedback?.notificationOccurred("success");
    } else {
      const err = await res.json();
      webApp?.showAlert?.(err.error || "Ошибка");
    }
  };

  const renderCard = (post: Post) => (
    <div className="relative w-full h-full bg-black">
      {post.image && (
        <img
          src={post.image}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
          onDoubleClick={() => toggleLike(post.id)}
        />
      )}
      {post.video && (
        <video
          src={post.video}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          loop
          muted
          autoPlay
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30 pointer-events-none" />

      <div className="absolute top-3 left-3 right-3 flex items-center gap-2 z-10">
        <img
          src={post.author.avatar}
          alt=""
          className="w-9 h-9 rounded-full ring-2 ring-white/80 object-cover"
        />
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-semibold truncate">{post.author.name}</p>
          <p className="text-white/60 text-xs truncate">{post.author.username}</p>
        </div>
        <span className="text-white/50 text-[10px]">{post.timestamp}</span>
      </div>

      <div className="absolute right-2 bottom-16 flex flex-col items-center gap-3 z-10">
        <button
          type="button"
          onClick={() => toggleLike(post.id)}
          className="flex flex-col items-center gap-0.5"
        >
          <Heart
            size={24}
            className={cn("text-white", post.liked && "fill-red-500 text-red-500")}
          />
          <span className="text-[10px] text-white font-medium">{post.likes}</span>
        </button>
        <button
          type="button"
          onClick={() => setShowCommentSheet(post.id)}
          className="flex flex-col items-center gap-0.5"
        >
          <MessageCircle size={24} className="text-white" />
          <span className="text-[10px] text-white font-medium">{post.comments}</span>
        </button>
        <button
          type="button"
          onClick={() => setShowStarModal(post.id)}
          className="flex flex-col items-center gap-0.5"
        >
          <Star size={24} className="text-amber-400 fill-amber-400" />
          <span className="text-[10px] text-white font-medium">{post.stars || ""}</span>
        </button>
        <button
          type="button"
          onClick={() => {
            const url = `https://t.me/share/url?url=${encodeURIComponent(`post/${post.id}`)}`;
            webApp?.openTelegramLink?.(url);
          }}
        >
          <Share2 size={22} className="text-white" />
        </button>
      </div>

      {post.caption && (
        <p className="absolute bottom-3 left-3 right-14 text-white text-[13px] leading-snug line-clamp-2 z-10">
          {post.caption}
        </p>
      )}
    </div>
  );

  return (
    <div className="flex flex-col min-h-[calc(100dvh-8rem)] max-w-lg mx-auto w-full">
      <div className="px-1 pt-1 pb-2">
        <Stories />
      </div>

      {liveGoals.length > 0 && (
        <button
          type="button"
          onClick={() => navigate("/goals")}
          className="mx-4 mb-2 flex items-center justify-center gap-2 py-2 rounded-xl bg-primary/15 text-primary text-xs font-semibold"
        >
          <Target size={14} /> {liveGoals.length} активных целей
        </button>
      )}

      {loading ? (
        <div className="flex-1 flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-muted-foreground" size={28} />
        </div>
      ) : posts.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-16 text-center">
          <p className="text-lg font-semibold mb-2">Лента пуста</p>
          <p className="text-sm text-muted-foreground mb-6">
            Создайте первый пост — он появится здесь для всех подписчиков {APP_NAME}.
          </p>
          <Link to="/create" className="btn-premium px-6 py-3 text-sm inline-flex items-center gap-2">
            <Plus size={18} /> Создать пост
          </Link>
        </div>
      ) : (
        <>
          <FeedCardStack
            items={posts}
            index={currentIndex}
            onIndexChange={setCurrentIndex}
            renderCard={renderCard}
          />
          <div className="flex justify-center gap-1.5 pb-4 pt-1">
            {posts.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1 rounded-full transition-all",
                  i === currentIndex ? "w-5 bg-primary" : "w-1 bg-muted-foreground/40",
                )}
              />
            ))}
          </div>
          <p className="text-center text-[11px] text-muted-foreground pb-2">
            Свайп влево / вправо · {currentIndex + 1} / {posts.length}
          </p>
        </>
      )}

      {showCommentSheet && (
        <div className="fixed inset-0 z-50 flex items-end" onClick={() => setShowCommentSheet(null)}>
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="relative z-10 w-full rounded-t-3xl bg-card max-h-[70vh] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-border font-semibold">Комментарии</div>
            <div className="overflow-y-auto max-h-[55vh]">
              <Comments postId={showCommentSheet} onClose={() => setShowCommentSheet(null)} />
            </div>
          </div>
        </div>
      )}

      {showStarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowStarModal(null)}>
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative z-10 w-full max-w-sm rounded-2xl p-5 bg-card" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold mb-1">Поддержать ⭐</h3>
            <p className="text-sm text-muted-foreground mb-4">Баланс: {starsBalance}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {[1, 5, 10, 25, 50].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setStarAmount(n)}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium",
                    starAmount === n ? "bg-primary text-primary-foreground" : "bg-muted",
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => handleSendStar(showStarModal)} className="btn-premium w-full py-3 text-sm">
              Отправить {starAmount} ⭐
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
