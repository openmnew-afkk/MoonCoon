import { useState, useEffect } from "react";
import { Sparkles, Check, Star, Video, Brain, Zap } from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";
import PremiumBadge from "./PremiumBadge";

interface PremiumPurchaseProps {
  userId: string;
  currentStars: number;
  onSuccess?: () => void;
}

type PremiumType = "standard" | "blogger";

export default function PremiumPurchase({ userId, currentStars, onSuccess }: PremiumPurchaseProps) {
  const { webApp } = useTelegram();
  const [loading, setLoading] = useState<string | null>(null);

  const premiumPlans = [
    {
      type: "standard" as PremiumType,
      name: "Premium",
      price: 120,
      videoDuration: 5, // минут
      benefits: [
        "Все функции приложения",
        "Видео до 5 минут",
        "AI помощник Gemini",
        "Редактирование фото с NanoBonano",
        "Приоритетная поддержка",
        "Нет рекламы",
        "Расширенная аналитика",
      ],
      popular: false,
    },
    {
      type: "blogger" as PremiumType,
      name: "Premium Blogger",
      price: 180,
      videoDuration: 18, // минут
      benefits: [
        "Все функции Premium",
        "Видео до 18 минут",
        "AI помощник Gemini",
        "Редактирование фото с NanoBonano",
        "Приоритетная поддержка",
        "Нет рекламы",
        "Расширенная аналитика",
        "Эксклюзивные инструменты для блогеров",
      ],
      popular: true,
    },
  ];

  const handlePurchase = async (planType: PremiumType, price: number) => {
    if (currentStars < price) {
      webApp?.showAlert(`Недостаточно звезд. Нужно ${price} ⭐ для ${planType === "standard" ? "Premium" : "Premium Blogger"} на месяц`);
      return;
    }

    setLoading(planType);
    try {
      const response = await fetch("/api/premium/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          amount: price,
          duration: 30, // дней
          type: planType,
        }),
      });

      if (response.ok) {
        webApp?.showAlert(`Premium успешно активирован на 30 дней! 🎉`);
        onSuccess?.();
      } else {
        const error = await response.json();
        webApp?.showAlert(error.error || "Ошибка при покупке Premium. Попробуйте позже.");
      }
    } catch (error) {
      console.error("Ошибка:", error);
      webApp?.showAlert("Ошибка при покупке Premium. Попробуйте позже.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Premium Plans */}
      <div className="grid gap-4">
        {premiumPlans.map((plan) => (
          <div
            key={plan.type}
            className={`glass-card p-6 rounded-xl relative ${
              plan.popular ? "border-2 border-yellow-500/50 bg-gradient-to-br from-yellow-500/10 to-orange-500/10" : ""
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black text-xs font-bold px-3 py-1 rounded-full">
                  Популярный
                </span>
              </div>
            )}

            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <PremiumBadge size="md" />
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Star className="text-yellow-400 fill-yellow-400" size={24} />
                  <span className="text-3xl font-bold text-primary">{plan.price}</span>
                  <span className="text-muted-foreground">⭐/месяц</span>
                </div>
              </div>
            </div>

            {/* Key Features */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                <Video size={16} />
                Видео до {plan.videoDuration} минут
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                <Brain size={16} />
                AI помощник Gemini
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                <Sparkles size={16} />
                Редактирование с NanoBonano
              </div>
            </div>

            {/* All Benefits */}
            <div className="border-t border-glass-light/10 pt-4 mb-4">
              <h4 className="text-sm font-semibold mb-3">Что включено:</h4>
              <div className="space-y-2">
                {plan.benefits.map((benefit, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Check className="text-green-500 flex-shrink-0" size={16} />
                    <span className="text-xs text-muted-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Purchase Button */}
            <button
              onClick={() => handlePurchase(plan.type, plan.price)}
              disabled={loading !== null || currentStars < plan.price}
              className={`w-full glass-button py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                plan.popular
                  ? "bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-red-500/20 hover:from-yellow-500/30 hover:via-orange-500/30 hover:to-red-500/30 border border-yellow-500/30 text-yellow-400"
                  : "bg-primary/20 text-primary hover:bg-primary/30"
              }`}
            >
              {loading === plan.type ? (
                "Обработка..."
              ) : (
                <>
                  <Star className="fill-yellow-400" size={18} />
                  Купить за {plan.price} ⭐
                </>
              )}
            </button>

            {currentStars < plan.price && (
              <p className="text-xs text-red-400 mt-2 text-center">
                Не хватает {plan.price - currentStars} ⭐
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Balance Info */}
      <div className="glass-card p-4 rounded-xl text-center">
        <p className="text-sm text-muted-foreground mb-1">Ваш баланс звезд</p>
        <p className="text-2xl font-bold text-primary">{currentStars} ⭐</p>
      </div>
    </div>
  );
}
