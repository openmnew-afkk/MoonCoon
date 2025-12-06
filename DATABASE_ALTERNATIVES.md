# Бесплатные альтернативы MongoDB

## 🎯 Рекомендация: MongoDB Atlas (БЕСПЛАТНО, без изменений кода)

**Лучший вариант** - использует тот же MongoDB, код менять не нужно!

### MongoDB Atlas (M0 Free Tier)
- ✅ **512 MB хранилища** (достаточно для начала)
- ✅ **Бесплатно навсегда**
- ✅ **Без изменений кода** - использует тот же Mongoose
- ✅ **Автоматические бэкапы**
- ✅ **Глобальная доступность**

**Как настроить:**
1. Зарегистрируйтесь на https://cloud.mongodb.com
2. Создайте бесплатный кластер (M0 Free)
3. Создайте пользователя БД (Database Access)
4. Добавьте IP адрес в Network Access (или 0.0.0.0/0 для всех)
5. Получите connection string: Connect → Connect your application
6. Используйте в Vercel как `MONGODB_URI`

**Connection string формат:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/mooncoon?retryWrites=true&w=majority
```

---

## 🔄 Альтернативы (требуют изменения кода)

### 1. Supabase (PostgreSQL) - Рекомендуется для миграции

**Бесплатный tier:**
- ✅ 500 MB база данных
- ✅ 2 GB хранилище файлов
- ✅ Автоматические API endpoints
- ✅ Реалтайм подписки
- ✅ Встроенная аутентификация

**Что нужно изменить:**
- Заменить Mongoose на Prisma или TypeORM
- Переписать модели на SQL схемы
- Изменить запросы с MongoDB на SQL

**Ссылка:** https://supabase.com

---

### 2. PlanetScale (MySQL) - Serverless MySQL

**Бесплатный tier:**
- ✅ 1 база данных
- ✅ 5 GB хранилища
- ✅ 1 миллиард строк чтения/месяц
- ✅ Автоматические бэкапы

**Что нужно изменить:**
- Заменить Mongoose на Prisma или TypeORM
- Переписать модели на SQL схемы
- Изменить запросы

**Ссылка:** https://planetscale.com

---

### 3. Railway - Разные БД на выбор

**Бесплатный tier:**
- ✅ $5 кредитов в месяц (хватает для маленьких проектов)
- ✅ Можно выбрать MongoDB, PostgreSQL, MySQL, Redis
- ✅ Простой деплой

**Что нужно изменить:**
- Если выберете MongoDB - ничего менять не нужно!
- Если другую БД - как выше

**Ссылка:** https://railway.app

---

### 4. Neon (PostgreSQL) - Serverless Postgres

**Бесплатный tier:**
- ✅ 0.5 GB хранилища
- ✅ Автоматическое масштабирование
- ✅ Branching (как Git для БД)

**Что нужно изменить:**
- Заменить Mongoose на Prisma или TypeORM
- Переписать модели

**Ссылка:** https://neon.tech

---

### 5. Turso (SQLite) - Edge SQLite

**Бесплатный tier:**
- ✅ 500 MB хранилища
- ✅ 1 миллиард строк чтения/месяц
- ✅ Глобальное распределение

**Что нужно изменить:**
- Заменить Mongoose на libSQL клиент
- Переписать модели на SQL

**Ссылка:** https://turso.tech

---

## 📊 Сравнение

| Сервис | БД | Хранилище | Изменения кода | Рекомендация |
|--------|----|-----------|----------------|--------------|
| **MongoDB Atlas** | MongoDB | 512 MB | ❌ Нет | ⭐⭐⭐⭐⭐ |
| **Supabase** | PostgreSQL | 500 MB | ✅ Да (Prisma) | ⭐⭐⭐⭐ |
| **PlanetScale** | MySQL | 5 GB | ✅ Да (Prisma) | ⭐⭐⭐ |
| **Railway** | Любая | $5/мес | Зависит от БД | ⭐⭐⭐⭐ |
| **Neon** | PostgreSQL | 0.5 GB | ✅ Да (Prisma) | ⭐⭐⭐ |
| **Turso** | SQLite | 500 MB | ✅ Да (libSQL) | ⭐⭐ |

---

## 🚀 Быстрый старт с MongoDB Atlas

### Шаг 1: Регистрация
1. Перейдите на https://cloud.mongodb.com
2. Зарегистрируйтесь (можно через Google/GitHub)

### Шаг 2: Создание кластера
1. Нажмите **"Build a Database"**
2. Выберите **FREE (M0)** план
3. Выберите регион (ближайший к вам)
4. Назовите кластер (например: `MoonCoon-Cluster`)
5. Нажмите **Create**

### Шаг 3: Настройка безопасности
1. **Database Access:**
   - Add New Database User
   - Username: `mooncoon-user`
   - Password: сгенерируйте надежный пароль (сохраните!)
   - Database User Privileges: **Read and write to any database**

2. **Network Access:**
   - Add IP Address
   - Выберите **"Allow Access from Anywhere"** (0.0.0.0/0)
   - Или добавьте IP Vercel серверов

### Шаг 4: Получение connection string
1. Нажмите **Connect** на вашем кластере
2. Выберите **"Connect your application"**
3. Driver: **Node.js**, Version: **5.5 or later**
4. Скопируйте connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Шаг 5: Настройка в Vercel
1. Замените `<username>` и `<password>` на ваши данные
2. Добавьте имя базы данных: `...mongodb.net/mooncoon?...`
3. Добавьте в Vercel Environment Variables как `MONGODB_URI`

**Готово!** 🎉

---

## 💡 Рекомендация

**Используйте MongoDB Atlas** - это самый простой вариант:
- ✅ Не нужно менять код
- ✅ Бесплатно навсегда
- ✅ Надежно и масштабируемо
- ✅ Отличная документация

Если MongoDB Atlas не подходит, рекомендую **Supabase** - у них отличный бесплатный tier и хорошая документация для миграции.
