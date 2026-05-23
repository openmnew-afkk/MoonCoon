import { RequestHandler } from "express";
import {
  getUserBalance,
  addStars,
  deductStars,
  getLegacyUserStars,
  addLedgerEntry,
} from "../store/stars-store";
import {
  addStarsReceived,
  recordStarSupport,
} from "../store/user-stats";

interface StarsRequest {
  userId: string;
  amount: number;
}

interface SendStarRequest {
  fromUserId: string;
  toPostId: string;
  toUserId?: string;
  amount: number;
}

export function getUserBalanceExport(userId: string): number {
  return getUserBalance(userId);
}

export function deductStarsExport(userId: string, amount: number): void {
  deductStars(userId, amount);
}

export const handleStarsAdd: RequestHandler = async (req, res) => {
  try {
    const { userId, amount }: StarsRequest = req.body;

    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ error: "Неверные параметры запроса" });
    }

    addStars(userId, amount);
    addLedgerEntry({
      userId,
      amount,
      type: "purchase",
      counterparty: "user",
      description: `Пополнение: +${amount} ⭐`,
    });

    res.json({
      success: true,
      balance: getUserBalance(userId),
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
      return res.status(400).json({
        error: isAdmin
          ? "Неверная сумма"
          : "Минимальная сумма вывода: 100 звезд",
      });
    }

    const currentBalance = getUserBalance(userId);

    if (amount > currentBalance) {
      return res.status(400).json({ error: "Недостаточно звезд на балансе" });
    }

    deductStars(userId, amount);

    const getCommissionRate = (val: number) => {
      if (isAdmin) return 0;
      if (val >= 5000) return 0.05;
      if (val >= 2000) return 0.07;
      return 0.1;
    };

    const rate = getCommissionRate(amount);
    const withdrawCommission = Math.floor(amount * rate);
    const withdrawFinalAmount = amount - withdrawCommission;

    res.json({
      success: true,
      balance: getUserBalance(userId),
      withdrawn: withdrawFinalAmount,
      commission: withdrawCommission,
      message: `Запрос на вывод ${withdrawFinalAmount} звезд принят. Комиссия: ${withdrawCommission} звезд (${rate * 100}%)`,
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

    const BOT_TOKEN = process.env.BOT_TOKEN;

    if (BOT_TOKEN) {
      try {
        const response = await fetch(
          `https://api.telegram.org/bot${BOT_TOKEN}/getStarTransactions`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: parseInt(userId),
              offset: 0,
              limit: 100,
            }),
          },
        );

        if (response.ok) {
          const data = await response.json();

          if (data.ok && data.result?.transactions) {
            let balance = 0;
            for (const tx of data.result.transactions) {
              if (tx.amount) {
                balance += tx.amount;
              }
            }

            const legacy = getLegacyUserStars();
            legacy[userId] = balance;

            return res.json({
              success: true,
              balance: balance,
              source: "telegram",
            });
          }
        }
      } catch (telegramError) {
        console.warn(
          "Не удалось получить баланс из Telegram API:",
          telegramError,
        );
      }
    }

    const balance = getUserBalance(userId);

    res.json({
      success: true,
      balance: balance,
      source: "local",
    });
  } catch (error) {
    console.error("Ошибка при получении баланса:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
};

export const handleStarsInvoice: RequestHandler = async (req, res) => {
  try {
    const { userId, amount } = req.body as StarsRequest;
    const BOT_TOKEN = process.env.BOT_TOKEN;

    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ error: "Неверные параметры" });
    }

    if (!BOT_TOKEN) {
      return res.status(503).json({
        error: "Покупка звёзд доступна только в Telegram-приложении с настроенным ботом",
      });
    }

    const payload = JSON.stringify({
      userId: String(userId),
      amount,
      ts: Date.now(),
    });

    const tgRes = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/createInvoiceLink`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${amount} Telegram Stars`,
          description: `Пополнение баланса Vexora на ${amount} ⭐`,
          payload: payload.slice(0, 128),
          currency: "XTR",
          prices: [{ label: `${amount} Stars`, amount }],
        }),
      },
    );

    const data = await tgRes.json();
    if (!data.ok || !data.result) {
      return res.status(502).json({
        error: data.description || "Не удалось создать счёт Telegram",
      });
    }

    res.json({ success: true, invoiceLink: data.result, amount });
  } catch (error) {
    console.error("Ошибка создания invoice:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
};

export const handleStarsPurchaseConfirm: RequestHandler = async (req, res) => {
  try {
    const { userId, amount } = req.body as StarsRequest;
    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ error: "Неверные параметры" });
    }

    addStars(userId, amount);
    addLedgerEntry({
      userId,
      amount,
      type: "purchase",
      counterparty: "telegram",
      description: `Покупка через Telegram: +${amount} ⭐`,
    });

    res.json({
      success: true,
      balance: getUserBalance(userId),
      source: "telegram",
    });
  } catch (error) {
    console.error("Ошибка подтверждения покупки:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
};

export const handleSendStar: RequestHandler = async (req, res) => {
  try {
    const { fromUserId, toPostId, toUserId, amount }: SendStarRequest =
      req.body;

    if (!fromUserId || !toPostId || !amount || amount <= 0) {
      return res.status(400).json({ error: "Неверные параметры запроса" });
    }

    const currentBalance = getUserBalance(fromUserId);

    if (amount > currentBalance) {
      return res.status(400).json({ error: "Недостаточно звезд на балансе" });
    }

    const deducted = deductStars(fromUserId, amount);
    if (!deducted) {
      return res.status(400).json({ error: "Недостаточно звезд на балансе" });
    }

    addLedgerEntry({
      userId: fromUserId,
      amount: -amount,
      type: "tip",
      counterparty: "user",
      description: `Поддержка поста: -${amount} ⭐`,
    });

    if (toUserId && toUserId !== fromUserId) {
      addStars(toUserId, amount);
      addStarsReceived(toUserId, amount);
      recordStarSupport(fromUserId, toUserId);
      addLedgerEntry({
        userId: toUserId,
        amount,
        type: "tip",
        counterparty: "user",
        description: `Получено за пост: +${amount} ⭐`,
      });
    }

    res.json({
      success: true,
      balance: getUserBalance(fromUserId),
      message: `Отправлено ${amount} звезд`,
    });
  } catch (error) {
    console.error("Ошибка при отправке звезды:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
};
