import { useState } from "react";
import { Star, ArrowUpRight } from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";
import { cn } from "@/lib/utils";

interface StarsPaymentProps {
  userId: string;
  currentStars?: number;
  onSuccess?: () => void;
}

export default function StarsPayment({ userId, currentStars = 0, onSuccess }: StarsPaymentProps) {
  const { webApp } = useTelegram();
  const [amount, setAmount] = useState<number>(100);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(100);

  const handlePurchase = async () => {
    if (!webApp) {
      alert("Telegram Web App не инициализирован");
      return;
    }

    try {
      // Открываем официальную страницу покупки звезд Telegram
      // Используем прямой deep link для покупки звезд
      const starsPurchaseUrl = `https://t.me/premium?ref=stars`;
      
      // Открываем через Telegram Mini App API
      try {
        if (webApp.openLink) {
          webApp.openLink(starsPurchaseUrl);
        } else if (webApp.openTelegramLink) {
          webApp.openTelegramLink(starsPurchaseUrl);
        } else {
          // Fallback: открываем в новом окне
          window.open(starsPurchaseUrl, '_blank');
        }
      } catch (error) {
        // Альтернативный способ
        window.location.href = starsPurchaseUrl;
      }
      
      // После покупки пользователь вернется в приложение
      // Можно показать инструкцию
      webApp.showAlert(
        `Открыта страница покупки ${amount} звезд Telegram.\n\nПосле покупки звезды будут автоматически добавлены на ваш баланс.`,
        () => {
          // Обновляем баланс после возврата
          setTimeout(() => {
            onSuccess?.();
          }, 2000);
        }
      );
    } catch (error) {
      console.error("Ошибка при открытии покупки звезд:", error);
      webApp?.showAlert("Ошибка при открытии страницы покупки. Попробуйте позже.");
    }
  };

  const handleWithdraw = async () => {
    if (withdrawAmount < 100) {
      webApp?.showAlert("Минимальная сумма вывода: 100 звезд");
      return;
    }

    if (withdrawAmount > currentStars) {
      webApp?.showAlert("Недостаточно звезд на балансе");
      return;
    }

    const commission = Math.floor(withdrawAmount * 0.1); // 10% комиссия
    const finalAmount = withdrawAmount - commission;

    try {
      // Отправляем запрос на вывод
      const response = await fetch("/api/stars/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          amount: withdrawAmount,
          commission,
          finalAmount,
        }),
      });

      if (response.ok) {
        webApp?.showAlert(
          `Запрос на вывод ${finalAmount} звезд отправлен. Комиссия: ${commission} звезд (10%)`
        );
        setShowWithdraw(false);
        onSuccess?.();
      } else {
        webApp?.showAlert("Ошибка при выводе звезд. Попробуйте позже.");
      }
    } catch (error) {
      console.error("Ошибка при выводе звезд:", error);
      webApp?.showAlert("Ошибка при выводе звезд. Попробуйте позже.");
    }
  };

  const packages = [100, 250, 500, 1000, 2500, 5000];

  return (
    <div className="space-y-6">
      {/* Текущий баланс - Красивая карточка */}
      <div className="relative glass-card p-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/20 to-primary/20 opacity-50"></div>
        <div className="relative">
          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Ваш баланс</p>
          <div className="flex items-center justify-center gap-3 mb-2">
            <Star className="text-primary fill-primary" size={32} />
            <p className="text-4xl font-bold text-primary">{currentStars}</p>
          </div>
          <p className="text-xs text-muted-foreground">звезд доступно</p>
        </div>
      </div>

      {!showWithdraw ? (
        <>
          {/* Покупка звезд */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Star className="text-primary fill-primary" size={20} />
              <p className="text-base font-semibold">Купить звезды</p>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {packages.map((pkg) => (
                <button
                  key={pkg}
                  onClick={() => setAmount(pkg)}
                  className={cn(
                    "glass-button py-3 text-sm font-medium transition-all rounded-xl",
                    amount === pkg
                      ? "bg-primary/20 text-primary border-2 border-primary shadow-lg shadow-primary/30"
                      : "hover:bg-glass-light/40"
                  )}
                >
                  {pkg}
                </button>
              ))}
            </div>
            <button
              onClick={handlePurchase}
              className="w-full glass-button bg-primary/20 text-primary hover:bg-primary/30 font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20"
            >
              <Star className="fill-primary" size={20} />
              Купить {amount} звезд
            </button>
          </div>

          {/* Вывод */}
          <div className="border-t border-glass-light/20 pt-4">
            <button
              onClick={() => setShowWithdraw(true)}
              className="w-full glass-button py-3 rounded-xl flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground hover:bg-glass-light/40 transition-all"
            >
              <ArrowUpRight size={18} />
              Вывести звезды
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Форма вывода */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <ArrowUpRight className="text-primary" size={20} />
              <p className="text-base font-semibold">Вывести звезды</p>
            </div>
            <div className="mb-4">
              <label className="text-sm font-medium mb-2 block">
                Сумма (мин. 100 звезд)
              </label>
              <input
                type="number"
                min="100"
                max={currentStars}
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                className="w-full glass-morphism rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50 mb-3"
                placeholder="100"
              />
              {withdrawAmount >= 100 && (
                <div className="glass-morphism rounded-xl p-3 text-sm space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">К получению:</span>
                    <span className="font-semibold text-primary">{Math.floor(withdrawAmount * 0.9)} ⭐</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Комиссия (10%):</span>
                    <span className="text-muted-foreground">{Math.floor(withdrawAmount * 0.1)} ⭐</span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowWithdraw(false)}
                className="flex-1 glass-button py-3 rounded-xl text-sm hover:bg-glass-light/40 transition-all"
              >
                Отмена
              </button>
              <button
                onClick={handleWithdraw}
                disabled={withdrawAmount < 100 || withdrawAmount > currentStars}
                className="flex-1 glass-button bg-primary/20 text-primary hover:bg-primary/30 py-3 rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Вывести
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

