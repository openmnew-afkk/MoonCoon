import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PremiumBadge({
  size = "sm",
}: {
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "px-2.5 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  };

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 18,
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full",
        "bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-red-500/20",
        "border border-yellow-500/40 backdrop-blur-sm",
        "shadow-lg shadow-yellow-500/20",
        "relative overflow-hidden",
        sizeClasses[size],
      )}
    >
      {/* Анимированный фон */}
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-red-500/10 animate-shimmer"></div>

      {/* Контент */}
      <div className="relative flex items-center gap-1.5">
        <Sparkles
          className="text-yellow-400 fill-yellow-400 animate-pulse"
          size={iconSizes[size]}
        />
        <span className="font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
          PREMIUM
        </span>
      </div>

      <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
