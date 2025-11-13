import { RequestHandler } from "express";

// Хранилище данных (в продакшене - БД)
const adminSessions: Set<string> = new Set();
const adminUsers: Set<string> = new Set(); // userId админов
const bannedUsers: Set<string> = new Set(); // userId забаненных

// Автоматически делаем пользователя админом (можно настроить через .env)
if (process.env.ADMIN_USER_ID) {
  adminUsers.add(process.env.ADMIN_USER_ID);
  console.log("✅ Admin userId из env:", process.env.ADMIN_USER_ID);
}

// Хранилище username админов
const adminUsernames: Set<string> = new Set();
if (process.env.ADMIN_USERNAME) {
  adminUsernames.add(process.env.ADMIN_USERNAME.toLowerCase().replace("@", ""));
  console.log("✅ Admin username из env:", process.env.ADMIN_USERNAME);
}

// Добавляем тестовых админов для разработки (убрать в продакшене)
adminUsers.add("1234567890"); // ID из тестового случая
adminUsernames.add("testuser"); // username для теста
console.log("🧪 Добавлены тестовые админы для разработки");

interface AdminAuthRequest {
  userId: string;
}

export const handleAdminAuth: RequestHandler = async (req, res) => {
  try {
    const { userId }: AdminAuthRequest = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId обязателен" });
    }

    // Проверяем, является ли пользователь админом
    // В продакшене это должно проверяться через Telegram Bot API или БД
    const isAdmin = adminUsers.has(userId.toString());

    if (isAdmin) {
      const sessionToken = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      adminSessions.add(sessionToken);

      res.json({
        success: true,
        sessionToken,
        message: "Успешная авторизация",
      });
    } else {
      res.status(403).json({
        success: false,
        error: "У вас нет прав администратора",
      });
    }
  } catch (error) {
    console.error("Ошибка авторизации администратора:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
};

export const handleAdminCheck: RequestHandler = async (req, res) => {
  try {
    // Проверяем по userId или username из query
    const userId = req.query.userId as string;
    const username = req.query.username as string;

    let isAdmin = false;

    // Проверка по userId
    if (userId) {
      isAdmin = adminUsers.has(userId.toString());
      console.log(`🔍 Проверка userId: ${userId}, isAdmin: ${isAdmin}`);
    }

    // Проверка по username
    if (!isAdmin && username) {
      const cleanUsername = username.toLowerCase().replace("@", "");
      isAdmin = adminUsernames.has(cleanUsername);
      console.log(
        `🔍 Проверка username: ${cleanUsername}, isAdmin: ${isAdmin}`,
      );
    }

    // Если есть Authorization header - проверяем сессию
    const authHeader = req.headers.authorization;
    if (!isAdmin && authHeader && authHeader.startsWith("Bearer ")) {
      const sessionToken = authHeader.substring(7);
      isAdmin = adminSessions.has(sessionToken);
      console.log(
        `🔍 Проверка session: ${sessionToken.substring(0, 20)}..., isAdmin: ${isAdmin}`,
      );
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

// Управление пользователями
export const handleGetUsers: RequestHandler = async (req, res) => {
  try {
    // Проверка прав администратора
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Не авторизован" });
    }

    const sessionToken = authHeader.substring(7);
    if (!adminSessions.has(sessionToken)) {
      return res.status(403).json({ error: "Недостаточно прав" });
    }

    // В продакшене здесь будет запрос к БД
    const users = Array.from({ length: 50 }, (_, i) => ({
      id: `user_${i + 1}`,
      name: `User ${i + 1}`,
      username: `@user${i + 1}`,
      isAdmin: adminUsers.has(`user_${i + 1}`),
      isBanned: bannedUsers.has(`user_${i + 1}`),
      posts: Math.floor(Math.random() * 100),
      followers: Math.floor(Math.random() * 1000),
      createdAt: new Date(
        Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000,
      ).toISOString(),
    }));

    res.json({ users });
  } catch (error) {
    console.error("Ошибка получения пользователей:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
};

export const handleSetAdmin: RequestHandler = async (req, res) => {
  try {
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

    if (isAdmin) {
      adminUsers.add(userId.toString());
    } else {
      adminUsers.delete(userId.toString());
    }

    res.json({
      success: true,
      message: `Права администратора ${isAdmin ? "выданы" : "отозваны"}`,
    });
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

    if (isBanned) {
      bannedUsers.add(userId.toString());
    } else {
      bannedUsers.delete(userId.toString());
    }

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
