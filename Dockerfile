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
# Старт: сервер запускается сразу и сам применяет миграции (prodMigrations, src/instrumentation.ts),
# /api/health/ отвечает с первой секунды. Сиды идут в фоне: ждут, пока /api/health/ сообщит db=ready,
# и работают с пулом в 2 подключения (в базе ~20 слотов, при деплое живут старый и новый контейнеры).
# Ошибка сида не роняет сайт. Строки [startup]/[seeds] в логе — с временем, чтобы видеть, где долго.
CMD ["sh", "-c", "( export DB_POOL_MAX=2 PAYLOAD_PROD_MIGRATIONS=0; i=0; until curl -fsS \"http://127.0.0.1:${PORT}/api/health/\" 2>/dev/null | grep -q '\"db\":\"ready\"'; do i=$((i+1)); [ $i -gt 360 ] && { echo \"[seeds] $(date -u +%T) DB not ready after 30 min, skipping\" >&2; exit 1; }; sleep 5; done; echo \"[seeds] $(date -u +%T) start\"; if [ \"$SEED_ON_START\" = 1 ]; then npm run seed; fi && if [ \"$CONTENT_ON_START\" = 1 ]; then npm run seed:content && npm run seed:catalog; fi && echo \"[seeds] $(date -u +%T) done\" || echo \"[seeds] $(date -u +%T) failed\" >&2 ) & exec npm run start"]
