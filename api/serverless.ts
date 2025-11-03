import type { VercelRequest, VercelResponse } from "@vercel/node";

// In-memory storage (will reset on each cold start)
const posts: any[] = [];
const stories: any[] = [];
const adminUsers = new Set(["1234567890"]); // Test admin
const adminUsernames = new Set(["testuser"]); // Test admin

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

    // Admin API
    if (url.startsWith("/api/admin/check")) {
      const userId = req.query.userId as string;
      const username = req.query.username as string;

      console.log("🔍 Admin check:", { userId, username });

      let isAdmin = false;
      if (userId) isAdmin = adminUsers.has(userId);
      if (!isAdmin && username)
        isAdmin = adminUsernames.has(username.toLowerCase().replace("@", ""));

      console.log("🔑 Admin result:", isAdmin);
      return res.json({ isAdmin });
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
