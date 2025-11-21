import { RequestHandler } from "express";
import User from "../models/User";
import Post from "../models/Post";

export const handleStarsAdd: RequestHandler = async (req, res) => {
  try {
    const { userId, amount } = req.body;

    if (!userId || !amount) {
      return res.status(400).json({ error: "Неверные параметры" });
    }

    const user = await User.findOne({ telegramId: userId });
    if (!user) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    user.starsBalance += amount;
    await user.save();

    res.json({ success: true, balance: user.starsBalance });
  } catch (error) {
    console.error("Ошибка добавления звезд:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
};

export const handleStarsWithdraw: RequestHandler = async (req, res) => {
  try {
    const { userId, amount } = req.body;

    if (!userId || !amount) {
      return res.status(400).json({ error: "Неверные параметры" });
    }

    const user = await User.findOne({ telegramId: userId });
    if (!user) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    if (user.starsBalance < amount) {
      return res.status(400).json({ error: "Недостаточно средств" });
    }

    user.starsBalance -= amount;
    await user.save();

    res.json({ success: true, balance: user.starsBalance });
  } catch (error) {
    console.error("Ошибка вывода звезд:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
};

export const handleStarsBalance: RequestHandler = async (req, res) => {
  try {
    const userId = req.query.userId as string;

    if (!userId) {
      return res.status(400).json({ error: "userId обязателен" });
    }

    const user = await User.findOne({ telegramId: userId });
    res.json({ balance: user?.starsBalance || 0 });
  } catch (error) {
    console.error("Ошибка получения баланса:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
};

export const handleSendStar: RequestHandler = async (req, res) => {
  try {
    const { fromUserId, toPostId, amount } = req.body;

    if (!fromUserId || !toPostId || !amount) {
      return res.status(400).json({ error: "Неверные параметры" });
    }

    const sender = await User.findOne({ telegramId: fromUserId });
    if (!sender || sender.starsBalance < amount) {
      return res.status(400).json({ error: "Недостаточно звезд" });
    }

    const post = await Post.findById(toPostId);
    if (!post) {
      return res.status(404).json({ error: "Пост не найден" });
    }

    // Transaction simulation
    sender.starsBalance -= amount;
    await sender.save();

    post.stars += amount;
    if (!post.starredBy.includes(fromUserId)) {
      post.starredBy.push(fromUserId);
    }
    await post.save();

    // Credit author
    await User.updateOne(
      { telegramId: post.userId },
      {
        $inc: {
          starsBalance: amount,
          "stats.starsReceived": amount
        }
      }
    );

    res.json({ success: true, newBalance: sender.starsBalance });
  } catch (error) {
    console.error("Ошибка отправки звезды:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
};
