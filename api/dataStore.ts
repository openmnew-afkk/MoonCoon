// Simple JSON persistence for serverless demo
// (Created for branch: fix/persistence-and-modal)
//
// Usage:
//   const store = new DataStore(pathToJson)
//   await store.load()
//   await store.addPost({...})
//   await store.save()
import fs from "fs";
import path from "path";

type AnyObj = Record<string, any>;

export class DataStore {
  filePath: string;
  state: {
    posts: AnyObj[];
    stories: AnyObj[];
    postLikes: Record<string, string[]>;
    postComments: Record<string, AnyObj[]>;
    users: AnyObj[];
    userSettings: Record<string, AnyObj>;
    userProfiles: Record<string, AnyObj>;
    userStars: Record<string, number>;
    adminUsers: string[];
  };

  constructor(file = "./.data/store.json") {
    this.filePath = path.resolve(process.cwd(), file);
    this.state = {
      posts: [],
      stories: [],
      postLikes: {},
      postComments: {},
      users: [],
      userSettings: {},
      userProfiles: {},
      userStars: {},
      adminUsers: [],
    };
  }

  async ensureDir() {
    const dir = path.dirname(this.filePath);
    await fs.promises.mkdir(dir, { recursive: true });
  }

  async load() {
    try {
      await this.ensureDir();
      if (!fs.existsSync(this.filePath)) {
        await this.save(); // create initial file
        return;
      }
      const raw = await fs.promises.readFile(this.filePath, "utf-8");
      this.state = JSON.parse(raw || "{}");
      // ensure keys exist
      this.state.posts = this.state.posts || [];
      this.state.stories = this.state.stories || [];
      this.state.postLikes = this.state.postLikes || {};
      this.state.postComments = this.state.postComments || {};
      this.state.users = this.state.users || [];
      this.state.userSettings = this.state.userSettings || {};
      this.state.userProfiles = this.state.userProfiles || {};
      this.state.userStars = this.state.userStars || {};
      this.state.adminUsers = this.state.adminUsers || [];
    } catch (e) {
      console.error("DataStore load error:", e);
      // keep defaults
    }
  }

  async save() {
    try {
      await this.ensureDir();
      const tmp = this.filePath + ".tmp";
      await fs.promises.writeFile(tmp, JSON.stringify(this.state, null, 2), "utf-8");
      await fs.promises.rename(tmp, this.filePath); // atomic-ish
    } catch (e) {
      console.error("DataStore save error:", e);
    }
  }

  // Posts
  getPosts() {
    return this.state.posts;
  }
  addPost(post: AnyObj) {
    this.state.posts.push(post);
  }
  findPost(id: string) {
    return this.state.posts.find((p: AnyObj) => p.id === id);
  }

  // Likes
  getLikes(postId: string) {
    return new Set(this.state.postLikes[postId] || []);
  }
  like(postId: string, userId: string) {
    const arr = this.state.postLikes[postId] || [];
    if (!arr.includes(userId)) arr.push(userId);
    this.state.postLikes[postId] = arr;
  }
  unlike(postId: string, userId: string) {
    const arr = this.state.postLikes[postId] || [];
    this.state.postLikes[postId] = arr.filter((u: string) => u !== userId);
    this.state.postLikes[postId] = arr;
  }

  // Comments
  getComments(postId: string) {
    return this.state.postComments[postId] || [];
  }
  addComment(postId: string, comment: AnyObj) {
    const arr = this.state.postComments[postId] || [];
    arr.push(comment);
    this.state.postComments[postId] = arr;
  }

  // Settings / profiles / stars
  getUserSettings(userId: string) {
    return this.state.userSettings[userId] || null;
  }
  putUserSettings(userId: string, settings: AnyObj) {
    this.state.userSettings[userId] = { ...(this.state.userSettings[userId] || {}), ...settings };
  }
  getUserProfile(userId: string) {
    return this.state.userProfiles[userId] || null;
  }
  putUserProfile(userId: string, profile: AnyObj) {
    this.state.userProfiles[userId] = { ...(this.state.userProfiles[userId] || {}), ...profile };
  }

  // Stars
  getStars(userId: string) {
    return this.state.userStars[userId] || 0;
  }
  addStars(userId: string, amount: number) {
    this.state.userStars[userId] = (this.state.userStars[userId] || 0) + amount;
  }
  spendStars(userId: string, amount: number) {
    this.state.userStars[userId] = (this.state.userStars[userId] || 0) - amount;
  }
}