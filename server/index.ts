import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB, { ensureDB } from "./db";
import User from "./models/User";
import { handleDemo } from "./routes/demo";
import {
  handleStarsAdd,
  handleStarsWithdraw,
  handleStarsBalance,
  handleSendStar,
} from "./routes/stars";
import {
  handleAdminAuth,
  handleAdminCheck,
  handleGetUsers,
  handleSetAdmin,
  handleBanUser,
  handleAdminStats,
} from "./routes/admin";
import {
  handleUserStats,
  handleUserProfile,
  handleUpdateUserStats,
  handleUserSettingsGet,
  handleUserSettingsPut,
  handleDeleteUser,
} from "./routes/users";
import { handlePremiumPurchase, handlePremiumStatus } from "./routes/premium";
import {
  handleGetPosts,
  handleCreatePost,
  handleLikePost,
  handleDeletePost
} from "./routes/posts";

export function createServer() {
  const app = express();

  // Connect to Database (async, but don't block)
  connectDB().catch(console.error);

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: "25mb" }));
  app.use(express.urlencoded({ extended: true, limit: "25mb" }));

  // Ensure DB connection before API routes
  app.use("/api", async (req, res, next) => {
    try {
      await ensureDB();
      next();
    } catch (error) {
      console.error("DB connection error in middleware:", error);
      res.status(500).json({ error: "Database connection failed" });
    }
  });

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Stars API routes
  app.post("/api/stars/add", handleStarsAdd);
  app.post("/api/stars/withdraw", handleStarsWithdraw);
  app.post("/api/stars/send", handleSendStar);
  app.get("/api/stars/balance", handleStarsBalance);

  // Admin API routes
  app.post("/api/admin/auth", handleAdminAuth);
  app.get("/api/admin/check", handleAdminCheck);
  app.get("/api/admin/users", handleGetUsers);
  app.get("/api/admin/stats", handleAdminStats);
  app.post("/api/admin/set-admin", handleSetAdmin);
  app.post("/api/admin/ban-user", handleBanUser);

  // Users API routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { id, first_name, last_name, username, photo_url } = req.body;

      if (!id) {
        return res.status(400).json({ error: "User ID is required" });
      }

      const userId = id.toString();
      const name = [first_name, last_name].filter(Boolean).join(" ");
      const userUsername = username ? username : undefined;

      // Find or create user in DB
      let user = await User.findOne({ telegramId: userId });

      if (!user) {
        console.log(`[AUTH] Создание нового пользователя: ${userId}`);
        user = await User.create({
          telegramId: userId,
          name: name || `User ${userId}`,
          username: userUsername,
          avatarUrl: photo_url,
          verified: false,
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
        console.log(`[AUTH] Пользователь ${userId} создан успешно`);
      } else {
        // Update info if changed
        console.log(`[AUTH] Обновление пользователя: ${userId}`);
        
        // Ensure stats and settings exist
        if (!user.stats) {
          user.stats = {
            posts: 0,
            followers: 0,
            following: 0,
            likesReceived: 0,
            viewsCount: 0,
            starsReceived: 0
          };
        }
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
        
        user.name = name || user.name;
        user.username = userUsername || user.username;
        user.avatarUrl = photo_url || user.avatarUrl;
        await user.save();
        console.log(`[AUTH] Пользователь ${userId} обновлен`);
      }

      res.json({
        success: true,
        user: {
          id: user.telegramId,
          name: user.name,
          username: user.username,
          avatarUrl: user.avatarUrl,
          verified: user.verified,
          isAdmin: user.isAdmin
        }
      });
    } catch (error) {
      console.error("Auth error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Posts API routes
  app.get("/api/posts", handleGetPosts);
  app.post("/api/posts", handleCreatePost);
  app.post("/api/posts/:postId/like", handleLikePost);
  app.delete("/api/posts/:postId", handleDeletePost);

  // Premium API routes
  app.post("/api/premium/purchase", handlePremiumPurchase);
  app.get("/api/premium/status", handlePremiumStatus);

  // User Stats & Settings
  app.get("/api/users/:userId", handleUserProfile); // Profile endpoint
  app.get("/api/users/:userId/stats", handleUserStats); // Stats only
  app.put("/api/users/:userId", handleUpdateUserStats);
  app.get("/api/users/:userId/settings", handleUserSettingsGet);
  app.put("/api/users/:userId/settings", handleUserSettingsPut);
  app.delete("/api/users/:userId", handleDeleteUser);

  return app;
}
