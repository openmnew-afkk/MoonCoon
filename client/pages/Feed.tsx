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
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40 pointer-events-none" />

      {/* Author info - top */}
      <div className="absolute top-3 left-3 right-3 flex items-center gap-2.5 z-10">
        <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white/20 ring-offset-1 ring-offset-black/50">
          <img
            src={post.author.avatar}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-semibold truncate drop-shadow-lg">{post.author.name}</p>
          <p className="text-white/50 text-xs truncate">{post.author.username}</p>
        </div>
        <span className="text-white/40 text-[10px] font-medium">{post.timestamp}</span>
      </div>

      {/* Actions - right side */}
      <div className="absolute right-2.5 bottom-20 flex flex-col items-center gap-3.5 z-10">
        <button
          type="button"
          onClick={() => toggleLike(post.id)}
          className="flex flex-col items-center gap-0.5 post-action-btn"
        >
          <div className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-sm ${post.liked ? 'bg-red-500/20' : 'bg-black/30'}`}>
            <Heart
              size={22}
              className={cn("text-white drop-shadow-lg", post.liked && "fill-red-500 text-red-500")}
            />
          </div>
          <span className="text-[10px] text-white font-medium drop-shadow-lg">{post.likes}</span>
        </button>
        <button
          type="button"
          onClick={() => setShowCommentSheet(post.id)}
          className="flex flex-col items-center gap-0.5 post-action-btn"
        >
          <div className="w-11 h-11 rounded-full flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <MessageCircle size={22} className="text-white drop-shadow-lg" />
          </div>
          <span className="text-[10px] text-white font-medium drop-shadow-lg">{post.comments}</span>
        </button>
        <button
          type="button"
          onClick={() => setShowStarModal(post.id)}
          className="flex flex-col items-center gap-0.5 post-action-btn"
        >
          <div className="w-11 h-11 rounded-full flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <Star size={22} className="text-amber-400 fill-amber-400 drop-shadow-lg" />
          </div>
          <span className="text-[10px] text-white font-medium drop-shadow-lg">{post.stars || ""}</span>
        </button>
        <button
          type="button"
          onClick={() => {
            const url = `https://t.me/share/url?url=${encodeURIComponent(`post/${post.id}`)}`;
            webApp?.openTelegramLink?.(url);
          }}
          className="post-action-btn"
        >
          <div className="w-11 h-11 rounded-full flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <Share2 size={20} className="text-white drop-shadow-lg" />
          </div>
        </button>
      </div>

      {/* Caption - bottom */}
      {post.caption && (
        <div className="absolute bottom-3 left-3 right-16 z-10">
          <p className="text-white text-[13px] leading-snug line-clamp-2 drop-shadow-lg">
            {post.caption}
          </p>
        </div>
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
          className="mx-4 mb-2 flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-500/20 text-amber-400 text-xs font-semibold"
          style={{ boxShadow: "0 0 20px rgba(245,158,11,0.1)" }}
        >
          <Target size={14} /> {liveGoals.length} активных целей
        </button>
      )}

      {loading ? (
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-primary" size={28} />
            <span className="text-xs text-muted-foreground">Загружаем ленту...</span>
          </div>
        </div>
      ) : posts.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-16 text-center">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(139,92,246,0.08))", border: "1px solid rgba(59,130,246,0.15)" }}>
            <Plus size={32} className="text-primary" />
          </div>
          <p className="text-lg font-bold mb-2">Лента пуста</p>
          <p className="text-sm text-muted-foreground mb-6 max-w-[260px]">
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
          <div className="flex justify-center gap-1.5 pb-3 pt-1">
            {posts.map((_, i) => (
              <div
                key={i}
                className="h-1 rounded-full transition-all duration-300"
                style={{
                  width: i === currentIndex ? 20 : 4,
                  background: i === currentIndex
                    ? "linear-gradient(90deg, #3b82f6, #8b5cf6)"
                    : "rgba(148,163,184,0.2)",
                  boxShadow: i === currentIndex ? "0 0 8px rgba(59,130,246,0.4)" : "none",
                }}
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
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative z-10 w-full rounded-t-3xl overflow-hidden"
            style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border) / 0.5)", boxShadow: "0 -8px 40px rgba(0,0,0,0.4)" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="px-4 py-3.5 border-b border-border/50 font-semibold flex items-center gap-2">
              <MessageCircle size={16} className="text-primary" />
              Комментарии
            </div>
            <div className="overflow-y-auto max-h-[55vh]">
              <Comments postId={showCommentSheet} onClose={() => setShowCommentSheet(null)} />
            </div>
          </div>
        </div>
      )}

      {showStarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowStarModal(null)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-sm rounded-3xl p-6" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border) / 0.5)", boxShadow: "0 24px 80px rgba(0,0,0,0.5)" }} onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-1">Поддержать</h3>
            <p className="text-sm text-muted-foreground mb-5">Баланс: {starsBalance} ⭐</p>
            <div className="flex flex-wrap gap-2 mb-5">
              {[1, 5, 10, 25, 50].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setStarAmount(n)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: starAmount === n
                      ? "linear-gradient(135deg, #3b82f6, #8b5cf6)"
                      : "hsl(var(--secondary))",
                    color: starAmount === n ? "white" : "hsl(var(--secondary-foreground))",
                    boxShadow: starAmount === n ? "0 4px 16px rgba(59,130,246,0.3)" : "none",
                  }}
                >
                  {n} ⭐
                </button>
              ))}
            </div>
            <button type="button" onClick={() => handleSendStar(showStarModal)} className="btn-premium w-full py-3.5 text-sm">
              Отправить {starAmount} ⭐
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
