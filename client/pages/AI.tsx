import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Sparkles, ArrowDown, Volume2 } from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";
import { APP_NAME } from "@/lib/brand";

interface Message {
  id: string;
  role: "user" | "ai";
  text: string;
  time: string;
}

function playIntroSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.12);
      gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + i * 0.12 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.5);
    });
  } catch {}
}

function playMessageSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch {}
}

const KB: Record<string, string[]> = {
  greeting: [
    "Привет! 👋 Рада видеть тебя. Чем помочь сегодня?",
    "Привет! ✨ Готова к работе — задавай любые вопросы!",
    "О, привет! Давай создадим что-то крутое вместе 🚀",
    "Йо! 👋 Я Адель, твой AI-помощник. Рассказывай — чем займёмся?",
  ],
  farewell: [
    "Пока-пока! 🌟 Удачи с контентом, обращайся когда нужно!",
    "До встречи! ✨ Буду рада помочь снова!",
    "Удачи! 💫 Помни — я всегда тут, если нужна помощь.",
  ],
  thanks: [
    "Пожалуйста! 😊 Рада помочь!",
    "Не за что! ✨ Обращайся ещё!",
    "Всегда пожалуйста! 💫 Я рядом, если нужна помощь.",
  ],
  howAreYou: [
    "Супер! Генерирую идеи со скоростью света ⚡ А у тебя как?",
    "Прекрасно! Вся в работе — давай творить 😊",
    "Замечательно! Готова помочь с чем угодно 🚀",
  ],
  name: [
    "Я — Адель! 🌟 Твой персональный AI-помощник в Vexora. Помогаю с контентом, подписями, хэштегами и стратегией роста.",
    "Меня зовут Адель! ✨ Я создана чтобы делать твой контент лучше и жизнь проще.",
  ],
  age: [
    "Я — AI, у меня нет возраста 😄 Но智慧 мне не занимать! Давай лучше о твоём контенте поговорим 🚀",
  ],
  purpose: [
    "Моя мission — помочь тебе стать звездой Vexora! 🌟\n\nЯ умею:\n📸 Генерировать подписи\n🏷️ Подбирать хэштеги\n💡 Давать советы по контенту\n📈 Помогать расти\n😎 Шутить, когда грустно\n\nСпрашивай что угодно!",
  ],
  caption: [
    "📸 Давай сделаем крутую подпись!\n\nРасскажи:\n• Что на фото?\n• Какое настроение?\n• Стиль: дерзкий, нежный, минималистичный?\n\nИ я придумаю 3 варианта на выбор!",
    "📸 Подпись — это 50% успеха поста! Расскажи что на фото, и я придумаю что-то цепляющее ✨",
  ],
  captionGenerate: [
    "Вот 3 варианта подписи:\n\n✨ «Моменты, которые стоит запомнить»\n🌟 «Жизнь слишком коротка для обычных фото»\n💫 «Между небом и мечтой»\n\nКакой нравится? Или опиши фото подробнее — сделаю точнее!",
    "Окей, генерирую! 🚀\n\n✨ «В каждом кадре — целая история»\n🌟 «Не ищи идеальный момент — создай его»\n💫 «Тише едешь, дальше будешь... но быстрее запомнят»\n\nХочешь другой стиль? Скажи: дерзкий, нежный или минимализм!",
  ],
  hashtags: [
    "🏷️ Для точных хэштегов расскажи тему. А пока — универсальный набор:\n\n📈 Охват: #инстаграм #тренды #вирусное\n🎨 Стиль: #эстетика #минимализм #mood\n📸 Фото: #фотодня #portrait #photography\n🌍 Гео: #москва #россия #travel\n\nДай тему — подберу точнее!",
    "🏷️ Вот готовый набор хэштегов:\n\n🔥 Трендовые: #trending #viral #explore\n📸 Фото: #photooftheday #instagood #love\n🎯 Нишевые: скажи тему — подберу точнее!\n\nСовет: комбинируй 2-3 трендовых + 3-5 нишевых!",
  ],
  premium: [
    "💎 Premium в Vexora — это:\n\n✦ Без рекламы навсегда\n✦ Золотой статус в профиле\n✦ Приоритет в ленте и рекомендациях\n✦ Видео до 5 минут (вместо 1 мин)\n✦ Эксклюзивные фильтры\n✦ Ранний доступ к новым функциям\n\n👉 Купить: Профиль → Premium",
    "💎 Premium — твой билет в элиту Vexora!\n\n🔥 Главные плюсы:\n• Без рекламы — наслаждайся контентом\n• Золотой значок — все видят твой статус\n• Видео до 5 минут — больше контента\n• Приоритет в рекомендациях — больше охвата\n\nСтоит? Если хочешь расти — однозначно да! 💫",
  ],
  stars: [
    "⭐ Звёзды — валюта Vexora:\n\n💰 Как получить:\n• Получай от подписчиков за контент\n• Покупай в разделе Профиль\n\n🛍️ Как потратить:\n• Поддержи любимых авторов\n• Купи Premium-подписку\n• Продвигай свои посты\n\nЧем больше звёзд — тем выше в рейтинге!",
    "⭐ Звёзды = влияние в Vexora!\n\n📈 Как заработать:\n• Создавай крутой контент\n• Подписчики дарят звёзды за лучшие посты\n• Покупай в Профиле\n\n💎 На что потратить:\n• Premium-подписка\n• Продвижение постов\n• Подарки авторам\n\nСовет: качество контента — лучший способ заработать звёзды! 🌟",
  ],
  post: [
    "📱 Создать пост за 30 секунд:\n\n1️⃣ Нажми ➕ внизу экрана\n2️⃣ Выбери фото/видео из галереи\n3️⃣ Добавь описание + хэштеги\n4️⃣ Нажми «Готово» ✓\n\n💡 Лайфхак: первые 2 строки подписи — самые важные, их видно без раскрытия!",
    "📱 Пост = фото + подпись + хэштеги!\n\nКак создать:\n1. ➕ Внизу экрана\n2. Выбери медиа\n3. Напиши подпись (или попроси меня!)\n4. Добавь хэштеги\n5. Готово! 🎉\n\n💡 Тайминги: 12:00 и 19:00 — пик активности!",
  ],
  reel: [
    "🎬 Reels — лучший способ охватов!\n\nКак снять:\n1. ➕ → Выбери «Reels»\n2. Запиши видео (до 30 сек)\n3. Добавь трендовую музыку\n4. Напиши цепляющую подпись\n\n💡 Лайфхаки:\n• Первые 1 секунда — хук\n• Используй тренды\n• Вертикальное видео\n• Текст на экране",
  ],
  story: [
    "📱 Stories — для ежедневного контента!\n\nФичи:\n• Фото/видео на 24 часа\n• Стикиры, опросы, вопросы\n• Музыка\n• Ссылки\n\n💡 Совет: Stories держат аудиторию между постами!",
  ],
  live: [
    "🔴 Live-стримы в Vexora!\n\nКак начать:\n1. Профиль → «Начать трансляцию»\n2. Дай название\n3. Начни общаться!\n\n💡 Советы:\n• Анонсируй заранее\n• Общайся с зрителями\n• Проводи регулярно",
  ],
  music: [
    "🎵 Раздел Музыка:\n\n• Нажми на трек для воспроизведения\n• ❤️ Лайкай любимые треки\n• 🔍 Ищи по названию или исполнителю\n• ⏭️ Переключай в плеере внизу\n\nМузыка создаёт настроение для контента!",
    "🎵 Музыка в Vexora — это vibe!\n\n• 🔍 Поиск по трекам и исполнителям\n• ❤️ Сохраняй в избранное\n• 🎧 Слушай в фоне\n• 📱 Добавляй в Reels\n\nСовет: трендовая музыка = +50% к охвату! 📈",
  ],
  profile: [
    "👤 Профиль — твоя визитная карточка!\n\nЧто настроить:\n• Аватар (яркий, запоминающийся)\n• Био (что делаешь + CTA)\n• Ссылки\n• Закреплённый пост\n\n💡 Совет: первое впечатление решает — сделай профиль идеальным!",
  ],
  settings: [
    "⚙️ Настройки:\n\n• Уведомления — контролируй что приходит\n• Приватность — кто видит твои посты\n• Аккаунт — управление данными\n• Оформление — темы и стили\n\nЧто конкретно настроить?",
  ],
  notifications: [
    "🔔 Уведомления в Vexora:\n\n• ❤️ Лайки на твои посты\n• 💬 Комментарии\n• 👤 Новые подписчики\n• 📢 Рекомендации\n\nНастроить: ⚙️ → Уведомления",
  ],
  privacy: [
    "🔒 Приватность:\n\n• Открытый аккаунт — все видят контент\n• Закрытый — только подписчики\n• Скрыть статус онлайн\n• Ограничить комментарии\n\nНастроить: ⚙️ → Приватность",
  ],
  analytics: [
    "📊 Аналитика — ключ к росту!\n\nЧто смотришь:\n• Охват постов\n• Вовлечённость\n• Рост подписчиков\n• Лучшее время для публикации\n\nДоступно в: Профиль → Аналитика (Premium)",
  ],
  filter: [
    "🎨 Фильтры и редактор:\n\n• 20+ фильтров в посте\n• Регулировка яркости/контраста\n• Наложение текста\n• Обрезка и поворот\n\n💡 Совет: минимализм в фильтрах — максимум в вовлечении!",
  ],
  help: [
    "Я могу помочь с:\n\n📸 Подписи к фото (расскажи что на снимке)\n🏷️ Хэштеги (скажи тему поста)\n💎 Premium и звёзды (объясню всё)\n📱 Навигация по приложению\n💡 Идеи для контента\n🎯 Стратегия роста аудитории\n📊 Аналитика\n👤 Настройки профиля\n\nПросто спроси! Я всегда рядом ✨",
    "Чем могу помочь? 😊\n\n🎯 Вот что я умею:\n\n📸 Генерирую подписи\n🏷️ Подбираю хэштеги\n💡 Даю советы по контенту\n📈 Помогаю с ростом\n💎 Объясняю Premium\n⭐ Рассказываю о звёздах\n😊 Шучу, когда грустно\n\nПросто спроси!",
  ],
  content: [
    "💡 10 советов для вирусного контента:\n\n1. Снимай при золотом часе (утро/вечер)\n2. Первые 3 сек видео решают всё\n3. Используй 8-12 хэштегов\n4. Публикуй в 12:00 и 19:00\n5. Задавай вопросы в подписях\n6. Отвечай на все комментарии\n7. Делай серии постов (часть 1, 2...)\n8. Используй тренды, но по-своему\n9. Будь аутентичным — люди чувствуют\n10. Качество > количество",
    "💡 Контент-стратегия:\n\n📱 Форматы:\n• Посты — для полезного контента\n• Reels — для охватов\n• Stories — для ежедневного общения\n• Live — для глубокой связи\n\n🕐 Когда публиковать:\n• 12:00 — обеденный пик\n• 19:00 — вечерний пик\n• 21:00 — перед сном\n\n🔑 Главное: регулярность + качество!",
  ],
  growth: [
    "📈 Как набрать аудиторию:\n\n🔥 Быстро:\n• Коллаборации с другими авторами\n• Участвуй в челленджах\n• Используй трендовые хэштеги\n\n🌱 Стабильно:\n• Публикуй 1-2 раза в день\n• Держи единый стиль ленты\n• Общайся в комментариях\n• Делись экспертизой\n\nГлавное — регулярность!",
    "📈 Стратегия роста:\n\n🚀 Быстрый старт:\n• Reels — лучший способ охватов\n• Тренды — заходи вовремя\n• Коллаборации — обмен аудиторией\n\n🏗️ Долгосрочный рост:\n• Ниша — выбери и придерживайся\n• Экспертность — делись знаниями\n• Вовлечение — отвечай на комменты\n• Анализ — смотри статистику\n\nСовет: 1000 подписчиков за месяц — реально! 🎯",
  ],
  engagement: [
    "💬 Как увеличить вовлечённость:\n\n❤️ В комментариях:\n• Отвечай на каждый комментарий\n• Задавай вопросы\n• Создавай дискуссии\n\n📊 В постах:\n• CTA в конце («Поделись мнением!»)\n• Опросы и голосования\n• Серии постов\n\n🎯 В Stories:\n• Стикер «Вопрос»\n• Опросы\n• Турнирные сетки",
  ],
  monetization: [
    "💰 Монетизация в Vexora:\n\n⭐ Звёзды — получай от подписчиков\n💎 Premium — больше возможностей\n📈 Продвижение — привлекай рекламодателей\n🤝 Коллаборации — работай с брендами\n\n💡 Совет: сначала 1000 подписчиков, потом монетизация!",
  ],
  trends: [
    "🔥 Как ловить тренды:\n\n1. Смотри раздел «В тренде»\n2. Подписывайся на трендовых авторов\n3. Следи за музыкальными чартами\n4. Участвуй в челленджах\n\n⏰ Важно: тренд живёт 2-3 дня — заходи быстро!",
  ],
  collaborate: [
    "🤝 Коллаборации — мощный инструмент!\n\nКак начать:\n1. Найди автора в твоей нише\n2. Напиши с предложением\n3. Придумай совместный контент\n\n💡 Идеи:\n• Взаимные посты\n• Совместные Reels\n• Челленджи вдвоём\n• Взаимные сторис",
  ],
  joke: [
    "Хочешь шутку? 😄\n\nПочему программист пошёл в спортзал?\nПотому что ему сказали, что нужно качать пресс... кнопок! 💪⌨️\n\nИли вот ещё:\nЧто сказал один пиксель другому?\n— Не приближайся, ты слишком зернистый! 📸",
    "Окей, вот шутка 😄\n\n— Знаешь почему фотки в Vexora всегда идеальные?\n— Потому что плохие сразу удаляются! 📸\n\nЕщё:\n— Как называется альбом, который никто не лайкает?\n— Рабочий стол! 🖥️😄",
    "😂 Держи:\n\n— Что сказал один пост другому?\n— Ты такой охват имеешь, что я завидую!\n\n— Почему Instagram нервничает?\n— Потому что Vexora растёт быстрее! 🚀",
  ],
  compliment: [
    "Спасибо! 😊 Ты тоже крутой(ая)! Давай вместе сделаем твой контент ещё лучше 🚀",
    "Ай лав ю ту! ❤️ Шучу 😄 Давай лучше я помогу тебе с контентом — это будет полезнее!",
  ],
  mood: [
    "Если грустно — давай я придумаю что-то весёлое! 😊\n\nИли:\n📸 Сфотографируй что-то красивое\n🎵 Включи любимый трек\n💡 Напиши пост о том, что любишь\n\nКонтент-терапия — лучшее лекарство! 💊",
    "Настроение — это всё! ✨\n\nВот что помогает:\n☕ Чашка кофе\n🎵 Хорошая музыка\n📸 Красивый вид\n💬 Разговор с друзьями\n\nИли просто спроси меня — я подниму настроение! 😊",
  ],
  photo: [
    "📸 Советы для крутых фото:\n\n🌅 Золотой час — за час до заката\n📐 Правило третей\n🎨 Контрастные цвета\n🔍 Внимание к деталям\n💡 Естественный свет — лучший свет\n\nХочешь — расскажи что сфоткал(а), и я придумаю подпись!",
  ],
  video: [
    "🎬 Советы для видео:\n\n⏱️ Длительность: 15-30 сек оптимально\n🎵 Трендовая музыка — обязательно\n🎯 Хук в первые 1-2 секунды\n📱 Вертикальный формат\n✨ Хорошее освещение\n\nХочешь — расскажи о видео, и я помогу с подписью!",
  ],
  birthday: [
    "🎂 С Днём Рождения! 🎉\n\nПоздравляю! 🥳 Желаю:\n• Творческого вдохновения\n• Тысяч лайков\n• Миллиона охватов\n• Любви подписчиков\n\n📸 Совет: сделай пост-поздравление — подписчики оценят!",
  ],
  holiday: [
    "🎉 С праздником! 🥳\n\nКакой праздник? Расскажи — я помогу с тематическим контентом!\n\n💡 Идеи:\n• Поздравительный пост\n• Тематические хэштеги\n• Сторис со стикерами",
  ],
  error: [
    "😅 Ой, что-то пошло не так! Попробуй ещё раз — я постараюсь лучше!",
    "🤔 Хм, кажется я запуталась. Давай переформулируешь?",
  ],
  love: [
    "❤️ Ааа, ну спасибо! 😊\n\nДавай лучше я покажу любовь через крутой контент! Расскажи что хочешь создать — и я помогу 🚀",
  ],
  subscribe: [
    "👥 Подписки — ключ к росту!\n\nКак подписываться:\n• Найди автора через поиск\n• Нажми «Подписаться»\n• Включи уведомления\n\n💡 Совет: подписывайся на авторов в твоей нише!",
  ],
  unfollow: [
    "😢 Жаль, что уходишь от кого-то...\n\nНо если хочешь отписаться:\n1. Профиль автора\n2. «Подписки»\n3. Нажми «Отписаться»\n\n💡 Совет: фильтруй ленту, а не удаляй подписки!",
  ],
  blocked: [
    "🚫 Блокировка:\n\nЧтобы заблокировать:\n1. Профиль пользователя\n2. ⋮ → Заблокировать\n\nЧтобы разблокировать:\n⚙️ → Приватность → Заблокированные\n\n💡 Если кто-то нарушает правила — жалуйся!",
  ],
  report: [
    "🚨 Жалоба:\n\nЕсли видишь нарушение:\n1. Профиль → ⋮ → Пожаловаться\n2. Выбери причину\n3. Опиши ситуацию\n\nМы рассматриваем жалобы в течение 24 часов!",
  ],
  darkMode: [
    "🌙 Тёмная тема:\n\nВключить: ⚙️ → Оформление → Тёмная тема\n\n💡 Преимущества:\n• Меньше наглаза\n• Экономия батареи\n• Выглядит stylish 😎",
  ],
  language: [
    "🌐 Языки:\n\nVexora доступен на:\n• Русском\n• Английском\n• И ещё 10+ языках\n\nСменить: ⚙️ → Язык",
  ],
  bug: [
    "🐛 Баг?\n\nПопробуй:\n1. Перезапусти приложение\n2. Проверь обновления\n3. Очисти кэш\n\nЕсли не помогло — напиши в поддержку!",
  ],
  support: [
    "📩 Поддержка Vexora:\n\n• В приложении: ⚙️ → Поддержка\n• Email: support@vexora.app\n• Чат: мы онлайн 24/7\n\n📝 Опиши проблему подробно — поможем быстрее!",
  ],
  changelog: [
    "📋 Что нового в Vexora:\n\n• Улучшенная аналитика\n• Новые фильтры\n• Оптимизация производительности\n\nОбнови приложение в App Store / Google Play!",
  ],
  update: [
    "🔄 Обновление:\n\nПроверь: App Store / Google Play → Vexora → Обновить\n\n💡 Новинки автоматически появятся после обновления!",
  ],
  terms: [
    "📜 Правила Vexora:\n\n• Будь дружелюбным\n• Не спами\n• Уважай других\n• Публикуй только своё\n\nНарушения = бан!",
  ],
  default: [
    "Интересно! 🤔 Расскажи подробнее — постараюсь помочь максимально.",
    "Хм, давай разберёмся! Уточни вопрос, и я дам развёрнутый ответ.",
    "Услышала! Могу помочь с контентом, хэштегами, Premium — просто спроси 😊",
    "Спасибо за вопрос! Дай больше деталей — так ответ будет точнее 💡",
    "Можно по-разному 🤔 Расскажи подробнее, и я помогу!",
    "Хм, попробуй уточнить — я постараюсь найти лучший ответ! 💡",
  ],
};

function getSmartReply(msg: string, history: Message[]): string {
  const l = msg.toLowerCase().trim();

  if (/пока|до свидан|бай|bye|see ya|увидимся|прощай|уйду|отдох/.test(l)) return pick(KB.farewell);
  if (/спасибо|благодар|сенкс|thanks|thx|мерси/.test(l)) return pick(KB.thanks);
  if (/доброе утро|добрый вечер|добрый день/.test(l)) return pick(KB.greeting);
  if (/привет|хай|hello|здравс|добр|йо|хеллоу|здаров|салют|хэй/.test(l)) return pick(KB.greeting);
  if (/как (ты|дела|жизнь|настр|поживаешь|себячувствуешь)/.test(l)) return pick(KB.howAreYou);
  if (/что (нового|у тебя|с тобой)/.test(l)) return pick(KB.howAreYou);
  if (/как сам|как дела|как поживаешь/.test(l)) return pick(KB.howAreYou);
  if (/как (тебя|зовут|твоё имя)|твое имя|имя|тебя зовут/.test(l)) return pick(KB.name);
  if (/сколько (тебе|лет|возраст)|твой возраст/.test(l)) return pick(KB.age);
  if (/зачем|зачем ты|для чего|что ты тут|чем занимаешься|миссия/.test(l)) return pick(KB.purpose);
  if (/ты (круто|молодец|супер|класс|лчшая|лучший|умная)/.test(l)) return pick(KB.compliment);
  if (/красавица|умница|талант|шик/.test(l)) return pick(KB.compliment);
  if (/люблю|love|обожаю|милота/.test(l)) return pick(KB.love);
  if (/грустн|плохо|тоска|депресс|хандра|печаль|не настроение/.test(l)) return pick(KB.mood);
  if (/весело|хорошо|отлично|супер|класс|кайф/.test(l)) return pick(KB.mood);
  if (/придумай подпис|напиши подпис|генер.+подпис|создай подпис|сделай подпис/.test(l)) return pick(KB.captionGenerate);
  if (/подпис|caption|опис|текст к фото|текст к видео/.test(l)) return pick(KB.caption);
  if (/хэштег|хештег|тег|hashtag|хештэг/.test(l)) return pick(KB.hashtags);
  if (/premium|премиум|подписк|премиум подпис/.test(l)) return pick(KB.premium);
  if (/звёзд|звезд|star|баланс|валют/.test(l)) return pick(KB.stars);
  if (/reel|рилс|рил|видео коротк|короткое видео/.test(l)) return pick(KB.reel);
  if (/сторис|story|stories|история/.test(l)) return pick(KB.story);
  if (/live|лайв|трансляц|стрим|прямой эфир/.test(l)) return pick(KB.live);
  if (/пост|публик|создать пост|разместить|запостить/.test(l)) return pick(KB.post);
  if (/музык|трек|плейлист|song|песн|аудио/.test(l)) return pick(KB.music);
  if (/профиль|аккаунт|био|аватар|фото профиля/.test(l)) return pick(KB.profile);
  if (/настройк|setting|configure|конфиг/.test(l)) return pick(KB.settings);
  if (/уведомлен|нотификац|push|оповещен/.test(l)) return pick(KB.notifications);
  if (/приватн|закрытый|открытый|закрыть аккаунт/.test(l)) return pick(KB.privacy);
  if (/аналитик|статистик|охват|views|reach|engagement|вовлечённ|вовлеченн/.test(l)) return pick(KB.analytics);
  if (/фильтр|редактор|обработк|редактир/.test(l)) return pick(KB.filter);
  if (/фото|снимок|фотк|камер|сфотк|фотограф/.test(l)) return pick(KB.photo);
  if (/видео(?!с)|снять видео|съемка|съёмка/.test(l)) return pick(KB.video);
  if (/контент|совет|tip|рекоменд|идеи|идея|что постить|чем занять/.test(l)) return pick(KB.content);
  if (/рост|аудитор|подписчик|набрать|раскрут|продвиж/.test(l)) return pick(KB.growth);
  if (/вовлечен|комментар|лайк|互动|реакц/.test(l)) return pick(KB.engagement);
  if (/монетиз|заработ|деньги|доход|куш|прочин/.test(l)) return pick(KB.monetization);
  if (/тренд|trend|вирусн|viral|в тренде/.test(l)) return pick(KB.trends);
  if (/коллаборац|сотрудничеств|вместе|коллаб|партнер/.test(l)) return pick(KB.collaborate);
  if (/шутк|смеш|анекдот|весел|юмор|joke|смех|посмеять/.test(l)) return pick(KB.joke);
  if (/день рожд|birthday|роджен/.test(l)) return pick(KB.birthday);
  if (/праздник|holiday|новый год|дата|праздну/.test(l)) return pick(KB.holiday);
  if (/подписаться|подписчики|набрать подписчиков/.test(l)) return pick(KB.subscribe);
  if (/отписаться|отписка|отпис/.test(l)) return pick(KB.unfollow);
  if (/блок|заблокир/.test(l)) return pick(KB.blocked);
  if (/жалоб|report|нарушен/.test(l)) return pick(KB.report);
  if (/тёмная тема|тёмный|dark mode|ночной/.test(l)) return pick(KB.darkMode);
  if (/язык|language|перевод|lang/.test(l)) return pick(KB.language);
  if (/баг|bug|ошибка|error|глюч|вылет|краш|не работает/.test(l)) return pick(KB.bug);
  if (/поддержка|support|помощь|связаться|контакт/.test(l)) return pick(KB.support);
  if (/что нового|changelog|обновлен|нововведен/.test(l)) return pick(KB.changelog);
  if (/обновить|обновись|update|апдейт/.test(l)) return pick(KB.update);
  if (/правил|условия|terms|бан/.test(l)) return pick(KB.terms);
  if (/помо|умеешь|можешь|функци|help|что ты|чем пом|что умеешь/.test(l)) return pick(KB.help);

  if (history.length >= 2) {
    const lastAi = [...history].reverse().find(m => m.role === "ai");
    if (lastAi) {
      const la = lastAi.text.toLowerCase();
      if ((la.includes("что на фото") || la.includes("что на снимке")) && l.length > 3) {
        return `📸 Отлично! Теперь расскажи какое настроение передаёт фото, и я придумаю подпись!\n\nИли напиши «сгенерируй подпись» — и я создам варианты прямо сейчас.`;
      }
      if ((la.includes("какой стиль") || la.includes("какой темп")) && l.length > 2) {
        return `✨ Поняла стиль! Генерирую...\n\nДавай попробую: «${l.length > 20 ? l.slice(0, 30) + '...' : msg}» в стиле, который ты описал(а).\n\nНапиши «сгенерируй подпись» — и я создам готовые варианты!`;
      }
    }
  }

  return pick(KB.default);
}

function pick(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

const QUICK_CHIPS = [
  { emoji: "👋", text: "Привет!" },
  { emoji: "📸", text: "Придумай подпись для фото" },
  { emoji: "🏷️", text: "Подбери хэштеги" },
  { emoji: "🎬", text: "Как снять крутой Reels?" },
  { emoji: "💎", text: "Что даёт Premium?" },
  { emoji: "💡", text: "Советы по контенту" },
  { emoji: "📈", text: "Как набрать аудиторию?" },
  { emoji: "😄", text: "Расскажи шутку" },
];

export default function AI() {
  const { user } = useTelegram();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [introStep, setIntroStep] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, typing, scrollToBottom]);

  useEffect(() => {
    if (!showIntro) return;
    const timers = [
      setTimeout(() => setIntroStep(1), 200),
      setTimeout(() => setIntroStep(2), 600),
      setTimeout(() => { setIntroStep(3); playIntroSound(); }, 1000),
      setTimeout(() => setIntroStep(4), 1600),
      setTimeout(() => setIntroStep(5), 2200),
      setTimeout(() => setShowIntro(false), 2600),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const now = () => new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });

  const send = useCallback(async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg) return;
    setInput("");

    const userMsg: Message = { id: `u-${Date.now()}`, role: "user", text: msg, time: now() };
    setMessages(p => [...p, userMsg]);
    setTyping(true);

    let reply: string | null = null;
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          systemPrompt: `Ты — Адель, дружелюбный AI-помощник в ${APP_NAME}. Отвечай на русском, подробно но структурировано. Помогай с подписями, хэштегами, контент-стратегией. Будь тёплой и профессиональной.`,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.reply) reply = data.reply;
      }
    } catch {}

    if (!reply) reply = getSmartReply(msg, messages);

    const delay = 400 + Math.min(reply.length * 4, 1200) + Math.random() * 300;
    await new Promise(r => setTimeout(r, delay));

    playMessageSound();
    const aiMsg: Message = { id: `a-${Date.now()}`, role: "ai", text: reply, time: now() };
    setMessages(p => [...p, aiMsg]);
    setTyping(false);
  }, [input]);

  const name = user?.first_name || "друг";

  if (showIntro) {
    return (
      <div style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "var(--bg)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        fontFamily: "Inter, sans-serif",
        overflow: "hidden",
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: 18,
          background: "var(--bg-tertiary)",
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: introStep >= 1 ? 1 : 0,
          transform: introStep >= 2 ? "scale(1) translateY(0)" : "scale(0.6) translateY(24px)",
          transition: "all 0.7s cubic-bezier(0.16,1,0.3,1)",
        }}>
          <Sparkles size={30} style={{
            color: "var(--text-secondary)",
            transform: introStep >= 2 ? "rotate(0deg) scale(1)" : "rotate(-30deg) scale(0.5)",
            transition: "all 0.6s cubic-bezier(0.16,1,0.3,1) 0.1s",
          }} />
        </div>

        <h1 style={{
          fontSize: 32, fontWeight: 900, letterSpacing: "-0.03em",
          margin: "18px 0 6px", color: "var(--text-primary)",
          opacity: introStep >= 2 ? 1 : 0,
          transform: introStep >= 3 ? "translateY(0)" : "translateY(12px)",
          transition: "all 0.6s cubic-bezier(0.16,1,0.3,1) 0.1s",
        }}>Адель</h1>

        <p style={{
          fontSize: 13, color: "var(--text-tertiary)",
          opacity: introStep >= 3 ? 1 : 0,
          transform: introStep >= 3 ? "translateY(0)" : "translateY(6px)",
          transition: "all 0.5s ease 0.15s",
        }}>AI-помощник • {APP_NAME}</p>

        {introStep >= 4 && (
          <div style={{
            display: "flex", gap: 6, marginTop: 24,
            opacity: introStep >= 4 ? 1 : 0,
            transition: "opacity 0.4s ease",
          }}>
            {[0,1,2].map(i => (
              <div key={i} style={{
                width: 5, height: 5, borderRadius: "50%",
                background: "var(--text-tertiary)",
                animation: `adel-load-dot 1s ease-in-out infinite ${i * 0.2}s`,
              }} />
            ))}
          </div>
        )}

        <style>{`
          @keyframes adel-load-dot {
            0%, 60%, 100% { opacity: 0.3; transform: scale(0.8); }
            30% { opacity: 1; transform: scale(1.2); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      height: "calc(100dvh - var(--tg-safe-top, 0px) - var(--tg-chrome-top, 52px) - 48px - 4.5rem)",
      maxWidth: 480, margin: "0 auto", fontFamily: "Inter, sans-serif",
    }}>
      <div ref={scrollRef} style={{
        flex: 1, overflowY: "auto", padding: "16px 16px 8px",
        WebkitOverflowScrolling: "touch",
      }}>
        {messages.length === 0 ? (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", height: "100%", textAlign: "center",
            padding: "0 20px",
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14,
              background: "var(--bg-tertiary)",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 16,
            }}>
              <Sparkles size={24} style={{ color: "var(--text-secondary)" }} />
            </div>

            <h2 style={{
              fontSize: 20, fontWeight: 900, margin: "0 0 6px",
              color: "var(--text-primary)",
            }}>Привет, {name}!</h2>
            <p style={{ fontSize: 12, color: "var(--text-tertiary)", lineHeight: 1.5, maxWidth: 260, margin: "0 0 28px" }}>
              Я Адель — AI-помощник {APP_NAME}. Помогу с контентом, подписями и стратегией.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", maxWidth: 320 }}>
              {QUICK_CHIPS.map(chip => (
                <button key={chip.text} onClick={() => send(chip.text)} className="ios-btn-ghost"
                  style={{ padding: "8px 14px", borderRadius: 20, fontSize: 11 }}>
                  {chip.emoji} {chip.text}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {messages.map(msg => (
              <div key={msg.id} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                <div className={msg.role === "user" ? "ai-bubble-user" : "ai-bubble-ai"}
                  style={{
                    maxWidth: "84%", padding: "10px 14px", borderRadius: 18,
                    ...(msg.role === "user"
                      ? { borderBottomRightRadius: 6 }
                      : { borderBottomLeftRadius: 6 }),
                  }}>
                  <p style={{ fontSize: 13, lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{msg.text}</p>
                  <p style={{
                    fontSize: 10, margin: "4px 0 0", textAlign: "right",
                    color: msg.role === "user" ? "rgba(0,0,0,0.4)" : "var(--text-tertiary)",
                  }}>{msg.time}</p>
                </div>
              </div>
            ))}
            {typing && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div className="ai-bubble-ai" style={{
                  padding: "12px 18px", borderRadius: 18, borderBottomLeftRadius: 6,
                  display: "flex", gap: 5, alignItems: "center",
                  animation: "adel-typing-in 0.3s ease-out",
                }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{
                      width: 7, height: 7, borderRadius: "50%",
                      background: "var(--text-tertiary)",
                      animation: `adel-dot 1.2s ease-in-out infinite ${i * 0.2}s`,
                    }} />
                  ))}
                  <span style={{
                    fontSize: 11, color: "var(--text-tertiary)",
                    marginLeft: 4, fontStyle: "italic",
                  }}>Адель печатает</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div style={{ padding: "8px 12px 12px", borderTop: "0.5px solid var(--separator)", background: "var(--bg)" }}>
        <form onSubmit={e => { e.preventDefault(); send(); }} style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "6px 6px 6px 16px", borderRadius: 24,
          background: "var(--bg-secondary)", border: "0.5px solid var(--separator)",
        }}>
          <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
            placeholder="Напишите Адели..."
            style={{ flex: 1, background: "none", border: "none", outline: "none", color: "var(--text-primary)", fontSize: 14 }}
          />
          <button type="submit" disabled={!input.trim()} style={{
            width: 38, height: 38, borderRadius: "50%",
            background: input.trim() ? "var(--blue)" : "var(--bg-tertiary)",
            border: "none", display: "flex", alignItems: "center", justifyContent: "center",
            cursor: input.trim() ? "pointer" : "default", transition: "all 0.2s",
          }}>
            <Send size={15} style={{ color: input.trim() ? "#fff" : "var(--text-tertiary)", marginLeft: 1 }} />
          </button>
        </form>
      </div>

      <style>{`
        @keyframes adel-dot {
          0%, 60%, 100% { opacity: 0.3; transform: scale(0.8); }
          30% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes adel-typing-in {
          0% { opacity: 0; transform: translateY(8px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
