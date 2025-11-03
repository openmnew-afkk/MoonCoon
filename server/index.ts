import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  handleStarsAdd,
  handleStarsWithdraw,
  handleStarsBalance,
  handleSendStar,
} from "./routes/stars";
import { handleAdminAuth, handleAdminCheck, handleGetUsers, handleSetAdmin, handleBanUser } from "./routes/admin";
import {
  handleUserStats,
  handleUpdateUserStats,
  handleUserSettings,
  handleDeleteUser,
} from "./routes/users";
import {
  handlePremiumPurchase,
  handlePremiumStatus,
} from "./routes/premium";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: '100mb' }));
  app.use(express.urlencoded({ extended: true, limit: '100mb' }));

  // Временное in-memory хранилище
  const posts: any[] = [];
  const stories: any[] = [];
  const users: any[] = [];
  const messages: any[] = [];
  const notifications: Map<string, number> = new Map();
  const starsBalance: Map<string, number> = new Map();
  const premiumUsers: Map<string, { expiresAt: string; type: string }> = new Map();

  // Вспомогательная сортировка: сначала pinned, затем по дате
  const sortWithPinned = (arr: any[]) => {
    const now = Date.now();
    return [...arr].sort((a, b) => {
      const ap = a.pinnedUntil && new Date(a.pinnedUntil).getTime() > now;
      const bp = b.pinnedUntil && new Date(b.pinnedUntil).getTime() > now;
      if (ap && !bp) return -1;
      if (!ap && bp) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  };

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
  app.post("/api/admin/set-admin", handleSetAdmin);
  app.post("/api/admin/ban-user", handleBanUser);

  // Users API routes
  app.get("/api/users/:userId/stats", handleUserStats);
  app.put("/api/users/:userId/stats", handleUpdateUserStats);
  app.get("/api/users/:userId/settings", handleUserSettings);
  app.put("/api/users/:userId/settings", handleUserSettings);
  app.get("/api/users/:userId/premium", handlePremiumStatus);
  app.delete("/api/users/:userId", handleDeleteUser);

  // Premium API routes
  app.post("/api/premium/purchase", handlePremiumPurchase);

  // Posts API (in-memory)
  app.get('/api/posts', (_req, res) => {
    res.json({ posts: sortWithPinned(posts) });
  });

  app.post('/api/posts', (req, res) => {
    try {
      console.log('📥 Получен запрос на создание поста');
      console.log('Body keys:', Object.keys(req.body || {}));
      
      const { userId, caption, visibility, media, mediaType, type } = req.body || {};
      
      // Проверка обязательных полей
      if (!userId) {
        console.error('❌ Отсутствует userId');
        return res.status(400).json({ error: 'Не указан ID пользователя' });
      }
      if (!media) {
        console.error('❌ Отсутствует media');
        return res.status(400).json({ error: 'Не указано медиа' });
      }
      if (!mediaType) {
        console.error('❌ Отсутствует mediaType');
        return res.status(400).json({ error: 'Не указан тип медиа' });
      }

      // Если это история, добавляем в массив stories
      if (type === 'story') {
        const story = {
          id: Date.now().toString(),
          userId,
          caption: caption || '',
          media,
          mediaType,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 часа
          views: 0,
          pinned: false
        };
        
        stories.push(story);
        console.log('✅ История создана:', story.id, '| userId:', userId, '| mediaType:', mediaType);
        
        return res.json({ success: true, story });
      }
      
      // Обычный пост
      const post = {
        id: Date.now().toString(),
        userId,
        caption: caption || '',
        visibility: visibility || 'public',
        media,
        mediaType,
        createdAt: new Date().toISOString(),
        likes: 0,
        comments: 0,
        pinned: false
      };
      
      posts.push(post);
      console.log('✅ Пост создан:', post.id, '| userId:', userId, '| mediaType:', mediaType);
      
      res.json({ success: true, post });
    } catch (error: any) {
      console.error('❌ Ошибка создания поста:', error);
      res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
  });

  // Stories API (in-memory)
  app.get('/api/stories', (_req, res) => {
    res.json({ stories: sortWithPinned(stories) });
  });

  // OpenAI endpoints
  const OPENAI_API_KEY = process.env.API_KEY || '';
  const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

  // Модерация контента
  app.post('/api/ai/moderate', async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) return res.status(400).json({ error: 'Нужен текст' });

      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{
            role: 'system',
            content: 'Ты модератор контента. Проверяй на соответствие правилам РФ: запрещены порнография, экстремизм, наркотики, насилие. Отвечай только "APPROVED" или "REJECTED".'
          }, {
            role: 'user',
            content: text
          }],
          max_tokens: 10,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        return res.json({ approved: true }); // Fallback
      }

      const data = await response.json();
      const result = data.choices?.[0]?.message?.content || 'APPROVED';
      const approved = result.includes('APPROVED');

      console.log('🤖 Модерация:', { approved });
      res.json({ approved });
    } catch (error) {
      console.error('❌ Ошибка модерации:', error);
      res.json({ approved: true }); // Fallback
    }
  });

  // Генерация подписей
  app.post('/api/ai/generate', async (req, res) => {
    try {
      const { description, style = 'casual' } = req.body;
      if (!description) return res.status(400).json({ error: 'Нужно описание' });

      const styles: Record<string, string> = {
        casual: 'непринуждённую',
        professional: 'профессиональную',
        funny: 'смешную с эмодзи',
        poetic: 'поэтичную'
      };

      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{
            role: 'system',
            content: `Ты креативный копирайтер. Пиши ${styles[style] || styles.casual} подпись для поста в соцсети на русском языке.`
          }, {
            role: 'user',
            content: description
          }],
          max_tokens: 150,
          temperature: 0.8
        })
      });

      if (!response.ok) {
        return res.status(500).json({ error: 'AI недоступен' });
      }

      const data = await response.json();
      const caption = data.choices?.[0]?.message?.content || '';

      console.log('✨ Генерация:', caption.substring(0, 50));
      res.json({ caption: caption.trim() });
    } catch (error) {
      console.error('❌ Ошибка генерации:', error);
      res.status(500).json({ error: 'Ошибка генерации' });
    }
  });

  // AI чат-бот
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { message } = req.body;
      if (!message) return res.status(400).json({ error: 'Нужно сообщение' });

      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{
            role: 'system',
            content: 'Ты - дружелюбный AI помощник MoonCoon. Помогаешь с вопросами о платформе, публикации контента, Premium подписке и звёздах. Отвечай кратко и по делу на русском языке.'
          }, {
            role: 'user',
            content: message
          }],
          max_tokens: 300,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('OpenAI error:', errorData);
        return res.status(500).json({ error: 'AI недоступен' });
      }

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || 'Извините, не могу ответить';

      console.log('💬 AI чат:', reply.substring(0, 50));
      res.json({ reply: reply.trim() });
    } catch (error: any) {
      console.error('❌ Ошибка чата:', error.message);
      res.status(500).json({ error: 'Ошибка чата: ' + error.message });
    }
  });

  // Media Proxy (whitelist)
  app.get('/api/proxy', async (req, res) => {
    try {
      const url = (req.query.url as string) || '';
      if (!url || !/^https:\/\//i.test(url)) {
        return res.status(400).send('Invalid url');
      }
      // Разрешённые домены
      const allowed = [
        'images.unsplash.com',
        'media.w3.org',
      ];
      const { hostname } = new URL(url);
      if (!allowed.includes(hostname)) {
        return res.status(403).send('Host not allowed');
      }
      const r = await fetch(url, { headers: { 'User-Agent': 'MoonCoon/1.0' } });
      if (!r.ok) {
        return res.status(r.status).send('Upstream error');
      }
      const ct = r.headers.get('content-type') || 'application/octet-stream';
      res.setHeader('Content-Type', ct);
      const buf = Buffer.from(await r.arrayBuffer());
      res.send(buf);
    } catch (e) {
      console.error('proxy error', e);
      res.status(500).send('Proxy error');
    }
  });

  // Ads API (pin content)
  app.post('/api/ads/story', (req, res) => {
    try {
      const { userId, hours = 1 } = req.body || {};
      if (!userId) return res.status(400).json({ error: 'userId обязателен' });
      const duration = Math.max(1, Math.min(24, Number(hours)));
      const price = 300 * duration; // 300⭐ за 1 час
      // TODO: списание звёзд на сервере из баланса (интеграция со stars)
      // Ищем последнюю сторис пользователя и пиним её
      const story = stories.find(s => s.userId === userId);
      if (!story) return res.status(404).json({ error: 'Нет опубликованных историй для закрепления' });
      story.pinnedUntil = new Date(Date.now() + duration * 3600 * 1000).toISOString();
      res.json({ success: true, price, pinnedUntil: story.pinnedUntil, story });
    } catch (e) {
      console.error('ads/story error', e);
      res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
  });

  app.post('/api/ads/post', (req, res) => {
    try {
      const { userId, hours = 1 } = req.body || {};
      if (!userId) return res.status(400).json({ error: 'userId обязателен' });
      const duration = Math.max(1, Math.min(24, Number(hours)));
      const price = 200 * duration; // 200⭐ за 1 час
      // TODO: списание звёзд на сервере из баланса (интеграция со stars)
      // Ищем последний пост пользователя и пиним его
      const post = posts.find(p => p.userId === userId);
      if (!post) return res.status(404).json({ error: 'Нет опубликованных постов для закрепления' });
      post.pinnedUntil = new Date(Date.now() + duration * 3600 * 1000).toISOString();
      res.json({ success: true, price, pinnedUntil: post.pinnedUntil, post });
    } catch (e) {
      console.error('ads/post error', e);
      res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
  });

  // Messages API
  app.post('/api/messages/send', (req, res) => {
    try {
      const { fromUserId, toUserId, text } = req.body || {};
      if (!fromUserId || !toUserId || !text) {
        return res.status(400).json({ error: 'Недостаточно данных' });
      }
      
      const message = {
        id: `msg_${Date.now()}`,
        senderId: fromUserId,
        receiverId: toUserId,
        text,
        timestamp: new Date().toISOString(),
        read: false,
      };
      
      messages.push(message);
      
      // Увеличиваем счетчик уведомлений для получателя
      const currentNotifications = notifications.get(toUserId) || 0;
      notifications.set(toUserId, currentNotifications + 1);
      
      console.log('✉️ Сообщение отправлено:', { from: fromUserId, to: toUserId });
      res.json({ success: true, message });
    } catch (e) {
      console.error('messages/send error', e);
      res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
  });

  app.get('/api/messages/:conversationId', (req, res) => {
    try {
      const { conversationId } = req.params;
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({ error: 'userId обязателен' });
      }
      
      // Получаем сообщения между двумя пользователями
      const conversationMessages = messages.filter(
        m => (m.senderId === userId && m.receiverId === conversationId) ||
             (m.senderId === conversationId && m.receiverId === userId)
      );
      
      // Помечаем сообщения как прочитанные
      conversationMessages.forEach(m => {
        if (m.receiverId === userId && !m.read) {
          m.read = true;
          const currentNotifications = notifications.get(userId as string) || 0;
          notifications.set(userId as string, Math.max(0, currentNotifications - 1));
        }
      });
      
      res.json({ messages: conversationMessages });
    } catch (e) {
      console.error('messages/get error', e);
      res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
  });

  app.get('/api/messages/notifications', (req, res) => {
    try {
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ error: 'userId обязателен' });
      }
      
      const count = notifications.get(userId as string) || 0;
      res.json({ count });
    } catch (e) {
      console.error('messages/notifications error', e);
      res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
  });

  return app;
}
