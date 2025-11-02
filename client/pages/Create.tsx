import { useState, useRef } from "react";
import { Plus, X, Share2, Zap, Video, AlertCircle, Clock, Sparkles } from "lucide-react";
import MediaEditor from "@/components/MediaEditor";
import { usePremium } from "@/hooks/usePremium";
import { useTelegram } from "@/hooks/useTelegram";

type CreateMode = "post" | "story";

const MAX_VIDEO_DURATION_FREE = 60; // 60 секунд для всех бесплатно
const MAX_VIDEO_DURATION_STANDARD = 5 * 60; // 5 минут для Premium
const MAX_VIDEO_DURATION_BLOGGER = 18 * 60; // 18 минут для Premium Blogger

export default function Create() {
  const [mode, setMode] = useState<CreateMode>("post");
  const [caption, setCaption] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { premium } = usePremium();
  const { user } = useTelegram();
  const [visibility, setVisibility] = useState<'public' | 'followers'>('public');
  const [allowReactions, setAllowReactions] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiStyles, setShowAiStyles] = useState(false);

  // Определяем максимальную длительность видео на основе премиум статуса
  const getMaxVideoDuration = () => {
    if (!premium.isPremium) return MAX_VIDEO_DURATION_FREE;
    // В продакшене нужно получать тип премиум из premium.type
    // Пока определяем по videoDuration из premium (если доступно)
    const videoDuration = (premium as any).videoDuration;
    if (videoDuration >= MAX_VIDEO_DURATION_BLOGGER) {
      return MAX_VIDEO_DURATION_BLOGGER;
    }
    return MAX_VIDEO_DURATION_STANDARD;
  };

  const maxVideoDuration = getMaxVideoDuration();

  const handleImageEdit = (edited: string) => {
    setEditedImage(edited);
    setShowEditor(false);
  };

  const resetForm = () => {
    setCaption("");
    setSelectedImage(null);
    setSelectedVideo(null);
    setVideoDuration(null);
    setEditedImage(null);
    setShowEditor(false);
    setVisibility('public');
    setAllowReactions(true);
  };

  const handleFileSelect = (file: File) => {
    if (file.type.startsWith("video/")) {
      const videoUrl = URL.createObjectURL(file);
      setSelectedVideo(videoUrl);
      setSelectedImage(null);
      
      // Проверяем длительность видео
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        const duration = Math.floor(video.duration);
        setVideoDuration(duration);
        
        if (duration > maxVideoDuration) {
          URL.revokeObjectURL(videoUrl);
          const maxMinutes = Math.floor(maxVideoDuration / 60);
          alert(`Видео слишком длинное. Максимальная длительность: ${maxMinutes} ${maxMinutes === 1 ? "минута" : "минут"}.`);
          setSelectedVideo(null);
          setVideoDuration(null);
        }
      };
      video.src = videoUrl;
    } else if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
        setEditedImage(null);
        setSelectedVideo(null);
        setVideoDuration(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const displayImage = editedImage || selectedImage;
  const hasMedia = displayImage || selectedVideo;

  const blobToBase64 = (blob: Blob): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string) || '');
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

  const getMediaPayload = async (): Promise<{ media: string; mediaType: 'image' | 'video' } | null> => {
    if (displayImage) {
      return { media: displayImage, mediaType: 'image' };
    }
    if (selectedVideo) {
      try {
        const resp = await fetch(selectedVideo);
        const blob = await resp.blob();
        const b64 = await blobToBase64(blob);
        return { media: b64, mediaType: 'video' };
      } catch (e) {
        alert('Не удалось подготовить видео для загрузки');
        return null;
      }
    }
    return null;
  };

  const publishPost = async () => {
    if (!hasMedia) {
      alert('Добавьте фото или видео');
      return;
    }
    const mediaPayload = await getMediaPayload();
    if (!mediaPayload) {
      alert('Не удалось подготовить медиа');
      return;
    }
    try {
      console.log('Публикация поста...', { userId: user?.id, caption, visibility, mediaType: mediaPayload.mediaType });
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id?.toString() || '0',
          caption,
          visibility,
          ...mediaPayload,
        }),
      });
      console.log('Ответ сервера:', res.status, res.statusText);
      if (res.ok) {
        const data = await res.json();
        console.log('Пост опубликован:', data);
        resetForm();
        alert('✅ Пост успешно опубликован!');
      } else {
        const err = await res.json().catch(() => ({ error: 'Неизвестная ошибка' }));
        console.error('Ошибка публикации:', err);
        alert(`❌ Ошибка публикации:\n${err.error || 'Проверьте консоль'}`);
      }
    } catch (e: any) {
      console.error('Ошибка сети:', e);
      alert(`❌ Ошибка сети:\n${e.message || 'Проверьте интернет-соединение'}`);
    }
  };

  const publishStory = async () => {
    if (!hasMedia) {
      alert('Добавьте фото или видео');
      return;
    }
    const mediaPayload = await getMediaPayload();
    if (!mediaPayload) {
      alert('Не удалось подготовить медиа');
      return;
    }
    try {
      console.log('Публикация сторис...', { allowReactions, mediaType: mediaPayload.mediaType });
      const res = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'self',
          allowReactions,
          ...mediaPayload,
        }),
      });
      console.log('Ответ сервера:', res.status, res.statusText);
      if (res.ok) {
        const data = await res.json();
        console.log('Сторис опубликована:', data);
        resetForm();
        alert('✅ История успешно опубликована!');
      } else {
        const err = await res.json().catch(() => ({ error: 'Неизвестная ошибка' }));
        console.error('Ошибка публикации сторис:', err);
        alert(`❌ Ошибка публикации:\n${err.error || 'Проверьте консоль'}`);
      }
    } catch (e: any) {
      console.error('Ошибка сети:', e);
      alert(`❌ Ошибка сети:\n${e.message || 'Проверьте интернет-соединение'}`);
    }
  };

  if (showEditor && selectedImage) {
    return (
      <div className="min-h-screen bg-background pb-24 sm:pb-28">
        <div className="max-w-2xl mx-auto pt-20 px-3 sm:px-4">
          <button
            onClick={() => setShowEditor(false)}
            className="text-primary mb-4 flex items-center gap-2"
          >
            ← Вернуться
          </button>
          <MediaEditor
            imageUrl={selectedImage}
            onSave={handleImageEdit}
            onCancel={() => setShowEditor(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 glass-morphism border-b border-glass-light/20 z-30 ios-shadow">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <h1 className="text-2xl font-bold">Создать</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto pt-20 px-4">
        {/* Mode Selector */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => {
              setMode("post");
              resetForm();
            }}
            className={`flex-1 glass-button rounded-2xl py-3 font-semibold transition-all ${
              mode === "post"
                ? "bg-primary/20 text-primary"
                : "opacity-70 hover:opacity-100"
            }`}
          >
            Пост
          </button>
          <button
            onClick={() => {
              setMode("story");
              resetForm();
            }}
            className={`flex-1 glass-button rounded-2xl py-3 font-semibold transition-all flex items-center justify-center gap-2 ${
              mode === "story"
                ? "bg-primary/20 text-primary"
                : "opacity-70 hover:opacity-100"
            }`}
          >
            <Zap size={18} />
            История
          </button>
        </div>

        {/* Create Form */}
        <div className="glass-card space-y-4">
          {/* Media Upload */}
          <div className="rounded-2xl overflow-hidden">
            {displayImage ? (
              <div className="relative">
                <img
                  src={displayImage}
                  alt="Selected"
                  className="w-full h-80 object-cover select-none"
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-all flex items-center justify-center gap-2 opacity-0 hover:opacity-100">
                  <button
                    onClick={() => setShowEditor(true)}
                    className="glass-button rounded-2xl px-4 py-2 bg-primary/20 text-primary hover:bg-primary/30"
                  >
                    ✏️ Редактировать
                  </button>
                  <button
                    onClick={() => {
                      setSelectedImage(null);
                      setEditedImage(null);
                    }}
                    className="glass-button rounded-full p-2"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            ) : selectedVideo ? (
              <div className="relative">
                <div className="relative w-full h-80 bg-black rounded-2xl overflow-hidden">
                  <video
                    ref={videoRef}
                    src={selectedVideo}
                    controls
                    playsInline
                    className="w-full h-full object-contain"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30"></div>
                </div>
                {videoDuration && (
                  <div className="absolute top-2 right-2 glass-morphism px-2 py-1 rounded-lg text-xs flex items-center gap-1">
                    <Clock size={12} />
                    {Math.floor(videoDuration / 60)}:{(videoDuration % 60).toString().padStart(2, "0")}
                  </div>
                )}
                {videoDuration && videoDuration > maxVideoDuration && (
                  <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                    <div className="glass-card p-4 text-center">
                      <AlertCircle className="text-red-500 mx-auto mb-2" size={24} />
                      <p className="text-sm font-semibold text-red-500">
                        Видео слишком длинное
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Максимум: {maxVideoDuration >= 60 ? `${Math.floor(maxVideoDuration / 60)} минут` : `${maxVideoDuration} секунд`}
                      </p>
                    </div>
                  </div>
                )}
                <button
                  onClick={() => {
                    setSelectedVideo(null);
                    setVideoDuration(null);
                  }}
                  className="absolute top-2 left-2 glass-button rounded-full p-2 bg-black/60 hover:bg-black/80 text-white"
                >
                  <X size={20} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-4 p-12 glass-morphism rounded-2xl cursor-pointer hover:bg-glass-light/40 transition-all">
                <Plus size={40} className="text-primary" />
                <span className="text-center">
                  <p className="font-semibold">
                    Добавить фото или видео
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Нажмите для выбора с вашего устройства
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 flex items-center justify-center gap-1">
                    <Video size={14} />
                    Видео до {maxVideoDuration >= 60 ? `${Math.floor(maxVideoDuration / 60)} мин` : `${maxVideoDuration} сек`}
                  </p>
                </span>
                <input
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileSelect(file);
                    }
                  }}
                />
              </label>
            )}
          </div>

          {/* Caption Input */}
          {mode === "post" && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Описание</label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Напишите описание... Добавьте #��ештеги и @упоминания"
                  rows={4}
                  className="w-full glass-morphism rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
              </div>

              {/* Tags Preview */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Теги</p>
                <div className="flex flex-wrap gap-2">
                  {caption
                    .match(/#[\w]+/g)
                    ?.map((tag, i) => (
                      <span
                        key={i}
                        className="glass-button text-accent text-sm flex items-center gap-1"
                      >
                        {tag}
                      </span>
                    ))}
                </div>
              </div>

              {/* Settings */}
              <div className="space-y-3 border-t border-glass-light/10 pt-4">
                <label className="flex items-center justify-between p-3 bg-glass-light/30 rounded-xl cursor-pointer hover:bg-glass-light/50 transition-all">
                  <span className="text-sm font-medium">Разрешить комментарии</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </label>
                <label className="flex items-center justify-between p-3 bg-glass-light/30 rounded-xl cursor-pointer hover:bg-glass-light/50 transition-all">
                  <span className="text-sm font-medium">Разрешить лайки</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </label>
                <div className="p-3 bg-glass-light/30 rounded-xl">
                  <label className="block text-sm font-medium mb-2">Видимость</label>
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      { key: 'public', label: 'Всем' },
                      { key: 'followers', label: 'Подписчикам' },
                    ] as const).map(opt => (
                      <button
                        key={opt.key}
                        onClick={() => setVisibility(opt.key)}
                        className={`glass-button py-2 rounded-xl text-sm ${visibility === opt.key ? 'bg-primary/20 text-primary' : ''}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Publish Button */}
              <button
                onClick={publishPost}
                disabled={!hasMedia || !caption.trim()}
                className="w-full glass-button rounded-2xl py-3 font-semibold bg-primary/20 text-primary hover:bg-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                <Share2 size={20} />
                Опубликовать пост
              </button>
            </>
          )}

          {/* Story Mode */}
          {mode === "story" && (
            <>
              <div className="space-y-3 border-t border-glass-light/10 pt-4">
                <p className="text-sm font-medium text-muted-foreground">
                  История будет видна в течение 24 часов
                </p>
                <label className="flex items-center justify-between p-3 bg-glass-light/30 rounded-xl cursor-pointer hover:bg-glass-light/50 transition-all">
                  <span className="text-sm font-medium">Разрешить ответы</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </label>
                <label className="flex items-center justify-between p-3 bg-glass-light/30 rounded-xl cursor-pointer hover:bg-glass-light/50 transition-all">
                  <span className="text-sm font-medium">Разрешить реакции</span>
                  <input type="checkbox" className="w-4 h-4" checked={allowReactions} onChange={(e)=>setAllowReactions(e.target.checked)} />
                </label>
              </div>

              {/* Story Preview */}
              {hasMedia && (
                <div className="p-4 bg-glass-light/30 rounded-2xl">
                  <p className="text-xs text-muted-foreground mb-2">Предпросмотр</p>
                  <div className="w-24 h-44 rounded-2xl overflow-hidden mx-auto relative">
                    {displayImage ? (
                      <img
                        src={displayImage}
                        alt="Story preview"
                        className="w-full h-full object-cover"
                      />
                    ) : selectedVideo ? (
                      <video
                        src={selectedVideo}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                      />
                    ) : null}
                    <div className="pointer-events-none absolute inset-0" style={{ WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,1) 15%, rgba(0,0,0,1) 85%, rgba(0,0,0,0.15))', maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,1) 15%, rgba(0,0,0,1) 85%, rgba(0,0,0,0.15))' }}></div>
                  </div>
                </div>
              )}

              {/* Publish Button */}
              <button
                onClick={publishStory}
                disabled={!hasMedia}
                className="w-full glass-button rounded-2xl py-3 font-semibold bg-primary/20 text-primary hover:bg-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                <Zap size={20} />
                Поделиться историей
              </button>
            </>
          )}

          {/* Reset Button */}
          {hasMedia && (
            <button
              onClick={resetForm}
              className="w-full glass-button rounded-2xl py-2 opacity-70 hover:opacity-100 transition-opacity"
            >
              Начать заново
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
