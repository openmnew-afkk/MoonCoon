import { RequestHandler } from "express";
import User from "../models/User";
import Post from "../models/Post";

export const handleUserStats: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "userId обязателен" });
    }

    const user = await User.findOne({ telegramId: userId });

    if (!user) {
      // If user doesn't exist, return default stats (or 404, but frontend might expect defaults)
      return res.json({
        posts: 0,
        followers: 0,
        following: 0,
        likesReceived: 0,
        viewsCount: 0,
        starsReceived: 0
      });
    }

    // Recalculate stats from posts if needed, or trust the stored stats
    // For robustness, let's trust stored stats but ensure they exist
    // Optionally, we could aggregate from Posts collection for accuracy:
    // const postStats = await Post.aggregate([
    //   { $match: { userId: userId } },
    //   { $group: { _id: null, totalLikes: { $sum: "$likes" }, totalStars: { $sum: "$stars" }, count: { $sum: 1 } } }
    // ]);

    // For now, return the stats stored in the User document
    res.json(user.stats);
  } catch (error) {
    console.error("Ошибка получения статистики пользователя:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
};

export const handleUpdateUserStats: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId обязателен" });
    }

    const user = await User.findOne({ telegramId: userId });
    if (!user) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    // Merge updates into stats
    // Only allow specific fields to be updated via this endpoint if needed
    if (updates.posts !== undefined) user.stats.posts = updates.posts;
    if (updates.followers !== undefined) user.stats.followers = updates.followers;
    if (updates.following !== undefined) user.stats.following = updates.following;
    if (updates.likesReceived !== undefined) user.stats.likesReceived = updates.likesReceived;
    if (updates.viewsCount !== undefined) user.stats.viewsCount = updates.viewsCount;
    if (updates.starsReceived !== undefined) user.stats.starsReceived = updates.starsReceived;

    await user.save();

    res.json({
      success: true,
      stats: user.stats,
    });
  } catch (error) {
    console.error("Ошибка обновления статистики:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
};

export const handleUserSettings: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "userId обязателен" });
    }

    const user = await User.findOne({ telegramId: userId });
    if (!user) {
      // Return defaults if user not found
      return res.json({
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
      });
    }

    // Return settings merged with some profile info that might be needed
    res.json({
      ...user.settings,
      // Add these if the frontend expects them in settings
      username: user.username,
      bio: user.settings.bio // explicitly ensuring bio is there
    });
  } catch (error) {
    console.error("Ошибка получения настроек:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
};

export const handleDeleteUser: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "userId обязателен" });
    }

    await User.deleteOne({ telegramId: userId });
    await Post.deleteMany({ userId });

    res.json({ success: true });
  } catch (error) {
    console.error("Ошибка удаления пользователя:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
};

