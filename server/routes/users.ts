import { RequestHandler } from "express";
import crypto from "node:crypto";

// В реальном приложении здесь должна быть работа с БД
const userStats: Record<
  string,
  { posts: number; followers: number; following: number }
> = {};
const userSettings: Record<string, any> = {};

export const handleUserStats: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "userId обязателен" });
    }

    // Инициализируем статистику с 0, если пользователя еще нет
    if (!userStats[userId]) {
      userStats[userId] = {
        posts: 0,
        followers: 0,
        following: 0,
      };
    }

    res.json(userStats[userId]);
  } catch (error) {
    console.error("Ошибка получения статистики пользователя:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
};

export const handleUpdateUserStats: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const { posts, followers, following } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId обязателен" });
    }

    if (!userStats[userId]) {
      userStats[userId] = { posts: 0, followers: 0, following: 0 };
    }

    if (posts !== undefined) userStats[userId].posts = posts;
    if (followers !== undefined) userStats[userId].followers = followers;
    if (following !== undefined) userStats[userId].following = following;

    res.json({
      success: true,
      stats: userStats[userId],
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

    if (req.method === "GET") {
      // Получить настройки
      const raw = userSettings[userId] || {
        privateAccount: false,
        allowDMs: true,
        showOnlineStatus: true,
        email: "",
        username: "",
        bio: "",
      };
      // Не возвращаем hash PIN на клиент
      const { childModePinHash, ...settings } = raw;
      res.json(settings);
    } else if (req.method === "PUT") {
      const body = req.body || {};
      const current = userSettings[userId] || {};

      // Установка PIN: сохраняем hash
      if (
        typeof body.setChildModePin === "string" &&
        body.setChildModePin.length >= 4
      ) {
        const pin = body.setChildModePin;
        const hash = crypto.createHash("sha256").update(pin).digest("hex");
        current.childModePinHash = hash;
        current.childMode = true;
        delete body.setChildModePin;
      }

      // Проверка PIN при выключении детского режима
      if (current.childModePinHash && body.childMode === false) {
        if (typeof body.verifyChildModePin !== "string") {
          return res
            .status(400)
            .json({ error: "Требуется PIN для отключения детского режима" });
        }
        const checkHash = crypto
          .createHash("sha256")
          .update(body.verifyChildModePin)
          .digest("hex");
        if (checkHash !== current.childModePinHash) {
          return res.status(403).json({ error: "Неверный PIN" });
        }
        // PIN верный, можно отключить
        delete body.verifyChildModePin;
      }

      // Обновляем остальные настройки
      userSettings[userId] = {
        ...current,
        ...body,
      };

      const { childModePinHash, ...safe } = userSettings[userId];
      res.json({
        success: true,
        settings: safe,
      });
    }
  } catch (error) {
    console.error("Ошибка работы с настройками:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
};

export const handleDeleteUser: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "userId обязателен" });
    }

    // В реальном приложении здесь должна быть удаление из БД
    delete userStats[userId];
    delete userSettings[userId];

    res.json({
      success: true,
      message: "Пользователь удален",
    });
  } catch (error) {
    console.error("Ошибка удаления пользователя:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
};
