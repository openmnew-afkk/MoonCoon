export interface PhotoFilter {
  id: string;
  name: string;
  css: string;
}

export const IG_FILTERS: PhotoFilter[] = [
  { id: "normal", name: "Оригинал", css: "none" },
  {
    id: "clarendon",
    name: "Clarendon",
    css: "contrast(1.2) saturate(1.35) brightness(1.1)",
  },
  {
    id: "gingham",
    name: "Gingham",
    css: "brightness(1.05) hue-rotate(-10deg) contrast(0.9)",
  },
  {
    id: "moon",
    name: "Moon",
    css: "grayscale(1) contrast(1.1) brightness(1.1)",
  },
  {
    id: "lark",
    name: "Lark",
    css: "contrast(0.9) brightness(1.15) saturate(1.2)",
  },
  {
    id: "reyes",
    name: "Reyes",
    css: "sepia(0.22) brightness(1.1) contrast(0.85) saturate(0.75)",
  },
  {
    id: "juno",
    name: "Juno",
    css: "sepia(0.15) contrast(1.15) brightness(1.1) saturate(1.4)",
  },
  {
    id: "slumber",
    name: "Slumber",
    css: "saturate(0.66) brightness(1.05) sepia(0.25)",
  },
  {
    id: "crema",
    name: "Crema",
    css: "sepia(0.5) contrast(0.95) brightness(1.05)",
  },
  {
    id: "ludwig",
    name: "Ludwig",
    css: "brightness(1.05) saturate(0.9) contrast(1.05)",
  },
  {
    id: "aden",
    name: "Aden",
    css: "hue-rotate(-20deg) contrast(0.9) saturate(0.85) brightness(1.2)",
  },
  {
    id: "perpetua",
    name: "Perpetua",
    css: "contrast(1.1) brightness(1.1) saturate(1.1)",
  },
  {
    id: "amaro",
    name: "Amaro",
    css: "contrast(1.1) brightness(1.1) saturate(1.3)",
  },
  {
    id: "mayfair",
    name: "Mayfair",
    css: "contrast(1.1) saturate(1.5) brightness(1.15)",
  },
  {
    id: "rise",
    name: "Rise",
    css: "sepia(0.25) brightness(1.15) saturate(1.4)",
  },
  {
    id: "hudson",
    name: "Hudson",
    css: "brightness(1.15) contrast(1.2) saturate(1.1) hue-rotate(-15deg)",
  },
  {
    id: "valencia",
    name: "Valencia",
    css: "sepia(0.15) contrast(1.1) brightness(1.1) saturate(1.3)",
  },
  {
    id: "xpro2",
    name: "X-Pro II",
    css: "sepia(0.3) contrast(1.3) brightness(1.1) saturate(1.2)",
  },
  {
    id: "willow",
    name: "Willow",
    css: "grayscale(0.5) contrast(0.95) brightness(1.05)",
  },
  {
    id: "lofi",
    name: "Lo-Fi",
    css: "contrast(1.4) saturate(1.2) brightness(0.9)",
  },
];

export interface Adjustments {
  brightness: number;
  contrast: number;
  saturation: number;
  warmth: number;
  rotation: number;
  filterId: string;
}

export function buildFilterCss(adj: Adjustments): string {
  const preset = IG_FILTERS.find((f) => f.id === adj.filterId)?.css || "none";
  const parts = [
    preset !== "none" ? preset : "",
    `brightness(${adj.brightness}%)`,
    `contrast(${adj.contrast}%)`,
    `saturate(${adj.saturation}%)`,
    adj.warmth !== 0 ? `hue-rotate(${adj.warmth}deg)` : "",
  ].filter(Boolean);
  return parts.join(" ");
}

export async function renderImageToDataUrl(
  imageUrl: string,
  adj: Adjustments,
  quality = 0.92,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const max = 1080;
      let w = img.width;
      let h = img.height;
      if (w > max || h > max) {
        const r = Math.min(max / w, max / h);
        w *= r;
        h *= r;
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas unavailable"));
        return;
      }
      ctx.filter = buildFilterCss(adj);
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.rotate((adj.rotation * Math.PI) / 180);
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
      ctx.restore();
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = imageUrl;
  });
}
