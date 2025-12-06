import { RequestHandler } from "express";
import User from "../models/User";
import Post from "../models/Post";

// Хранилище сессий (в продакшене лучше использовать Redis или БД)
const adminSessions: Set<string> = new Set();

interface AdminAuthRequest {
  userId: string;
}

export const handleAdminAuth: RequestHandler = async (req, res) => {
  try {
    const { userId, username } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId обязателен" });
    }

    // Check if user is admin in DB
    const user = await User.findOne({ telegramId: userId });

    if (user && user.isAdmin) {
      const sessionToken = `admin_${userId}_${Date.now()}`;
      adminSessions.add(sessionToken);
      return res.json({ success: true, token: sessionToken });
    }

    // Auto-admin for first user if no admins exist
    const adminCount = await User.countDocuments({ isAdmin: true });
    if (adminCount === 0) {
      if (user) {
        user.isAdmin = true;
        await user.save();
      } else {
        // Create new admin user
        await User.create({
          telegramId: userId,
          name: "Admin",
          username: username,
          isAdmin: true,
          verified: true
        });
      }

      const sessionToken = `admin_${userId}_${Date.now()}`;
      adminSessions.add(sessionToken);
      return res.json({ success: true, token: sessionToken, message: "Вы назначены первым администратором" });
    }

    res.status(403).json({ error: "Доступ запрещен" });
  } catch (error) {
    console.error("Admin auth error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const handleAdminCheck: RequestHandler = async (req, res) => {
  try {
    const userId = req.query.userId as string;

    let isAdmin = false;

    if (userId) {
      const user = await User.findOne({ telegramId: userId });
      if (user && user.isAdmin) isAdmin = true;
    }

    // Check session
    const authHeader = req.headers.authorization;
    if (!isAdmin && authHeader && authHeader.startsWith("Bearer ")) {
      const sessionToken = authHeader.substring(7);
      if (adminSessions.has(sessionToken)) {
        isAdmin = true;
      }
    }

    // Auto-admin check (same logic as auth)
    if (!isAdmin && userId) {
      const adminCount = await User.countDocuments({ isAdmin: true });
      if (adminCount === 0) {
        const user = await User.findOne({ telegramId: userId });
        if (user) {
          user.isAdmin = true;
          await user.save();
          isAdmin = true;
        }
      }
    }

    res.json({
      isAdmin,
      message: isAdmin ? "Доступ разрешен" : "Доступ запрещен",
    });
  } catch (error) {
    console.error("Ошибка проверки прав администратора:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
};

export const handleGetUsers: RequestHandler = async (req, res) => {
  try {
    // Authorization check
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Не авторизован" });
    }
    const sessionToken = authHeader.substring(7);
    if (!adminSessions.has(sessionToken)) {
      return res.status(403).json({ error: "Недостаточно прав" });
    }

    const users = await User.find().sort({ createdAt: -1 });

    const usersList = users.map(u => ({
      id: u.telegramId,
      name: u.name,
      username: u.username ? `@${u.username}` : "Нет ника",
      isAdmin: u.isAdmin,
      isBanned: u.isBanned,
      posts: u.stats?.posts || 0,
      followers: u.stats?.followers || 0,
      stars: u.starsBalance || 0,
      joinedAt: u.createdAt ? u.createdAt.toLocaleDateString() : "N/A"
    }));

    res.json({ users: usersList });
  } catch (error) {
    console.error("Ошибка получения пользователей:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
};

export const handleSetAdmin: RequestHandler = async (req, res) => {
  try {
    // Authorization check
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Не авторизован" });
    }
    const sessionToken = authHeader.substring(7);
    if (!adminSessions.has(sessionToken)) {
      return res.status(403).json({ error: "Недостаточно прав" });
    }

    const { userId, isAdmin } = req.body;

    if (!userId || typeof isAdmin !== "boolean") {
      return res.status(400).json({ error: "Неверные параметры" });
    }

    await User.updateOne({ telegramId: userId }, { isAdmin });

    res.json({ success: true, message: `Права администратора ${isAdmin ? "выданы" : "отозваны"}` });
  } catch (error) {
    console.error("Ошибка изменения прав:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
};

export const handleBanUser: RequestHandler = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Не авторизован" });
    }

    const sessionToken = authHeader.substring(7);
    if (!adminSessions.has(sessionToken)) {
      return res.status(403).json({ error: "Недостаточно прав" });
    }

    const { userId, isBanned, reason } = req.body;

    if (!userId || typeof isBanned !== "boolean") {
      return res.status(400).json({ error: "Неверные параметры" });
    }

    await User.updateOne({ telegramId: userId }, { isBanned });

    res.json({
      success: true,
      message: `Пользователь ${isBanned ? "забанен" : "разбанен"}`,
      reason: reason || null,
    });
  } catch (error) {
    console.error("Ошибка бана пользователя:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
};

export const handleAdminStats: RequestHandler = async (req, res) => {
  try {
    // Authorization check
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Не авторизован" });
    }
    const sessionToken = authHeader.substring(7);
    if (!adminSessions.has(sessionToken)) {
      return res.status(403).json({ error: "Недостаточно прав" });
    }

    // Get statistics from database
    const totalUsers = await User.countDocuments();
    const totalPosts = await Post.countDocuments();
    const totalLikes = await Post.aggregate([
      { $group: { _id: null, total: { $sum: "$likes" } } }
    ]);
    const totalComments = await Post.aggregate([
      { $group: { _id: null, total: { $sum: "$comments" } } }
    ]);

    // Calculate week-over-week changes (simplified - you can make this more sophisticated)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const usersLastWeek = await User.countDocuments({ createdAt: { $lt: oneWeekAgo } });
    const postsLastWeek = await Post.countDocuments({ createdAt: { $lt: oneWeekAgo } });

    const usersChange = usersLastWeek > 0 
      ? ((totalUsers - usersLastWeek) / usersLastWeek * 100).toFixed(0)
      : "0";
    const postsChange = postsLastWeek > 0
      ? ((totalPosts - postsLastWeek) / postsLastWeek * 100).toFixed(0)
      : "0";

    res.json({
      totalUsers,
      totalPosts,
      totalLikes: totalLikes[0]?.total || 0,
      totalComments: totalComments[0]?.total || 0,
      usersChange: `+${usersChange}% на этой неделе`,
      postsChange: `+${postsChange}% на этой неделе`,
      likesChange: "+18% на этой неделе", // Placeholder - can be calculated similarly
      commentsChange: "+31% на этой неделе", // Placeholder - can be calculated similarly
    });
  } catch (error) {
    console.error("Ошибка получения статистики:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
};

