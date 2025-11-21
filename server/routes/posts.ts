import { RequestHandler } from "express";
import Post from "../models/Post";
import User from "../models/User";

export const handleGetPosts: RequestHandler = async (req, res) => {
    try {
        const { type, userId } = req.query;
        const query: any = {};

        if (type) {
            query.type = type;
        } else {
            // If type is not specified, we might want to exclude stories/scrolls or include them?
            // Default behavior: show 'post' type if nothing specified, or maybe all?
            // Let's default to 'post' to match typical feed behavior
            query.type = 'post';
        }

        if (userId) {
            query.userId = userId;
        }

        const posts = await Post.find(query).sort({ createdAt: -1 }).limit(50);
        res.json({ posts });
    } catch (error) {
        console.error("Ошибка получения постов:", error);
        res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
};

export const handleCreatePost: RequestHandler = async (req, res) => {
    try {
        const { userId, caption, media, mediaType, type, visibility } = req.body;

        if (!userId || !media || !mediaType) {
            return res.status(400).json({ error: "Неверные параметры" });
        }

        // Get author info
        const user = await User.findOne({ telegramId: userId });
        const author = {
            name: user?.name || "Unknown",
            avatar: user?.avatarUrl || "",
            username: user?.username || "",
            verified: user?.verified || false
        };

        const newPost = await Post.create({
            userId,
            author,
            caption,
            media,
            mediaType,
            type: type || 'post',
            visibility: visibility || 'public',
        });

        // Update user stats
        if (user && type === 'post') {
            user.stats.posts += 1;
            await user.save();
        }

        res.json({ success: true, post: newPost });
    } catch (error) {
        console.error("Ошибка создания поста:", error);
        res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
};

export const handleLikePost: RequestHandler = async (req, res) => {
    try {
        const { postId } = req.params;
        const { userId, action } = req.body;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "Пост не найден" });
        }

        if (action === 'like') {
            if (!post.likedBy.includes(userId)) {
                post.likedBy.push(userId);
                post.likes += 1;
            }
        } else {
            const index = post.likedBy.indexOf(userId);
            if (index > -1) {
                post.likedBy.splice(index, 1);
                post.likes = Math.max(0, post.likes - 1);
            }
        }

        await post.save();

        // Update author's total likes received
        if (action === 'like') {
            await User.updateOne(
                { telegramId: post.userId },
                { $inc: { "stats.likesReceived": 1 } }
            );
        } else {
            await User.updateOne(
                { telegramId: post.userId },
                { $inc: { "stats.likesReceived": -1 } }
            );
        }

        res.json({ success: true, likes: post.likes, liked: action === 'like' });
    } catch (error) {
        console.error("Ошибка лайка:", error);
        res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
};

export const handleDeletePost: RequestHandler = async (req, res) => {
    try {
        const { postId } = req.params;
        const { userId } = req.body; // Check ownership

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "Пост не найден" });
        }

        if (post.userId !== userId) {
            // Check if admin
            const user = await User.findOne({ telegramId: userId });
            if (!user?.isAdmin) {
                return res.status(403).json({ error: "Нет прав" });
            }
        }

        await Post.findByIdAndDelete(postId);

        // Decrement stats
        if (post.type === 'post') {
            await User.updateOne(
                { telegramId: post.userId },
                { $inc: { "stats.posts": -1 } }
            );
        }

        res.json({ success: true });
    } catch (error) {
        console.error("Ошибка удаления поста:", error);
        res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
};
