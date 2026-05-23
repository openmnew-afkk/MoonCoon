import { useState, useEffect } from "react";
import { Star, Check, Video, Sparkles, CreditCard } from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";
import PremiumBadge from "./PremiumBadge";

interface PremiumPurchaseProps {
  userId: string;
  currentStars: number;
  onSuccess?: () => void;
}

interface PublicSettings {
  premiumPriceRub: number;
  premiumPriceStars: number;
  cardPaymentEnabled: boolean;
  starsPaymentEnabled: boolean;
}

export default function PremiumPurchase({
  userId,
  currentStars,
  onSuccess,
}: PremiumPurchaseProps) {
  const { webApp } = useTelegram();
  const [loading, setLoading] = useState<string | null>(null);
  const [settings, setSettings] = useState<PublicSettings>({
    premiumPriceRub: 250,
    premiumPriceStars: 150,
    cardPaymentEnabled: true,
    starsPaymentEnabled: true,
  });

  useEffect(() => {
    fetch("/api/settings/public")
      .then((r) => r.json())
      .then((d) => setSettings(d))
      .catch(() => {});
  }, []);

  const benefits = [
    "Все функции приложения",
    "Видео до 5 минут",
    "Чат с Lyra — живой AI-помощник",
    "Эксклюзивные функции",
    "Без рекламы",
    "Приоритет в ленте",
  ];

  const purchase = async (method: "stars" | "card") => {
    if (method === "stars" && currentStars < settings.premiumPriceStars) {
      webApp?.showAlert(
        `Нужно ${settings.premiumPriceStars} ⭐ (у вас ${currentStars})`,
      );
      return;
    }

    setLoading(method);
    try {
      const response = await fetch("/api/premium/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          duration: 30,
          paymentMethod: method,
        }),
      });

      if (response.ok) {
        webApp?.showAlert(
          method === "card"
            ? "Premium активирован! Оплата картой принята (демо)."
            : "Premium на 30 дней активирован! 🎉",
        );
        onSuccess?.();
      } else {
        const err = await response.json();
        webApp?.showAlert(err.error || "Ошибка покупки");
      }
    } catch {
      webApp?.showAlert("Ошибка сети");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="glass-surface-v2 p-6 rounded-2xl border border-primary/20">
        <div className="flex items-center gap-2 mb-3">
          <PremiumBadge size="md" />
          <h3 className="text-xl font-bold">Vexora Premium</h3>
        </div>
        <p className="text-3xl font-black text-primary mb-1">
          {settings.premiumPriceRub} ₽
          <span className="text-base font-medium text-muted-foreground">
            {" "}
            / месяц
          </span>
        </p>
        <p className="text-caption mb-1">или</p>
        <p className="text-xl font-bold text-amber-400 mb-4">
          {settings.premiumPriceStars} ⭐
          <span className="text-base font-medium text-muted-foreground"> / месяц</span>
        </p>
        <p className="text-caption mb-4">Единый тариф · без разделения на блогеров</p>

        <div className="space-y-2 mb-5">
          {benefits.map((b) => (
            <div key={b} className="flex items-center gap-2">
              <Check className="text-emerald-500 shrink-0" size={16} />
              <span className="text-xs text-muted-foreground">{b}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 text-sm text-primary mb-4">
          <Video size={16} />
          <span>Видео до 5 минут</span>
        </div>

        <div className="space-y-2">
          {settings.starsPaymentEnabled && (
            <button
              type="button"
              onClick={() => purchase("stars")}
              disabled={loading !== null}
              className="w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 bg-primary/15 text-primary border border-primary/30 disabled:opacity-50"
            >
              {loading === "stars" ? (
                "Обработка…"
              ) : (
                <>
                  <Star className="fill-amber-400 text-amber-400" size={18} />
                  {settings.premiumPriceStars} ⭐ / месяц
                </>
              )}
            </button>
          )}
          {settings.cardPaymentEnabled && (
            <button
              type="button"
              onClick={() => purchase("card")}
              disabled={loading !== null}
              className="w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white disabled:opacity-50"
            >
              {loading === "card" ? (
                "Обработка…"
              ) : (
                <>
                  <CreditCard size={18} />
                  Картой · {settings.premiumPriceRub} ₽
                </>
              )}
            </button>
          )}
        </div>

        {settings.starsPaymentEnabled &&
          currentStars < settings.premiumPriceStars && (
            <p className="text-xs text-destructive mt-2 text-center">
              Не хватает {settings.premiumPriceStars - currentStars} ⭐
            </p>
          )}
      </div>

      <div className="glass-card p-4 rounded-xl text-center">
        <p className="text-caption mb-1">Баланс звёзд</p>
        <p className="text-2xl font-bold text-primary">{currentStars} ⭐</p>
      </div>
    </div>
  );
}
