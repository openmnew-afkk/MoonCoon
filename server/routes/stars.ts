import { RequestHandler } from "express";

interface StarsRequest {
  userId: string;
  amount: number;
}

interface WithdrawRequest extends StarsRequest {
  commission: number;
  finalAmount: number;
}

interface SendStarRequest {
  fromUserId: string;
  toPostId: string;
  amount: number;
}

// В реальном приложении здесь должна быть работа с БД
const userStars: Record<string, number> = {};

export function getUserBalance(userId: string): number {
  return userStars[userId] || 0;
}

export function deductStars(userId: string, amount: number): void {
  if (!userStars[userId]) {
    userStars[userId] = 0;
  }
  userStars[userId] = Math.max(0, userStars[userId] - amount);
}

export const handleStarsAdd: RequestHandler = async (req, res) => {
  try {
    const { userId, amount }: StarsRequest = req.body;

    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ error: "Неверные параметры запроса" });
    }

    // Добавляем звезды к балансу пользователя
    userStars[userId] = (userStars[userId] || 0) + amount;

    res.json({
      success: true,
      balance: userStars[userId],
      message: `Добавлено ${amount} звезд`,
    });
  } catch (error) {
    console.error("Ошибка при добавлении звезд:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
};

export const handleStarsWithdraw: RequestHandler = async (req, res) => {
  try {
    const { userId, amount }: StarsRequest = req.body;

    const ADMIN_USER_ID = process.env.ADMIN_USER_ID;
    const isAdmin = ADMIN_USER_ID && userId?.toString() === ADMIN_USER_ID;

    if (!userId || !amount || (!isAdmin && amount < 100)) {
      return res.status(400).json({ error: isAdmin ? "Неверная сумма" : "Минимальная сумма вывода: 100 звезд" });
    }

    const currentBalance = userStars[userId] || 0;

    if (amount > currentBalance) {
      return res.status(400).json({ error: "Недостаточно звезд на балансе" });
    }

    // Списываем звезды
    userStars[userId] = currentBalance - amount;

    // В реальном приложении здесь должна быть отправка запроса на вывод через Telegram Bot API
    // Например, через Telegram Stars API

    const getCommissionRate = (val: number) => {
      if (isAdmin) return 0;
      if (val >= 5000) return 0.05;
      if (val >= 2000) return 0.07;
      return 0.1;
    };

    const rate = getCommissionRate(amount);
    const commission = Math.floor(amount * rate);
    const finalAmount = amount - commission;

    res.json({
      success: true,
      balance: userStars[userId],
      withdrawn: finalAmount,
      commission: commission,
      message: `Запрос на вывод ${finalAmount} звезд принят. Комиссия: ${commission} звезд (${rate * 100}%)`,
    });
  } catch (error) {
    console.error("Ошибка при выводе звезд:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
};

export const handleStarsBalance: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId || typeof userId !== "string") {
      return res.status(400).json({ error: "Неверный userId" });
    }

    // В продакшене здесь должна быть интеграция с Telegram Stars API
    // const BOT_TOKEN = process.env.BOT_TOKEN;
    // const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getStarTransactions`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ user_id: parseInt(userId), offset: 0, limit: 100 })
    // });
    // const data = await response.json();
    // const balance = calculateBalanceFromTransactions(data.result);

    // Пока используем локальное хранилище
    const balance = userStars[userId] || 0;

    res.json({
      success: true,
      balance: balance,
    });
  } catch (error) {
    console.error("Ошибка при получении баланса:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
};

export const handleSendStar: RequestHandler = async (req, res) => {
  try {
    const { fromUserId, toPostId, amount }: SendStarRequest = req.body;

    if (!fromUserId || !toPostId || !amount || amount <= 0) {
      return res.status(400).json({ error: "Неверные параметры запроса" });
    }

    const currentBalance = userStars[fromUserId] || 0;

    if (amount > currentBalance) {
      return res.status(400).json({ error: "Недостаточно звезд на балансе" });
    }

    // В продакшене здесь должна быть интеграция с Telegram Stars API
    // const BOT_TOKEN = process.env.BOT_TOKEN;
    // const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendStarPayment`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     user_id: parseInt(fromUserId),
    //     amount: amount,
    //     // Telegram Stars API параметры
    //   })
    // });

    // Списываем звезды у отправителя
    userStars[fromUserId] = currentBalance - amount;
    
    // Добавляем звезды получателю (автору поста)
    // В реальном приложении нужно получить userId автора поста из БД
    // const postAuthorId = getPostAuthor(toPostId);
    // userStars[postAuthorId] = (userStars[postAuthorId] || 0) + amount;

    res.json({
      success: true,
      balance: userStars[fromUserId],
      message: `Отправлено ${amount} звезд`,
    });
  } catch (error) {
    console.error("Ошибка при отправке звезды:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
};
