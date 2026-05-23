import { useState, useRef, useEffect, useCallback } from "react";
import { Plus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ─── Types ─────────────────────────────────────────────────────────── */
interface Slide { id: string; media: string; mediaType: string; }
interface StoryUser {
  userId: string;
  name: string;
  avatar: string;
  slides: Slide[];
  seen: boolean;
}

/* ─── Fake story data ────────────────────────────────────────────────── */
const FAKE_STORIES: StoryUser[] = [
  {
    userId: "u1", name: "Алексей", seen: false,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alexey",
    slides: [
      { id: "s1a", media: "https://images.unsplash.com/photo-1520106212299-d99c443e4568?w=600&q=80", mediaType: "image" },
      { id: "s1b", media: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&q=80", mediaType: "image" },
    ],
  },
  {
    userId: "u2", name: "Мария", seen: false,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=maria",
    slides: [
      { id: "s2a", media: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80", mediaType: "image" },
    ],
  },
  {
    userId: "u3", name: "Денис", seen: true,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=denis",
    slides: [
      { id: "s3a", media: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80", mediaType: "image" },
      { id: "s3b", media: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&q=80", mediaType: "image" },
      { id: "s3c", media: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80", mediaType: "image" },
    ],
  },
  {
    userId: "u4", name: "Ирина", seen: false,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=irina",
    slides: [
      { id: "s4a", media: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80", mediaType: "image" },
    ],
  },
  {
    userId: "u5", name: "Катя", seen: true,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=katya",
    slides: [
      { id: "s5a", media: "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=600&q=80", mediaType: "image" },
      { id: "s5b", media: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80", mediaType: "image" },
    ],
  },
  {
    userId: "u6", name: "Вадим", seen: false,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=vadim",
    slides: [
      { id: "s6a", media: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&q=80", mediaType: "image" },
    ],
  },
];

/* ─── Progress bar ───────────────────────────────────────────────────── */
function ProgressBar({ active, done, paused, duration = 5000 }: {
  active: boolean; done: boolean; paused: boolean; duration?: number;
}) {
  return (
    <div className="h-[3px] flex-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.3)" }}>
      <div
        className="h-full rounded-full"
        style={{
          background: "rgba(255,255,255,0.95)",
          width: done ? "100%" : "0%",
          transition: active && !paused ? `width ${duration}ms linear` : "none",
          ...(active && !paused ? { width: "100%" } : {}),
        }}
      />
    </div>
  );
}

/* ─── Preview card for adjacent user peek ────────────────────────────── */
function PeekCard({ story }: { story: StoryUser }) {
  const slide = story.slides[0];
  return (
    <div className="absolute inset-0" style={{ borderRadius: 28, overflow: "hidden" }}>
      {slide.mediaType === "video" ? (
        <video src={slide.media} className="absolute inset-0 w-full h-full object-cover" muted playsInline />
      ) : (
        <img src={slide.media} alt="" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
      )}
      <div className="absolute inset-x-0 top-0 h-24"
        style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 100%)" }} />
      <div className="absolute top-3 left-3 flex items-center gap-2">
        <div className="w-7 h-7 rounded-full overflow-hidden" style={{ boxShadow: "0 0 0 2px rgba(255,255,255,0.8)" }}>
          <img src={story.avatar} alt="" className="w-full h-full object-cover" />
        </div>
        <p className="text-white text-[11px] font-bold">{story.name}</p>
      </div>
    </div>
  );
}

/* ─── Full-screen Story viewer ───────────────────────────────────────── */
function StoryViewer({
  stories, startIndex, onClose,
}: {
  stories: StoryUser[];
  startIndex: number;
  onClose: () => void;
}) {
  const [userIdx, setUserIdx] = useState(startIndex);
  const [slideIdx, setSlideIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [draggingH, setDraggingH] = useState(false);

  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const dirRef = useRef<"h" | "v" | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressStartRef = useRef(0);
  const elapsedRef = useRef(0);
  const DURATION = 5000;

  const current = stories[userIdx];
  const totalSlides = current?.slides.length ?? 0;

  /* ── go to next/prev cleanly (no nested state setters) ── */
  const goNext = useCallback(() => {
    elapsedRef.current = 0;
    if (timerRef.current) clearTimeout(timerRef.current);
    setSlideIdx(s => {
      if (s < totalSlides - 1) return s + 1;
      return s; // handled separately
    });
    // If on last slide → move to next user or close
    setUserIdx(u => {
      const currentSlideIdx = slideIdx;
      const currentTotalSlides = stories[u]?.slides.length ?? 1;
      if (currentSlideIdx >= currentTotalSlides - 1) {
        if (u < stories.length - 1) {
          setSlideIdx(0);
          return u + 1;
        }
        // close — use timeout to avoid calling onClose inside state setter
        setTimeout(onClose, 0);
      }
      return u;
    });
  }, [totalSlides, slideIdx, stories, onClose]);

  const goPrev = useCallback(() => {
    elapsedRef.current = 0;
    if (timerRef.current) clearTimeout(timerRef.current);
    if (slideIdx > 0) {
      setSlideIdx(s => s - 1);
    } else if (userIdx > 0) {
      setUserIdx(u => u - 1);
      setSlideIdx(0);
    }
  }, [slideIdx, userIdx]);

  /* ── Timer ── */
  const stopTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    elapsedRef.current += Date.now() - progressStartRef.current;
  }, []);

  useEffect(() => {
    if (paused || draggingH || dragY > 0) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    progressStartRef.current = Date.now();
    elapsedRef.current = 0;
    const remaining = DURATION;
    timerRef.current = setTimeout(goNext, remaining);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [userIdx, slideIdx, paused, draggingH, dragY]);

  /* ── Touch handlers ── */
  const onTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    startYRef.current = e.touches[0].clientY;
    dirRef.current = null;
    longPressRef.current = setTimeout(() => {
      setPaused(true);
      stopTimer();
    }, 180);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - startXRef.current;
    const dy = e.touches[0].clientY - startYRef.current;
    if (!dirRef.current) {
      if (Math.abs(dx) > Math.abs(dy) + 6) {
        dirRef.current = "h";
        clearTimeout(longPressRef.current!);
        stopTimer();
        setDraggingH(true);
      } else if (Math.abs(dy) > Math.abs(dx) + 6) {
        dirRef.current = "v";
        clearTimeout(longPressRef.current!);
        stopTimer();
      }
    }
    if (dirRef.current === "h") setDragX(dx);
    else if (dirRef.current === "v" && dy > 0) setDragY(dy);
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    clearTimeout(longPressRef.current!);
    const screenW = window.innerWidth;
    const dir = dirRef.current;
    dirRef.current = null;

    if (dir === "h") {
      setDraggingH(false);
      const threshold = screenW * 0.28;
      const snap = dragX;
      setDragX(0);
      elapsedRef.current = 0;
      if (snap < -threshold && userIdx < stories.length - 1) {
        setUserIdx(u => u + 1);
        setSlideIdx(0);
      } else if (snap > threshold && userIdx > 0) {
        setUserIdx(u => u - 1);
        setSlideIdx(0);
      }
    } else if (dir === "v") {
      if (dragY > 120) {
        onClose();
      } else {
        setDragY(0);
        setPaused(false);
      }
    } else {
      // tap
      setPaused(false);
      const touch = e.changedTouches[0];
      if (touch.clientX < screenW * 0.35) goPrev();
      else goNext();
    }
  };

  const slide = current?.slides[slideIdx];
  const vOpacity = Math.max(0, 1 - dragY / 280);
  const vScale = Math.max(0.88, 1 - dragY / 1100);
  const hFrac = dragX / Math.max(window.innerWidth, 1);
  const hScale = draggingH ? Math.max(0.85, 1 - Math.abs(hFrac) * 0.15) : 1;
  const hRotate = draggingH ? hFrac * -4 : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{ background: "#000", opacity: vOpacity }}
    >
      {/* Previous user peek */}
      {userIdx > 0 && draggingH && dragX > 0 && (
        <div
          className="absolute inset-0 max-w-md mx-auto pointer-events-none"
          style={{
            transform: `translateX(${-100 + hFrac * 100}%) scale(0.9)`,
            opacity: Math.min(1, dragX / (window.innerWidth * 0.4)),
          }}
        >
          <PeekCard story={stories[userIdx - 1]} />
        </div>
      )}

      {/* Next user peek */}
      {userIdx < stories.length - 1 && draggingH && dragX < 0 && (
        <div
          className="absolute inset-0 max-w-md mx-auto pointer-events-none"
          style={{
            transform: `translateX(${100 + hFrac * 100}%) scale(0.9)`,
            opacity: Math.min(1, -dragX / (window.innerWidth * 0.4)),
          }}
        >
          <PeekCard story={stories[userIdx + 1]} />
        </div>
      )}

      {/* Current card */}
      <div
        className="relative w-full h-full max-w-md mx-auto select-none"
        style={{
          transform: `translateY(${dragY}px) translateX(${dragX}px) scale(${vScale * hScale}) rotate(${hRotate}deg)`,
          transition: draggingH || dragY > 0 ? "none" : "transform 0.42s cubic-bezier(0.34,1.56,0.64,1)",
          borderRadius: dragY > 15 || draggingH ? 28 : 0,
          overflow: "hidden",
          boxShadow: draggingH
            ? "0 24px 40px -12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.12), 0 0 0 2px rgba(255,255,255,0.12)"
            : "none",
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Gloss */}
        <div
          className="absolute inset-x-0 top-0 pointer-events-none z-10"
          style={{
            height: "35%",
            background: "linear-gradient(180deg, rgba(255,255,255,0.07) 0%, transparent 100%)",
          }}
        />

        {/* Media */}
        {slide && (
          slide.mediaType === "video" ? (
            <video key={slide.id} src={slide.media}
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay muted playsInline loop={false} />
          ) : (
            <img key={slide.id} src={slide.media} alt=""
              className="absolute inset-0 w-full h-full object-cover"
              draggable={false} />
          )
        )}

        {/* Top gradient */}
        <div className="absolute inset-x-0 top-0 h-40 pointer-events-none z-10"
          style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.65) 0%, transparent 100%)" }} />

        {/* Progress bars */}
        <div
          className="absolute top-0 left-0 right-0 flex gap-1 px-3 z-20 pointer-events-none"
          style={{ paddingTop: "calc(var(--tg-safe-top, env(safe-area-inset-top, 0px)) + 10px)" }}
        >
          {current?.slides.map((_, i) => (
            <ProgressBar key={i} done={i < slideIdx} active={i === slideIdx} paused={paused} duration={DURATION} />
          ))}
        </div>

        {/* Author row */}
        <div
          className="absolute left-0 right-0 flex items-center justify-between px-3 z-20"
          style={{ top: "calc(var(--tg-safe-top, env(safe-area-inset-top, 0px)) + 26px)" }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full overflow-hidden"
              style={{ boxShadow: "0 0 0 2px rgba(255,255,255,0.85)" }}>
              <img src={current?.avatar} alt="" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-white text-[13px] font-bold leading-tight"
                style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>{current?.name}</p>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }}>@{current?.userId}</p>
            </div>
          </div>
          <button
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", WebkitTapHighlightColor: "transparent" }}
            onClick={e => { e.stopPropagation(); onClose(); }}
          >
            <X size={16} className="text-white" />
          </button>
        </div>

        {/* Swipe-down hint */}
        {dragY > 50 && (
          <div className="absolute inset-0 flex items-end justify-center pb-20 pointer-events-none z-30">
            <div className="px-5 py-2 rounded-full"
              style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)" }}>
              <p className="text-white text-sm font-semibold">Отпустите, чтобы закрыть</p>
            </div>
          </div>
        )}

        {/* Bottom gradient */}
        <div className="absolute inset-x-0 bottom-0 h-28 pointer-events-none z-10"
          style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.5) 0%, transparent 100%)" }} />
      </div>
    </div>
  );
}

/* ─── Story bubble ───────────────────────────────────────────────────── */
function StoryBubble({ user, onClick }: { user: StoryUser; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 flex-shrink-0"
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      <div className={`relative w-[68px] h-[68px] rounded-full p-[2.5px] ${user.seen ? "bg-foreground/20" : "bg-gradient-to-br from-primary via-accent to-pink-500"}`}>
        <div className="w-full h-full rounded-full overflow-hidden border-2 border-background">
          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
        </div>
        {user.slides.length > 1 && (
          <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-primary border-2 border-background flex items-center justify-center">
            <span className="text-white text-[9px] font-bold">{user.slides.length}</span>
          </div>
        )}
      </div>
      <span className="text-[11px] font-medium text-center w-16 truncate">{user.name}</span>
    </button>
  );
}

/* ─── Main Stories component ─────────────────────────────────────────── */
export default function Stories({ onStoryClick }: { onStoryClick?: (id: string) => void }) {
  const navigate = useNavigate();
  const [storyUsers, setStoryUsers] = useState<StoryUser[]>(FAKE_STORIES);
  const [viewingIdx, setViewingIdx] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/stories")
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data?.stories?.length) return;
        const grouped: Record<string, StoryUser> = {};
        data.stories.forEach((s: any) => {
          if (new Date(s.expiresAt).getTime() < Date.now()) return;
          if (!grouped[s.userId]) {
            grouped[s.userId] = {
              userId: s.userId, name: `@${s.userId}`,
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.userId}`,
              slides: [], seen: false,
            };
          }
          grouped[s.userId].slides.push({ id: s.id, media: s.media, mediaType: s.mediaType });
        });
        const users = Object.values(grouped);
        if (users.length > 0) setStoryUsers([...users, ...FAKE_STORIES]);
      })
      .catch(() => {});
  }, []);

  const openStory = (idx: number) => {
    setViewingIdx(idx);
    onStoryClick?.(storyUsers[idx]?.userId);
  };

  return (
    <>
      <div className="w-full mb-4 overflow-hidden">
        <div className="flex gap-3 px-4 py-2 overflow-x-auto"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          <button
            onClick={() => navigate("/create")}
            className="flex flex-col items-center gap-1.5 flex-shrink-0"
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            <div className="w-[68px] h-[68px] rounded-full border-2 border-dashed border-primary/50 flex items-center justify-center bg-primary/[0.06] active:scale-90 transition-transform">
              <Plus size={24} className="text-primary" />
            </div>
            <span className="text-[11px] font-medium text-center w-16 truncate text-muted-foreground">История</span>
          </button>

          {storyUsers.map((user, idx) => (
            <StoryBubble key={user.userId} user={user} onClick={() => openStory(idx)} />
          ))}
        </div>
      </div>

      {viewingIdx !== null && (
        <StoryViewer
          stories={storyUsers}
          startIndex={viewingIdx}
          onClose={() => {
            setStoryUsers(prev => prev.map((u, i) => i === viewingIdx ? { ...u, seen: true } : u));
            setViewingIdx(null);
          }}
        />
      )}
    </>
  );
}
