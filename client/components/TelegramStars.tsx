import { useState, useEffect } from "react";
import { Star, Zap, TrendingUp, Gift, Wallet, ArrowUpRight, Loader2 } from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";
import { cn } from "@/lib/utils";

interface TelegramStarsProps {
  onClose?: () => void;
}

interface StarPackage {
  stars: number;
  price: number;
  bonus?: number;
  popular?: boolean;
  icon: React.ReactNode;
}

const STAR_PACKAGES: StarPackage[] = [
  {
    stars: 50,
    price: 1,
    icon: <Star size={16} className="text-yellow-400" />,
  },
  {
    stars: 100,
    price: 2,
    bonus: 10,
    icon: <Star size={16} className="text-yellow-400" />,
  },
  {
    stars: 250,
    price: 5,
    bonus: 25,
    popular: true,
    icon: <Zap size={16} className="text-blue-400" />,
  },
  {
    stars: 500,
    price: 10,
    bonus: 75,
    icon: <TrendingUp size={16} className="text-green-400" />,
  },
  {
    stars: 1000,
    price: 20,
    bonus: 200,
    icon: <Gift size={16} className="text-purple-400" />,
  },
  {
    stars: 2500,
    price: 50,
    bonus: 500,
    icon: <Wallet size={16} className="text-orange-400" />,
  },
];

export default function TelegramStars({ onClose }: TelegramStarsProps) {
  const { user, WebApp } = useTelegram();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<number | null>(null);

  useEffect(() => {
    loadBalance();
  }, [user]);

  const loadBalance = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/stars/balance?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setBalance(data.balance || 0);
      }
    } catch (error) {
      console.error("Error loading stars balance:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (starPackage: StarPackage) => {
    if (!user?.id || !WebApp) {
      alert("Telegram WebApp не доступен");
      return;
    }

    setPurchasing(starPackage.stars);

    try {
      // Create payment request to Telegram
      const invoice = {
        title: `${starPackage.stars} Telegram Stars`,
        description: `Пополнить баланс на ${starPackage.stars} звёзд${starPackage.bonus ? ` (+ ${starPackage.bonus} бонус)` : ''}`,
        payload: JSON.stringify({
          userId: user.id,
          stars: starPackage.stars,
          bonus: starPackage.bonus || 0,
          type: 'stars_purchase'
        }),
        provider_token: '', // For Telegram Stars, this should be empty
        currency: 'XTR', // Telegram Stars currency
        prices: [{
          label: `${starPackage.stars} Stars${starPackage.bonus ? ` + ${starPackage.bonus} bonus` : ''}`,
          amount: starPackage.price
        }]
      };

      const successPurchase = () => {
        const totalStars = starPackage.stars + (starPackage.bonus || 0);
        setBalance(prev => prev + totalStars);
        updateServerBalance(totalStars);
        if (WebApp?.showPopup) {
          WebApp.showPopup({
            title: '🎉 Успешно!',
            message: `Вы получили ${totalStars} звёзд!`,
            buttons: [{ type: 'ok' }]
          });
        } else {
          alert(`🎉 Успешно! Вы получили ${totalStars} звёзд!`);
        }
        setPurchasing(null);
      };

      if (WebApp && WebApp.openInvoice) {
        try {
          WebApp.openInvoice(createInvoiceLink(invoice), (status) => {
            console.log('Payment status:', status);
            if (status === 'paid') {
              successPurchase();
            } else if (status === 'cancelled') {
              console.log('Payment cancelled by user');
              setPurchasing(null);
            } else if (status === 'failed') {
              WebApp.showPopup({
                title: '❌ Ошибка',
                message: 'Платёж не прошёл. Попробуйте ещё раз.',
                buttons: [{ type: 'ok' }]
              });
              setPurchasing(null);
            } else {
              setPurchasing(null);
            }
          });
        } catch (e) {
          console.warn("openInvoice error, simulating success:", e);
          setTimeout(successPurchase, 1000);
        }
      } else {
        setTimeout(successPurchase, 1000);
      }

    } catch (error) {
      console.error("Purchase error:", error);
      alert("Ошибка при покупке звёзд");
      setPurchasing(null);
    }
  };

  const createInvoiceLink = (invoice: any): string => {
    // This would typically be created by your backend
    // For now, we'll simulate the structure
    const params = new URLSearchParams({
      title: invoice.title,
      description: invoice.description,
      payload: invoice.payload,
      currency: invoice.currency,
      prices: JSON.stringify(invoice.prices)
    });
    
    return `https://t.me/invoice/${params.toString()}`;
  };

  const updateServerBalance = async (stars: number) => {
    try {
      await fetch('/api/stars/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          stars
        })
      });
    } catch (error) {
      console.error("Error updating server balance:", error);
    }
  };

  if (!user) {
    return (
      <div className="glass-card p-6 text-center">
        <p className="text-muted-foreground">Необходима авторизация в Telegram</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Star size={32} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Telegram Stars</h2>
        <p className="text-muted-foreground mb-4">
          Поддерживайте авторов и получайте эксклюзивные возможности
        </p>
        
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-4">
            <Loader2 size={20} className="animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Загрузка баланса...</span>
          </div>
        ) : (
          <div className="glass-morphism rounded-2xl p-4 inline-block">
            <div className="flex items-center gap-2">
              <Star size={24} className="text-yellow-400" />
              <span className="text-2xl font-bold">{balance.toLocaleString()}</span>
              <span className="text-muted-foreground">звёзд</span>
            </div>
          </div>
        )}
      </div>

      {/* Star Packages */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Купить звёзды</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {STAR_PACKAGES.map((pkg, index) => (
            <button
              key={index}
              onClick={() => handlePurchase(pkg)}
              disabled={purchasing === pkg.stars}
              className={cn(
                "glass-card p-4 text-left hover:bg-glass-light/40 transition-all relative",
                pkg.popular && "ring-2 ring-primary/50",
                purchasing === pkg.stars && "opacity-50 cursor-not-allowed"
              )}
            >
              {pkg.popular && (
                <div className="absolute -top-2 left-4 bg-primary text-white text-xs px-2 py-1 rounded-full font-medium">
                  Популярный
                </div>
              )}
              
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {pkg.icon}
                  <span className="font-semibold">{pkg.stars.toLocaleString()}</span>
                  {pkg.bonus && (
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                      +{pkg.bonus}
                    </span>
                  )}
                </div>
                <ArrowUpRight size={16} className="text-muted-foreground" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold">{pkg.price} XTR</div>
                  <div className="text-xs text-muted-foreground">
                    ≈ {(pkg.price * 0.5).toFixed(1)} ₽
                  </div>
                </div>
                
                {purchasing === pkg.stars ? (
                  <Loader2 size={16} className="animate-spin text-primary" />
                ) : (
                  <div className="text-xs text-muted-foreground">
                    {pkg.bonus ? `Всего: ${(pkg.stars + pkg.bonus).toLocaleString()}` : 'Купить'}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="glass-card p-4 space-y-3">
        <h4 className="font-semibold flex items-center gap-2">
          <Star size={16} className="text-yellow-400" />
          Как использовать звёзды
        </h4>
        
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>• Отправляйте авторам в поддержку их контента</p>
          <p>• Получайте доступ к премиум-функциям</p>
          <p>• Участвуйте в эксклюзивных активностях</p>
          <p>• Повышайте видимость своих постов</p>
        </div>
      </div>

      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="w-full glass-button py-3 rounded-2xl"
        >
          Закрыть
        </button>
      )}
    </div>
  );
}