# Бриф: справочные страницы авторов (content/catalog/authors/*.json)

Литмоб (litmob.ru) — каталог книг и аудиокниг по сюжетам. Страница автора — справочная:
«[Автор] — все книги и аудиокниги по порядку»: коротко об авторе (свой текст), ссылки на его страницы
на площадках, циклы и книги **по порядку**. Люди ищут «[автор] все книги по порядку», «[автор] новинки»,
«[автор] аудиокниги», «[цикл] по порядку».

## Главное правило — точность
- Только проверяемые факты. Названия книг и циклов, порядок, годы — по надёжным источникам:
  официальные страницы автора (Литнет, Author.Today, ЛитРес, сайт/соцсети автора), Фантлаб (fantlab.ru),
  ЛитРес, сайты издательств (АСТ, Эксмо, Альфа-книга). Википедия — как вспомогательный.
- Если не уверен в книге или в порядке — не включай. Лучше меньше, но верно.
- Не выдумывай биографию, даты рождения, награды. В `about` — 2–4 предложения своими словами:
  в каких жанрах пишет, чем известен (главные циклы, типичные сюжеты/тропы), где публикуется.
  Без оценочных штампов («талантливая», «культовый»), без копирования аннотаций.
- Ссылки (`links`) — только реальные страницы автора, которые ты видел (URL открывается).
  Метки: «Литнет», «Author.Today», «ЛитРес», «Сайт автора», «VK», «Telegram». 1–4 ссылки.

## Объём
- Плодовитым авторам (50+ книг) — главные циклы: до 8 циклов, в каждом все тома по порядку,
  плюс до 10 самых известных отдельных книг. Остальным — все циклы и заметные отдельные книги.
- Если у автора есть свежие книги 2025–2026 — включи их (это запрос «новинки»).

## Формат файла: content/catalog/authors/<slug>.json
slug — транслит имени латиницей через дефис (anna-dzhejn, erofej-trofimov, vasilij-mahanenko).

```json
{
  "name": "Анна Джейн",
  "slug": "anna-dzhejn",
  "about": "2–4 предложения своими словами.",
  "links": [{ "label": "ЛитРес", "url": "https://..." }],
  "genres": ["lyubovnye-romany"],
  "tropes": [],
  "series": [
    { "title": "Название цикла", "books": [ { "title": "Книга 1", "year": 2017 }, { "title": "Книга 2", "year": 2018 } ] }
  ],
  "standalone": [ { "title": "Отдельная книга", "year": 2020 } ],
  "sources": ["https://fantlab.ru/autor...", "https://..."]
}
```

- `genres` — 1–3 слага из списка: lyubovnoe-fentezi, bytovoe-fentezi, popadanka, lyubovnye-romany,
  dark-romans, akademiya-magii, popadancy, litrpg, boyarka, detektivy, fentezi, fantastika,
  istoricheskij-lyubovnyj-roman, young-adult. (Подуровни: popadancy/v-sssr → "popadancy".)
- `tropes` — 0–3 слага сюжетов, только если явно подходят: razvod-s-drakonom, zhena-generala-drakona,
  nelyubimaya-zhena, vdova, naslednik, izmena, vtoroj-shans, fiktivnyj-brak, byvshie, istinnaya-para,
  otvergnutaya-para, oborotni, vampiry, fejri, elfy, vedmy, demony, akademiya-drakonov, sluzhanka-rektora,
  adeptka, nevesta-drakona, otbor-nevest, popadanka-v-zlodejku, popadanka-k-drakonu, popadanka-v-knigu,
  popadanka-v-akademiyu, hozyajka-lavki, hozyajka-pomestya, hozyajka-taverny, ot-nenavisti-do-lyubvi,
  gercog, boss, raznica-v-vozraste, regressor, nekromant, lekar, apokalipsis.
- `year` — год первой публикации, если известен; иначе не указывай поле.
- Названия — как на русском издании/публикации, ёлочки внутри названий не нужны.
- Валидный JSON (UTF-8), без комментариев.
