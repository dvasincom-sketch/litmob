import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/**
 * Один читатель — одна подписка на книгу и одна на литмоб;
 * один автор — одна заявка в литмоб.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS "follows_user_book_uniq" ON "follows" ("user_id", "book_id") WHERE "book_id" IS NOT NULL;
    CREATE UNIQUE INDEX IF NOT EXISTS "follows_user_litmob_uniq" ON "follows" ("user_id", "litmob_id") WHERE "litmob_id" IS NOT NULL;
    CREATE UNIQUE INDEX IF NOT EXISTS "litmob_entries_litmob_author_uniq" ON "litmob_entries" ("litmob_id", "author_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "follows_user_book_uniq";
    DROP INDEX IF EXISTS "follows_user_litmob_uniq";
    DROP INDEX IF EXISTS "litmob_entries_litmob_author_uniq";
  `)
}
