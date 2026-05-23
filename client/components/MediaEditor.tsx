import { useState, useRef, useEffect } from "react";
import {
  RotateCw,
  Sun,
  Contrast as ContrastIcon,
  Check,
  Droplet,
  Sparkles,
  ZoomIn,
  ZoomOut,
  X,
  RefreshCw,
  Grid3X3,
  Sliders,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MediaEditorProps {
  imageUrl: string;
  onSave?: (editedImage: string) => void;
  onCancel?: () => void;
}

const PRESET_FILTERS = [
  { name: "Оригинал", filter: "none" },
  { name: "Ч/Б", filter: "grayscale(100%)" },
  { name: "Сепия", filter: "sepia(80%)" },
  { name: "Драма", filter: "contrast(140%) brightness(92%) saturate(110%)" },
  { name: "Мягкий", filter: "contrast(88%) brightness(112%) saturate(95%)" },
  { name: "Яркий", filter: "brightness(115%) saturate(130%) contrast(105%)" },
  { name: "Тёмный", filter: "brightness(78%) contrast(115%) saturate(90%)" },
  { name: "Тёплый", filter: "sepia(30%) brightness(108%) saturate(120%)" },
  { name: "Холодный", filter: "hue-rotate(190deg) saturate(120%) brightness(105%)" },
  { name: "Кино", filter: "contrast(130%) brightness(88%) saturate(80%) sepia(10%)" },
];

export default function MediaEditor({
  imageUrl,
  onSave,
  onCancel,
}: MediaEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [blur, setBlur] = useState(0);
  const [warmth, setWarmth] = useState(0);
  const [sharpen, setSharpen] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState<string>("none");
  const [saved, setSaved] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [activeTab, setActiveTab] = useState<"filters" | "adjust">("filters");
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const lastTouchDist = useRef<number | null>(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const maxW = 1080, maxH = 1080;
      let w = img.width, h = img.height;
      if (w > maxW || h > maxH) {
        const r = Math.min(maxW / w, maxH / h);
        w = w * r; h = h * r;
      }
      setImageSize({ width: w, height: h });
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastTouchDist.current = Math.sqrt(dx * dx + dy * dy);
    } else if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - position.x, y: e.touches[0].clientY - position.y });
    }
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 2 && lastTouchDist.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const delta = dist / lastTouchDist.current;
      setScale(prev => Math.max(0.5, Math.min(3, prev * delta)));
      lastTouchDist.current = dist;
    } else if (e.touches.length === 1 && isDragging) {
      setPosition({ x: e.touches[0].clientX - dragStart.x, y: e.touches[0].clientY - dragStart.y });
    }
  };
  const handleTouchEnd = () => {
    setIsDragging(false);
    lastTouchDist.current = null;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.92 : 1.08;
    setScale(prev => Math.max(0.5, Math.min(3, prev * delta)));
  };

  const getFilterStyle = () => {
    let f = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px)`;
    if (warmth !== 0) f += ` hue-rotate(${warmth * 1.5}deg)`;
    if (selectedFilter !== "none") f += ` ${selectedFilter}`;
    return f;
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const fw = imageSize.width || img.width;
      const fh = imageSize.height || img.height;
      canvas.width = fw; canvas.height = fh;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.filter = getFilterStyle().trim();
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      const sw = fw * scale, sh = fh * scale;
      ctx.drawImage(img, position.x - sw / 2, position.y - sh / 2, sw, sh);
      ctx.restore();
      const edited = canvas.toDataURL("image/jpeg", 0.92);
      onSave?.(edited);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    };
    img.src = imageUrl;
  };

  const resetFilters = () => {
    setRotation(0); setBrightness(100); setContrast(100);
    setSaturation(100); setBlur(0); setWarmth(0); setSharpen(0);
    setSelectedFilter("none"); setPosition({ x: 0, y: 0 }); setScale(1);
  };

  const applyPresetFilter = (filter: string) => {
    setSelectedFilter(filter);
    if (filter === "none") resetFilters();
  };

  const adjustControls = [
    { label: "Яркость", icon: Sun, value: brightness, set: setBrightness, min: 0, max: 200, unit: "%" },
    { label: "Контраст", icon: ContrastIcon, value: contrast, set: setContrast, min: 0, max: 200, unit: "%" },
    { label: "Насыщенность", icon: Droplet, value: saturation, set: setSaturation, min: 0, max: 200, unit: "%" },
    { label: "Резкость", icon: Sliders, value: sharpen, set: setSharpen, min: 0, max: 100, unit: "" },
    { label: "Тепло", icon: Sparkles, value: warmth, set: setWarmth, min: -50, max: 50, unit: "" },
    { label: "Размытие", icon: Sliders, value: blur, set: setBlur, min: 0, max: 10, unit: "px" },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0a] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/70 backdrop-blur-sm relative z-10 border-b border-white/[0.06]">
        <button
          onClick={onCancel}
          className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-2">
          <Sparkles className="text-violet-400" size={16} />
          <h3 className="text-sm font-semibold text-white">Редактор</h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGrid(g => !g)}
            className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95",
              showGrid ? "bg-violet-500/40 text-violet-300" : "bg-white/10 text-white hover:bg-white/20"
            )}
          >
            <Grid3X3 size={16} />
          </button>
          <button
            onClick={resetFilters}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={handleSave}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95",
              saved
                ? "bg-emerald-500/30 text-emerald-300 border border-emerald-500/30"
                : "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/25"
            )}
          >
            {saved ? (
              <span className="flex items-center gap-1.5"><Check size={14} /> Готово</span>
            ) : "Применить"}
          </button>
        </div>
      </div>

      {/* Preview */}
      <div
        ref={containerRef}
        className="relative flex-1 flex items-center justify-center overflow-hidden bg-black cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: "none" }}
      >
        <div
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
            filter: getFilterStyle(),
            transition: isDragging ? "none" : "transform 0.1s ease-out",
          }}
        >
          <img
            src={imageUrl}
            alt="Preview"
            style={{
              maxWidth: imageSize.width || "100%",
              maxHeight: "60vh",
              width: "auto",
              height: "auto",
              display: "block",
              userSelect: "none",
              pointerEvents: "none",
              borderRadius: "4px",
            }}
            draggable={false}
          />
        </div>

        {/* Rule-of-thirds grid */}
        {showGrid && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0" style={{
              backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.15) 1px, transparent 1px)",
              backgroundSize: "33.333% 33.333%"
            }} />
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />

        {/* Zoom controls */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          <button
            onClick={() => setScale(p => Math.min(3, p + 0.15))}
            className="w-9 h-9 bg-black/60 backdrop-blur-sm rounded-xl flex items-center justify-center text-white hover:bg-black/80 transition-all active:scale-95"
          >
            <ZoomIn size={16} />
          </button>
          <button
            onClick={() => setScale(p => Math.max(0.5, p - 0.15))}
            className="w-9 h-9 bg-black/60 backdrop-blur-sm rounded-xl flex items-center justify-center text-white hover:bg-black/80 transition-all active:scale-95"
          >
            <ZoomOut size={16} />
          </button>
        </div>

        {/* Rotate */}
        <div className="absolute bottom-4 left-4">
          <button
            onClick={() => setRotation(p => (p + 90) % 360)}
            className="w-9 h-9 bg-black/60 backdrop-blur-sm rounded-xl flex items-center justify-center text-white hover:bg-black/80 transition-all active:scale-95"
          >
            <RotateCw size={16} />
          </button>
        </div>

        {/* Scale badge */}
        <div className="absolute top-3 right-3 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-lg">
          <span className="text-[10px] text-white/60 font-mono">{Math.round(scale * 100)}%</span>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="bg-black/90 backdrop-blur-md border-t border-white/[0.06]" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="flex">
          {(["filters", "adjust"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 py-3 text-xs font-semibold tracking-wide uppercase transition-all",
                activeTab === tab
                  ? "text-violet-400 border-b-2 border-violet-500"
                  : "text-white/40 border-b-2 border-transparent hover:text-white/60"
              )}
            >
              {tab === "filters" ? "Фильтры" : "Настройки"}
            </button>
          ))}
        </div>

        {activeTab === "filters" && (
          <div className="px-4 py-3">
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
              {PRESET_FILTERS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => applyPresetFilter(preset.filter)}
                  className="flex-shrink-0 flex flex-col items-center gap-1.5 group"
                >
                  <div
                    className={cn(
                      "w-16 h-16 rounded-2xl overflow-hidden border-2 transition-all duration-200",
                      selectedFilter === preset.filter
                        ? "border-violet-500 scale-105 shadow-lg shadow-violet-500/30"
                        : "border-white/[0.12] group-hover:border-white/30"
                    )}
                  >
                    <img
                      src={imageUrl}
                      alt={preset.name}
                      className="w-full h-full object-cover"
                      style={{ filter: preset.filter }}
                      draggable={false}
                    />
                  </div>
                  <span className={cn(
                    "text-[10px] font-medium transition-colors",
                    selectedFilter === preset.filter ? "text-violet-400" : "text-white/50"
                  )}>
                    {preset.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === "adjust" && (
          <div className="px-4 py-3 space-y-3 max-h-52 overflow-y-auto scrollbar-hide">
            {adjustControls.map(({ label, icon: Icon, value, set, min, max, unit }) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-white/70">
                    <Icon size={13} className="text-violet-400" />
                    {label}
                  </span>
                  <span className="text-[11px] font-mono text-violet-400 min-w-[40px] text-right">
                    {value}{unit}
                  </span>
                </div>
                <input
                  type="range"
                  min={min}
                  max={max}
                  value={value}
                  onChange={e => set(parseFloat(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-violet-500"
                  style={{
                    background: `linear-gradient(to right, #7c3aed ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.1) ${((value - min) / (max - min)) * 100}%)`
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
