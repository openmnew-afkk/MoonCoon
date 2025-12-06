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

        console.log(`[POST] Создание поста для userId: ${userId}`, { type, mediaType, hasMedia: !!media });

        if (!userId || !media || !mediaType) {
            console.error(`[POST] Неверные параметры: userId=${userId}, hasMedia=${!!media}, mediaType=${mediaType}`);
            return res.status(400).json({ error: "Неверные параметры: userId, media и mediaType обязательны" });
        }

        // Find or create user
        const userQuery = User.findOne({ telegramId: userId }) as any;
        let user = await userQuery.exec();
        
        if (!user) {
            console.log(`[POST] Пользователь ${userId} не найден, создаем нового`);
            // Create user if doesn't exist
            const newUserData = {
                telegramId: userId,
                name: `User ${userId}`,
                username: undefined as string | undefined,
                avatarUrl: undefined as string | undefined,
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
            };
            user = await (User.create as any)(newUserData);
            console.log(`[POST] Пользователь ${userId} создан`);
        }

        // Ensure stats exist
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

        const author = {
            name: user.name,
            avatar: user.avatarUrl || "",
            username: user.username || "",
            verified: user.verified || false
        };

        console.log(`[POST] Создание поста в БД...`);
        const postData = {
            userId,
            author,
            caption: caption || '',
            media,
            mediaType,
            type: (type || 'post') as 'post' | 'story' | 'scroll',
            visibility: (visibility || 'public') as 'public' | 'followers',
        };
        const newPost = await (Post.create as any)(postData);
        console.log(`[POST] Пост создан с ID: ${newPost._id}`);

        // Update user stats
        if (type === 'post' || !type) {
            user.stats.posts = (user.stats.posts || 0) + 1;
            await user.save();
            console.log(`[POST] Статистика пользователя ${userId} обновлена: posts=${user.stats.posts}`);
        }

        res.json({ success: true, post: newPost });
    } catch (error) {
        console.error("Ошибка создания поста:", error);
        res.status(500).json({ 
            error: "Внутренняя ошибка сервера", 
            details: error instanceof Error ? error.message : String(error) 
        });
    }
};

export const handleLikePost: RequestHandler = async (req, res) => {
    try {
        const { postId } = req.params;
        const { userId, action } = req.body;

        const postQuery = Post.findById(postId) as any;
        const post = await postQuery.exec();
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

        // Update author's total likes received (ensure user exists)
        const authorQuery = User.findOne({ telegramId: post.userId }) as any;
        const author = await authorQuery.exec();
        if (author) {
            if (action === 'like') {
                author.stats = author.stats || {
                    posts: 0,
                    followers: 0,
                    following: 0,
                    likesReceived: 0,
                    viewsCount: 0,
                    starsReceived: 0
                };
                author.stats.likesReceived = (author.stats.likesReceived || 0) + 1;
                await author.save();
            } else {
                author.stats = author.stats || {
                    posts: 0,
                    followers: 0,
                    following: 0,
                    likesReceived: 0,
                    viewsCount: 0,
                    starsReceived: 0
                };
                author.stats.likesReceived = Math.max(0, (author.stats.likesReceived || 0) - 1);
                await author.save();
            }
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

        const postQuery = Post.findById(postId) as any;
        const post = await postQuery.exec();
        if (!post) {
            return res.status(404).json({ error: "Пост не найден" });
        }

        if (post.userId !== userId) {
            // Check if admin
            const userQuery = User.findOne({ telegramId: userId }) as any;
            const user = await userQuery.exec();
            if (!user?.isAdmin) {
                return res.status(403).json({ error: "Нет прав" });
            }
        }

        const deleteQuery = Post.findByIdAndDelete(postId) as any;
        await deleteQuery.exec();

        // Decrement stats
        if (post.type === 'post') {
            const updateQuery = User.updateOne(
                { telegramId: post.userId },
                { $inc: { "stats.posts": -1 } }
            ) as any;
            await updateQuery.exec();
        }

        res.json({ success: true });
    } catch (error) {
        console.error("Ошибка удаления поста:", error);
        res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
};
