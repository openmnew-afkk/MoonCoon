# 🚀 Полное руководство по деплою MoonCoon на Vercel

## ✅ Быстрая настройка (5 минут)

### Шаг 1: Настройка MongoDB Atlas

1. **Добавьте IP адрес в Network Access:**
   - Войдите в https://cloud.mongodb.com
   - Перейдите в **Network Access**
   - Нажмите **Add IP Address**
   - Добавьте IP: `31.56.240.167` (или выберите **Allow Access from Anywhere** - `0.0.0.0/0`)
   - Нажмите **Confirm**

2. **Проверьте Database User:**
   - Перейдите в **Database Access**
   - Убедитесь, что пользователь `openmnew_db_user` существует
   - Если нет - создайте с паролем `o4x8p28SuEQJfBht`

### Шаг 2: Настройка Vercel

1. **Откройте проект в Vercel:**
   - https://vercel.com/dashboard
   - Найдите проект **MoonCoon**

2. **Добавьте переменную окружения:**
   - Перейдите в **Settings** → **Environment Variables**
   - Нажмите **Add New**
   - **Name:** `MONGODB_URI`
   - **Value:** 
     ```
     mongodb+srv://openmnew_db_user:o4x8p28SuEQJfBht@cluster0.iufs4hs.mongodb.net/mooncoon?retryWrites=true&w=majority
     ```
   - Выберите: ✅ **Production**, ✅ **Preview**
   - Нажмите **Save**

3. **Передеплойте:**
   - Перейдите в **Deployments**
   - Найдите последний деплой
   - Нажмите **⋯** → **Redeploy**

### Шаг 3: Проверка работы

После деплоя проверьте:

1. **API работает:**
   - Откройте: `https://ваш-домен.vercel.app/api/ping`
   - Должно вернуть: `{"message":"ping"}`

2. **База данных подключена:**
   - Проверьте логи в Vercel
   - Должно быть: `✅ MongoDB connected successfully`

3. **Функции работают:**
   - Создайте пост через приложение
   - Проверьте профиль
   - Проверьте статистику

---

## 📋 Чек-лист перед деплоем

- [ ] MongoDB Atlas кластер создан и работает
- [ ] IP адрес добавлен в Network Access
- [ ] Database User создан (`openmnew_db_user`)
- [ ] `MONGODB_URI` добавлена в Vercel Environment Variables
- [ ] Переменная добавлена для Production и Preview
- [ ] Код закоммичен и запушен в GitHub
- [ ] Vercel подключен к GitHub репозиторию
- [ ] Деплой прошел успешно

---

## 🔧 Структура проекта

```
├── api/
│   └── serverless.ts          # Serverless функция для Vercel
├── client/                    # React фронтенд
├── server/                    # Express backend
│   ├── db.ts                  # Подключение к MongoDB
│   ├── index.ts               # Express сервер
│   ├── models/                # Mongoose модели
│   └── routes/                # API routes
├── vercel.json                # Конфигурация Vercel
└── package.json
```

---

## 🌐 API Endpoints

После деплоя доступны следующие endpoints:

### Пользователи
- `POST /api/auth/login` - Авторизация пользователя
- `GET /api/users/:userId` - Профиль пользователя
- `GET /api/users/:userId/stats` - Статистика пользователя
- `GET /api/users/:userId/settings` - Настройки пользователя
- `PUT /api/users/:userId/settings` - Обновить настройки

### Посты
- `GET /api/posts` - Получить посты
- `POST /api/posts` - Создать пост
- `POST /api/posts/:postId/like` - Лайкнуть пост
- `DELETE /api/posts/:postId` - Удалить пост

### Звезды
- `GET /api/stars/balance?userId=...` - Баланс звезд
- `POST /api/stars/add` - Добавить звезды
- `POST /api/stars/send` - Отправить звезды на пост

### Админ
- `GET /api/admin/check?userId=...` - Проверка прав админа
- `GET /api/admin/users` - Список пользователей
- `GET /api/admin/stats` - Статистика админ-панели
- `POST /api/admin/set-admin` - Выдать права админа
- `POST /api/admin/ban-user` - Забанить пользователя

---

## 🐛 Решение проблем

### Проблема: "MongoDB connection failed"

**Решение:**
1. Проверьте, что `MONGODB_URI` правильно добавлена в Vercel
2. Убедитесь, что IP адрес добавлен в Network Access MongoDB Atlas
3. Проверьте правильность пароля в connection string
4. Передеплойте проект

### Проблема: "404 Not Found" на API routes

**Решение:**
1. Убедитесь, что `vercel.json` правильно настроен
2. Проверьте, что `api/serverless.ts` существует
3. Передеплойте проект

### Проблема: Посты не сохраняются

**Решение:**
1. Проверьте подключение к БД в логах Vercel
2. Убедитесь, что пользователь создается при авторизации
3. Проверьте, что `userId` передается правильно

### Проблема: Статистика не работает

**Решение:**
1. Убедитесь, что endpoint `/api/users/:userId/stats` доступен
2. Проверьте, что пользователь существует в БД
3. Проверьте логи в Vercel

---

## 📊 Мониторинг

### Логи Vercel
- Перейдите в **Deployments** → выберите деплой → **Functions** → `api/serverless`
- Здесь видны все логи сервера

### MongoDB Atlas
- Перейдите в **Monitoring** для просмотра метрик
- **Database** → **Collections** для просмотра данных

---

## 🔐 Безопасность

⚠️ **Важно:**
- Никогда не коммитьте пароли в Git
- Используйте Environment Variables в Vercel
- Регулярно обновляйте пароли
- Ограничьте IP адреса в Network Access (не используйте 0.0.0.0/0 в продакшене)

---

## 🎉 Готово!

После выполнения всех шагов ваше приложение должно работать:
- ✅ Посты создаются и сохраняются
- ✅ Пользователи регистрируются автоматически
- ✅ Статистика работает
- ✅ Настройки сохраняются
- ✅ Система звезд работает
- ✅ Админ-панель доступна

**Удачи с деплоем!** 🚀
