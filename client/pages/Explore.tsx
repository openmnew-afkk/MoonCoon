import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Sparkles, TrendingUp, Heart, Search } from "lucide-react";

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

  const categories = ["Все", "Дизайн", "Фотография", "Искусство", "Веб", "Путешествие"];

  const filteredItems = discoveryItems
    .filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        !selectedCategory || selectedCategory === "Все" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "likes":
          return b.likes - a.likes;
        case "recent":
          return parseInt(b.id) - parseInt(a.id);
        default:
          return b.likes + b.saves - (a.likes + a.saves);
      }
    });

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <div className="max-w-2xl mx-auto px-4 pb-28 pt-4">
        <div className="mb-4 relative">
          <Search
            className="absolute left-3.5 top-1/2 transform -translate-y-1/2"
            size={16}
            style={{ color: "var(--text-tertiary)" }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Найти контент..."
            className="ios-input"
            style={{ paddingLeft: "2.5rem" }}
          />
        </div>

        {searchQuery && (
          <div className="mb-4 flex items-center gap-2">
            <span className="ios-body" style={{ color: "var(--text-secondary)" }}>Поиск:</span>
            <span className="ios-headline" style={{ color: "var(--text-primary)" }}>
              «{searchQuery}»
            </span>
            <button
              onClick={() => setSearchQuery("")}
              className="ml-auto ios-caption touch-manipulation"
              style={{ color: "var(--text-tertiary)" }}
            >
              Сбросить
            </button>
          </div>
        )}

        <div className="mb-6 space-y-4">
          <div>
            <p className="ios-section-header">Категории</p>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((category) => {
                const isActive =
                  selectedCategory === category ||
                  (selectedCategory === null && category === "Все");
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                    className="ios-badge touch-manipulation whitespace-nowrap"
                    style={{
                      background: isActive ? "var(--bg-quaternary)" : "var(--bg-tertiary)",
                      color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                    }}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="ios-section-header">Сортировка</p>
            <div className="flex gap-2">
              {[
                { key: "popular" as const, label: "Популярные" },
                { key: "likes" as const, label: "По лайкам" },
                { key: "recent" as const, label: "Новые" },
              ].map((s) => {
                const isActive = sortBy === s.key;
                return (
                  <button
                    key={s.key}
                    onClick={() => setSortBy(s.key)}
                    className="ios-badge touch-manipulation"
                    style={{
                      background: isActive ? "var(--bg-quaternary)" : "var(--bg-tertiary)",
                      color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                    }}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {!searchQuery && !selectedCategory && (
          <div className="mb-8">
            <h2 className="ios-headline mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <TrendingUp size={20} style={{ color: "var(--text-secondary)" }} />
              Тренды сейчас
            </h2>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {["#Дизайн", "#Фотография", "#Путешествие", "#Искусство"].map((tag) => (
                <div
                  key={tag}
                  className="ios-card p-4 cursor-pointer touch-manipulation"
                >
                  <p className="ios-headline" style={{ color: "var(--text-primary)" }}>{tag}</p>
                  <p className="ios-caption">2.5M постов</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {searchQuery || selectedCategory ? (
          <div className="mb-4 ios-body" style={{ color: "var(--text-secondary)" }}>
            Найдено результатов: {filteredItems.length}
          </div>
        ) : null}

        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div key={item.id} className="break-inside-avoid mb-4 group cursor-pointer">
                <div className="relative rounded-2xl overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300 select-none"
                    draggable={false}
                    onContextMenu={(e) => e.preventDefault()}
                  />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4"
                    style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85), transparent)" }}>
                    <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                    <p className="text-xs mb-2" style={{ color: "var(--text-secondary)" }}>от {item.author}</p>
                    <div className="flex items-center justify-between text-white text-xs">
                      <span className="px-2 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }}>
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
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "var(--bg-tertiary)" }}
              >
                <Sparkles size={24} style={{ color: "var(--text-tertiary)" }} />
              </div>
              <p className="ios-headline mb-2" style={{ color: "var(--text-secondary)" }}>
                Ничего не найдено
              </p>
              <p className="ios-caption max-w-[240px] mx-auto">
                Попробуйте другой поисковый запрос или категорию
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
