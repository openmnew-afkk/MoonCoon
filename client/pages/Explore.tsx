import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Sparkles, TrendingUp, Heart, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface DiscoveryItem {
  id: string;
  image: string;
  title: string;
  author: string;
  category: string;
  likes: number;
  saves: number;
}

const discoveryItems: DiscoveryItem[] = [];

export default function Explore() {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"popular" | "recent" | "likes">("popular");

  useEffect(() => {
    const q = searchParams.get("q");
    if (q !== null) setSearchQuery(q);
  }, [searchParams]);

  const categories = [
    "Все",
    "Дизайн",
    "Фотография",
    "Искусство",
    "Веб",
    "Путешествие",
  ];

  const filteredItems = discoveryItems
    .filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        !selectedCategory ||
        selectedCategory === "Все" ||
        item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "likes": return b.likes - a.likes;
        case "recent": return parseInt(b.id) - parseInt(a.id);
        default: return b.likes + b.saves - (a.likes + a.saves);
      }
    });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 pb-28 pt-4">
        {/* Search bar */}
        <div className="mb-4 relative">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Найти контент..."
            className="w-full rounded-2xl pl-10 pr-4 py-3 text-sm outline-none transition-all"
            style={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border) / 0.5)",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            }}
          />
        </div>

        {/* Active search query indicator */}
        {searchQuery && (
          <div className="mb-4 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Поиск:</span>
            <span className="text-sm font-semibold text-primary">«{searchQuery}»</span>
            <button
              onClick={() => setSearchQuery("")}
              className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Сбросить
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 space-y-4">
          <div>
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">
              Категории
            </p>
            <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() =>
                    setSelectedCategory(
                      selectedCategory === category ? null : category,
                    )
                  }
                  className="rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-all"
                  style={{
                    background: (selectedCategory === category || (selectedCategory === null && category === "Все"))
                      ? "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.1))"
                      : "hsl(var(--card))",
                    border: (selectedCategory === category || (selectedCategory === null && category === "Все"))
                      ? "1px solid rgba(59,130,246,0.25)"
                      : "1px solid hsl(var(--border) / 0.5)",
                    color: (selectedCategory === category || (selectedCategory === null && category === "Все"))
                      ? "#60a5fa" : "hsl(var(--muted-foreground))",
                    boxShadow: (selectedCategory === category || (selectedCategory === null && category === "Все"))
                      ? "0 2px 12px rgba(59,130,246,0.1)" : "none",
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">
              Сортировка
            </p>
            <div className="flex gap-2">
              {[
                { key: "popular" as const, label: "Популярные" },
                { key: "likes" as const, label: "По лайкам" },
                { key: "recent" as const, label: "Новые" },
              ].map(s => (
                <button
                  key={s.key}
                  onClick={() => setSortBy(s.key)}
                  className="rounded-xl px-4 py-2 text-sm font-medium transition-all"
                  style={{
                    background: sortBy === s.key
                      ? "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.1))"
                      : "hsl(var(--card))",
                    border: sortBy === s.key
                      ? "1px solid rgba(59,130,246,0.25)"
                      : "1px solid hsl(var(--border) / 0.5)",
                    color: sortBy === s.key ? "#60a5fa" : "hsl(var(--muted-foreground))",
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Trending */}
        {!searchQuery && !selectedCategory && (
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="text-primary" size={20} />
              Тренды сейчас
            </h2>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {["#Дизайн", "#Фотография", "#Путешествие", "#Искусство"].map(
                (tag) => (
                  <div
                    key={tag}
                    className="rounded-2xl p-4 cursor-pointer transition-all hover:scale-[1.02]"
                    style={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border) / 0.5)",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                    }}
                  >
                    <p className="font-bold text-primary text-lg">{tag}</p>
                    <p className="text-xs text-muted-foreground mt-1">2.5M постов</p>
                  </div>
                ),
              )}
            </div>
          </div>
        )}

        {searchQuery || selectedCategory ? (
          <div className="mb-4 text-sm text-muted-foreground">
            Найдено результатов: {filteredItems.length}
          </div>
        ) : null}

        {/* Grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="break-inside-avoid mb-4 group cursor-pointer"
              >
                <div className="relative rounded-2xl overflow-hidden transition-all"
                  style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300 select-none"
                    draggable={false}
                    onContextMenu={(e) => e.preventDefault()}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <h3 className="font-semibold text-white mb-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-300 mb-2">
                      от {item.author}
                    </p>
                    <div className="flex items-center justify-between text-white text-xs">
                      <span className="px-2 py-1 rounded-full backdrop-blur-sm"
                        style={{ background: "rgba(255,255,255,0.15)" }}>
                        {item.category}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Heart size={14} />
                          {item.likes}
                        </span>
                        <span>💾 {item.saves}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-16 text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.12)" }}>
                <Sparkles className="text-primary" size={24} />
              </div>
              <p className="text-muted-foreground font-semibold mb-2">
                Ничего не найдено
              </p>
              <p className="text-xs text-muted-foreground max-w-[240px] mx-auto">
                Попробуйте другой поисковый запрос или категорию
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
