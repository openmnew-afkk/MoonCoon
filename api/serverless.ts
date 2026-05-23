import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";

// In-memory storage (will reset on each cold start)
const posts: any[] = [];
const stories: any[] = [];
const adminUsers = new Set(["1234567890"]); // Test admin
const adminUsernames = new Set(["testuser"]); // Test admin
const userSettings: Record<string, any> = {}; // User settings storage
const userStars: Record<string, number> = {}; // User stars balance
const userProfiles: Record<string, any> = {}; // User profile data cache
const postLikes: Record<string, Set<string>> = {}; // Track likes per post
const postComments: Record<string, any[]> = {}; // Store comments per post

// Admin session storage
const adminSessions = new Map<string, { userId: string; expiresAt: number }>();
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

function getAdminUsername(): string {
  return (process.env.ADMIN_USERNAME || "mikysauce").toLowerCase().replace("@", "");
}

function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || "";
}

function hashStr(s: string): string {
  return crypto.createHash("sha256").update(s).digest("hex");
}

function verifyAdminPassword(input: string): boolean {
  const expected = getAdminPassword();
  if (!expected) return false;
  const a = Buffer.from(hashStr(input));
  const b = Buffer.from(hashStr(expected));
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function createAdminSession(userId: string): string {
  const token = crypto.randomBytes(32).toString("hex");
  adminSessions.set(token, { userId, expiresAt: Date.now() + SESSION_TTL_MS });
  return token;
}

function isValidAdminSession(req: VercelRequest): boolean {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return false;
  const token = auth.slice(7);
  const session = adminSessions.get(token);
  if (!session) return false;
  if (session.expiresAt < Date.now()) { adminSessions.delete(token); return false; }
  return true;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  console.log(`🌐 ${req.method} ${req.url}`);

  try {
    const url = req.url || "";

    // Posts API
    if (url === "/api/posts" && req.method === "GET") {
      return res.json({ posts });
    }

    if (url === "/api/posts" && req.method === "POST") {
      const { userId, caption, visibility, media, mediaType, type } =
        req.body || {};

      console.log("📥 Creating post:", {
        userId: !!userId,
        mediaType,
        mediaSize: media?.length || 0,
        type: type || "post",
      });

      if (!userId || !media || !mediaType) {
        console.log("❌ Missing required fields");
        return res.status(400).json({ error: "Missing required fields" });
      }

      const newPost = {
        id: Date.now().toString(),
        userId,
        caption: caption || "",
        visibility: visibility || "public",
        media,
        mediaType,
        createdAt: new Date().toISOString(),
        likes: 0,
        comments: 0,
        pinned: false,
      };

      if (type === "story") {
        stories.push({
          ...newPost,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        });
        console.log("✅ Story created:", newPost.id);
        return res.json({ success: true, story: newPost });
      } else {
        posts.push(newPost);
        console.log("✅ Post created:", newPost.id);
        return res.json({ success: true, post: newPost });
      }
    }

    // Stories API
    if (url === "/api/stories" && req.method === "GET") {
      return res.json({ stories });
    }

    // Admin Login
    if (url === "/api/admin/login" && req.method === "POST") {
      const { username, password, userId } = req.body || {};
      if (!username || !password || !userId) {
        return res.status(400).json({ error: "Нужны username, password, userId" });
      }
      const cleanUsername = username.toLowerCase().replace("@", "");
      if (cleanUsername !== getAdminUsername()) {
        return res.status(403).json({ success: false, error: "Доступ запрещён" });
      }
      if (!verifyAdminPassword(password)) {
        return res.status(403).json({ success: false, error: "Неверный пароль" });
      }
      const sessionToken = createAdminSession(String(userId));
      console.log("🔑 Admin login success:", userId);
      return res.json({ success: true, sessionToken, message: "Вход выполнен" });
    }

    // Admin Auth check (by session token)
    if (url === "/api/admin/auth" && req.method === "POST") {
      const valid = isValidAdminSession(req);
      return res.json({ success: valid });
    }

    // Admin API
    if (url.startsWith("/api/admin/check")) {
      const isAdmin = isValidAdminSession(req);
      console.log("🔑 Admin check:", isAdmin);
      return res.json({ isAdmin, message: isAdmin ? "Доступ разрешен" : "Доступ запрещен" });
    }

    if (url === "/api/admin/users" && req.method === "GET") {
      const users = Array.from({ length: 10 }, (_, i) => ({
        id: `user_${i + 1}`,
        name: `User ${i + 1}`,
        username: `@user${i + 1}`,
        isAdmin: adminUsers.has(`user_${i + 1}`),
        isBanned: false,
        posts: Math.floor(Math.random() * 100),
        followers: Math.floor(Math.random() * 1000),
        createdAt: new Date().toISOString(),
      }));
      return res.json({ users });
    }

    // Admin user management endpoints
    if (url === "/api/admin/set-admin" && req.method === "POST") {
      const { userId, isAdmin } = req.body || {};
      console.log("🔧 Setting admin status:", { userId, isAdmin });
      // For demo purposes, just return success
      return res.json({ success: true });
    }

    if (url === "/api/admin/ban-user" && req.method === "POST") {
      const { userId, isBanned, reason } = req.body || {};
      console.log("🚫 Banning user:", { userId, isBanned, reason });
      // For demo purposes, just return success
      return res.json({ success: true });
    }

    // User Settings API
    if (url.match(/^\/api\/users\/([^\/]+)\/settings$/)) {
      const userId = url.split("/")[3];

      if (req.method === "GET") {
        const settings = userSettings[userId] || {
          privateAccount: false,
          allowDMs: true,
          showOnlineStatus: true,
          email: "",
          username: `@user_${userId}`,
          bio: "",
          avatarUrl: "",
          blurAdultContent: true,
          allowAdultReveal: true,
          childMode: false,
        };
        console.log("🔧 Getting user settings:", { userId, settings });
        return res.json(settings);
      }

      if (req.method === "PUT") {
        const newSettings = { ...req.body };
        userSettings[userId] = { ...userSettings[userId], ...newSettings };
        console.log("💾 Saving user settings:", {
          userId,
          settings: newSettings,
        });
        return res.json({ success: true, settings: userSettings[userId] });
      }
    }

    // User Stats API
    if (url.match(/^\/api\/users\/([^\/]+)\/stats$/)) {
      const userId = url.split("/")[3];
      const stats = {
        posts: posts.filter((p) => p.userId === userId).length,
        followers: Math.floor(Math.random() * 1000),
        following: Math.floor(Math.random() * 500),
      };
      console.log("📊 Getting user stats:", { userId, stats });
      return res.json(stats);
    }

    // Stars API
    if (url.startsWith("/api/stars/balance")) {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ error: "Missing userId parameter" });
      }

      const balance =
        userStars[userId] || Math.floor(Math.random() * 500) + 100;
      userStars[userId] = balance; // Cache the balance
      console.log("⭐ Getting stars balance:", { userId, balance });
      return res.json({ balance });
    }

    // Premium API
    if (url.startsWith("/api/premium/check")) {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ error: "Missing userId parameter" });
      }

      // Users with ID <= 1000 get premium for free
      const isPremium = parseInt(userId) <= 1000;
      console.log("💎 Checking premium status:", { userId, isPremium });
      return res.json({ isPremium, type: isPremium ? "early_user" : "none" });
    }

    // User Profile API
    if (url.match(/^\/api\/users\/([^\/]+)$/)) {
      const userId = url.split("/")[3];

      if (req.method === "GET") {
        // Generate or get cached user profile
        if (!userProfiles[userId]) {
          const userNames = [
            "Александр",
            "Мария",
            "Дмитрий",
            "Анна",
            "Сергей",
            "Елена",
            "Андрей",
            "Наталья",
            "Михаил",
            "Ольга",
            "Павел",
            "Татьяна",
            "Николай",
            "Светлана",
            "Владимир",
            "Юлия",
            "Денис",
            "Ирина",
          ];
          const randomName =
            userNames[parseInt(userId) % userNames.length] || "Пользователь";

          userProfiles[userId] = {
            id: userId,
            name: randomName,
            username: `@${randomName.toLowerCase()}${userId}`,
            bio: `Пользователь ${randomName}`,
            avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
            verified: parseInt(userId) <= 1000, // Early users get verified
            createdAt: new Date().toISOString(),
          };
        }

        console.log("👤 Getting user profile:", {
          userId,
          profile: userProfiles[userId],
        });
        return res.json(userProfiles[userId]);
      }
    }

    // Likes API
    if (url.match(/^\/api\/posts\/([^\/]+)\/like$/)) {
      const postId = url.split("/")[3];
      const { userId, action } = req.body || {};

      if (!userId || !action) {
        return res.status(400).json({ error: "Missing userId or action" });
      }

      if (!postLikes[postId]) {
        postLikes[postId] = new Set();
      }

      let liked = false;
      if (action === "like") {
        postLikes[postId].add(userId);
        liked = true;
      } else if (action === "unlike") {
        postLikes[postId].delete(userId);
        liked = false;
      }

      // Update post likes count
      const post = posts.find((p) => p.id === postId);
      if (post) {
        post.likes = postLikes[postId].size;
      }

      console.log("❤️ Post like:", {
        postId,
        userId,
        action,
        likes: postLikes[postId].size,
      });
      return res.json({ success: true, liked, likes: postLikes[postId].size });
    }

    // Comments API
    if (url.match(/^\/api\/posts\/([^\/]+)\/comments$/)) {
      const postId = url.split("/")[3];

      if (req.method === "GET") {
        const comments = postComments[postId] || [];
        return res.json({ comments });
      }

      if (req.method === "POST") {
        const { userId, text, author } = req.body || {};

        if (!userId || !text) {
          return res.status(400).json({ error: "Missing userId or text" });
        }

        if (!postComments[postId]) {
          postComments[postId] = [];
        }

        const comment = {
          id: Date.now().toString(),
          userId,
          text,
          author: author || "Пользователь",
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
          timestamp: new Date().toISOString(),
          likes: 0,
          liked: false,
        };

        postComments[postId].push(comment);

        // Update post comments count
        const post = posts.find((p) => p.id === postId);
        if (post) {
          post.comments = postComments[postId].length;
        }

        console.log("💬 Comment added:", {
          postId,
          userId,
          comments: postComments[postId].length,
        });
        return res.json({
          success: true,
          comment,
          total: postComments[postId].length,
        });
      }
    }

    // Telegram Stars API
    if (url.startsWith("/api/stars/balance") && req.method === "GET") {
      const { userId } = req.query;
      if (!userId || typeof userId !== "string") {
        return res.status(400).json({ error: "User ID required" });
      }

      const balance = userStars[userId] || 0;
      console.log("⭐ Get stars balance:", { userId, balance });
      return res.json({ balance });
    }

    if (url === "/api/stars/add" && req.method === "POST") {
      const { userId, stars } = req.body || {};
      if (!userId || typeof stars !== "number") {
        return res.status(400).json({ error: "User ID and stars amount required" });
      }

      // Add stars to user balance
      userStars[userId] = (userStars[userId] || 0) + stars;

      console.log("⭐ Add stars:", { userId, stars, newBalance: userStars[userId] });
      return res.json({ success: true, balance: userStars[userId] });
    }

    if (url === "/api/stars/spend" && req.method === "POST") {
      const { userId, stars, purpose } = req.body || {};
      if (!userId || typeof stars !== "number") {
        return res.status(400).json({ error: "User ID and stars amount required" });
      }

      const currentBalance = userStars[userId] || 0;
      if (currentBalance < stars) {
        return res.status(400).json({ error: "Insufficient stars balance" });
      }

      // Spend stars
      userStars[userId] = currentBalance - stars;

      console.log("⭐ Spend stars:", { userId, stars, purpose, newBalance: userStars[userId] });
      return res.json({ success: true, balance: userStars[userId] });
    }

    if (url === "/api/stars/send" && req.method === "POST") {
      const { fromUserId, toUserId, stars, message } = req.body || {};
      if (!fromUserId || !toUserId || typeof stars !== "number") {
        return res.status(400).json({ error: "From/To user IDs and stars amount required" });
      }

      const senderBalance = userStars[fromUserId] || 0;
      if (senderBalance < stars) {
        return res.status(400).json({ error: "Insufficient stars balance" });
      }

      // Transfer stars
      userStars[fromUserId] = senderBalance - stars;
      userStars[toUserId] = (userStars[toUserId] || 0) + stars;

      console.log("⭐ Send stars:", { 
        fromUserId, 
        toUserId, 
        stars, 
        message, 
        senderBalance: userStars[fromUserId],
        receiverBalance: userStars[toUserId]
      });
      
      return res.json({ 
        success: true, 
        senderBalance: userStars[fromUserId],
        receiverBalance: userStars[toUserId]
      });
    }

    // Search API
    if (url.startsWith("/api/search")) {
      const query = req.query.q as string;
      if (!query) {
        return res.json({ posts: [], users: [] });
      }

      const matchingPosts = posts
        .filter(
          (post) =>
            post.caption?.toLowerCase().includes(query.toLowerCase()) ||
            userProfiles[post.userId]?.name
              ?.toLowerCase()
              .includes(query.toLowerCase()),
        )
        .slice(0, 10);

      console.log("🔍 Search results:", { query, found: matchingPosts.length });
      return res.json({ posts: matchingPosts, users: [] });
    }

    // Default response for unknown endpoints
    console.log("❓ Unknown endpoint:", url);
    return res.status(404).json({ error: "Endpoint not found", url });
  } catch (error: any) {
    console.error("❌ Server error:", error);
    return res
      .status(500)
      .json({ error: "Internal server error", message: error.message });
  }
}
