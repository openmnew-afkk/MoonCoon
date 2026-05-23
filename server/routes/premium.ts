import { RequestHandler } from "express";
import { getAppSettings } from "../store/app-settings";

interface PremiumPurchaseRequest {
  userId: string;
  amount?: number;
  duration?: number;
  paymentMethod?: "stars" | "card";
}

const premiumUsers: Record<
  string,
  {
    expiresAt: Date;
    isTrial: boolean;
    createdAt: Date;
  }
> = {};

const MAX_VIDEO_PREMIUM = 5 * 60;

export const handlePremiumPurchase: RequestHandler = async (req, res) => {
  try {
    const {
      userId,
      duration = 30,
      paymentMethod = "stars",
    }: PremiumPurchaseRequest = req.body;

    const settings = getAppSettings();

    if (!userId) {
      return res.status(400).json({ error: "userId обязателен" });
    }

    if (paymentMethod === "card" && !settings.cardPaymentEnabled) {
      return res.status(400).json({ error: "Оплата картой отключена" });
    }
    if (paymentMethod === "stars" && !settings.starsPaymentEnabled) {
      return res.status(400).json({ error: "Оплата звёздами отключена" });
    }

    if (paymentMethod === "stars") {
      const { getUserBalance, deductStars } = await import("../store/stars-store");
      const price = settings.premiumPriceStars;
      const balance = getUserBalance(userId);
      if (balance < price) {
        return res.status(400).json({
          error: `Недостаточно звёзд. Нужно ${price} ⭐`,
        });
      }
      deductStars(userId, price);
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + duration);

    premiumUsers[userId] = {
      expiresAt,
      isTrial: false,
      createdAt: new Date(),
    };

    res.json({
      success: true,
      premium: {
        isPremium: true,
        expiresAt: expiresAt.toISOString(),
        isTrial: false,
        videoDuration: MAX_VIDEO_PREMIUM,
      },
      priceRub: settings.premiumPriceRub,
      paymentMethod,
    });
  } catch (error) {
    console.error("Ошибка при покупке Premium:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
};

export const handlePremiumStatus: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: "userId обязателен" });
    }

    const settings = getAppSettings();
    const premiumData = premiumUsers[userId];
    const now = new Date();

    if (!premiumData) {
      res.json({
        isPremium: false,
        expiresAt: null,
        isTrial: false,
        priceRub: settings.premiumPriceRub,
        priceStars: settings.premiumPriceStars,
        cardPaymentEnabled: settings.cardPaymentEnabled,
        starsPaymentEnabled: settings.starsPaymentEnabled,
      });
      return;
    }

    if (premiumData.expiresAt > now) {
      res.json({
        isPremium: true,
        expiresAt: premiumData.expiresAt.toISOString(),
        isTrial: premiumData.isTrial,
        videoDuration: MAX_VIDEO_PREMIUM,
        priceRub: settings.premiumPriceRub,
        priceStars: settings.premiumPriceStars,
        cardPaymentEnabled: settings.cardPaymentEnabled,
        starsPaymentEnabled: settings.starsPaymentEnabled,
      });
    } else {
      delete premiumUsers[userId];
      res.json({
        isPremium: false,
        expiresAt: null,
        isTrial: false,
        priceRub: settings.premiumPriceRub,
        priceStars: settings.premiumPriceStars,
      });
    }
  } catch (error) {
    console.error("Ошибка получения статуса Premium:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
};
