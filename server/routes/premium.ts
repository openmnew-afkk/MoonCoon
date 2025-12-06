import { RequestHandler } from "express";
import User from "../models/User";

interface PremiumPurchaseRequest {
  userId: string;
  amount: number;
  duration: number; // дни
  type?: "standard" | "blogger"; // тип премиум
}

export const handlePremiumPurchase: RequestHandler = async (req, res) => {
  try {
    const {
      userId,
      amount,
      duration,
      type = "standard",
    }: PremiumPurchaseRequest = req.body;

    // Проверяем валидность суммы
    const validAmounts = [120, 180]; // standard: 120, blogger: 180
    if (!userId || !validAmounts.includes(amount)) {
      return res.status(400).json({
        error:
          "Неверные параметры запроса. Допустимые суммы: 120 или 180 звезд",
      });
    }

    const user = await User.findOne({ telegramId: userId });
    if (!user) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    // Проверяем баланс
    if (user.starsBalance < amount) {
      return res.status(400).json({ error: "Недостаточно звезд" });
    }

    // Списываем звезды
    user.starsBalance -= amount;

    // Активируем Premium
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + duration);

    const premiumType = amount === 180 ? "blogger" : "standard";
    const videoDuration = premiumType === "blogger" ? 18 * 60 : 5 * 60; // в секундах

    user.premium = {
      isPremium: true,
      expiresAt,
      isTrial: false,
      type: premiumType,
      videoDuration,
    };

    await user.save();

    res.json({
      success: true,
      premium: user.premium,
      balance: user.starsBalance,
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

    const user = await User.findOne({ telegramId: userId });
    if (!user) {
      // If user not found, we can't really give them a trial unless we create them, 
      // but usually this endpoint is called for existing users.
      // Let's just return not premium.
      return res.json({
        isPremium: false,
        expiresAt: null,
        isTrial: false,
      });
    }

    const now = new Date();

    // Check if premium exists
    if (!user.premium || !user.premium.isPremium) {
      // Check for trial eligibility? 
      // For now, let's say if they never had premium (or trial), give them trial?
      // Or just stick to the demo logic: if no premium data, give trial.

      // NOTE: In a real app, we'd track if they ALREADY had a trial.
      // Here we just check if premium is set.

      if (!user.premium) {
        const trialExpiresAt = new Date();
        trialExpiresAt.setDate(trialExpiresAt.getDate() + 7);

        user.premium = {
          isPremium: true,
          expiresAt: trialExpiresAt,
          isTrial: true,
          type: "standard",
          videoDuration: 5 * 60,
        };
        await user.save();

        return res.json(user.premium);
      }

      return res.json({
        isPremium: false,
        expiresAt: null,
        isTrial: false,
      });
    }

    // Проверяем, не истек ли Premium
    if (user.premium.expiresAt && new Date(user.premium.expiresAt) > now) {
      res.json(user.premium);
    } else {
      // Premium истек
      user.premium.isPremium = false;
      await user.save();

      res.json({
        isPremium: false,
        expiresAt: null,
        isTrial: false,
      });
    }
  } catch (error) {
    console.error("Ошибка получения статуса Premium:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
};

