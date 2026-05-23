import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  ChevronLeft,
  Image as ImageIcon,
  Globe,
  Users,
  Send,
  Zap,
  Clock,
  Video,
  Target,
  Trash2,
} from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";
import { usePremium } from "@/hooks/usePremium";
import { cn } from "@/lib/utils";

type Stage = "select" | "share";

interface MediaFile {
  file: File;
  url: string;
  type: "image" | "video";
}

const MAX_VIDEO_DURATION_FREE = 60;
const MAX_VIDEO_DURATION_PREMIUM = 5 * 60;

export default function CreateInstagram() {
  const { user } = useTelegram();
  const { premium } = usePremium();
  const navigate = useNavigate();
  const [stage, setStage] = useState<Stage>("select");
  const [mediaList, setMediaList] = useState<MediaFile[]>([]);
  const [caption, setCaption] = useState("");
  const [isStory, setIsStory] = useState(false);
  const [visibility, setVisibility] = useState<"public" | "followers">("public");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const maxDuration = premium.isPremium ? MAX_VIDEO_DURATION_PREMIUM : MAX_VIDEO_DURATION_FREE;
  const current = mediaList[0];

  const handleFiles = useCallback(
    (files: FileList) => {
      const items: MediaFile[] = [];
      Array.from(files).forEach((file) => {
        if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) return;
        const url = URL.createObjectURL(file);
        const type = file.type.startsWith("image/") ? "image" : "video";

        if (type === "video") {
          const v = document.createElement("video");
          v.preload = "metadata";
          v.onloadedmetadata = () => {
            if (v.duration > maxDuration) {
              const maxMin = Math.floor(maxDuration / 60);
              alert(`Видео слишком длинное. Максимум: ${maxMin} мин.`);
              URL.revokeObjectURL(url);
              return;
            }
            items.push({ file, url, type });
            if (items.length) {
              setMediaList(items);
              setStage("share");
            }
          };
          v.src = url;
        } else {
          items.push({ file, url, type });
        }
      });
      if (items.length && items[0].type === "image") {
        setMediaList(items);
        setStage("share");
      }
    },
    [maxDuration],
  );

  const removeMedia = () => {
    mediaList.forEach((m) => URL.revokeObjectURL(m.url));
    setMediaList([]);
    setStage("select");
    setCaption("");
  };

  const publish = async () => {
    if (!user?.id || !current) return;
    setUploading(true);
    try {
      let mediaData: string;
      if (current.type === "image") {
        // Read image as data URL directly (no filters applied)
        const resp = await fetch(current.url);
        const blob = await resp.blob();
        mediaData = await new Promise((res, rej) => {
          const r = new FileReader();
          r.onload = () => res(r.result as string);
          r.onerror = rej;
          r.readAsDataURL(blob);
        });
      } else {
        const resp = await fetch(current.url);
        const blob = await resp.blob();
        mediaData = await new Promise((res, rej) => {
          const r = new FileReader();
          r.onload = () => res(r.result as string);
          r.onerror = rej;
          r.readAsDataURL(blob);
        });
      }
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: String(user.id),
          caption: caption.trim(),
          visibility,
          media: mediaData,
          mediaType: current.type,
          type: isStory ? "story" : "post",
        }),
      });
      if (response.ok) {
        alert(isStory ? "✅ История опубликована!" : "✅ Пост опубликован!");
        removeMedia();
      } else {
        alert("❌ Ошибка публикации");
      }
    } catch {
      alert("❌ Ошибка сети");
    } finally {
      setUploading(false);
    }
  };

  /* ─── Stage: Select ─── */
  if (stage === "select") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <header
          className="glass-morphism border-b border-border/50 px-4 py-3 flex items-center justify-between"
          style={{ paddingTop: "env(safe-area-inset-top)" }}
        >
          <button type="button" onClick={() => window.history.back()} className="p-2 -ml-2 rounded-xl hover:bg-glass-light/30 transition-colors">
            <X size={22} />
          </button>
          <h1 className="font-bold text-base">Новая публикация</h1>
          <div className="w-10" />
        </header>

        <div
          className="flex-1 flex flex-col items-center justify-center p-6"
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
          }}
        >
          <div className={cn(
            "w-full max-w-sm rounded-3xl border-2 border-dashed p-10 flex flex-col items-center gap-5 transition-all duration-300",
            dragOver
              ? "border-primary bg-primary/5 scale-[1.02]"
              : "border-border/60 hover:border-primary/40 hover:bg-primary/[0.02]"
          )}>
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5 flex items-center justify-center shadow-lg">
              <ImageIcon size={36} className="text-primary" />
            </div>
            <div className="text-center">
              <h2 className="text-lg font-bold mb-1">Создать публикацию</h2>
              <p className="text-sm text-muted-foreground mb-1">
                Выберите фото или видео
              </p>
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <Video size={12} />
                Видео до {maxDuration >= 60 ? `${Math.floor(maxDuration / 60)} мин` : `${maxDuration} сек`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-semibold text-sm shadow-lg shadow-primary/25 active:scale-[0.98] transition-transform"
            >
              Выбрать из галереи
            </button>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />

          {/* Divider */}
          <div className="flex items-center gap-3 w-full max-w-sm mt-2">
            <div className="flex-1 h-px bg-border/40" />
            <span className="text-xs text-muted-foreground font-medium">или</span>
            <div className="flex-1 h-px bg-border/40" />
          </div>

          {/* Goal creation */}
          <button
            type="button"
            onClick={() => navigate("/goals")}
            className="w-full max-w-sm flex items-center gap-4 p-4 rounded-2xl border border-orange-400/30 bg-orange-400/5 hover:bg-orange-400/10 transition-all active:scale-[0.98]"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400/30 to-amber-400/20 flex items-center justify-center flex-shrink-0">
              <Target size={24} className="text-orange-400" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-orange-400">Создать цель 🎯</p>
              <p className="text-xs text-muted-foreground">Появится в ленте на 10 минут</p>
            </div>
          </button>
        </div>
      </div>
    );
  }

  /* ─── Stage: Share (Preview + Caption + Settings) ─── */
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header
        className="glass-morphism border-b border-border/50 px-4 py-3 flex items-center justify-between z-20"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <button
          type="button"
          onClick={() => setStage("select")}
          className="p-2 -ml-2 rounded-xl hover:bg-glass-light/30 transition-colors flex items-center gap-1"
        >
          <ChevronLeft size={20} />
          <span className="text-sm font-medium">Назад</span>
        </button>
        <span className="font-bold text-base">Публикация</span>
        <button
          type="button"
          onClick={publish}
          disabled={uploading || !current}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-accent text-white text-sm font-bold disabled:opacity-50 active:scale-[0.97] transition-all shadow-md shadow-primary/20"
        >
          {uploading ? (
            <span className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Публикуем…
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <Send size={14} />
              Готово
            </span>
          )}
        </button>
      </header>

      <div className="flex-1 overflow-y-auto pb-28">
        <div className="max-w-lg mx-auto px-4 py-5 space-y-5">
          {/* Media Preview */}
          {current && (
            <div className="relative rounded-2xl overflow-hidden shadow-lg">
              {current.type === "image" ? (
                <img
                  src={current.url}
                  alt=""
                  className="w-full max-h-[50vh] object-contain bg-black/5 dark:bg-white/5"
                />
              ) : (
                <div className="relative bg-black rounded-2xl">
                  <video
                    src={current.url}
                    className="w-full max-h-[50vh] object-contain"
                    controls
                    playsInline
                  />
                </div>
              )}
              {/* Remove media button */}
              <button
                type="button"
                onClick={removeMedia}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/70 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}

          {/* Type Selector */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setIsStory(false)}
              className={cn(
                "py-3.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-all border",
                !isStory
                  ? "border-primary bg-primary/10 text-primary shadow-sm shadow-primary/10"
                  : "border-border/60 text-muted-foreground hover:border-border"
              )}
            >
              <ImageIcon size={16} />
              Пост
            </button>
            <button
              type="button"
              onClick={() => setIsStory(true)}
              className={cn(
                "py-3.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-all border",
                isStory
                  ? "border-accent bg-accent/10 text-accent shadow-sm shadow-accent/10"
                  : "border-border/60 text-muted-foreground hover:border-border"
              )}
            >
              <Zap size={16} />
              История
            </button>
          </div>

          {/* Caption */}
          <div className="glass-surface-v2 p-4 rounded-2xl">
            <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
              {isStory ? "Подпись к истории" : "Описание"}
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder={isStory ? "Добавьте текст к вашей истории…" : "Напишите описание… #хештеги @упоминания"}
              className="w-full bg-transparent text-sm min-h-[80px] outline-none resize-none placeholder:text-muted-foreground/50 leading-relaxed"
              maxLength={2200}
            />
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/30">
              <span className="text-[10px] text-muted-foreground">
                {caption.length} / 2200
              </span>
              {caption.match(/#[\w\u0400-\u04FF]+/g) && (
                <div className="flex gap-1 flex-wrap justify-end">
                  {caption.match(/#[\w\u0400-\u04FF]+/g)?.slice(0, 5).map((tag, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Visibility */}
          <div className="glass-surface-v2 p-4 rounded-2xl">
            <label className="block text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
              Видимость
            </label>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setVisibility("public")}
                className={cn(
                  "w-full p-3.5 rounded-xl flex items-center gap-3 border transition-all text-left",
                  visibility === "public"
                    ? "border-primary/40 bg-primary/5"
                    : "border-transparent hover:bg-glass-light/30"
                )}
              >
                <div className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center",
                  visibility === "public" ? "bg-primary/15" : "bg-muted/30"
                )}>
                  <Globe size={18} className={visibility === "public" ? "text-primary" : "text-muted-foreground"} />
                </div>
                <div>
                  <p className="text-sm font-semibold">Все пользователи</p>
                  <p className="text-[11px] text-muted-foreground">Видно всем в ленте</p>
                </div>
                {visibility === "public" && (
                  <div className="ml-auto w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                )}
              </button>
              <button
                type="button"
                onClick={() => setVisibility("followers")}
                className={cn(
                  "w-full p-3.5 rounded-xl flex items-center gap-3 border transition-all text-left",
                  visibility === "followers"
                    ? "border-accent/40 bg-accent/5"
                    : "border-transparent hover:bg-glass-light/30"
                )}
              >
                <div className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center",
                  visibility === "followers" ? "bg-accent/15" : "bg-muted/30"
                )}>
                  <Users size={18} className={visibility === "followers" ? "text-accent" : "text-muted-foreground"} />
                </div>
                <div>
                  <p className="text-sm font-semibold">Только подписчики</p>
                  <p className="text-[11px] text-muted-foreground">Видно подписчикам</p>
                </div>
                {visibility === "followers" && (
                  <div className="ml-auto w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Story hint */}
          {isStory && (
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-accent/5 border border-accent/15">
              <Clock size={16} className="text-accent flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                История будет видна <span className="text-accent font-semibold">24 часа</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
