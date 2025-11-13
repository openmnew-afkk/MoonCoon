import { useState, useRef, useEffect } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Story {
  id: string;
  userId: string;
  media: string;
  mediaType: string;
  createdAt: string;
  expiresAt: string;
  views: string[];
}

interface StoriesProps {
  onStoryClick?: (storyId: string) => void;
}

export default function Stories({ onStoryClick }: StoriesProps) {
  const [selectedStory, setSelectedStory] = useState<string | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const navigate = useNavigate();

  // Загружаем сторис с сервера
  useEffect(() => {
    fetch("/api/stories")
      .then((res) => res.json())
      .then((data) => {
        if (data.stories && Array.isArray(data.stories)) {
          // Фильтруем не истекшие сторис
          const activeStories = data.stories.filter(
            (s: Story) => new Date(s.expiresAt).getTime() > Date.now(),
          );
          setStories(activeStories);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const checkScroll = () => {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft <
          container.scrollWidth - container.clientWidth - 10,
      );
    };

    checkScroll();
    container.addEventListener("scroll", checkScroll, { passive: true });

    // Auto-scroll slowly
    let scrollInterval: NodeJS.Timeout;
    const startAutoScroll = () => {
      scrollInterval = setInterval(() => {
        if (
          container.scrollLeft <
          container.scrollWidth - container.clientWidth
        ) {
          container.scrollLeft += 1;
        }
      }, 50);
    };

    startAutoScroll();

    return () => {
      container.removeEventListener("scroll", checkScroll);
      clearInterval(scrollInterval);
    };
  }, []);

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const scrollAmount = 300;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (selectedStory) {
    const story = stories.find((s) => s.id === selectedStory);
    if (!story) return null;

    return (
      <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
        <div className="relative w-full max-w-sm h-full max-h-[600px] rounded-3xl overflow-hidden bg-black">
          {story.mediaType === "video" ? (
            <video
              src={story.media}
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
            />
          ) : (
            <img
              src={story.media}
              alt="Story"
              className="w-full h-full object-cover"
            />
          )}

          {/* Story Header */}
          <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${story.userId}`}
                  alt="User"
                  className="w-10 h-10 rounded-full border-2 border-white"
                />
                <span className="text-white font-semibold">
                  @user{story.userId}
                </span>
              </div>
              <button
                onClick={() => setSelectedStory(null)}
                className="text-white text-2xl hover:opacity-80 transition-opacity"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="absolute top-16 left-0 right-0 p-2">
            <div className="h-1 bg-white/30 rounded-full overflow-hidden">
              <div className="h-full bg-white w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mb-6 overflow-hidden">
      <div className="relative group">
        {/* Stories Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-3 px-4 py-3 overflow-x-auto scroll-smooth max-w-full"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <style>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          {/* Add Story Button */}
          <button
            onClick={() => navigate("/create")}
            className="flex flex-col items-center gap-2 flex-shrink-0 group/story hover:opacity-80 transition-opacity"
          >
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary/40 via-accent/40 to-primary/40 flex items-center justify-center glass-morphism hover:shadow-lg hover:shadow-primary/40 transition-all duration-300">
              <Plus className="text-primary" size={28} />
              <div className="absolute inset-0 rounded-full border-2 border-primary/30 group-hover/story:border-primary/60 transition-all duration-300"></div>
            </div>
            <span className="text-xs font-medium text-center w-20 truncate">
              Ваша история
            </span>
          </button>

          {/* Stories */}
          {stories.map((story) => (
            <button
              key={story.id}
              onClick={() => {
                setSelectedStory(story.id);
                onStoryClick?.(story.id);
              }}
              className="flex flex-col items-center gap-2 flex-shrink-0 group/story hover:opacity-80 transition-opacity"
            >
              <div className="relative w-20 h-20 rounded-full p-[3px] bg-gradient-to-br from-primary via-accent to-primary hover:shadow-lg hover:shadow-primary/40 transition-all duration-300">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${story.userId}`}
                  alt="User"
                  className="w-full h-full rounded-full object-cover border-[3px] border-background"
                />
              </div>
              <span className="text-xs font-medium text-center w-20 truncate">
                @user{story.userId}
              </span>
            </button>
          ))}
        </div>

        {/* Scroll Indicators */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 glass-button rounded-full p-2 bg-black/60 hover:bg-black/80 text-white transition-all duration-200 opacity-0 group-hover:opacity-100"
          >
            ←
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 glass-button rounded-full p-2 bg-black/60 hover:bg-black/80 text-white transition-all duration-200 opacity-0 group-hover:opacity-100"
          >
            →
          </button>
        )}
      </div>
    </div>
  );
}
