# Бриф: карточки книг с Литнета (content/catalog/books/*.json)

По этим книгам на Литнете люди ищут сами книги: «[название] читать», «[название] слушать».
Мы делаем справочную карточку: наше описание (свой текст, не копия аннотации), сюжеты, статус,
ссылка на книгу у автора. Плюс страница «Книги, похожие на [название]».

## Точность
- Название — точно как на Литнете (без номера в названии, если номер — это номер тома в серии;
  но если номер входит в название на Литнете, сохрани как есть).
- Ссылка `url` — реальная страница книги на litnet.com, которую ты открыл. Если книга на другой площадке —
  укажи её (label соответствующий). Если не нашёл — не выдумывай, оставь `links: []`.
- `status`: "completed" (на Литнете «Завершена»/«Полный текст»), "ongoing" («В процессе»), "frozen".
  Не уверен — "ongoing" для 2025–2026 и "completed" для старых.
- `heat`: "none" | "moderate" | "explicit" (если на Литнете 18+ или откровенные сцены) — по метке площадки.
- `series`: если книга — часть цикла (например «… 2», «Хозяйка пряничной лавки 3»), укажи
  `{ "title": "Название цикла", "order": N }` по данным площадки. Иначе не указывай.

## Свой текст
- `hook` — одна строка до 110 знаков: крючок в голосе Литмоба («Брошенная жена получает поместье
  и долги — и не собирается сдаваться»). Без спойлеров, без «захватывающий/уникальный».
- `about` — 500–900 знаков своими словами на основе аннотации: завязка, героиня/герой, тон
  (драма, юмор, уют), чем зацепит. НЕ копировать фразы аннотации, без спойлеров финала.
- `tropes` — 1–3 слага из списка (самые точные): razvod-s-drakonom, zhena-generala-drakona,
  nelyubimaya-zhena, vdova, naslednik, izmena, vtoroj-shans, fiktivnyj-brak, byvshie, istinnaya-para,
  otvergnutaya-para, oborotni, vampiry, fejri, elfy, vedmy, demony, akademiya-drakonov,
  sluzhanka-rektora, adeptka, nevesta-drakona, otbor-nevest, popadanka-v-zlodejku, popadanka-k-drakonu,
  popadanka-v-knigu, popadanka-v-akademiyu, hozyajka-lavki, hozyajka-pomestya, hozyajka-taverny,
  ot-nenavisti-do-lyubvi, gercog, boss, raznica-v-vozraste, regressor, nekromant, lekar, apokalipsis.
- `genres` — 1–2 слага: lyubovnoe-fentezi, bytovoe-fentezi, popadanka, lyubovnye-romany, dark-romans,
  akademiya-magii, popadancy, young-adult.

## Формат: content/catalog/books/<slug>.json
slug — транслит названия латиницей через дефис (pomestye-dlya-broshennoj-zheny).

```json
{
  "title": "Поместье для брошенной жены",
  "slug": "pomestye-dlya-broshennoj-zheny",
  "author": "Екатерина Белова",
  "authorSlug": "ekaterina-belova",
  "year": 2024,
  "status": "completed",
  "heat": "none",
  "series": { "title": "…", "order": 1 },
  "tropes": ["nelyubimaya-zhena", "hozyajka-pomestya"],
  "genres": ["bytovoe-fentezi"],
  "hook": "…",
  "about": "…",
  "links": [{ "label": "Литнет", "url": "https://litnet.com/ru/book/..." }],
  "sources": ["https://litnet.com/ru/book/..."]
}
```
Имя автора — «Имя Фамилия» (на Литнете бывает «Белова Екатерина» — переставь). Валидный JSON.
