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
    
    // If user doesn't exist, return 0 (or create user)
    if (!user) {
      return res.json({ balance: 0 });
    }
    
    res.json({ balance: user.starsBalance || 0 });
  } catch (error) {
    console.error("Ошибка получения баланса:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
};

export const handleSendStar: RequestHandler = async (req, res) => {
  try {
    const { fromUserId, toPostId, amount } = req.body;

    if (!fromUserId || !toPostId || !amount || amount <= 0) {
      return res.status(400).json({ error: "Неверные параметры" });
    }

    const sender = await User.findOne({ telegramId: fromUserId });
    if (!sender) {
      return res.status(404).json({ error: "Отправитель не найден" });
    }

    if ((sender.starsBalance || 0) < amount) {
      return res.status(400).json({ error: "Недостаточно звезд" });
    }

    const post = await Post.findById(toPostId);
    if (!post) {
      return res.status(404).json({ error: "Пост не найден" });
    }

    // Get or create recipient user
    let recipient = await User.findOne({ telegramId: post.userId });
    if (!recipient) {
      // Create recipient if doesn't exist
      recipient = await User.create({
        telegramId: post.userId,
        name: post.author?.name || `User ${post.userId}`,
        username: post.author?.username,
        avatarUrl: post.author?.avatar,
        verified: post.author?.verified || false,
        isAdmin: false,
        isBanned: false,
        stats: {
          posts: 0,
          followers: 0,
          following: 0,
          likesReceived: 0,
          viewsCount: 0,
          starsReceived: 0
        },
        settings: {
          privateAccount: false,
          allowDMs: true,
          showOnlineStatus: true,
          activityStatus: true,
          postsFromFollowers: true,
          likesAndComments: true,
          directMessages: true,
          followSuggestions: false,
          reduceMotion: false,
          accessibilityMode: false,
          theme: 'dark',
          email: "",
          bio: "",
        },
        starsBalance: 0
      });
    }

    // Transaction simulation
    sender.starsBalance = (sender.starsBalance || 0) - amount;
    await sender.save();

    post.stars = (post.stars || 0) + amount;
    if (!post.starredBy.includes(fromUserId)) {
      post.starredBy.push(fromUserId);
    }
    await post.save();

    // Credit author
    recipient.starsBalance = (recipient.starsBalance || 0) + amount;
    recipient.stats = recipient.stats || {
      posts: 0,
      followers: 0,
      following: 0,
      likesReceived: 0,
      viewsCount: 0,
      starsReceived: 0
    };
    recipient.stats.starsReceived = (recipient.stats.starsReceived || 0) + amount;
    await recipient.save();

    res.json({ success: true, newBalance: sender.starsBalance });
  } catch (error) {
    console.error("Ошибка отправки звезды:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
};
