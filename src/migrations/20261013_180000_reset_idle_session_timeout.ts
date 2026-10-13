import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/**
 * Отмена idle_session_timeout из 20261013_110000_db_session_timeouts.
 * Payload держит одно подключение пула постоянно открытым и простаивающим; через 10 минут
 * сервер БД его обрывал (57P05), процесс падал с uncaughtException — деплой проваливался
 * ровно через 10 минут после health-check. TCP keepalive оставляем: он не трогает живых клиентов.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql.raw(`DO $$ BEGIN EXECUTE 'ALTER ROLE CURRENT_USER RESET idle_session_timeout'; EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'skip: %', SQLERRM; END $$;`))
}

export async function down(_: MigrateDownArgs): Promise<void> {
  // Обратно не включаем: таймаут ломает постоянное подключение Payload.
}
