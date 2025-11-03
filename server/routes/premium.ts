import { RequestHandler } from "express";

interface PremiumPurchaseRequest {
  userId: string;
  amount: number;
  duration: number; // дни
  type?: "standard" | "blogger"; // тип премиум
}

// В реальном приложении здесь должна быть работа с БД
const premiumUsers: Record<
  string,
  {
    expiresAt: Date;
    isTrial: boolean;
    createdAt: Date;
    type: "standard" | "blogger";
    videoDuration: number;
  }
> = {};

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

    // Импортируем функции из stars.ts
    // В реальном приложении это должно быть через общую БД с транзакциями
    const { getUserBalance, deductStars } = require("./stars");

    // Проверяем баланс
    const currentBalance = getUserBalance(userId);
    if (currentBalance < amount) {
      return res.status(400).json({ error: "Недостаточно звезд" });
    }

    // Списываем звезды
    deductStars(userId, amount);

    // Активируем Premium
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + duration);

    const premiumType = amount === 180 ? "blogger" : "standard";
    const videoDuration = premiumType === "blogger" ? 18 * 60 : 5 * 60; // в секундах

    premiumUsers[userId] = {
      expiresAt,
      isTrial: false,
      createdAt: new Date(),
      type: premiumType,
      videoDuration,
    };

    res.json({
      success: true,
      premium: {
        isPremium: true,
        expiresAt: expiresAt.toISOString(),
        isTrial: false,
        type: premiumType,
        videoDuration,
      },
      balance: currentBalance - amount,
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

    const premiumData = premiumUsers[userId];
    const now = new Date();

    if (!premiumData) {
      // Проверяем, новый ли это пользователь (в реальном приложении проверка через БД)
      // Для демо: если пользователя нет в premiumUsers, даем неделю бесплатно
      const trialExpiresAt = new Date();
      trialExpiresAt.setDate(trialExpiresAt.getDate() + 7);

      premiumUsers[userId] = {
        expiresAt: trialExpiresAt,
        isTrial: true,
        createdAt: new Date(),
        type: "standard",
        videoDuration: 5 * 60, // стандартный триал: 5 минут
      };

      res.json({
        isPremium: true,
        expiresAt: trialExpiresAt.toISOString(),
        isTrial: true,
        type: "standard",
        videoDuration: 5 * 60,
      });
      return;
    }

    // Проверяем, не истек ли Premium
    if (premiumData.expiresAt > now) {
      res.json({
        isPremium: true,
        expiresAt: premiumData.expiresAt.toISOString(),
        isTrial: premiumData.isTrial,
        type: premiumData.type,
        videoDuration: premiumData.videoDuration,
      });
    } else {
      // Premium истек
      delete premiumUsers[userId];
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
