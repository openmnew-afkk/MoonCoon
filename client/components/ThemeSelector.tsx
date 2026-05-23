import { cn } from "@/lib/utils";
import type { ThemeMode } from "@/lib/theme";
import { Moon, Sun, Smartphone } from "lucide-react";

interface ThemeSelectorProps {
  value: ThemeMode;
  onChange: (mode: ThemeMode) => void;
  className?: string;
}

const options: { id: ThemeMode; label: string; icon: typeof Sun }[] = [
  { id: "auto", label: "Авто", icon: Smartphone },
  { id: "light", label: "Светлая", icon: Sun },
  { id: "dark", label: "Тёмная", icon: Moon },
];

export default function ThemeSelector({
  value,
  onChange,
  className,
}: ThemeSelectorProps) {
  return (
    <div className={cn("glass-card p-3 rounded-xl", className)}>
      <p className="text-sm font-medium mb-2">Тема оформления</p>
      <div className="grid grid-cols-3 gap-2">
        {options.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={cn(
              "flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-semibold transition-all border",
              value === id
                ? "bg-primary/15 text-primary border-primary/40 shadow-sm"
                : "bg-secondary/50 text-muted-foreground border-transparent hover:border-border",
            )}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
