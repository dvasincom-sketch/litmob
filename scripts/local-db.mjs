// Встроенный PostgreSQL для локальной разработки без Docker.
// Данные — в ./.pgdata, порт 54329. Остановка — Ctrl+C.
import EmbeddedPostgres from 'embedded-postgres'
import { existsSync } from 'node:fs'

const dir = process.env.PGDATA_DIR || './.pgdata'
const pg = new EmbeddedPostgres({ databaseDir: dir, user: 'postgres', password: 'postgres', port: 54329, persistent: true })
if (!existsSync(dir)) await pg.initialise()
await pg.start()
try { await pg.createDatabase('litmob') } catch { /* уже есть */ }
console.log('Postgres запущен: postgres://postgres:postgres@127.0.0.1:54329/litmob')
const stop = async () => { await pg.stop(); process.exit(0) }
process.on('SIGINT', stop)
process.on('SIGTERM', stop)
setInterval(() => {}, 1 << 30)
