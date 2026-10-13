import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/**
 * Утечка подключений при деплоях: когда платформа убивает контейнер, его TCP-соединения
 * с базой не закрываются, и Postgres держит их часами. После пары неудачных деплоев
 * все ~20 слотов заняты, новый контейнер не может даже выполнить migrate.
 *
 * Ставим на роль приложения серверные таймауты (действуют для новых сессий):
 * - tcp_keepalives_*: сервер сам находит мёртвых клиентов примерно за 1,5 минуты;
 * - idle_session_timeout: простаивающая сессия закрывается через 10 минут (пул приложения
 *   закрывает свои простаивающие подключения через 10 секунд, так что живым процессам это не мешает).
 * Каждая настройка — в отдельном блоке: если хостинг что-то запрещает, миграция не падает.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  for (const stmt of [
    `ALTER ROLE CURRENT_USER SET tcp_keepalives_idle = 60`,
    `ALTER ROLE CURRENT_USER SET tcp_keepalives_interval = 10`,
    `ALTER ROLE CURRENT_USER SET tcp_keepalives_count = 3`,
    `ALTER ROLE CURRENT_USER SET idle_session_timeout = '10min'`,
  ]) {
    await db.execute(sql.raw(`DO $$ BEGIN EXECUTE '${stmt.replace(/'/g, "''")}'; EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'skip: %', SQLERRM; END $$;`))
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  for (const p of ['tcp_keepalives_idle', 'tcp_keepalives_interval', 'tcp_keepalives_count', 'idle_session_timeout']) {
    await db.execute(sql.raw(`DO $$ BEGIN EXECUTE 'ALTER ROLE CURRENT_USER RESET ${p}'; EXCEPTION WHEN OTHERS THEN NULL; END $$;`))
  }
}
