import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_reviews_status" AS ENUM('pending', 'approved', 'rejected');
  CREATE TABLE "reviews" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"book_id" integer NOT NULL,
  	"user_id" integer NOT NULL,
  	"author_name" varchar,
  	"rating" numeric NOT NULL,
  	"text" varchar NOT NULL,
  	"status" "enum_reviews_status" DEFAULT 'pending',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "reviews_id" integer;
  ALTER TABLE "reviews" ADD CONSTRAINT "reviews_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "reviews_book_idx" ON "reviews" USING btree ("book_id");
  CREATE INDEX "reviews_user_idx" ON "reviews" USING btree ("user_id");
  CREATE INDEX "reviews_status_idx" ON "reviews" USING btree ("status");
  CREATE INDEX "reviews_updated_at_idx" ON "reviews" USING btree ("updated_at");
  CREATE INDEX "reviews_created_at_idx" ON "reviews" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_reviews_fk" FOREIGN KEY ("reviews_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_reviews_id_idx" ON "payload_locked_documents_rels" USING btree ("reviews_id");
  CREATE UNIQUE INDEX "reviews_user_book_uniq" ON "reviews" ("user_id", "book_id");`)

  // «Фейри и эльфы» → «Фейри»: эльфы теперь отдельный сюжет /tropy/elfy/ (создаёт сид).
  await db.execute(sql`
    UPDATE "tropes" SET "title" = 'Фейри', "subtitle" = 'Дворы фейри и сделки',
      "lead" = 'Дворы фейри, сделки, которые нельзя нарушить, и бессмертные, которые не умеют проигрывать.'
    WHERE "slug" = 'fejri' AND "kind" = 'trope' AND "title" = 'Фейри и эльфы';
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_reviews_fk";
    DROP INDEX IF EXISTS "payload_locked_documents_rels_reviews_id_idx";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "reviews_id";
    DROP TABLE IF EXISTS "reviews" CASCADE;
    DROP TYPE IF EXISTS "public"."enum_reviews_status";
  `)
}
