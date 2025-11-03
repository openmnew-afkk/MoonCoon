import type { VercelRequest, VercelResponse } from "@vercel/node";
import { DataStore } from "./dataStore";

const store = new DataStore("./.data/store.json");
await store.load();

function buildPost(post: any) {
  const author = store.getUserProfile(post.userId) || {
    id: post.userId,
    name: post.userId,
    username: `@user_${post.userId}`,
    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.userId}`,
  };
  const likes = (store.state.postLikes[post.id] || []).length || 0;
  const comments = (store.state.postComments[post.id] || []).length || 0;
  return { ...post, author, likes, comments };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const url = req.url || "";

    if (url === "/api/posts" && req.method === "GET") {
      const posts = store.getPosts().map(buildPost);
      return res.json({ posts });
    }

    if (url === "/api/posts" && req.method === "POST") {
      const { userId, caption, visibility, media, mediaType, type } = req.body || {};
      if (!userId || !media || !mediaType) return res.status(400).json({ error: "Missing required fields" });
      const newPost = { id: Date.now().toString(), userId, caption: caption||"", visibility: visibility||"public", media, mediaType, createdAt: new Date().toISOString(), pinned:false };
      if (type === "story") {
        const story = { ...newPost, expiresAt: new Date(Date.now() + 24*60*60*1000).toISOString() };
        store.state.stories.push(story);
        await store.save();
        return res.json({ success:true, story: buildPost(story) });
      } else {
        store.state.posts.push(newPost);
        await store.save();
        return res.json({ success:true, post: buildPost(newPost) });
      }
    }

    if (url.match(/^\/api\/posts\/([^\/]+)\/like$/)) {
      const postId = url.split("/")[3];
      const { userId, action } = req.body || {};
      if (!userId || !action) return res.status(400).json({ error: "Missing userId or action" });
      store.state.postLikes[postId] = store.state.postLikes[postId] || [];
      if (action === "like") {
        if (!store.state.postLikes[postId].includes(userId)) store.state.postLikes[postId].push(userId);
      } else if (action === "unlike") {
        store.state.postLikes[postId] = store.state.postLikes[postId].filter((u:string)=>u!==userId);
      }
      const likes = store.state.postLikes[postId].length;
      const post = store.findPost ? store.findPost(postId) : store.getPosts().find((p:any)=>p.id===postId);
      if (post) post.likes = likes;
      await store.save();
      return res.json({ success:true, likes, liked: action==="like" });
    }

    if (url.match(/^\/api\/posts\/([^\/]+)\/comments$/)) {
      const postId = url.split("/")[3];
      if (req.method === "GET") {
        return res.json({ comments: store.getComments(postId) });
      }
      if (req.method === "POST") {
        const { userId, text, author } = req.body || {};
        if (!userId || !text) return res.status(400).json({ error: "Missing userId or text" });
        const comment = { id: Date.now().toString(), userId, text, author: author||"Пользователь", avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`, timestamp: new Date().toISOString(), likes:0 };
        store.addComment(postId, comment);
        const post = store.getPosts().find((p:any)=>p.id===postId);
        if (post) post.comments = store.getComments(postId).length;
        await store.save();
        return res.json({ success:true, comment, total: store.getComments(postId).length });
      }
    }

    // user profile/settings
    if (url.match(/^\/api\/users\/([^\/]+)\/settings$/)) {
      const userId = url.split("/")[3];
      if (req.method === "GET") {
        const settings = store.getUserSettings(userId) || { privateAccount:false, allowDMs:true, showOnlineStatus:true, email:"", username:`@user_${userId}`, bio:"", avatarUrl:"", blurAdultContent:true, allowAdultReveal:true, childMode:false };
        return res.json(settings);
      }
      if (req.method === "PUT") {
        const newSettings = { ...(req.body||{}) };
        store.putUserSettings(userId, newSettings);
        await store.save();
        return res.json({ success:true, settings: store.getUserSettings(userId) });
      }
    }

    // stats, stars, premium, admin checks remain similar but use store.state where needed

    return res.status(404).json({ error: "Endpoint not found", url });
  } catch (err:any) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error", message: err.message });
  }
}