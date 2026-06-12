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
    <div className="relative w-full h-full" style={{ background: "var(--bg)" }}>
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
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.12) 40%, rgba(0,0,0,0.25) 100%)",
        }}
      />

      <div className="absolute top-3 left-3 right-3 flex items-center gap-2.5 z-10">
        <div className="story-ring">
          <div className="w-10 h-10 rounded-full overflow-hidden" style={{ background: "var(--bg-tertiary)" }}>
            <img
              src={post.author.avatar}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>{post.author.name}</p>
          <p className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>{post.author.username}</p>
        </div>
        <span className="text-[10px] font-medium" style={{ color: "var(--text-secondary)" }}>{post.timestamp}</span>
      </div>

      <div className="absolute right-2.5 bottom-20 flex flex-col items-center gap-3.5 z-10">
        <button
          type="button"
          onClick={() => toggleLike(post.id)}
          className="flex flex-col items-center gap-0.5 post-action-btn"
        >
          <div className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{
              background: post.liked ? "rgba(255,69,58,0.18)" : "rgba(28,28,30,0.85)",
              border: `0.5px solid ${post.liked ? "rgba(255,69,58,0.35)" : "var(--separator)"}`,
            }}>
            <Heart
              size={22}
              className={cn("transition-all", post.liked && "fill-[var(--red)] text-[var(--red)] scale-110")}
              style={{ color: post.liked ? "var(--red)" : "var(--text-primary)" }}
            />
          </div>
          <span className="text-[10px] font-medium" style={{ color: "var(--text-primary)" }}>{post.likes}</span>
        </button>
        <button
          type="button"
          onClick={() => setShowCommentSheet(post.id)}
          className="flex flex-col items-center gap-0.5 post-action-btn"
        >
          <div className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(28,28,30,0.85)",
              border: "0.5px solid var(--separator)",
            }}>
            <MessageCircle size={22} style={{ color: "var(--text-primary)" }} />
          </div>
          <span className="text-[10px] font-medium" style={{ color: "var(--text-primary)" }}>{post.comments}</span>
        </button>
        <button
          type="button"
          onClick={() => setShowStarModal(post.id)}
          className="flex flex-col items-center gap-0.5 post-action-btn"
        >
          <div className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(28,28,30,0.85)",
              border: "0.5px solid rgba(255,214,10,0.2)",
            }}>
            <Star size={22} className="fill-[var(--yellow)]" style={{ color: "var(--yellow)" }} />
          </div>
          <span className="text-[10px] font-medium" style={{ color: "var(--text-primary)" }}>{post.stars || ""}</span>
        </button>
        <button
          type="button"
          onClick={() => {
            const url = `https://t.me/share/url?url=${encodeURIComponent(`post/${post.id}`)}`;
            webApp?.openTelegramLink?.(url);
          }}
          className="post-action-btn"
        >
          <div className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(28,28,30,0.85)",
              border: "0.5px solid var(--separator)",
            }}>
            <Share2 size={20} style={{ color: "var(--text-primary)" }} />
          </div>
        </button>
      </div>

      {post.caption && (
        <div className="absolute bottom-3 left-3 right-16 z-10">
          <p className="text-[13px] leading-snug line-clamp-2 font-medium" style={{ color: "var(--text-primary)" }}>
            {post.caption}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col min-h-[calc(100dvh-8rem)] max-w-lg mx-auto w-full" style={{ background: "var(--bg)" }}>
      <div className="px-1 pt-1 pb-2">
        <Stories />
      </div>

      {liveGoals.length > 0 && (
        <button
          type="button"
          onClick={() => navigate("/goals")}
          className="mx-4 mb-2 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-xs font-semibold"
          style={{
            background: "rgba(255,214,10,0.08)",
            border: "0.5px solid rgba(255,214,10,0.18)",
            color: "var(--yellow)",
          }}
        >
          <Target size={14} /> {liveGoals.length} активных целей
        </button>
      )}

      {loading ? (
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="animate-spin" size={28} style={{ color: "var(--text-secondary)" }} />
            <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Загружаем ленту...</span>
          </div>
        </div>
      ) : posts.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-16 text-center">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
            style={{
              background: "var(--bg-secondary)",
              border: "0.5px solid var(--separator)",
            }}>
            <Plus size={32} style={{ color: "var(--text-secondary)" }} />
          </div>
          <p className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>Лента пуста</p>
          <p className="text-sm mb-6 max-w-[260px]" style={{ color: "var(--text-secondary)" }}>
            Создайте первый пост — он появится здесь для всех подписчиков {APP_NAME}.
          </p>
          <Link to="/create" className="ios-btn text-sm inline-flex items-center gap-2">
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
                  width: i === currentIndex ? 24 : 4,
                  background: i === currentIndex ? "var(--blue)" : "rgba(142,142,147,0.2)",
                }}
              />
            ))}
          </div>
          <p className="text-center text-[11px] pb-2 font-medium" style={{ color: "var(--text-secondary)" }}>
            Свайп влево / вправо · {currentIndex + 1} / {posts.length}
          </p>
        </>
      )}

      {showCommentSheet && (
        <div className="fixed inset-0 z-50 flex items-end" onClick={() => setShowCommentSheet(null)}>
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.6)" }} />
          <div
            className="relative z-10 w-full ios-blur"
            style={{ background: "var(--bg-secondary)", borderRadius: "1.5rem 1.5rem 0 0" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full" style={{ background: "var(--separator)" }} />
            </div>
            <div className="px-4 py-3 flex items-center gap-2 text-sm" style={{ borderBottom: "0.5px solid var(--separator)" }}>
              <MessageCircle size={16} style={{ color: "var(--blue)" }} />
              <span className="font-semibold" style={{ color: "var(--text-primary)" }}>Комментарии</span>
            </div>
            <div className="overflow-y-auto max-h-[55vh]">
              <Comments postId={showCommentSheet} onClose={() => setShowCommentSheet(null)} />
            </div>
          </div>
        </div>
      )}

      {showStarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowStarModal(null)}>
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.7)" }} />
          <div className="relative z-10 w-full max-w-sm ios-card p-6" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-1" style={{ color: "var(--text-primary)" }}>Поддержать</h3>
            <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>Баланс: {starsBalance} ⭐</p>
            <div className="flex flex-wrap gap-2 mb-5">
              {[1, 5, 10, 25, 50].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setStarAmount(n)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: starAmount === n ? "var(--blue)" : "var(--bg-tertiary)",
                    color: starAmount === n ? "#FFFFFF" : "var(--text-secondary)",
                    border: `0.5px solid ${starAmount === n ? "var(--blue)" : "var(--separator)"}`,
                  }}
                >
                  {n} ⭐
                </button>
              ))}
            </div>
            <button type="button" onClick={() => handleSendStar(showStarModal)} className="ios-btn w-full py-3.5 text-sm">
              Отправить {starAmount} ⭐
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
