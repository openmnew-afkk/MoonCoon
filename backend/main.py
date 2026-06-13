"""
VseOkNax Backend — FastAPI прокси-парсер для zona.plus
Запуск: uvicorn main:app --reload --port 8000
"""

from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
from bs4 import BeautifulSoup
import re
import json
from typing import Optional
from urllib.parse import quote

app = FastAPI(title="VseOkNax API", version="1.0.0")

# CORS — разрешаем все origins для Telegram Mini App
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_URL = "https://w140.zona.plus"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "ru-RU,ru;q=0.9,en;q=0.5",
    "Referer": "https://w140.zona.plus/",
}

client = httpx.AsyncClient(headers=HEADERS, follow_redirects=True, timeout=15.0)


def parse_movie_card(el) -> dict:
    """Парсинг карточки фильма из HTML элемента.
    ВНИМАНИЕ: если zona.plus изменит вёрстку, обновите селекторы ниже.
    """
    try:
        # Ссылка и ID
        link_el = el.select_one("a[href]")
        href = link_el["href"] if link_el else ""
        movie_id = href.strip("/").split("/")[-1] if href else ""

        # Постер
        img_el = el.select_one("img")
        poster = ""
        if img_el:
            poster = img_el.get("data-src") or img_el.get("src") or ""
            if poster and not poster.startswith("http"):
                poster = BASE_URL + poster

        # Название
        title_el = el.select_one(".results-item-title, .poster-item-title, .title, h3, .name")
        title = title_el.get_text(strip=True) if title_el else (img_el.get("alt", "") if img_el else "")

        # Рейтинг
        rating_el = el.select_one(".rating, .rate, .score, .results-item-rating")
        rating = rating_el.get_text(strip=True) if rating_el else ""

        # Год
        year_el = el.select_one(".year, .results-item-year, .info-year")
        year = year_el.get_text(strip=True) if year_el else ""

        return {
            "id": movie_id,
            "title": title or "Без названия",
            "poster": poster,
            "rating": rating,
            "year": year,
            "href": href,
        }
    except Exception:
        return None


def parse_movie_list(html: str) -> list:
    """Парсинг списка фильмов со страницы."""
    soup = BeautifulSoup(html, "html.parser")
    items = []

    # Пробуем разные селекторы (zona меняет вёрстку)
    selectors = [
        ".results-item",
        ".poster-item",
        ".movie-item",
        ".catalog-item",
        "[data-id]",
        ".item",
    ]

    for selector in selectors:
        elements = soup.select(selector)
        if elements:
            for el in elements[:30]:
                card = parse_movie_card(el)
                if card and card.get("id"):
                    items.append(card)
            break

    # Если ничего не нашли через селекторы, ищем по ссылкам
    if not items:
        for a in soup.select("a[href*='/movies/'], a[href*='/tvseries/'], a[href*='/animation/']"):
            parent = a.parent
            if parent:
                card = parse_movie_card(parent)
                if card and card.get("id"):
                    items.append(card)

    return items


@app.get("/")
async def root():
    return {"status": "ok", "app": "VseOkNax API", "version": "1.0.0"}


@app.get("/api/home")
async def get_home():
    """Главная страница: тренды, новинки, сериалы, мультфильмы."""
    result = {
        "trending": [],
        "new_movies": [],
        "series": [],
        "cartoons": [],
    }

    try:
        # Тренды / Популярное
        r = await client.get(f"{BASE_URL}/movies/")
        if r.status_code == 200:
            items = parse_movie_list(r.text)
            result["trending"] = items[:10]
            result["new_movies"] = items[10:20] if len(items) > 10 else items[:10]
    except Exception as e:
        print(f"[home] movies error: {e}")

    try:
        # Сериалы
        r = await client.get(f"{BASE_URL}/tvseries/")
        if r.status_code == 200:
            result["series"] = parse_movie_list(r.text)[:12]
    except Exception as e:
        print(f"[home] tvseries error: {e}")

    try:
        # Мультфильмы
        r = await client.get(f"{BASE_URL}/animation/")
        if r.status_code == 200:
            result["cartoons"] = parse_movie_list(r.text)[:12]
    except Exception as e:
        print(f"[home] animation error: {e}")

    # Если парсинг не вернул данных, отдаём демо-данные
    if not any(result.values()):
        demo = _get_demo_data()
        return demo

    return result


@app.get("/api/search")
async def search_movies(q: str = Query(..., min_length=1)):
    """Поиск фильмов по ключевому слову."""
    try:
        encoded = quote(q)
        r = await client.get(f"{BASE_URL}/search/{encoded}/")
        if r.status_code == 200:
            items = parse_movie_list(r.text)
            if items:
                return {"results": items, "query": q}

        # Альтернативный endpoint поиска
        r2 = await client.get(f"{BASE_URL}/search/?q={encoded}")
        if r2.status_code == 200:
            items2 = parse_movie_list(r2.text)
            if items2:
                return {"results": items2, "query": q}

    except Exception as e:
        print(f"[search] error: {e}")

    # Возвращаем пустой результат
    return {"results": [], "query": q}


@app.get("/api/movie/{movie_id:path}")
async def get_movie_detail(movie_id: str):
    """Детальная информация о фильме по ID.
    
    Пример: /api/movie/movies/the-matrix-1999
    Извлекает: название, постер, описание, год, рейтинг, озвучки, m3u8 ссылку.
    """
    try:
        # Пробуем разные пути
        urls_to_try = [
            f"{BASE_URL}/{movie_id}",
            f"{BASE_URL}/movies/{movie_id}",
            f"{BASE_URL}/tvseries/{movie_id}",
        ]

        html = ""
        for url in urls_to_try:
            try:
                r = await client.get(url)
                if r.status_code == 200:
                    html = r.text
                    break
            except:
                continue

        if not html:
            raise HTTPException(status_code=404, detail="Фильм не найден")

        soup = BeautifulSoup(html, "html.parser")

        # Название
        title = ""
        for sel in [".headline-title", "h1", ".movie-title", ".player-title"]:
            el = soup.select_one(sel)
            if el:
                title = el.get_text(strip=True)
                break
        if not title:
            title_tag = soup.find("title")
            title = title_tag.get_text(strip=True) if title_tag else movie_id

        # Постер
        poster = ""
        for sel in [".poster img", ".movie-poster img", "meta[property='og:image']", ".cover img"]:
            el = soup.select_one(sel)
            if el:
                poster = el.get("content") or el.get("src") or el.get("data-src") or ""
                if poster and not poster.startswith("http"):
                    poster = BASE_URL + poster
                break

        # Описание
        description = ""
        for sel in [".description", ".movie-description", ".synopsis", "meta[property='og:description']", ".text-content"]:
            el = soup.select_one(sel)
            if el:
                description = el.get("content") or el.get_text(strip=True) or ""
                break

        # Год
        year = ""
        for sel in [".year", ".release-year", ".info-year"]:
            el = soup.select_one(sel)
            if el:
                year = el.get_text(strip=True)
                break
        if not year:
            year_match = re.search(r'(\d{4})', title + " " + description)
            if year_match:
                y = int(year_match.group(1))
                if 1900 <= y <= 2030:
                    year = str(y)

        # Рейтинг
        rating = ""
        for sel in [".rating", ".rate", ".score", ".imdb-rating"]:
            el = soup.select_one(sel)
            if el:
                rating = el.get_text(strip=True)
                break

        # Жанры
        genres = []
        for sel in [".genre a", ".genres a", ".tag"]:
            for el in soup.select(sel):
                g = el.get_text(strip=True)
                if g:
                    genres.append(g)
            if genres:
                break

        # Озвучки — ищем в скриптах и HTML
        translations = _extract_translations(html, soup)

        # m3u8 ссылка — извлечение из embed/плеера
        video_url = _extract_video_url(html, soup)

        return {
            "id": movie_id,
            "title": title,
            "poster": poster,
            "description": description,
            "year": year,
            "rating": rating,
            "genres": genres,
            "translations": translations,
            "video_url": video_url,
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"[movie_detail] error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/movie/{movie_id:path}/video")
async def get_video_url(movie_id: str, translation_id: Optional[str] = None):
    """Получить прямую ссылку на видео (m3u8) с выбранной озвучкой."""
    try:
        url = f"{BASE_URL}/{movie_id}"
        params = {}
        if translation_id:
            params["translation"] = translation_id

        r = await client.get(url, params=params)
        if r.status_code != 200:
            raise HTTPException(status_code=404, detail="Не удалось загрузить страницу")

        video_url = _extract_video_url(r.text, BeautifulSoup(r.text, "html.parser"))

        if not video_url:
            # Пробуем embed-плеер
            embed_urls = re.findall(r'src=["\']([^"\']*(?:embed|player)[^"\']*)["\']', r.text, re.I)
            for embed_url in embed_urls:
                if not embed_url.startswith("http"):
                    embed_url = BASE_URL + embed_url
                try:
                    er = await client.get(embed_url)
                    if er.status_code == 200:
                        video_url = _extract_video_url(er.text, BeautifulSoup(er.text, "html.parser"))
                        if video_url:
                            break
                except:
                    continue

        return {
            "video_url": video_url or "",
            "translation_id": translation_id,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def _extract_video_url(html: str, soup) -> str:
    """Извлечение m3u8 ссылки из HTML страницы.
    
    Zona обычно хранит ссылку на видео в:
    1. JSON-объекте внутри <script> тега (player config)
    2. Атрибуте data-url или data-src у video/iframe
    3. В embed-плеере через iframe
    """
    # 1. Ищем m3u8 ссылки напрямую в HTML
    m3u8_patterns = [
        r'(https?://[^\s"\'<>]+\.m3u8[^\s"\'<>]*)',
        r'file\s*[=:]\s*["\']([^"\']+\.m3u8[^"\']*)["\']',
        r'src\s*[=:]\s*["\']([^"\']+\.m3u8[^"\']*)["\']',
        r'video_url\s*[=:]\s*["\']([^"\']+)["\']',
        r'hls\s*[=:]\s*["\']([^"\']+)["\']',
        r'manifest_url\s*[=:]\s*["\']([^"\']+)["\']',
        r'stream_url\s*[=:]\s*["\']([^"\']+)["\']',
    ]

    for pattern in m3u8_patterns:
        matches = re.findall(pattern, html, re.I)
        for m in matches:
            if "m3u8" in m or "stream" in m or "manifest" in m:
                return m

    # 2. Ищем в JSON внутри скриптов
    for script in soup.select("script"):
        text = script.string or ""
        # Ищем JSON с конфигом плеера
        json_patterns = [
            r'playerConfig\s*=\s*({[^;]+})',
            r'videoConfig\s*=\s*({[^;]+})',
            r'new\s+Playerjs\s*\(\s*({[^)]+})\s*\)',
            r'file\s*:\s*["\']([^"\']+)["\']',
        ]
        for jp in json_patterns:
            jm = re.search(jp, text, re.I)
            if jm:
                try:
                    data = json.loads(jm.group(1))
                    for key in ["file", "url", "src", "video", "hls", "stream"]:
                        if key in data and isinstance(data[key], str):
                            return data[key]
                except (json.JSONDecodeError, IndexError):
                    # Может быть просто строка, не JSON
                    val = jm.group(1)
                    if "http" in val:
                        return val

    # 3. Ищем iframe с embed-плеером
    for iframe in soup.select("iframe[src]"):
        src = iframe["src"]
        if "player" in src or "embed" in src:
            return f"EMBED:{src}"  # Фронт обработает embed отдельно

    return ""


def _extract_translations(html: str, soup) -> list:
    """Извлечение списка доступных озвучек."""
    translations = []

    # Ищем select/option с озвучками
    for sel in [
        "select.translation-select option",
        ".translations option",
        ".voiceover option",
        "[data-translation]",
    ]:
        for el in soup.select(sel):
            name = el.get_text(strip=True)
            value = el.get("value") or el.get("data-translation") or name
            if name and name not in [t["name"] for t in translations]:
                translations.append({"id": value, "name": name})
        if translations:
            break

    # Ищем в JavaScript
    if not translations:
        trans_pattern = r'translations?\s*[=:]\s*(\[[\s\S]*?\])'
        matches = re.findall(trans_pattern, html, re.I)
        for m in matches:
            try:
                data = json.loads(m)
                for item in data:
                    if isinstance(item, dict):
                        name = item.get("name") or item.get("title") or ""
                        tid = str(item.get("id") or item.get("translation_id") or "")
                        if name:
                            translations.append({"id": tid, "name": name})
                    elif isinstance(item, str):
                        translations.append({"id": item, "name": item})
            except:
                pass

    # Дефолтная озвучка если ничего не нашли
    if not translations:
        translations = [
            {"id": "default", "name": "Оригинал"},
        ]

    return translations


# ── Музыка (заглушка с структурой) ──

@app.get("/api/music")
async def get_music():
    """Музыкальный раздел (структура для будущего парсинга zona music)."""
    # TODO: Парсить https://zona.plus/music/ когда будет доступен
    return {
        "tracks": [
            {
                "id": "1",
                "title": "Ночь",
                "artist": "Макс Корж",
                "album": "Малый повзрослел",
                "duration": "3:42",
                "cover": "https://picsum.photos/seed/track1/300/300",
                "audio_url": "",
            },
            {
                "id": "2",
                "title": "Грустная песня",
                "artist": "Thrill Pill",
                "album": "Сингл",
                "duration": "2:58",
                "cover": "https://picsum.photos/seed/track2/300/300",
                "audio_url": "",
            },
            {
                "id": "3",
                "title": "Космос",
                "artist": "Markul",
                "album": "Альбом",
                "duration": "4:15",
                "cover": "https://picsum.photos/seed/track3/300/300",
                "audio_url": "",
            },
            {
                "id": "4",
                "title": "Девочка с каре",
                "artist": "Мукка",
                "album": "Сингл",
                "duration": "3:22",
                "cover": "https://picsum.photos/seed/track4/300/300",
                "audio_url": "",
            },
            {
                "id": "5",
                "title": "Патамушка",
                "artist": "Cream Soda",
                "album": "Сингл",
                "duration": "3:05",
                "cover": "https://picsum.photos/seed/track5/300/300",
                "audio_url": "",
            },
            {
                "id": "6",
                "title": "Лунная",
                "artist": "ANNA ASTI",
                "album": "Сингл",
                "duration": "3:33",
                "cover": "https://picsum.photos/seed/track6/300/300",
                "audio_url": "",
            },
        ],
        "playlists": [
            {"id": "pop", "title": "Поп хиты 2025", "count": 50},
            {"id": "rap", "title": "Русский рэп", "count": 40},
            {"id": "rock", "title": "Рок классика", "count": 35},
            {"id": "electronic", "title": "Электроника", "count": 30},
        ],
    }


# ── Демо данные (если парсинг не сработал) ──

def _get_demo_data():
    """Демо-данные для отображения, когда парсинг недоступен."""
    demo_movies = [
        {"id": "movies/inception-2010", "title": "Начало", "poster": "https://picsum.photos/seed/inception/300/450", "rating": "8.8", "year": "2010"},
        {"id": "movies/interstellar-2014", "title": "Интерстеллар", "poster": "https://picsum.photos/seed/interstellar/300/450", "rating": "8.6", "year": "2014"},
        {"id": "movies/the-dark-knight-2008", "title": "Тёмный рыцарь", "poster": "https://picsum.photos/seed/darkknight/300/450", "rating": "9.0", "year": "2008"},
        {"id": "movies/fight-club-1999", "title": "Бойцовский клуб", "poster": "https://picsum.photos/seed/fightclub/300/450", "rating": "8.8", "year": "1999"},
        {"id": "movies/matrix-1999", "title": "Матрица", "poster": "https://picsum.photos/seed/matrix/300/450", "rating": "8.7", "year": "1999"},
        {"id": "movies/gladiator-2000", "title": "Гладиатор", "poster": "https://picsum.photos/seed/gladiator/300/450", "rating": "8.5", "year": "2000"},
        {"id": "movies/shawshank-1994", "title": "Побег из Шоушенка", "poster": "https://picsum.photos/seed/shawshank/300/450", "rating": "9.3", "year": "1994"},
        {"id": "movies/forrest-gump-1994", "title": "Форрест Гамп", "poster": "https://picsum.photos/seed/forrestgump/300/450", "rating": "8.8", "year": "1994"},
        {"id": "movies/pulp-fiction-1994", "title": "Криминальное чтиво", "poster": "https://picsum.photos/seed/pulpfiction/300/450", "rating": "8.9", "year": "1994"},
        {"id": "movies/avengers-2019", "title": "Мстители: Финал", "poster": "https://picsum.photos/seed/avengers/300/450", "rating": "8.4", "year": "2019"},
    ]

    demo_series = [
        {"id": "tvseries/breaking-bad", "title": "Во все тяжкие", "poster": "https://picsum.photos/seed/breakingbad/300/450", "rating": "9.5", "year": "2008"},
        {"id": "tvseries/game-of-thrones", "title": "Игра престолов", "poster": "https://picsum.photos/seed/got/300/450", "rating": "9.3", "year": "2011"},
        {"id": "tvseries/stranger-things", "title": "Очень странные дела", "poster": "https://picsum.photos/seed/stranger/300/450", "rating": "8.7", "year": "2016"},
        {"id": "tvseries/money-heist", "title": "Бумажный дом", "poster": "https://picsum.photos/seed/moneyheist/300/450", "rating": "8.3", "year": "2017"},
        {"id": "tvseries/dark", "title": "Тьма", "poster": "https://picsum.photos/seed/dark/300/450", "rating": "8.8", "year": "2017"},
        {"id": "tvseries/chernobyl", "title": "Чернобыль", "poster": "https://picsum.photos/seed/chernobyl/300/450", "rating": "9.4", "year": "2019"},
    ]

    demo_cartoons = [
        {"id": "animation/spirited-away", "title": "Унесённые призраками", "poster": "https://picsum.photos/seed/spirited/300/450", "rating": "8.6", "year": "2001"},
        {"id": "animation/your-name", "title": "Твоё имя", "poster": "https://picsum.photos/seed/yourname/300/450", "rating": "8.4", "year": "2016"},
        {"id": "animation/up-2009", "title": "Вверх", "poster": "https://picsum.photos/seed/up/300/450", "rating": "8.3", "year": "2009"},
        {"id": "animation/coco-2017", "title": "Тайна Коко", "poster": "https://picsum.photos/seed/coco/300/450", "rating": "8.4", "year": "2017"},
        {"id": "animation/howl-castle", "title": "Ходячий замок", "poster": "https://picsum.photos/seed/howl/300/450", "rating": "8.2", "year": "2004"},
        {"id": "animation/wall-e", "title": "ВАЛЛ·И", "poster": "https://picsum.photos/seed/walle/300/450", "rating": "8.4", "year": "2008"},
    ]

    return {
        "trending": demo_movies[:6],
        "new_movies": demo_movies[4:],
        "series": demo_series,
        "cartoons": demo_cartoons,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
