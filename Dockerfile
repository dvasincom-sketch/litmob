# Литмоб: Next.js + Payload. Сборка без БД (все страницы с данными — динамические),
# миграции применяются при старте контейнера.
FROM node:22-bookworm-slim AS base
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates curl && rm -rf /var/lib/apt/lists/*
RUN mkdir -p /app && chown node:node /app
WORKDIR /app
USER node
COPY --chown=node:node package.json package-lock.json .npmrc ./
RUN npm ci --no-audit --no-fund
COPY --chown=node:node . .
ARG S3_PUBLIC_URL
ENV S3_PUBLIC_URL=$S3_PUBLIC_URL
ARG NEXT_PUBLIC_SITE_URL=https://litmob.ru
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
RUN npm run build
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=5 CMD curl -fsS "http://127.0.0.1:${PORT}/api/health/" || exit 1
# SEED_ON_START=1 — структура сайта (сюжеты, жанры, подборки, страницы): создаёт новое,
#   у существующих обновляет только связи и спрос, тексты из админки не трогает. Можно держать включённым.
# CONTENT_ON_START=1 — тексты из content/ в пустые поля и справочный каталог авторов, серий и книг
#   (content/catalog/). Повторный запуск ничего не дублирует. Можно держать включённым.
CMD ["sh", "-c", "npm run migrate && if [ \"$SEED_ON_START\" = 1 ]; then npm run seed; fi && if [ \"$CONTENT_ON_START\" = 1 ]; then npm run seed:content && npm run seed:catalog; fi && npm run start"]
