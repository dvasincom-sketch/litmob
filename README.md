# Литмоб

Площадка книг и аудиокниг по сюжетам (тропам): страницы сюжетов под растущие поисковые
запросы, справочные карточки книг со ссылками на авторов, профессиональная озвучка
по подписке и литмобы — серии книг разных авторов на один сюжет.

Документы проекта: «Структура сайта» (иерархия сюжетов, типы страниц, волны запуска)
и семантическое ядро `semanticheskoe_yadro_knigi.xlsx`.

## Стек

- Next.js 16 (App Router), React 19, Tailwind CSS 4
- Payload CMS 3.85 на PostgreSQL — схема только миграциями (`push: false`)
- Плагин SEO Payload, хранилище S3 (Timeweb Cloud) для обложек и аудио
- Наработки перенесены из `content-box`: роли и доступы, книги и главы, подписки на проду,
  настройки пула Postgres и sharp. Платежи ЮKassa, поиск Meilisearch и письма RuSender —
  следующие итерации (см. `docs/ROADMAP.md`).

## Локальный запуск

```bash
cp .env.example .env          # заполните PAYLOAD_SECRET
npm install
npm run db:local              # встроенный Postgres на 54329 (или: docker compose up -d db)
# во втором терминале:
npm run migrate               # применить миграции
SEED_ADMIN_EMAIL=you@example.com SEED_ADMIN_PASSWORD=... npm run seed   # вся структура + админ
npm run seed:demo             # вымышленные демо-книги для проверки дизайна (удалить: npm run seed:demo -- --remove)
npm run dev                   # http://localhost:3000, админка — /admin
```

## Модель данных

| Коллекция | Что это | Адрес |
|---|---|---|
| `tropes` | Сюжеты: семейство → сюжет → уточнение. Семейство — поле `family`, уточнение — `parent` | `/tropy/[сюжет]/`, `/tropy/[сюжет]/[уточнение]/`, 18+ — `/18/...` |
| `genres` | Жанры и аудиохабы | `/zhanr/[жанр]/audio/` |
| `books` | Книга: справочная карточка или по договору (главы, аудио). Ярлыки: ХЭ, откровенность, статус, предупреждения | `/kniga/[slug]/` |
| `chapters` | Главы: текст и/или аудио, бесплатные первые главы | — |
| `series`, `authors`, `narrators` | Серии, авторы, чтецы | `/serii/`, `/avtor/`, `/chtec/` |
| `litmobs`, `litmob-entries` | Литмобы (8 шагов конструктора, модерация) и заявки авторов | `/litmoby/[slug]/` |
| `follows` | «Сообщим о проде»: подписка на книгу или литмоб | — |
| `users` | Роли: admin, editor, author, narrator, reader | — |

Поле `path` у каждой SEO-страницы вычисляется хуком и уникально — фронт, sitemap и
canonical строятся от него. Страница сюжета с числом книг меньше `minBooksToIndex`
(настройки сайта, по умолчанию 5) отдаётся с `noindex` и не попадает в sitemap.

## Миграции

```bash
npm run migrate:create <название>   # после изменения коллекций
npm run migrate
npm run generate:types
```

## Деплой

`Dockerfile` собирает образ без доступа к БД; при старте контейнера выполняются
`npm run migrate && npm run start`. Health-check — `/api/health`.
