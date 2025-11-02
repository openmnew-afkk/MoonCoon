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

  return (
    <div className="glass-card space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="text-primary" size={20} />
          Редактор фото
        </h3>
        <button
          onClick={resetFilters}
          className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
        >
          <RotateCw size={16} />
          Сбросить
        </button>
      </div>

      {/* Preview с возможностью перемещения и масштабирования */}
      <div 
        ref={containerRef}
        className="relative bg-black rounded-2xl overflow-hidden h-96 flex items-center justify-center cursor-move"
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
        <div className="absolute bottom-2 right-2 flex gap-2">
          <button
            onClick={() => setScale((prev) => Math.max(0.5, prev - 0.1))}
            className="glass-morphism p-2 rounded-lg hover:bg-glass-light/40"
          >
            <ZoomOut size={16} />
          </button>
          <button
            onClick={() => setScale((prev) => Math.min(3, prev + 0.1))}
            className="glass-morphism p-2 rounded-lg hover:bg-glass-light/40"
          >
            <ZoomIn size={16} />
          </button>
          <div className="glass-morphism px-3 py-2 rounded-lg text-xs flex items-center gap-2">
            <Move size={14} />
            <span>{Math.round(scale * 100)}%</span>
          </div>
        </div>
      </div>

      {/* Preset Filters */}
      <div>
        <label className="text-sm font-medium mb-2 block flex items-center gap-2">
          <Filter size={16} />
          Готовые фильтры
        </label>
        <div className="grid grid-cols-4 gap-2">
          {PRESET_FILTERS.map((preset, i) => (
            <button
              key={i}
              onClick={() => applyPresetFilter(preset.filter)}
              className={cn(
                "glass-button py-2 text-xs font-medium transition-all",
                selectedFilter === preset.filter && "bg-primary/20 text-primary border-2 border-primary"
              )}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {/* Brightness */}
        <div>
          <label className="text-sm font-medium flex items-center justify-between mb-2">
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
            className="w-full h-2 bg-glass-light/30 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Contrast */}
        <div>
          <label className="text-sm font-medium flex items-center justify-between mb-2">
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
            className="w-full h-2 bg-glass-light/30 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Saturation */}
        <div>
          <label className="text-sm font-medium flex items-center justify-between mb-2">
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
            className="w-full h-2 bg-glass-light/30 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Blur */}
        <div>
          <label className="text-sm font-medium flex items-center justify-between mb-2">
            <span className="flex items-center gap-2">
              <Circle size={16} />
              Размытие
            </span>
            <span className="text-primary">{blur}px</span>
          </label>
          <input
            type="range"
            min="0"
            max="20"
            value={blur}
            onChange={(e) => setBlur(parseInt(e.target.value))}
            className="w-full h-2 bg-glass-light/30 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Warmth */}
        <div>
          <label className="text-sm font-medium flex items-center justify-between mb-2">
            <span>Теплота</span>
            <span className="text-primary">{warmth > 0 ? "+" : ""}{warmth}</span>
          </label>
          <input
            type="range"
            min="-50"
            max="50"
            value={warmth}
            onChange={(e) => setWarmth(parseInt(e.target.value))}
            className="w-full h-2 bg-glass-light/30 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Rotation */}
        <div>
          <label className="text-sm font-medium flex items-center justify-between mb-2">
            <span className="flex items-center gap-2">
              <RotateCw size={16} />
              Поворот
            </span>
            <span className="text-primary">{rotation}°</span>
          </label>
          <div className="flex gap-2">
            <input
              type="range"
              min="0"
              max="360"
              value={rotation}
              onChange={(e) => setRotation(parseInt(e.target.value))}
              className="flex-1 h-2 bg-glass-light/30 rounded-lg appearance-none cursor-pointer"
            />
            <button
              onClick={() => setRotation((prev) => (prev + 90) % 360)}
              className="glass-button px-3 py-1 text-xs"
            >
              90°
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4 border-t border-glass-light/10">
        {onCancel && (
          <button
            onClick={onCancel}
            className="flex-1 glass-button rounded-2xl py-2.5 opacity-70 hover:opacity-100 transition-opacity"
          >
            Отмена
          </button>
        )}
        <button
          onClick={handleSave}
          className="flex-1 glass-button rounded-2xl py-2.5 bg-primary/20 text-primary hover:bg-primary/30 transition-all flex items-center justify-center gap-2"
        >
          {saved ? (
            <>
              <Check size={20} />
              Сохранено
            </>
          ) : (
            <>
              <Copy size={20} />
              Применить
            </>
          )}
        </button>
      </div>
    </div>
  );
}
