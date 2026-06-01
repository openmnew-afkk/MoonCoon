import { RequestHandler } from "express";
import crypto from "crypto";
import { getAppSettings, updateAppSettings } from "../store/app-settings";

const adminSessions = new Map<string, { userId: string; expiresAt: number }>();
const adminUserIds = new Set<string>();
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

function getAdminUsername(): string {
  return (process.env.ADMIN_USERNAME || "MikySauce")
    .toLowerCase()
    .replace("@", "");
}

function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || "";
}

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function verifyPassword(input: string): boolean {
  const expected = getAdminPassword();
  if (!expected) return false;
  const a = Buffer.from(hashPassword(input));
  const b = Buffer.from(hashPassword(expected));
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function createSession(userId: string): string {
  const token = crypto.randomBytes(32).toString("hex");
  adminSessions.set(token, {
    userId,
    expiresAt: Date.now() + SESSION_TTL_MS,
  });
  return token;
}

function isValidSession(token: string | undefined): boolean {
  if (!token) return false;
  const session = adminSessions.get(token);
  if (!session) return false;
  if (session.expiresAt < Date.now()) {
    adminSessions.delete(token);
    return false;
  }
  return true;
}

function getBearerToken(req: {
  headers: { authorization?: string };
}): string | undefined {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return undefined;
  return auth.slice(7);
}

function requireAdmin(
  req: { headers: { authorization?: string } },
  res: { status: (n: number) => { json: (b: unknown) => void } },
): string | null {
  const token = getBearerToken(req);
  if (!isValidSession(token)) {
    res.status(403).json({ error: "Недостаточно прав" });
    return null;
  }
  return token!;
}

if (process.env.ADMIN_USER_ID) {
  adminUserIds.add(process.env.ADMIN_USER_ID);
}

export const handleAdminLogin: RequestHandler = async (req, res) => {
  try {
    const { username, userId, password } = req.body as {
      username?: string;
      userId?: string;
      password?: string;
    };

    if (!username) {
      return res.status(400).json({ error: "Нужен username" });
    }

    const cleanUsername = username.toLowerCase().replace("@", "");
    if (cleanUsername !== getAdminUsername()) {
      return res.status(403).json({ success: false, error: "Доступ запрещён" });
    }

    // Validate password if ADMIN_PASSWORD is configured
    const adminPassword = getAdminPassword();
    if (adminPassword) {
      if (!password) {
        return res.status(403).json({ success: false, error: "Требуется пароль" });
      }
      if (!verifyPassword(password)) {
        return res.status(403).json({ success: false, error: "Неверный пароль" });
      }
    }

    const uid = userId ? String(userId) : cleanUsername;
    adminUserIds.add(uid);
    const sessionToken = createSession(uid);

    res.json({
      success: true,
      sessionToken,
      message: "Вход выполнен",
    });
  } catch (error) {
    console.error("admin login error", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
};

export const handleAdminAuth: RequestHandler = async (req, res) => {
  try {
    const token = getBearerToken(req);
    if (isValidSession(token)) {
      return res.json({ success: true, sessionToken: token });
    }
    res.status(403).json({ success: false, error: "Сессия недействительна" });
  } catch (error) {
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
};

export const handleAdminCheck: RequestHandler = async (req, res) => {
  try {
    const token = getBearerToken(req);
    const isAdmin = isValidSession(token);
    res.json({
      isAdmin,
      message: isAdmin ? "Доступ разрешен" : "Доступ запрещен",
    });
  } catch (error) {
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
};

export const handleAdminSettingsGet: RequestHandler = async (req, res) => {
  if (!requireAdmin(req, res)) return;
  res.json({ settings: getAppSettings() });
};

export const handleAdminSettingsPut: RequestHandler = async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const settings = updateAppSettings(req.body || {});
  res.json({ success: true, settings });
};

export const handlePublicSettings: RequestHandler = async (_req, res) => {
  const s = getAppSettings();
  res.json({
    premiumPriceRub: s.premiumPriceRub,
    premiumPriceStars: s.premiumPriceStars,
    cardPaymentEnabled: s.cardPaymentEnabled,
    starsPaymentEnabled: s.starsPaymentEnabled,
  });
};

const bannedUsers = new Set<string>();

export const handleGetUsers: RequestHandler = async (req, res) => {
  if (!requireAdmin(req, res)) return;

  const users = Array.from({ length: 30 }, (_, i) => ({
    id: `user_${i + 1}`,
    name: `User ${i + 1}`,
    username: `@user${i + 1}`,
    isAdmin: false,
    isBanned: bannedUsers.has(`user_${i + 1}`),
    posts: Math.floor(Math.random() * 100),
    followers: Math.floor(Math.random() * 1000),
    createdAt: new Date(
      Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000,
    ).toISOString(),
  }));

  res.json({ users });
};

export const handleSetAdmin: RequestHandler = async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const { userId, isAdmin } = req.body;
  if (!userId || typeof isAdmin !== "boolean") {
    return res.status(400).json({ error: "Неверные параметры" });
  }
  if (isAdmin) adminUserIds.add(String(userId));
  else adminUserIds.delete(String(userId));
  res.json({ success: true });
};

export const handleBanUser: RequestHandler = async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const { userId, isBanned } = req.body;
  if (!userId || typeof isBanned !== "boolean") {
    return res.status(400).json({ error: "Неверные параметры" });
  }
  if (isBanned) bannedUsers.add(String(userId));
  else bannedUsers.delete(String(userId));
  res.json({ success: true });
};
