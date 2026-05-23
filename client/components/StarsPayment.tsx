import { useState } from "react";
import { Star, ArrowUpRight, Loader2 } from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/brand";

interface StarsPaymentProps {
  userId: string;
  currentStars?: number;
  onSuccess?: () => void;
}

export default function StarsPayment({
  userId,
  currentStars = 0,
  onSuccess,
}: StarsPaymentProps) {
  const { webApp } = useTelegram();
  const [amount, setAmount] = useState(100);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState(100);
  const [buying, setBuying] = useState(false);

  const packages = [50, 100, 250, 500, 1000];

  const handlePurchase = async () => {
    if (!userId || userId === "0") {
      webApp?.showAlert?.("Войдите через Telegram");
      return;
    }
    setBuying(true);
    try {
      const res = await fetch("/api/stars/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, amount }),
      });
      const data = await res.json();

      if (!res.ok) {
        webApp?.showAlert?.(data.error || "Покупка недоступна. Проверьте BOT_TOKEN на сервере.");
        return;
      }

      if (webApp?.openInvoice) {
        webApp.openInvoice(data.invoiceLink, async (status) => {
          if (status === "paid") {
            await fetch("/api/stars/confirm-purchase", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId, amount }),
            });
            webApp.showAlert?.(`Зачислено ${amount} ⭐ на баланс ${APP_NAME}`);
            webApp.HapticFeedback?.notificationOccurred("success");
            onSuccess?.();
          }
          setBuying(false);
        });
      } else {
        webApp?.showAlert?.("Оплата доступна только внутри Telegram");
        setBuying(false);
      }
    } catch {
      webApp?.showAlert?.("Ошибка сети");
      setBuying(false);
    }
  };

  const handleWithdraw = async () => {
    if (withdrawAmount < 100) {
      webApp?.showAlert?.("Минимум 100 звёзд");
      return;
    }
    if (withdrawAmount > currentStars) {
      webApp?.showAlert?.("Недостаточно звёзд");
      return;
    }
    const res = await fetch("/api/stars/withdraw", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, amount: withdrawAmount }),
    });
    if (res.ok) {
      const data = await res.json();
      webApp?.showAlert?.(
        `Заявка принята: ${data.withdrawn} ⭐ (комиссия ${data.commission} ⭐)`,
      );
      setShowWithdraw(false);
      onSuccess?.();
    } else {
      const err = await res.json();
      webApp?.showAlert?.(err.error || "Ошибка вывода");
    }
  };

  return (
    <div className="space-y-5">
      <div className="text-center py-4 rounded-2xl bg-muted/50 border border-border">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Баланс</p>
        <p className="text-4xl font-bold flex items-center justify-center gap-2">
          <Star className="text-primary fill-primary" size={28} />
          {currentStars}
        </p>
        <p className="text-[11px] text-muted-foreground mt-2">
          Оплата через официальные Telegram Stars (XTR)
        </p>
      </div>

      {!showWithdraw ? (
        <>
          <div>
            <p className="text-sm font-semibold mb-3">Купить звёзды</p>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {packages.map(pkg => (
                <button
                  key={pkg}
                  type="button"
                  onClick={() => setAmount(pkg)}
                  className={cn(
                    "py-2.5 rounded-xl text-sm font-medium border",
                    amount === pkg
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border bg-card",
                  )}
                >
                  {pkg}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={handlePurchase}
              disabled={buying}
              className="btn-premium w-full py-3.5 text-sm flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {buying ? <Loader2 size={18} className="animate-spin" /> : <Star size={18} className="fill-current" />}
              Купить {amount} ⭐ в Telegram
            </button>
          </div>
          <button
            type="button"
            onClick={() => setShowWithdraw(true)}
            className="w-full py-3 rounded-xl border border-border text-sm text-muted-foreground flex items-center justify-center gap-2"
          >
            <ArrowUpRight size={16} /> Вывести звёзды
          </button>
        </>
      ) : (
        <div className="space-y-3">
          <p className="text-sm font-semibold">Вывод</p>
          <input
            type="number"
            min={100}
            max={currentStars}
            value={withdrawAmount}
            onChange={e => setWithdrawAmount(Number(e.target.value))}
            className="w-full rounded-xl px-4 py-3 bg-muted border-0 text-sm"
          />
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowWithdraw(false)} className="flex-1 py-3 rounded-xl bg-muted text-sm">Отмена</button>
            <button type="button" onClick={handleWithdraw} className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">Вывести</button>
          </div>
        </div>
      )}
    </div>
  );
}
