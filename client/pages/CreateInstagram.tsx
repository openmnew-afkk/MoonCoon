import { useState, useRef } from "react";
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
  Trash2,
} from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";
import { usePremium } from "@/hooks/usePremium";

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

  const handleFiles = (files: FileList) => {
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
  };

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
      const resp = await fetch(current.url);
      const blob = await resp.blob();
      mediaData = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result as string);
        r.onerror = rej;
        r.readAsDataURL(blob);
      });
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
          authorName: [user.first_name, user.last_name].filter(Boolean).join(" ") || "Пользователь",
          authorUsername: user.username ? `@${user.username}` : `@user${user.id}`,
          authorAvatar: user.photo_url || `https://api.dicebear.com/9.x/thumbs/svg?seed=${user.id}`,
        }),
      });
      if (response.ok) {
        navigate("/");
      } else {
        alert("Не удалось опубликовать. Попробуйте ещё раз.");
      }
    } catch {
      alert("Ошибка сети");
    } finally {
      setUploading(false);
    }
  };

  if (stage === "select") {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: "#08080c" }}>
        <header
          className="glass px-4 py-3 flex items-center justify-between"
          style={{ paddingTop: "env(safe-area-inset-top)" }}
        >
          <button type="button" onClick={() => window.history.back()} className="btn-icon-luxe">
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
          <div className={dragOver
            ? "w-full max-w-sm rounded-3xl border-2 border-dashed border-[#E8B4F8] p-10 flex flex-col items-center gap-5 transition-all duration-300 scale-[1.02]"
            : "w-full max-w-sm rounded-3xl border-2 border-dashed p-10 flex flex-col items-center gap-5 transition-all duration-300"
          }
            style={{
              background: dragOver ? "hsl(var(--card) / 0.9)" : "hsl(var(--card))",
              borderColor: dragOver ? "#E8B4F8" : "hsl(240 12% 20% / 0.4)",
              boxShadow: dragOver ? "0 0 40px rgba(232,180,248,0.1)" : "0 4px 24px rgba(0,0,0,0.15)",
            }}
          >
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, rgba(232,180,248,0.15), rgba(129,140,248,0.08))", border: "1px solid rgba(232,180,248,0.15)" }}>
              <ImageIcon size={36} style={{ color: "#E8B4F8" }} />
            </div>
            <div className="text-center">
              <h2 className="text-lg font-bold mb-1" style={{ color: "#fff" }}>Создать публикацию</h2>
              <p className="text-sm mb-1" style={{ color: "hsl(var(--muted-foreground))" }}>
                Выберите фото или видео
              </p>
              <p className="text-xs flex items-center justify-center gap-1" style={{ color: "hsl(var(--muted-foreground))" }}>
                <Video size={12} />
                Видео до {maxDuration >= 60 ? `${Math.floor(maxDuration / 60)} мин` : `${maxDuration} сек`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="btn-luxe w-full"
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

          <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl mt-6"
            style={{ background: "hsl(var(--card))", border: "1px solid hsl(240 12% 20% / 0.3)" }}>
            <span className="text-lg">💡</span>
            <p className="text-xs leading-relaxed" style={{ color: "hsl(var(--muted-foreground))" }}>
              Совет: добавь хэштеги к посту для большего охвата
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#08080c" }}>
      <header
        className="glass px-4 py-3 flex items-center justify-between z-20"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <button
          type="button"
          onClick={() => setStage("select")}
          className="flex items-center gap-1 press-scale"
          style={{ background: "none", border: "none", cursor: "pointer", color: "#fff" }}
        >
          <ChevronLeft size={20} />
          <span className="text-sm font-medium">Назад</span>
        </button>
        <span className="font-bold text-base">Публикация</span>
        <button
          type="button"
          onClick={publish}
          disabled={uploading || !current}
          className="btn-luxe text-sm px-4 py-2 disabled:opacity-50"
        >
          {uploading ? (
            <span className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
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
          {current && (
            <div className="card-luxe overflow-hidden" style={{ padding: 0 }}>
              {current.type === "image" ? (
                <img
                  src={current.url}
                  alt=""
                  className="w-full max-h-[50vh] object-contain"
                  style={{ background: "#12121a" }}
                />
              ) : (
                <div style={{ background: "#12121a", borderRadius: 16 }}>
                  <video
                    src={current.url}
                    className="w-full max-h-[50vh] object-contain"
                    controls
                    playsInline
                  />
                </div>
              )}
              <button
                type="button"
                onClick={removeMedia}
                className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center press-scale"
                style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", color: "#fff" }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setIsStory(false)}
              className="py-3.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-all border press-scale"
              style={{
                borderColor: !isStory ? "rgba(232,180,248,0.3)" : "hsl(240 12% 20% / 0.4)",
                background: !isStory ? "rgba(232,180,248,0.08)" : "hsl(var(--card))",
                color: !isStory ? "#E8B4F8" : "hsl(var(--muted-foreground))",
                boxShadow: !isStory ? "0 2px 12px rgba(232,180,248,0.1)" : "none",
              }}
            >
              <ImageIcon size={16} />
              Пост
            </button>
            <button
              type="button"
              onClick={() => setIsStory(true)}
              className="py-3.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-all border press-scale"
              style={{
                borderColor: isStory ? "rgba(129,140,248,0.3)" : "hsl(240 12% 20% / 0.4)",
                background: isStory ? "rgba(129,140,248,0.08)" : "hsl(var(--card))",
                color: isStory ? "#818CF8" : "hsl(var(--muted-foreground))",
                boxShadow: isStory ? "0 2px 12px rgba(129,140,248,0.1)" : "none",
              }}
            >
              <Zap size={16} />
              История
            </button>
          </div>

          <div className="card-luxe">
            <label className="block text-[11px] font-bold uppercase tracking-widest mb-2"
              style={{ color: "hsl(var(--muted-foreground))" }}>
              {isStory ? "Подпись к истории" : "Описание"}
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder={isStory ? "Добавьте текст к вашей истории…" : "Напишите описание… #хештеги @упоминания"}
              className="input-luxe w-full min-h-[80px] resize-none leading-relaxed"
              style={{ background: "transparent", border: "none", padding: 0 }}
              maxLength={2200}
            />
            <div className="flex items-center justify-between mt-2 pt-2" style={{ borderTop: "1px solid hsl(240 12% 20% / 0.3)" }}>
              <span className="text-[10px]" style={{ color: "hsl(var(--muted-foreground))" }}>
                {caption.length} / 2200
              </span>
              {caption.match(/#[\w\u0400-\u04FF]+/g) && (
                <div className="flex gap-1 flex-wrap justify-end">
                  {caption.match(/#[\w\u0400-\u04FF]+/g)?.slice(0, 5).map((tag, i) => (
                    <span key={i} className="badge-neon">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="card-luxe">
            <label className="block text-[11px] font-bold uppercase tracking-widest mb-3"
              style={{ color: "hsl(var(--muted-foreground))" }}>
              Видимость
            </label>
            <div className="space-y-2">
              {[
                { value: "public" as const, icon: Globe, title: "Все пользователи", desc: "Видно всем в ленте" },
                { value: "followers" as const, icon: Users, title: "Только подписчики", desc: "Видно подписчикам" },
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setVisibility(opt.value)}
                  className="w-full p-3.5 rounded-xl flex items-center gap-3 border transition-all text-left press-scale"
                  style={{
                    borderColor: visibility === opt.value ? "rgba(232,180,248,0.3)" : "transparent",
                    background: visibility === opt.value ? "rgba(232,180,248,0.04)" : "transparent",
                  }}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{
                      background: visibility === opt.value ? "rgba(232,180,248,0.12)" : "hsl(var(--secondary))",
                    }}>
                    <opt.icon size={18} style={{ color: visibility === opt.value ? "#E8B4F8" : "hsl(var(--muted-foreground))" }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{opt.title}</p>
                    <p className="text-[11px]" style={{ color: "hsl(var(--muted-foreground))" }}>{opt.desc}</p>
                  </div>
                  {visibility === opt.value && (
                    <div className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg, #E8B4F8, #818CF8)" }}>
                      <div className="w-2 h-2 rounded-full bg-black" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {isStory && (
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl"
              style={{ background: "rgba(129,140,248,0.05)", border: "1px solid rgba(129,140,248,0.12)" }}>
              <Clock size={16} style={{ color: "#818CF8", flexShrink: 0 }} />
              <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                История будет видна <span className="font-semibold" style={{ color: "#818CF8" }}>24 часа</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Video({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14v-4z" />
      <rect x="3" y="6" width="12" height="12" rx="2" ry="2" />
    </svg>
  );
}
