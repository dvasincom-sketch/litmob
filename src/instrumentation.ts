/**
 * Старт Payload сразу при запуске сервера, а не на первом запросе.
 * В production адаптер БД сам применяет миграции (prodMigrations в payload.config.ts),
 * поэтому отдельный шаг `payload migrate` перед `next start` больше не нужен: он грузит
 * TS-конфиг через загрузчик и на хостинге запускался минутами, срывая health-check.
 * Не ждём здесь завершения: сервер должен отвечать на /api/health/ сразу.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return
  const g = globalThis as { __litmobDb?: 'pending' | 'ready' | 'failed' }
  g.__litmobDb = 'pending'
  const t = Date.now()
  console.log('[startup] connecting to DB and applying migrations…')
  void (async () => {
    try {
      const [{ getPayload }, { default: config }] = await Promise.all([import('payload'), import('@payload-config')])
      await getPayload({ config })
      g.__litmobDb = 'ready'
      console.log(`[startup] DB ready, migrations applied in ${Date.now() - t} ms`)
    } catch (err) {
      g.__litmobDb = 'failed'
      console.error(`[startup] DB init failed after ${Date.now() - t} ms`, err)
    }
  })()
}
