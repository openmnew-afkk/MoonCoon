import { useState, useRef, useEffect } from "react";
import { RotateCw, Crop, Sun, Contrast as ContrastIcon, Copy, Check, Filter, Circle, Droplet, Sparkles, Move, ZoomIn, ZoomOut, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface MediaEditorProps {
  imageUrl: string;
  onSave?: (editedImage: string) => void;
  onCancel?: () => void;
}

const PRESET_FILTERS = [
  { name: "Оригинал", filter: "none" },
  { name: "Черно-белое", filter: "grayscale(100%)" },
  { name: "Сепия", filter: "sepia(100%)" },
  { name: "Видео", filter: "brightness(110%) contrast(120%) saturate(130%)" },
  { name: "Драма", filter: "contrast(150%) brightness(90%)" },
  { name: "Мягкий", filter: "contrast(90%) brightness(110%) blur(0.5px)" },
  { name: "Яркий", filter: "brightness(120%) saturate(120%)" },
  { name: "Темный", filter: "brightness(80%) contrast(110%)" },
];

export default function MediaEditor({ imageUrl, onSave, onCancel }: MediaEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [blur, setBlur] = useState(0);
  const [warmth, setWarmth] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState<string>("none");
  const [saved, setSaved] = useState(false);
  
  // Позиция и масштаб для перемещения
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  // Автоматически устанавливаем размер изображения
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const maxWidth = 1080; // Стандартный размер для соцсетей
      const maxHeight = 1080;
      
      let width = img.width;
      let height = img.height;
      
      // Масштабируем до максимальных размеров, сохраняя пропорции
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = width * ratio;
        height = height * ratio;
      }
      
      setImageSize({ width, height });
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale((prev) => Math.max(0.5, Math.min(3, prev * delta)));
  };

  const getFilterStyle = () => {
    let filterString = `
      brightness(${brightness}%)
      contrast(${contrast}%)
      saturate(${saturation}%)
      blur(${blur}px)
    `;

    if (warmth !== 0) {
      filterString += ` hue-rotate(${warmth * 2}deg)`;
    }

    if (selectedFilter !== "none") {
      filterString += ` ${selectedFilter}`;
    }

    return filterString;
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // Устанавливаем размер canvas
      const finalWidth = imageSize.width || img.width;
      const finalHeight = imageSize.height || img.height;
      
      canvas.width = finalWidth;
      canvas.height = finalHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Очищаем canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Применяем фильтры
      ctx.filter = getFilterStyle().trim();

      // Сохраняем состояние
      ctx.save();

      // Применяем трансформации (центрируем)
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      ctx.translate(centerX, centerY);
      ctx.rotate((rotation * Math.PI) / 180);
      
      // Применяем позицию и масштаб
      const scaledWidth = finalWidth * scale;
      const scaledHeight = finalHeight * scale;
      
      ctx.drawImage(
        img, 
        position.x - scaledWidth / 2, 
        position.y - scaledHeight / 2,
        scaledWidth,
        scaledHeight
      );

      // Восстанавливаем состояние
      ctx.restore();

      const editedImage = canvas.toDataURL("image/jpeg", 0.9);
      onSave?.(editedImage);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    };
    img.src = imageUrl;
  };

  const resetFilters = () => {
    setRotation(0);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setBlur(0);
    setWarmth(0);
    setSelectedFilter("none");
    setPosition({ x: 0, y: 0 });
    setScale(1);
  };

  const applyPresetFilter = (filter: string) => {
    setSelectedFilter(filter);
    if (filter === "none") {
      resetFilters();
    }
  };

  const [activeTab, setActiveTab] = useState<'filters' | 'adjust'>('filters');

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/80 backdrop-blur-sm">
        <button
          onClick={onCancel}
          className="text-white hover:text-primary transition-colors"
        >
          <X size={24} />
        </button>
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Sparkles className="text-primary" size={20} />
          Редактор
        </h3>
        <button
          onClick={handleSave}
          className="text-primary font-semibold hover:opacity-80 transition-opacity"
        >
          {saved ? 'Готово' : 'Применить'}
        </button>
      </div>

      {/* Preview с возможностью перемещения и масштабирования */}
      <div 
        ref={containerRef}
        className="relative bg-black flex-1 flex items-center justify-center cursor-move overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ touchAction: "none" }}
      >
        <div
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
            filter: getFilterStyle(),
            transition: isDragging ? "none" : "transform 0.1s",
          }}
          className="relative"
        >
          <img
            src={imageUrl}
            alt="Preview"
            style={{
              maxWidth: imageSize.width || "100%",
              maxHeight: imageSize.height || "100%",
              width: "auto",
              height: "auto",
              display: "block",
              userSelect: "none",
              pointerEvents: "none",
            }}
            draggable={false}
          />
        </div>
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Индикаторы управления */}
        <div className="absolute bottom-4 right-4 flex gap-2">
          <button
            onClick={() => setScale((prev) => Math.max(0.5, prev - 0.1))}
            className="bg-black/60 backdrop-blur-sm p-2 rounded-full hover:bg-black/80 text-white"
          >
            <ZoomOut size={18} />
          </button>
          <button
            onClick={() => setScale((prev) => Math.min(3, prev + 0.1))}
            className="bg-black/60 backdrop-blur-sm p-2 rounded-full hover:bg-black/80 text-white"
          >
            <ZoomIn size={18} />
          </button>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="bg-black/80 backdrop-blur-sm">
        {/* Tabs */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab('filters')}
            className={cn(
              "flex-1 py-3 text-sm font-medium transition-all",
              activeTab === 'filters' ? 'text-primary border-b-2 border-primary' : 'text-white/60'
            )}
          >
            Фильтры
          </button>
          <button
            onClick={() => setActiveTab('adjust')}
            className={cn(
              "flex-1 py-3 text-sm font-medium transition-all",
              activeTab === 'adjust' ? 'text-primary border-b-2 border-primary' : 'text-white/60'
            )}
          >
            Настройки
          </button>
        </div>

        {/* Filters Tab */}
        {activeTab === 'filters' && (
          <div className="p-4">
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {PRESET_FILTERS.map((preset, i) => (
                <button
                  key={i}
                  onClick={() => applyPresetFilter(preset.filter)}
                  className="flex-shrink-0 flex flex-col items-center gap-2"
                >
                  <div
                    className={cn(
                      "w-16 h-16 rounded-xl overflow-hidden border-2 transition-all",
                      selectedFilter === preset.filter ? 'border-primary' : 'border-white/20'
                    )}
                  >
                    <img
                      src={imageUrl}
                      alt={preset.name}
                      className="w-full h-full object-cover"
                      style={{ filter: preset.filter }}
                    />
                  </div>
                  <span className={cn(
                    "text-xs font-medium",
                    selectedFilter === preset.filter ? 'text-primary' : 'text-white/60'
                  )}>
                    {preset.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Adjust Tab */}
        {activeTab === 'adjust' && (
          <div className="p-4 space-y-4 max-h-64 overflow-y-auto">
            {/* Brightness */}
            <div>
              <label className="text-sm font-medium flex items-center justify-between mb-2 text-white">
                <span className="flex items-center gap-2">
                  <Sun size={16} />
                  Яркость
                </span>
                <span className="text-primary">{brightness}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="200"
                value={brightness}
                onChange={(e) => setBrightness(parseInt(e.target.value))}
                className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            {/* Contrast */}
            <div>
              <label className="text-sm font-medium flex items-center justify-between mb-2 text-white">
                <span className="flex items-center gap-2">
                  <ContrastIcon size={16} />
                  Контрастность
                </span>
                <span className="text-primary">{contrast}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="200"
                value={contrast}
                onChange={(e) => setContrast(parseInt(e.target.value))}
                className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            {/* Saturation */}
            <div>
              <label className="text-sm font-medium flex items-center justify-between mb-2 text-white">
                <span className="flex items-center gap-2">
                  <Droplet size={16} />
                  Насыщенность
                </span>
                <span className="text-primary">{saturation}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="200"
                value={saturation}
                onChange={(e) => setSaturation(parseInt(e.target.value))}
                className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            {/* Rotation */}
            <div>
              <label className="text-sm font-medium flex items-center justify-between mb-2 text-white">
                <span className="flex items-center gap-2">
                  <RotateCw size={16} />
                  Поворот
                </span>
                <span className="text-primary">{rotation}°</span>
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={rotation}
                  onChange={(e) => setRotation(parseInt(e.target.value))}
                  className="flex-1 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <button
                  onClick={() => setRotation((prev) => (prev + 90) % 360)}
                  className="bg-white/10 px-3 py-1 rounded-lg text-xs text-white hover:bg-white/20"
                >
                  90°
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
