import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Home,
  Compass,
  Plus,
  Sparkles,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Лента", exact: true },
    { path: "/explore", icon: Compass, label: "Поиск" },
    { path: "/create", icon: Plus, label: "Создать" },
    { path: "/ai", icon: Sparkles, label: "AI" },
    { path: "/profile", icon: User, label: "Профиль" },
  ];

  const isActive = (path: string, exact: boolean = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        {children}
      </div>

      {/* Bottom Navigation - iOS 26 Style */}
      <nav className="fixed bottom-0 left-0 right-0 glass-morphism border-t border-glass-light/20 ios-shadow">
        <div className="max-w-2xl mx-auto h-20 flex items-center justify-around px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path, item.exact);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 w-16 h-16 rounded-2xl transition-all duration-200",
                  active
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon
                  size={24}
                  className={cn(
                    "transition-transform duration-200",
                    active && "scale-110"
                  )}
                />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
