import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/**
 * H1 сюжетов и жанров теперь строятся шаблоном (src/lib/landingSeo.ts).
 * Убираем H1, которые сид проставил автоматически, — иначе они перекрывали бы шаблон.
 * Ручные H1 (семейства и всё, что не совпадает с авто-шаблонами сида) остаются.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "tropes" SET "h1" = NULL
      WHERE "kind" <> 'family' AND ("h1" LIKE '%: книги и аудиокниги' OR "h1" LIKE '%: аудиокниги');
    UPDATE "genres" SET "h1" = NULL
      WHERE "h1" LIKE '%: книги и аудиокниги' OR "h1" LIKE '%: аудиокниги';
  `)
}

export async function down(_: MigrateDownArgs): Promise<void> {
  // Данные не восстанавливаем: шаблон выдаёт те же или лучшие H1.
}
