import { useState, useEffect, useRef } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  Star,
  Play,
  Pause,
  Volume2,
  VolumeX,
  MoreVertical
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTelegram } from "@/hooks/useTelegram";
import { usePremium } from "@/hooks/usePremium";

interface ScrollVideo {
  id: string;
  author: {
    name: string;
    avatar: string;
    username: string;
    verified: boolean;
  };
  video: string;
  thumbnail?: string;
  caption: string;
  likes: number;
  comments: number;
  stars: number;
  liked: boolean;
  starred: boolean;
  timestamp: string;
}

export default function ScrollFeed({ onBack }: { onBack?: () => void }) {
  const [videos, setVideos] = useState<ScrollVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [starsBalance, setStarsBalance] = useState(0);
  const [showStarModal, setShowStarModal] = useState<string | null>(null);
  const [starAmount, setStarAmount] = useState(1);
  const { user } = useTelegram();
  const { premium } = usePremium();

  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Загружаем видео для скролл-ленты
  useEffect(() => {
    const loadVideos = async () => {
      setLoading(true);
      try {
        // Получаем только видео-посты
        const response = await fetch("/api/posts?type=scroll");
        const data = await response.json();

        if (data.posts && Array.isArray(data.posts)) {
          const videoPosts = await Promise.all(
            data.posts
              .filter((post: any) => post.mediaType === "video")
              .map(async (post: any) => {
                try {
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
                    video: post.media,
                    thumbnail: post.media, // Для видео используем первый кадр
                    caption: post.caption || "",
                    likes: post.likes || 0,
                    comments: post.comments || 0,
                    stars: post.stars || 0,
                    liked: false,
                    starred: false,
                    timestamp: new Date(post.createdAt).toLocaleDateString(
                      "ru-RU",
                    ),
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
                    video: post.media,
                    thumbnail: post.media,
                    caption: post.caption || "",
                    likes: post.likes || 0,
                    comments: post.comments || 0,
                    stars: post.stars || 0,
                    liked: false,
                    starred: false,
                    timestamp: new Date(post.createdAt).toLocaleDateString("ru-RU"),
                  };
                }
              }),
          );

          setVideos(videoPosts);
        }
      } catch (error) {
        console.error("Ошибка загрузки видео:", error);
      } finally {
        setLoading(false);
      }
    };

    loadVideos();
  }, []);

  // Загружаем баланс звезд
  useEffect(() => {
    if (user?.id) {
      fetch(`/api/stars/balance?userId=${user.id}`)
        .then((res) => res.json())
        .then((data) => setStarsBalance(data.balance || 0))
        .catch(console.error);
    }
  }, [user]);

  // Обработка скролла для автопроигрывания
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const scrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;

      // Находим видео в центре экрана
      const videoElements = container.querySelectorAll('.video-container');
      let activeIndex = 0;
      let minDistance = Infinity;

      videoElements.forEach((element, index) => {
        const rect = element.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const centerY = rect.top + rect.height / 2;
        const containerCenterY = containerRect.top + containerRect.height / 2;
        const distance = Math.abs(centerY - containerCenterY);

        if (distance < minDistance) {
          minDistance = distance;
          activeIndex = index;
        }
      });

      if (activeIndex !== currentVideoIndex) {
        setCurrentVideoIndex(activeIndex);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [currentVideoIndex]);

  // Автопроигрывание активного видео
  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (video) {
        if (index === currentVideoIndex) {
          video.play().catch(console.error);
        } else {
          video.pause();
        }
      }
    });
  }, [currentVideoIndex]);

  const toggleLike = async (videoId: string) => {
    if (!user?.id) {
      alert("Необходима авторизация для лайков");
      return;
    }

    const video = videos.find((v) => v.id === videoId);
    if (!video) return;

    const action = video.liked ? "unlike" : "like";

    try {
      const response = await fetch(`/api/posts/${videoId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id.toString(),
          action,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setVideos(
          videos.map((v) =>
            v.id === videoId
              ? { ...v, liked: data.liked, likes: data.likes }
              : v,
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

  const handleSendStar = async (videoId: string) => {
    if (!user?.id) {
      alert("Необходима авторизация");
      return;
    }

    if (starsBalance < starAmount) {
      alert("Недостаточно звезд");
      return;
    }

    try {
      const response = await fetch("/api/stars/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromUserId: user.id.toString(),
          toPostId: videoId,
          amount: starAmount,
        }),
      });

      if (response.ok) {
        setStarsBalance((prev) => prev - starAmount);
        setVideos(
          videos.map((v) =>
            v.id === videoId
              ? {
                ...v,
                starred: true,
                stars: v.stars + starAmount,
              }
              : v,
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

  const toggleVideoPlay = (index: number) => {
    const video = videoRefs.current[index];
    if (video) {
      if (video.paused) {
        video.play().catch(console.error);
      } else {
        video.pause();
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Play className="text-primary" size={40} />
        </div>
        <h3 className="text-xl font-bold mb-2">MoonCoon Scroll</h3>
        <p className="text-muted-foreground text-center">
          Здесь будут появляться видео от создателей контента
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with back button */}
      <div
        className="fixed top-0 left-0 right-0 glass-morphism border-b border-glass-light/20 z-30 ios-shadow"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="max-w-2xl mx-auto px-4 py-6 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onBack ? onBack() : window.history.back()}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all hover:bg-glass-light/20 flex items-center gap-2"
            >
              ← Лента
            </button>
          </div>
        </div>
      </div>

      <div
        ref={containerRef}
        className="min-h-screen bg-background snap-y snap-mandatory overflow-y-scroll pt-20"
        style={{ scrollBehavior: 'smooth' }}
      >
        {videos.map((video, index) => (
          <div
            key={video.id}
            className="video-container h-screen w-full snap-start relative flex items-center justify-center bg-black"
          >
            {/* Video */}
            <video
              ref={(el) => (videoRefs.current[index] = el)}
              src={video.video}
              className="w-full h-full object-cover"
              loop
              muted
              playsInline
              poster={video.thumbnail}
              autoPlay={index === 0} // Автопроигрывание первого видео
              onClick={() => toggleVideoPlay(index)}
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />

            {/* Play/Pause Button */}
            <button
              onClick={() => toggleVideoPlay(index)}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-black/50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
            >
              <Play className="text-white" size={32} />
            </button>

            {/* Video Info */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <div className="flex items-end justify-between">
                {/* Author Info & Caption */}
                <div className="flex-1 mr-4">
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={video.author.avatar}
                      alt={video.author.name}
                      className="w-12 h-12 rounded-full flex-shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold">{video.author.name}</p>
                        {video.author.verified && (
                          <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white">✓</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm opacity-80">@{video.author.username}</p>
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed mb-3 line-clamp-3">
                    {video.caption}
                  </p>

                  {/* Hashtags */}
                  <div className="flex flex-wrap gap-2">
                    {video.caption.match(/#[^\s]+/g)?.slice(0, 3).map((tag, i) => (
                      <span key={i} className="text-sm opacity-80">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col items-center gap-4">
                  {/* Like */}
                  <button
                    onClick={() => toggleLike(video.id)}
                    className="flex flex-col items-center gap-1 group"
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center transition-all",
                      video.liked
                        ? "bg-red-500"
                        : "bg-black/50 group-hover:bg-black/70"
                    )}>
                      <Heart
                        size={24}
                        className={cn(
                          "transition-all",
                          video.liked ? "fill-white text-white scale-110" : "text-white"
                        )}
                      />
                    </div>
                    <span className="text-xs font-medium">{video.likes}</span>
                  </button>

                  {/* Comments */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center">
                      <MessageCircle size={24} className="text-white" />
                    </div>
                    <span className="text-xs font-medium">{video.comments}</span>
                  </div>

                  {/* Stars */}
                  <button
                    onClick={() => setShowStarModal(video.id)}
                    className="flex flex-col items-center gap-1 group"
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center transition-all",
                      video.starred
                        ? "bg-yellow-500"
                        : "bg-black/50 group-hover:bg-black/70"
                    )}>
                      <Star
                        size={24}
                        className={cn(
                          "transition-all",
                          video.starred ? "fill-white text-white scale-110" : "text-white"
                        )}
                      />
                    </div>
                    <span className="text-xs font-medium">{video.stars}</span>
                  </button>

                  {/* Share */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center">
                      <Share2 size={24} className="text-white" />
                    </div>
                    <span className="text-xs font-medium">Share</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Star Modal */}
            {showStarModal === video.id && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <div className="glass-card max-w-sm w-full p-6 bg-black/90 border-white/20">
                  <h3 className="text-lg font-bold mb-4 text-white">
                    Отправить звезду
                  </h3>
                  <div className="mb-4">
                    <p className="text-sm text-white/80 mb-2">
                      Ваш баланс: {starsBalance} ⭐
                    </p>
                    <div className="flex gap-2">
                      {[1, 5, 10, 50].map((amt) => (
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
                      className="flex-1 glass-button py-2 text-sm bg-white/10 text-white"
                    >
                      Отмена
                    </button>
                    <button
                      onClick={() => handleSendStar(video.id)}
                      disabled={starsBalance < starAmount}
                      className="flex-1 glass-button bg-primary/20 text-primary hover:bg-primary/30 py-2 text-sm font-semibold disabled:opacity-50"
                    >
                      Отправить {starAmount} ⭐
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}