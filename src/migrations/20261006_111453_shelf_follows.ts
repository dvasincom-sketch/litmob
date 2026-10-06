import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_shelf_status" AS ENUM('want', 'listening', 'done');
  CREATE TABLE "shelf" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"book_id" integer NOT NULL,
  	"status" "enum_shelf_status" DEFAULT 'want',
  	"chapter_id" integer,
  	"position_sec" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "follows" ADD COLUMN "narrator_id" integer;
  ALTER TABLE "follows" ADD COLUMN "trope_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "shelf_id" integer;
  ALTER TABLE "shelf" ADD CONSTRAINT "shelf_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "shelf" ADD CONSTRAINT "shelf_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "shelf" ADD CONSTRAINT "shelf_chapter_id_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."chapters"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "shelf_user_idx" ON "shelf" USING btree ("user_id");
  CREATE INDEX "shelf_book_idx" ON "shelf" USING btree ("book_id");
  CREATE INDEX "shelf_chapter_idx" ON "shelf" USING btree ("chapter_id");
  CREATE INDEX "shelf_updated_at_idx" ON "shelf" USING btree ("updated_at");
  CREATE INDEX "shelf_created_at_idx" ON "shelf" USING btree ("created_at");
  ALTER TABLE "follows" ADD CONSTRAINT "follows_narrator_id_narrators_id_fk" FOREIGN KEY ("narrator_id") REFERENCES "public"."narrators"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "follows" ADD CONSTRAINT "follows_trope_id_tropes_id_fk" FOREIGN KEY ("trope_id") REFERENCES "public"."tropes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_shelf_fk" FOREIGN KEY ("shelf_id") REFERENCES "public"."shelf"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "follows_narrator_idx" ON "follows" USING btree ("narrator_id");
  CREATE INDEX "follows_trope_idx" ON "follows" USING btree ("trope_id");
  CREATE INDEX "payload_locked_documents_rels_shelf_id_idx" ON "payload_locked_documents_rels" USING btree ("shelf_id");  CREATE UNIQUE INDEX IF NOT EXISTS "shelf_user_book_uniq" ON "shelf" ("user_id", "book_id");
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "shelf" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "shelf" CASCADE;
  ALTER TABLE "follows" DROP CONSTRAINT "follows_narrator_id_narrators_id_fk";
  
  ALTER TABLE "follows" DROP CONSTRAINT "follows_trope_id_tropes_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_shelf_fk";
  
  DROP INDEX "follows_narrator_idx";
  DROP INDEX "follows_trope_idx";
  DROP INDEX "payload_locked_documents_rels_shelf_id_idx";
  ALTER TABLE "follows" DROP COLUMN "narrator_id";
  ALTER TABLE "follows" DROP COLUMN "trope_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "shelf_id";
  DROP TYPE "public"."enum_shelf_status";`)
}
