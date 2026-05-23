import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Sparkles, TrendingUp, Heart } from "lucide-react";
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

// Пустой массив - контент будет добавляться пользователями
const discoveryItems: DiscoveryItem[] = [];

export default function Explore() {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"popular" | "recent" | "likes">("popular");

  // Sync with URL params when navigation happens
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
        case "likes":
          return b.likes - a.likes;
        case "recent":
          return parseInt(b.id) - parseInt(a.id);
        case "popular":
        default:
          return b.likes + b.saves - (a.likes + a.saves);
      }
    });

  return (
    <div className="min-h-screen bg-background">
      <div
        className="max-w-2xl mx-auto px-4 pb-28 pt-4"
      >
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
          {/* Category Filter */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Категории
            </p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() =>
                    setSelectedCategory(
                      selectedCategory === category ? null : category,
                    )
                  }
                  className={cn(
                    "glass-button rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-all",
                    selectedCategory === category ||
                      (selectedCategory === null && category === "Все")
                      ? "bg-primary/20 text-primary"
                      : "opacity-70 hover:opacity-100",
                  )}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Filter */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Сортировка
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy("popular")}
                className={cn(
                  "glass-button rounded-xl px-4 py-2 text-sm font-medium transition-all",
                  sortBy === "popular" ? "bg-primary/20 text-primary" : "",
                )}
              >
                Популярные
              </button>
              <button
                onClick={() => setSortBy("likes")}
                className={cn(
                  "glass-button rounded-xl px-4 py-2 text-sm font-medium transition-all",
                  sortBy === "likes" ? "bg-primary/20 text-primary" : "",
                )}
              >
                По лайкам
              </button>
              <button
                onClick={() => setSortBy("recent")}
                className={cn(
                  "glass-button rounded-xl px-4 py-2 text-sm font-medium transition-all",
                  sortBy === "recent" ? "bg-primary/20 text-primary" : "",
                )}
              >
                Новые
              </button>
            </div>
          </div>
        </div>

        {/* Trending/Popular Section */}
        {!searchQuery && !selectedCategory && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="text-primary" size={20} />
              Тренды сейчас
            </h2>
            <div className="grid grid-cols-2 gap-4 mb-8">
              {["#Дизайн", "#Фотография", "#Путешествие", "#Искусство"].map(
                (tag) => (
                  <div
                    key={tag}
                    className="glass-card hover:bg-glass-light/40 cursor-pointer transition-all"
                  >
                    <p className="font-semibold text-accent text-lg">{tag}</p>
                    <p className="text-xs text-muted-foreground">2.5M постов</p>
                  </div>
                ),
              )}
            </div>
          </div>
        )}

        {/* Results Count */}
        {searchQuery || selectedCategory ? (
          <div className="mb-4 text-sm text-muted-foreground">
            Найдено результатов: {filteredItems.length}
          </div>
        ) : null}

        {/* Pinterest-Style Grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="break-inside-avoid mb-4 group cursor-pointer"
              >
                <div className="relative rounded-2xl overflow-hidden glass-morphism hover:glass-morphism transition-all">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300 select-none"
                    draggable={false}
                    onContextMenu={(e) => e.preventDefault()}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <h3 className="font-semibold text-white mb-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-300 mb-2">
                      от {item.author}
                    </p>
                    <div className="flex items-center justify-between text-white text-xs">
                      <span className="px-2 py-1 bg-white/20 rounded-full backdrop-blur-sm">
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
            <div className="col-span-full py-12 text-center">
              <Sparkles
                className="mx-auto text-muted-foreground mb-4"
                size={40}
              />
              <p className="text-muted-foreground font-medium mb-2">
                Ничего не найдено
              </p>
              <p className="text-xs text-muted-foreground">
                Попробуйте другой поисковый запрос или категорию
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
