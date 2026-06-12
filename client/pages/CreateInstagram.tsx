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
      <div style={{ minHeight: "100dvh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
        <header
          className="ios-blur"
          style={{ padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "0.5px solid var(--separator)", paddingTop: "calc(env(safe-area-inset-top) + 12px)" }}
        >
          <button type="button" onClick={() => window.history.back()} className="ios-icon-btn">
            <X size={22} />
          </button>
          <h1 className="ios-body" style={{ fontWeight: 600, margin: 0 }}>Новая публикация</h1>
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
            ? "w-full max-w-sm rounded-3xl border-2 border-dashed p-10 flex flex-col items-center gap-5 transition-all duration-300 scale-[1.02]"
            : "w-full max-w-sm rounded-3xl border-2 border-dashed p-10 flex flex-col items-center gap-5 transition-all duration-300"
          }
            style={{
              background: dragOver ? "var(--bg-secondary)" : "var(--bg-secondary)",
              borderColor: dragOver ? "var(--blue)" : "var(--separator-opaque)",
            }}
          >
            <div className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: "var(--bg-tertiary)" }}>
              <ImageIcon size={36} style={{ color: "var(--text-secondary)" }} />
            </div>
            <div className="text-center">
              <h2 className="ios-title" style={{ marginBottom: 4 }}>Создать публикацию</h2>
              <p className="ios-caption" style={{ color: "var(--text-tertiary)", marginBottom: 4 }}>
                Выберите фото или видео
              </p>
              <p className="ios-caption" style={{ color: "var(--text-tertiary)" }}>
                Видео до {maxDuration >= 60 ? `${Math.floor(maxDuration / 60)} мин` : `${maxDuration} сек`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="ios-btn w-full"
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

          <div className="ios-card mx-4 mt-6" style={{ display: "flex", alignItems: "center", gap: 10, padding: 12 }}>
            <span className="text-lg">💡</span>
            <p className="ios-caption" style={{ color: "var(--text-tertiary)", margin: 0 }}>
              Совет: добавь хэштеги к посту для большего охвата
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100dvh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      <header
        className="ios-blur"
        style={{ padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 20, borderBottom: "0.5px solid var(--separator)", paddingTop: "calc(env(safe-area-inset-top) + 12px)" }}
      >
        <button
          type="button"
          onClick={() => setStage("select")}
          className="ios-btn-text"
          style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px" }}
        >
          <ChevronLeft size={20} />
          <span className="ios-body" style={{ fontWeight: 500 }}>Назад</span>
        </button>
        <span className="ios-body" style={{ fontWeight: 600, margin: 0 }}>Публикация</span>
        <button
          type="button"
          onClick={publish}
          disabled={uploading || !current}
          className="ios-btn"
          style={{ padding: "8px 16px", fontSize: 15 }}
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
          {current && (
            <div className="ios-card overflow-hidden" style={{ padding: 0, position: "relative" }}>
              {current.type === "image" ? (
                <img
                  src={current.url}
                  alt=""
                  className="w-full max-h-[50vh] object-contain"
                  style={{ background: "var(--bg-secondary)" }}
                />
              ) : (
                <div style={{ background: "var(--bg-secondary)", borderRadius: 16 }}>
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
                className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", color: "var(--text-primary)" }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setIsStory(false)}
              className="ios-btn-secondary py-3.5 flex items-center justify-center gap-2"
              style={{
                background: !isStory ? "var(--blue)" : "var(--bg-secondary)",
                color: !isStory ? "#fff" : "var(--text-secondary)",
              }}
            >
              <ImageIcon size={16} />
              Пост
            </button>
            <button
              type="button"
              onClick={() => setIsStory(true)}
              className="ios-btn-secondary py-3.5 flex items-center justify-center gap-2"
              style={{
                background: isStory ? "var(--blue)" : "var(--bg-secondary)",
                color: isStory ? "#fff" : "var(--text-secondary)",
              }}
            >
              <Zap size={16} />
              История
            </button>
          </div>

          <div className="ios-card">
            <label className="ios-caption" style={{ color: "var(--text-tertiary)", marginBottom: 8, display: "block" }}>
              {isStory ? "Подпись к истории" : "Описание"}
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder={isStory ? "Добавьте текст к вашей истории…" : "Напишите описание… #хештеги @упоминания"}
              className="ios-input w-full min-h-[80px] resize-none leading-relaxed"
              maxLength={2200}
            />
            <div className="flex items-center justify-between mt-2 pt-2" style={{ borderTop: "0.5px solid var(--separator)" }}>
              <span className="ios-caption" style={{ color: "var(--text-tertiary)" }}>
                {caption.length} / 2200
              </span>
              {caption.match(/#[\w\u0400-\u04FF]+/g) && (
                <div className="flex gap-1 flex-wrap justify-end">
                  {caption.match(/#[\w\u0400-\u04FF]+/g)?.slice(0, 5).map((tag, i) => (
                    <span key={i} className="ios-badge">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="ios-card">
            <label className="ios-caption" style={{ color: "var(--text-tertiary)", marginBottom: 12, display: "block" }}>
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
                  className="w-full flex items-center gap-3 rounded-xl"
                  style={{
                    padding: 12,
                    background: visibility === opt.value ? "var(--bg-tertiary)" : "transparent",
                    border: visibility === opt.value ? "0.5px solid var(--separator-opaque)" : "0.5px solid transparent",
                    textAlign: "left",
                  }}
                >
                  <div className="w-9 h-9 rounded-full flex items-center justify-center"
                    style={{ background: "var(--bg-quaternary)" }}>
                    <opt.icon size={18} style={{ color: "var(--text-secondary)" }} />
                  </div>
                  <div className="flex-1">
                    <p className="ios-body" style={{ fontWeight: 500, margin: 0 }}>{opt.title}</p>
                    <p className="ios-caption" style={{ color: "var(--text-tertiary)", margin: "2px 0 0" }}>{opt.desc}</p>
                  </div>
                  {visibility === opt.value && (
                    <div className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: "var(--blue)" }}>
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {isStory && (
            <div className="ios-card" style={{ display: "flex", alignItems: "center", gap: 10, padding: 12 }}>
              <Clock size={16} style={{ color: "var(--blue)", flexShrink: 0 }} />
              <p className="ios-caption" style={{ color: "var(--text-tertiary)", margin: 0 }}>
                История будет видна <span style={{ fontWeight: 600, color: "var(--blue)" }}>24 часа</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
