import { useState, useRef, useCallback } from "react";
import {
  ArrowLeft,
  ArrowRight,
  X,
  Image as ImageIcon,
  Video,
  Sparkles,
  Crop,
  RotateCw,
  Sun,
  Contrast,
  Palette,
  Music,
  Type,
  Heart,
  Users,
  Globe,
  Lock,
  Share2,
} from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";
import { usePremium } from "@/hooks/usePremium";
import { cn } from "@/lib/utils";

interface CreateStep {
  id: string;
  title: string;
  component: React.ReactNode;
}

type CreateStage = "select" | "edit" | "filters" | "caption" | "publish";

interface MediaFile {
  file: File;
  url: string;
  type: "image" | "video";
  duration?: number;
}

interface Filter {
  name: string;
  preview: string;
  filter: string;
}

const FILTERS: Filter[] = [
  { name: "Оригинал", preview: "📷", filter: "none" },
  { name: "Яркость", preview: "☀️", filter: "brightness(120%) saturate(110%)" },
  { name: "Контраст", preview: "⚫", filter: "contrast(120%) brightness(110%)" },
  { name: "Тёплый", preview: "🧡", filter: "sepia(30%) hue-rotate(20deg) saturate(120%)" },
  { name: "Холодный", preview: "💙", filter: "hue-rotate(180deg) saturate(110%)" },
  { name: "Чёрно-белый", preview: "⚪", filter: "grayscale(100%) contrast(110%)" },
  { name: "Винтаж", preview: "📼", filter: "sepia(50%) hue-rotate(320deg) saturate(120%)" },
  { name: "Драма", preview: "🎭", filter: "contrast(150%) brightness(90%) saturate(130%)" },
];

export default function CreateInstagram() {
  const { user } = useTelegram();
  const { premium } = usePremium();
  
  const [stage, setStage] = useState<CreateStage>("select");
  const [selectedMedia, setSelectedMedia] = useState<MediaFile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState("none");
  const [caption, setCaption] = useState("");
  const [isStory, setIsStory] = useState(false);
  const [visibility, setVisibility] = useState<"public" | "followers">("public");
  const [uploading, setUploading] = useState(false);
  
  // Editing states
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [rotation, setRotation] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMediaSelect = useCallback((files: FileList) => {
    const mediaFiles: MediaFile[] = [];
    
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        const url = URL.createObjectURL(file);
        const type = file.type.startsWith('image/') ? 'image' : 'video';
        
        // For videos, check duration
        if (type === 'video') {
          const video = document.createElement('video');
          video.preload = 'metadata';
          video.onloadedmetadata = () => {
            URL.revokeObjectURL(video.src);
            if (video.duration > 60 && !premium.isPremium) {
              alert('Видео длиной больше 60 секунд доступно только с Premium');
              return;
            }
            mediaFiles.push({ file, url, type, duration: video.duration });
          };
          video.src = url;
        } else {
          mediaFiles.push({ file, url, type });
        }
      }
    });
    
    setSelectedMedia(mediaFiles);
    if (mediaFiles.length > 0) {
      setStage("edit");
    }
  }, [premium.isPremium]);

  const handleFileSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handlePublish = async () => {
    if (!user?.id || selectedMedia.length === 0) {
      alert("Необходимо выбрать медиа и авторизоваться");
      return;
    }

    setUploading(true);

    try {
      const currentMedia = selectedMedia[currentIndex];
      
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const mediaData = e.target?.result as string;
        
        const response = await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id.toString(),
            caption: caption.trim(),
            visibility,
            media: mediaData,
            mediaType: currentMedia.type,
            type: isStory ? 'story' : 'post',
          }),
        });

        if (response.ok) {
          alert(isStory ? 'История опубликована!' : 'Пост опубликован!');
          // Reset form
          setSelectedMedia([]);
          setCurrentIndex(0);
          setCaption("");
          setStage("select");
        } else {
          alert('Ошибка при публикации');
        }
      };
      
      reader.readAsDataURL(currentMedia.file);
    } catch (error) {
      console.error('Error publishing:', error);
      alert('Ошибка при публикации');
    } finally {
      setUploading(false);
    }
  };

  const getCurrentFilter = () => {
    if (selectedFilter === "none") {
      return `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
    }
    return `${selectedFilter} brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
  };

  const renderSelectStage = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <div className="w-32 h-32 glass-card rounded-3xl flex items-center justify-center mb-6">
        <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center">
          <ImageIcon size={32} className="text-primary" />
        </div>
      </div>
      
      <h2 className="text-2xl font-bold mb-2">Создать публикацию</h2>
      <p className="text-muted-foreground text-center mb-8 max-w-sm">
        Выберите фото или видео для создания поста или истории
      </p>
      
      <div className="space-y-4 w-full max-w-xs">
        <button
          onClick={handleFileSelect}
          className="w-full glass-button bg-primary/20 text-primary hover:bg-primary/30 py-4 rounded-2xl font-semibold flex items-center justify-center gap-3"
        >
          <ImageIcon size={20} />
          Выбрать из галереи
        </button>
        
        {navigator.mediaDevices && (
          <button className="w-full glass-button py-4 rounded-2xl font-semibold flex items-center justify-center gap-3 opacity-50 cursor-not-allowed">
            <Video size={20} />
            Снять видео (скоро)
          </button>
        )}
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={(e) => e.target.files && handleMediaSelect(e.target.files)}
        className="hidden"
      />
    </div>
  );

  const renderEditStage = () => {
    if (selectedMedia.length === 0) return null;
    
    const currentMedia = selectedMedia[currentIndex];
    
    return (
      <div className="flex-1 flex flex-col">
        {/* Media Preview */}
        <div className="flex-1 bg-black/90 flex items-center justify-center relative">
          {currentMedia.type === 'image' ? (
            <img
              src={currentMedia.url}
              alt="Preview"
              className="max-w-full max-h-full object-contain"
              style={{
                filter: getCurrentFilter(),
                transform: `rotate(${rotation}deg)`,
              }}
            />
          ) : (
            <video
              src={currentMedia.url}
              className="max-w-full max-h-full object-contain"
              style={{
                filter: getCurrentFilter(),
                transform: `rotate(${rotation}deg)`,
              }}
              controls
            />
          )}
          
          {/* Multiple media navigation */}
          {selectedMedia.length > 1 && (
            <>
              <button
                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 text-white p-3 rounded-full disabled:opacity-50"
              >
                <ArrowLeft size={20} />
              </button>
              <button
                onClick={() => setCurrentIndex(Math.min(selectedMedia.length - 1, currentIndex + 1))}
                disabled={currentIndex === selectedMedia.length - 1}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 text-white p-3 rounded-full disabled:opacity-50"
              >
                <ArrowRight size={20} />
              </button>
              
              {/* Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {selectedMedia.map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-2 h-2 rounded-full",
                      i === currentIndex ? "bg-white" : "bg-white/50"
                    )}
                  />
                ))}
              </div>
            </>
          )}
        </div>
        
        {/* Editing Tools */}
        <div className="glass-card m-4 p-4 rounded-2xl">
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setRotation((prev) => (prev + 90) % 360)}
              className="flex-1 glass-button py-3 rounded-xl flex items-center justify-center gap-2"
            >
              <RotateCw size={18} />
              <span className="text-sm">Повернуть</span>
            </button>
            <button className="flex-1 glass-button py-3 rounded-xl flex items-center justify-center gap-2">
              <Crop size={18} />
              <span className="text-sm">Обрезать</span>
            </button>
          </div>
          
          {/* Adjustment Sliders */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sun size={16} className="text-primary" />
                  <span className="text-sm font-medium">Яркость</span>
                </div>
                <span className="text-xs text-primary">{brightness}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="150"
                value={brightness}
                onChange={(e) => setBrightness(parseInt(e.target.value))}
                className="w-full h-2 bg-glass-light/30 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Contrast size={16} className="text-primary" />
                  <span className="text-sm font-medium">Контраст</span>
                </div>
                <span className="text-xs text-primary">{contrast}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="150"
                value={contrast}
                onChange={(e) => setContrast(parseInt(e.target.value))}
                className="w-full h-2 bg-glass-light/30 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Palette size={16} className="text-primary" />
                  <span className="text-sm font-medium">Насыщенность</span>
                </div>
                <span className="text-xs text-primary">{saturation}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                value={saturation}
                onChange={(e) => setSaturation(parseInt(e.target.value))}
                className="w-full h-2 bg-glass-light/30 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderFiltersStage = () => {
    if (selectedMedia.length === 0) return null;
    
    const currentMedia = selectedMedia[currentIndex];
    
    return (
      <div className="flex-1 flex flex-col">
        {/* Media Preview */}
        <div className="flex-1 bg-black/90 flex items-center justify-center">
          {currentMedia.type === 'image' ? (
            <img
              src={currentMedia.url}
              alt="Preview"
              className="max-w-full max-h-full object-contain"
              style={{
                filter: getCurrentFilter(),
                transform: `rotate(${rotation}deg)`,
              }}
            />
          ) : (
            <video
              src={currentMedia.url}
              className="max-w-full max-h-full object-contain"
              style={{
                filter: getCurrentFilter(),
                transform: `rotate(${rotation}deg)`,
              }}
              muted
              loop
              autoPlay
            />
          )}
        </div>
        
        {/* Filters */}
        <div className="glass-card m-4 p-4 rounded-2xl">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Sparkles size={18} className="text-primary" />
            Фильтры
          </h3>
          
          <div className="flex gap-3 overflow-x-auto pb-2">
            {FILTERS.map((filter, i) => (
              <button
                key={i}
                onClick={() => setSelectedFilter(filter.filter)}
                className={cn(
                  "flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-xl transition-all",
                  selectedFilter === filter.filter
                    ? "bg-primary/20 border-2 border-primary"
                    : "glass-button hover:bg-glass-light/30"
                )}
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden">
                  {currentMedia.type === 'image' ? (
                    <img
                      src={currentMedia.url}
                      alt={filter.name}
                      className="w-full h-full object-cover"
                      style={{ filter: filter.filter }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-lg">
                      {filter.preview}
                    </div>
                  )}
                </div>
                <span className="text-xs font-medium">{filter.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderCaptionStage = () => (
    <div className="flex-1 flex flex-col p-4">
      {/* Preview */}
      <div className="glass-card p-4 rounded-2xl mb-4">
        <div className="flex items-center gap-3 mb-3">
          <img
            src={user?.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`}
            alt="Your avatar"
            className="w-10 h-10 rounded-full"
          />
          <div>
            <p className="font-semibold">{user?.first_name || "Вы"}</p>
            <p className="text-xs text-muted-foreground">{user?.username ? `@${user.username}` : `@user${user?.id}`}</p>
          </div>
        </div>
        
        {selectedMedia.length > 0 && (
          <div className="w-full h-40 rounded-xl overflow-hidden mb-3">
            {selectedMedia[currentIndex].type === 'image' ? (
              <img
                src={selectedMedia[currentIndex].url}
                alt="Preview"
                className="w-full h-full object-cover"
                style={{
                  filter: getCurrentFilter(),
                  transform: `rotate(${rotation}deg)`,
                }}
              />
            ) : (
              <video
                src={selectedMedia[currentIndex].url}
                className="w-full h-full object-cover"
                style={{
                  filter: getCurrentFilter(),
                  transform: `rotate(${rotation}deg)`,
                }}
                muted
              />
            )}
          </div>
        )}
      </div>
      
      {/* Caption Input */}
      <div className="glass-card p-4 rounded-2xl mb-4">
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Добавьте подпись..."
          className="w-full bg-transparent resize-none outline-none text-sm h-24"
          maxLength={2200}
        />
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-glass-light/20">
          <span className="text-xs text-muted-foreground">
            {caption.length}/2200 символов
          </span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Music size={14} />
            <Type size={14} />
            <Heart size={14} />
          </div>
        </div>
      </div>
      
      {/* Post Type */}
      <div className="glass-card p-4 rounded-2xl mb-4">
        <h3 className="font-semibold mb-3">Тип публикации</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setIsStory(false)}
            className={cn(
              "p-4 rounded-xl transition-all flex flex-col items-center gap-2",
              !isStory ? "bg-primary/20 border-2 border-primary" : "glass-button"
            )}
          >
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <ImageIcon size={16} className="text-primary" />
            </div>
            <span className="text-sm font-medium">Пост</span>
            <span className="text-xs text-muted-foreground">Постоянный</span>
          </button>
          
          <button
            onClick={() => setIsStory(true)}
            className={cn(
              "p-4 rounded-xl transition-all flex flex-col items-center gap-2",
              isStory ? "bg-primary/20 border-2 border-primary" : "glass-button"
            )}
          >
            <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
              <Sparkles size={16} className="text-accent" />
            </div>
            <span className="text-sm font-medium">История</span>
            <span className="text-xs text-muted-foreground">24 часа</span>
          </button>
        </div>
      </div>
      
      {/* Privacy Settings */}
      <div className="glass-card p-4 rounded-2xl">
        <h3 className="font-semibold mb-3">Кто может видеть</h3>
        <div className="space-y-3">
          <button
            onClick={() => setVisibility("public")}
            className={cn(
              "w-full p-3 rounded-xl flex items-center gap-3 transition-all",
              visibility === "public" ? "bg-primary/20 border border-primary" : "glass-button text-left"
            )}
          >
            <Globe size={18} className="text-primary" />
            <div>
              <div className="font-medium">Все пользователи</div>
              <div className="text-xs text-muted-foreground">Публично</div>
            </div>
          </button>
          
          <button
            onClick={() => setVisibility("followers")}
            className={cn(
              "w-full p-3 rounded-xl flex items-center gap-3 transition-all",
              visibility === "followers" ? "bg-primary/20 border border-primary" : "glass-button text-left"
            )}
          >
            <Users size={18} className="text-primary" />
            <div>
              <div className="font-medium">Только подписчики</div>
              <div className="text-xs text-muted-foreground">Ограниченный доступ</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div
        className="glass-morphism border-b border-glass-light/20"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => {
              if (stage === "select") {
                // Go back to main app
                window.history.back();
              } else if (stage === "edit") {
                setStage("select");
              } else if (stage === "filters") {
                setStage("edit");
              } else if (stage === "caption") {
                setStage("filters");
              }
            }}
            className="text-primary font-semibold"
          >
            {stage === "select" ? <X size={24} /> : <ArrowLeft size={24} />}
          </button>
          
          <h1 className="text-lg font-bold">
            {stage === "select" && "Новая публикация"}
            {stage === "edit" && "Редактировать"}
            {stage === "filters" && "Фильтры"}
            {stage === "caption" && "Новый пост"}
          </h1>
          
          <button
            onClick={() => {
              if (stage === "edit") {
                setStage("filters");
              } else if (stage === "filters") {
                setStage("caption");
              } else if (stage === "caption") {
                handlePublish();
              }
            }}
            disabled={stage === "select" || uploading}
            className={cn(
              "font-semibold disabled:opacity-50",
              stage === "caption" ? "text-primary" : "text-primary"
            )}
          >
            {stage === "edit" && "Далее"}
            {stage === "filters" && "Далее"}
            {stage === "caption" && (uploading ? "Публикуется..." : "Поделиться")}
          </button>
        </div>
      </div>

      {/* Content */}
      {stage === "select" && renderSelectStage()}
      {stage === "edit" && renderEditStage()}
      {stage === "filters" && renderFiltersStage()}
      {stage === "caption" && renderCaptionStage()}
    </div>
  );
}