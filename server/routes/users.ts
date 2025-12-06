import { RequestHandler } from "express";
import User from "../models/User";
import Post from "../models/Post";

export const handleUserStats: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "userId обязателен" });
    }

    console.log(`[GET] Запрос статистики для userId: ${userId}`);

    const user = await User.findOne({ telegramId: userId });

    if (!user) {
      console.log(`[GET] Пользователь ${userId} не найден, возвращаем дефолтную статистику`);
      return res.json({
        posts: 0,
        followers: 0,
        following: 0,
        likesReceived: 0,
        viewsCount: 0,
        starsReceived: 0
      });
    }

    // Ensure stats exist and initialize if needed
    if (!user.stats) {
      user.stats = {
        posts: 0,
        followers: 0,
        following: 0,
        likesReceived: 0,
        viewsCount: 0,
        starsReceived: 0
      };
      await user.save();
      console.log(`[GET] Статистика для ${userId} инициализирована`);
    }

    const stats = {
      posts: user.stats.posts || 0,
      followers: user.stats.followers || 0,
      following: user.stats.following || 0,
      likesReceived: user.stats.likesReceived || 0,
      viewsCount: user.stats.viewsCount || 0,
      starsReceived: user.stats.starsReceived || 0
    };

    console.log(`[GET] Статистика для ${userId}:`, stats);
    res.json(stats);
  } catch (error) {
    console.error("Ошибка получения статистики пользователя:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера", details: error instanceof Error ? error.message : String(error) });
  }
};

// New endpoint for user profile (not just stats)
export const handleUserProfile: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "userId обязателен" });
    }

    const user = await User.findOne({ telegramId: userId });

    if (!user) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    // Return full profile info
    res.json({
      id: user.telegramId,
      name: user.name,
      username: user.username,
      avatarUrl: user.avatarUrl,
      verified: user.verified,
      isAdmin: user.isAdmin,
      bio: user.settings?.bio || "",
      stats: user.stats || {
        posts: 0,
        followers: 0,
        following: 0,
        likesReceived: 0,
        viewsCount: 0,
        starsReceived: 0
      }
    });
  } catch (error) {
    console.error("Ошибка получения профиля пользователя:", error);
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

export const handleUserSettingsGet: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "userId обязателен" });
    }

    console.log(`[GET] Запрос настроек для userId: ${userId}`);

    const user = await User.findOne({ telegramId: userId });
    if (!user) {
      console.log(`[GET] Пользователь ${userId} не найден, возвращаем дефолты`);
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

    // Ensure settings exist
    if (!user.settings) {
      user.settings = {
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
      };
      await user.save();
    }

    // Return settings merged with some profile info that might be needed
    const response = {
      ...user.settings,
      username: user.username,
      bio: user.settings.bio || ""
    };
    
    console.log(`[GET] Настройки для ${userId} получены успешно`);
    res.json(response);
  } catch (error) {
    console.error("Ошибка получения настроек:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера", details: error instanceof Error ? error.message : String(error) });
  }
};

export const handleUserSettingsPut: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "userId обязателен" });
    }

    console.log(`[PUT] Обновление настроек для userId: ${userId}`, req.body);

    const user = await User.findOne({ telegramId: userId });
    if (!user) {
      console.log(`[PUT] Пользователь ${userId} не найден`);
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    // Ensure settings exist
    if (!user.settings) {
      user.settings = {
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
      };
    }

    const settingsUpdate = req.body;
    
    // Update settings fields
    if (settingsUpdate.privateAccount !== undefined) user.settings.privateAccount = settingsUpdate.privateAccount;
    if (settingsUpdate.allowDMs !== undefined) user.settings.allowDMs = settingsUpdate.allowDMs;
    if (settingsUpdate.showOnlineStatus !== undefined) user.settings.showOnlineStatus = settingsUpdate.showOnlineStatus;
    if (settingsUpdate.activityStatus !== undefined) user.settings.activityStatus = settingsUpdate.activityStatus;
    if (settingsUpdate.postsFromFollowers !== undefined) user.settings.postsFromFollowers = settingsUpdate.postsFromFollowers;
    if (settingsUpdate.likesAndComments !== undefined) user.settings.likesAndComments = settingsUpdate.likesAndComments;
    if (settingsUpdate.directMessages !== undefined) user.settings.directMessages = settingsUpdate.directMessages;
    if (settingsUpdate.followSuggestions !== undefined) user.settings.followSuggestions = settingsUpdate.followSuggestions;
    if (settingsUpdate.reduceMotion !== undefined) user.settings.reduceMotion = settingsUpdate.reduceMotion;
    if (settingsUpdate.accessibilityMode !== undefined) user.settings.accessibilityMode = settingsUpdate.accessibilityMode;
    if (settingsUpdate.theme !== undefined) user.settings.theme = settingsUpdate.theme;
    if (settingsUpdate.email !== undefined) user.settings.email = settingsUpdate.email;
    if (settingsUpdate.bio !== undefined) user.settings.bio = settingsUpdate.bio;

    await user.save();
    console.log(`[PUT] Настройки для ${userId} обновлены успешно`);

    res.json({
      success: true,
      settings: user.settings
    });
  } catch (error) {
    console.error("Ошибка обновления настроек:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера", details: error instanceof Error ? error.message : String(error) });
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

