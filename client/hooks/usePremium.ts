import { useState, useEffect } from "react";
import { useTelegram } from "./useTelegram";

export interface PremiumStatus {
  isPremium: boolean;
  expiresAt: string | null;
  isTrial: boolean;
  type?: "standard" | "blogger";
  videoDuration?: number; // в секундах
}

export function usePremium() {
  const { user } = useTelegram();
  const [premium, setPremium] = useState<PremiumStatus>({
    isPremium: false,
    expiresAt: null,
    isTrial: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPremiumStatus = async () => {
      if (user?.id) {
        try {
          const response = await fetch(`/api/users/${user.id}/premium`);
          if (response.ok) {
            const data = await response.json();
            setPremium(data);
          }
        } catch (error) {
          console.error("Ошибка загрузки премиум статуса:", error);
        }
      }
      setLoading(false);
    };

    loadPremiumStatus();
  }, [user]);

  return { premium, loading, setPremium };
}

