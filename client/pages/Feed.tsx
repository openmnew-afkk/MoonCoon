import { useState, useEffect } from "react";
import { Heart, MessageCircle, Share2, Star, MoreVertical, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import Stories from "@/components/Stories";
import Comments from "@/components/Comments";
import VideoPlayer from "@/components/VideoPlayer";
import ScrollFeed from "./ScrollFeed";
import { useTelegram } from "@/hooks/useTelegram";
import PremiumBadge from "@/components/PremiumBadge";
import { usePremium } from "@/hooks/usePremium";

interface Post {
  id: string;
  author: {
    name: string;
    avatar: string;
    username: string;
  };
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

// Пустой массив - посты будут загружаться с сервера
const mockPosts: Post[] = [];

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [startY, setStartY] = useState(0);
  const [feedMode, setFeedMode] = useState<"feed" | "scroll">("feed");
  const { user } = useTelegram();
  const [starsBalance, setStarsBalance] = useState(0);
  const [showStarModal, setShowStarModal] = useState<string | null>(null);
  const [starAmount, setStarAmount] = useState(1);
  const [showPostMenu, setShowPostMenu] = useState<string | null>(null);
  const { premium } = usePremium();

  // Загружаем посты с сервера
  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/posts");
        const data = await response.json();

        if (data.posts && Array.isArray(data.posts)) {
          // Загружаем профили пользователей для каждого поста
          const postsWithProfiles = await Promise.all(
            data.posts.map(async (post: any) => {
              try {
                // If this is current user's post, use their real data
                let profile;
                if (user?.id && post.userId === user.id.toString()) {
                  profile = {
                    name: user.first_name || user.username || "Вы",
                    username: user.username
                      ? `@${user.username}`
                      : `@user${user.id}`,
                    avatarUrl:
                      user.photo_url ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
                    verified: parseInt(user.id.toString()) <= 1000,
                  };
                } else {
                  const profileResponse = await fetch(
                    `/api/users/${post.userId}`,
                  );
                  profile = await profileResponse.json();
                }

                return {
                  id: post.id,
                  author: {
                    name: profile.name || "Пользователь",
                    avatar:
                      profile.avatarUrl ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.userId}`,
                    username: profile.username || `@user${post.userId}`,
                    verified: profile.verified || false,
                  },
                  image: post.mediaType === "image" ? post.media : undefined,
                  video: post.mediaType === "video" ? post.media : undefined,
                  caption: post.caption || "",
                  likes: post.likes || 0,
                  comments: post.comments || 0,
                  stars: 0,
                  timestamp: new Date(post.createdAt).toLocaleDateString(
                    "ru-RU",
                  ),
                  liked: false,
                  starred: false,
                  showComments: false,
                };
              } catch (profileError) {
                console.error("Ошибка загрузки профиля:", profileError);
                // Fallback если профиль не загрузился
                return {
                  id: post.id,
                  author: {
                    name: "Пользователь",
                    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.userId}`,
                    username: `@user${post.userId}`,
                    verified: false,
                  },
                  image: post.mediaType === "image" ? post.media : undefined,
                  video: post.mediaType === "video" ? post.media : undefined,
                  caption: post.caption || "",
                  likes: post.likes || 0,
                  comments: post.comments || 0,
                  stars: 0,
                  timestamp: new Date(post.createdAt).toLocaleDateString(
                    "ru-RU",
                  ),
                  liked: false,
                  starred: false,
                  showComments: false,
                };
              }
            }),
          );

          setPosts(postsWithProfiles);
        }
      } catch (error) {
        console.error("Ошибка загрузки постов:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  // Функция для обновления ленты
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await fetch("/api/posts");
      const data = await response.json();

      if (data.posts && Array.isArray(data.posts)) {
        // Загружаем профили пользователей для каждого поста
        const postsWithProfiles = await Promise.all(
          data.posts.map(async (post: any) => {
            try {
              // If this is current user's post, use their real data
              let profile;
              if (user?.id && post.userId === user.id.toString()) {
                profile = {
                  name: user.first_name || user.username || "Вы",
                  username: user.username
                    ? `@${user.username}`
                    : `@user${user.id}`,
                  avatarUrl:
                    user.photo_url ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
                  verified: parseInt(user.id.toString()) <= 1000,
                };
              } else {
                const profileResponse = await fetch(
                  `/api/users/${post.userId}`,
                );
                profile = await profileResponse.json();
              }

              return {
                id: post.id,
                author: {
                  name: profile.name || "Пользователь",
                  avatar:
                    profile.avatarUrl ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.userId}`,
                  username: profile.username || `@user${post.userId}`,
                  verified: profile.verified || false,
                },
                image: post.mediaType === "image" ? post.media : undefined,
                video: post.mediaType === "video" ? post.media : undefined,
                caption: post.caption || "",
                likes: post.likes || 0,
                comments: post.comments || 0,
                stars: 0,
                timestamp: new Date(post.createdAt).toLocaleDateString("ru-RU"),
                liked: false,
                starred: false,
                showComments: false,
              };
            } catch (profileError) {
              console.error("Ошибка загрузки профиля:", profileError);
              return {
                id: post.id,
                author: {
                  name: "Пользователь",
                  avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.userId}`,
                  username: `@user${post.userId}`,
                  verified: false,
                },
                image: post.mediaType === "image" ? post.media : undefined,
                video: post.mediaType === "video" ? post.media : undefined,
                caption: post.caption || "",
                likes: post.likes || 0,
                comments: post.comments || 0,
                stars: 0,
                timestamp: new Date(post.createdAt).toLocaleDateString("ru-RU"),
                liked: false,
                starred: false,
                showComments: false,
              };
            }
          }),
        );

        setPosts(postsWithProfiles);
      }
    } catch (error) {
      console.error("Ошибка обновления постов:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Загружаем баланс звезд
  useEffect(() => {
    if (user?.id) {
      fetch(`/api/stars/balance?userId=${user.id}`)
        .then((res) => res.json())
        .then((data) => setStarsBalance(data.balance || 0))
        .catch(console.error);
    }
  }, [user]);

  const toggleLike = async (postId: string) => {
    if (!user?.id) {
      alert("Необходима авторизация для лайков");
      return;
    }

    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    const action = post.liked ? "unlike" : "like";

    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id.toString(),
          action,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(
          posts.map((p) =>
            p.id === postId
              ? { ...p, liked: data.liked, likes: data.likes }
              : p,
          ),
        );
      } else {
        alert("Ошибка при обновлении лайка");
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      alert("Ошибка сети");
    }
  };

  const toggleComments = (postId: string) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? { ...post, showComments: !post.showComments }
          : post,
      ),
    );
  };

  const handleShare = async (post: Post) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.caption,
          text: `${post.author.name}: ${post.caption}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error("Ошибка при попытке поделиться:", error);
      }
    }
  };

  const handleSendStar = async (postId: string) => {
    if (!user?.id) {
      alert("Необходима авторизация");
      return;
    }

    if (starsBalance < starAmount) {
      alert("Недостаточно звезд");
      return;
    }

    try {
      // Отправляем звезду автору поста
      const response = await fetch("/api/stars/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromUserId: user.id.toString(),
          toPostId: postId,
          amount: starAmount,
        }),
      });

      if (response.ok) {
        // Обновляем баланс
        setStarsBalance((prev) => prev - starAmount);

        // Обновляем пост
        setPosts(
          posts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  starred: true,
                  stars: post.stars + starAmount,
                }
              : post,
          ),
        );

        setShowStarModal(null);
      } else {
        alert("Ошибка при отправке звезды");
      }
    } catch (error) {
      console.error("Ошибка:", error);
      alert("Ошибка при отправке звезды");
    }
  };

  if (feedMode === "scroll") {
    return <ScrollFeed />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div
        className="fixed top-0 left-0 right-0 glass-morphism border-b border-glass-light/20 z-30 ios-shadow"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="max-w-2xl mx-auto px-4 py-6 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFeedMode("feed")}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium transition-all",
                feedMode === "feed"
                  ? "bg-primary/20 text-primary"
                  : "hover:bg-glass-light/20"
              )}
            >
              Лента
            </button>
            <button
              onClick={() => setFeedMode("scroll")}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2",
                feedMode === "scroll"
                  ? "bg-primary/20 text-primary"
                  : "hover:bg-glass-light/20"
              )}
            >
              <Play size={16} />
              Scroll
            </button>
          </div>
        </div>
      </div>

      {/* Posts Feed */}
      <div
        className="max-w-2xl mx-auto px-3 sm:px-4 pb-8"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 6.5rem)" }}
      >
        {/* Pull to Refresh Indicator */}
        {refreshing && (
          <div className="flex justify-center items-center py-6 mb-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/20 border-t-primary"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              </div>
            </div>
            <span className="text-sm text-primary ml-3 font-medium">
              Обновление ленты...
            </span>
          </div>
        )}

        {/* Stories Section */}
        <Stories />

        {/* Posts */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="text-muted-foreground">Загрузка постов...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <MessageCircle className="text-primary" size={40} />
              </div>
              <h3 className="text-xl font-bold mb-2">Постов пока нет</h3>
              <p className="text-muted-foreground">
                Станьте первым, кто опубликует контент!
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="glass-card overflow-hidden">
                {/* Post Header */}
                <div className="flex items-center gap-3 mb-3 p-3 sm:p-4 border-b border-glass-light/10">
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-10 h-10 rounded-full flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm truncate">
                        {post.author.name}
                      </p>
                      {premium.isPremium && <PremiumBadge size="sm" />}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {post.timestamp}
                    </p>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() =>
                        setShowPostMenu(
                          showPostMenu === post.id ? null : post.id,
                        )
                      }
                      className="text-muted-foreground hover:text-foreground flex-shrink-0 p-2 rounded-lg hover:bg-glass-light/20 transition-all"
                    >
                      <MoreVertical size={20} />
                    </button>
                    {showPostMenu === post.id && (
                      <div className="absolute right-0 top-full mt-1 glass-card rounded-xl p-2 min-w-[180px] z-50 shadow-lg">
                        <button
                          onClick={() => {
                            alert("Пожалоба отправлена");
                            setShowPostMenu(null);
                          }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-glass-light/20 rounded-lg transition-all"
                        >
                          🚩 Пожаловаться
                        </button>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(
                              `https://mooncoon.app/post/${post.id}`,
                            );
                            alert("Ссылка скопирована");
                            setShowPostMenu(null);
                          }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-glass-light/20 rounded-lg transition-all"
                        >
                          🔗 Скопировать ссылку
                        </button>
                        <button
                          onClick={() => {
                            setPosts(posts.filter((p) => p.id !== post.id));
                            setShowPostMenu(null);
                          }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-glass-light/20 rounded-lg transition-all text-muted-foreground"
                        >
                          🚫 Не интересно
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Post Media */}
                <div className="mb-3 rounded-2xl overflow-hidden -mx-1 sm:mx-0">
                  {post.image && (
                    <div
                      className="relative w-full"
                      style={{ aspectRatio: "1/1" }}
                    >
                      <img
                        src={post.image}
                        alt={post.caption}
                        className="w-full h-full object-cover select-none cursor-pointer"
                        draggable={false}
                        onContextMenu={(e) => e.preventDefault()}
                        onClick={() => {
                        // Открыть полноэкранный просмотр в рамке
                        const modal = document.createElement("div");
                        modal.className =
                          "fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4";
                        modal.onclick = () =>
                          document.body.removeChild(modal);

                        const modalContent = document.createElement("div");
                        modalContent.className =
                          "relative glass-card rounded-2xl p-4 max-w-4xl max-h-[90vh] overflow-hidden";
                        modalContent.onclick = (e) => e.stopPropagation();

                        const img = document.createElement("img");
                        img.src = post.image!;
                        img.className =
                          "w-full h-auto max-h-[80vh] object-contain rounded-xl";
                        img.onclick = (e) => e.stopPropagation();

                        const closeBtn = document.createElement("button");
                        closeBtn.innerHTML = "✕";
                        closeBtn.className =
                          "absolute -top-2 -right-2 text-white text-2xl bg-black/80 hover:bg-black rounded-full w-12 h-12 flex items-center justify-center transition-all shadow-lg";
                        closeBtn.onclick = () =>
                          document.body.removeChild(modal);

                        modalContent.appendChild(img);
                        modalContent.appendChild(closeBtn);
                        modal.appendChild(modalContent);
                        document.body.appendChild(modal);
                      }}
                      />
                    </div>
                  )}
                  {post.video && (
                    <div
                      className="relative w-full"
                      style={{ aspectRatio: "16/9", maxHeight: "400px" }}
                    >
                      <VideoPlayer src={post.video} thumbnail={post.image} />
                    </div>
                  )}
                </div>

                {/* Post Actions - Improved for iPhone */}
                <div className="flex items-center gap-1 sm:gap-1.5 mb-3 px-2 sm:px-3 overflow-x-auto">
                  <button
                    onClick={() => toggleLike(post.id)}
                    className="glass-button flex items-center justify-center gap-1 flex-1 min-w-0 px-1.5 py-2 touch-manipulation rounded-xl"
                    aria-label="Лайк"
                  >
                    <Heart
                      size={16}
                      className={cn(
                        "flex-shrink-0",
                        post.liked ? "fill-red-500 text-red-500" : "",
                      )}
                    />
                    <span className="text-xs font-medium truncate hidden sm:inline">
                      {post.likes}
                    </span>
                    <span className="text-xs font-medium sm:hidden">
                      {post.likes > 999
                        ? `${(post.likes / 1000).toFixed(1)}K`
                        : post.likes}
                    </span>
                  </button>
                  <button
                    onClick={() => toggleComments(post.id)}
                    className="glass-button flex items-center justify-center gap-1 flex-1 min-w-0 px-1.5 py-2 touch-manipulation rounded-xl"
                    aria-label="Комментарии"
                  >
                    <MessageCircle size={16} className="flex-shrink-0" />
                    <span className="text-xs font-medium truncate hidden sm:inline">
                      {post.comments}
                    </span>
                    <span className="text-xs font-medium sm:hidden">
                      {post.comments > 999
                        ? `${(post.comments / 1000).toFixed(1)}K`
                        : post.comments}
                    </span>
                  </button>
                  <button
                    onClick={() => setShowStarModal(post.id)}
                    className={cn(
                      "glass-button flex items-center justify-center gap-1 flex-1 min-w-0 px-1.5 py-2 touch-manipulation rounded-xl",
                      post.starred && "bg-primary/10",
                    )}
                    aria-label="Звезды"
                  >
                    <Star
                      size={16}
                      className={cn(
                        "flex-shrink-0",
                        post.starred ? "fill-primary text-primary" : "",
                      )}
                    />
                    <span className="text-xs font-medium truncate hidden sm:inline">
                      {post.stars || 0}
                    </span>
                    <span className="text-xs font-medium sm:hidden">
                      {post.stars
                        ? post.stars > 999
                          ? `${(post.stars / 1000).toFixed(1)}K`
                          : post.stars
                        : "0"}
                    </span>
                  </button>
                  <button
                    onClick={() => handleShare(post)}
                    className="glass-button flex items-center justify-center flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 touch-manipulation rounded-xl"
                    aria-label="Поделиться"
                  >
                    <Share2 size={16} />
                  </button>
                </div>

                {/* Star Modal */}
                {showStarModal === post.id && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="glass-card max-w-sm w-full p-6">
                      <h3 className="text-lg font-bold mb-4">
                        Отправить звезду
                      </h3>
                      <div className="mb-4">
                        <p className="text-sm text-muted-foreground mb-2">
                          Ваш баланс: {starsBalance} ⭐
                        </p>
                        <div className="flex gap-2">
                          {[1, 5, 10, 50, 100].map((amt) => (
                            <button
                              key={amt}
                              onClick={() => setStarAmount(amt)}
                              className={cn(
                                "glass-button px-4 py-2 text-sm font-medium transition-all",
                                starAmount === amt &&
                                  "bg-primary/20 text-primary border-2 border-primary",
                              )}
                              disabled={starsBalance < amt}
                            >
                              {amt} ⭐
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowStarModal(null)}
                          className="flex-1 glass-button py-2 text-sm"
                        >
                          Отмена
                        </button>
                        <button
                          onClick={() => handleSendStar(post.id)}
                          disabled={starsBalance < starAmount}
                          className="flex-1 glass-button bg-primary/20 text-primary hover:bg-primary/30 py-2 text-sm font-semibold disabled:opacity-50"
                        >
                          Отправить {starAmount} ⭐
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Post Caption */}
                <div className="px-3 sm:px-4 pb-3">
                  <p className="text-sm break-words leading-relaxed">
                    <span className="font-semibold">{post.author.name}</span>{" "}
                    <span className="whitespace-pre-wrap">{post.caption}</span>
                  </p>
                </div>

                {/* Comments Preview or Full Comments */}
                {post.showComments ? (
                  <div className="px-3 sm:px-4 pb-3 border-t border-glass-light/10 pt-3">
                    <Comments
                      postId={post.id}
                      onClose={() => toggleComments(post.id)}
                    />
                  </div>
                ) : post.comments > 0 ? (
                  <div className="px-3 sm:px-4 pb-3 border-t border-glass-light/10 pt-3">
                    <button
                      onClick={() => toggleComments(post.id)}
                      className="text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      Просмотреть все {post.comments}{" "}
                      {post.comments === 1
                        ? "комментарий"
                        : post.comments < 5
                          ? "комментария"
                          : "комментариев"}
                    </button>
                  </div>
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
