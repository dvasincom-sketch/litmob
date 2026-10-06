import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_collections_wave" AS ENUM('1', '2', '3', '4');
  CREATE TYPE "public"."enum_pages_section" AS ENUM('narrators', 'authors', 'article', 'service');
  CREATE TYPE "public"."enum_pages_wave" AS ENUM('1', '2', '3', '4');
  CREATE TABLE "collections_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"q" varchar NOT NULL,
  	"a" varchar NOT NULL
  );
  
  CREATE TABLE "collections" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"subtitle" varchar,
  	"adult" boolean,
  	"audio_only" boolean,
  	"h1" varchar,
  	"lead" varchar,
  	"body" jsonb,
  	"main_query" varchar,
  	"monthly_volume" numeric,
  	"growth" varchar,
  	"wave" "enum_collections_wave",
  	"phrases" varchar,
  	"slug" varchar,
  	"custom_path" varchar,
  	"path" varchar,
  	"published" boolean DEFAULT false,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "collections_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"tropes_id" integer,
  	"genres_id" integer,
  	"books_id" integer
  );
  
  CREATE TABLE "pages_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"q" varchar NOT NULL,
  	"a" varchar NOT NULL
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"section" "enum_pages_section" DEFAULT 'service',
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"h1" varchar,
  	"lead" varchar,
  	"body" jsonb,
  	"main_query" varchar,
  	"monthly_volume" numeric,
  	"growth" varchar,
  	"wave" "enum_pages_wave",
  	"phrases" varchar,
  	"path" varchar,
  	"published" boolean DEFAULT false,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "tropes" ADD COLUMN "subtitle" varchar;
  ALTER TABLE "tropes" ADD COLUMN "custom_path" varchar;
  ALTER TABLE "genres" ADD COLUMN "subtitle" varchar;
  ALTER TABLE "genres" ADD COLUMN "custom_path" varchar;
  ALTER TABLE "books" ADD COLUMN "cover_tint" varchar;
  ALTER TABLE "books" ADD COLUMN "is_demo" boolean;
  ALTER TABLE "authors" ADD COLUMN "is_demo" boolean;
  ALTER TABLE "narrators" ADD COLUMN "is_demo" boolean;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "collections_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "pages_id" integer;
  ALTER TABLE "collections_faq" ADD CONSTRAINT "collections_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "collections" ADD CONSTRAINT "collections_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "collections_rels" ADD CONSTRAINT "collections_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "collections_rels" ADD CONSTRAINT "collections_rels_tropes_fk" FOREIGN KEY ("tropes_id") REFERENCES "public"."tropes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "collections_rels" ADD CONSTRAINT "collections_rels_genres_fk" FOREIGN KEY ("genres_id") REFERENCES "public"."genres"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "collections_rels" ADD CONSTRAINT "collections_rels_books_fk" FOREIGN KEY ("books_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_faq" ADD CONSTRAINT "pages_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "collections_faq_order_idx" ON "collections_faq" USING btree ("_order");
  CREATE INDEX "collections_faq_parent_id_idx" ON "collections_faq" USING btree ("_parent_id");
  CREATE INDEX "collections_slug_idx" ON "collections" USING btree ("slug");
  CREATE UNIQUE INDEX "collections_path_idx" ON "collections" USING btree ("path");
  CREATE INDEX "collections_published_idx" ON "collections" USING btree ("published");
  CREATE INDEX "collections_meta_meta_image_idx" ON "collections" USING btree ("meta_image_id");
  CREATE INDEX "collections_updated_at_idx" ON "collections" USING btree ("updated_at");
  CREATE INDEX "collections_created_at_idx" ON "collections" USING btree ("created_at");
  CREATE INDEX "collections_rels_order_idx" ON "collections_rels" USING btree ("order");
  CREATE INDEX "collections_rels_parent_idx" ON "collections_rels" USING btree ("parent_id");
  CREATE INDEX "collections_rels_path_idx" ON "collections_rels" USING btree ("path");
  CREATE INDEX "collections_rels_tropes_id_idx" ON "collections_rels" USING btree ("tropes_id");
  CREATE INDEX "collections_rels_genres_id_idx" ON "collections_rels" USING btree ("genres_id");
  CREATE INDEX "collections_rels_books_id_idx" ON "collections_rels" USING btree ("books_id");
  CREATE INDEX "pages_faq_order_idx" ON "pages_faq" USING btree ("_order");
  CREATE INDEX "pages_faq_parent_id_idx" ON "pages_faq" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_path_idx" ON "pages" USING btree ("path");
  CREATE INDEX "pages_published_idx" ON "pages" USING btree ("published");
  CREATE INDEX "pages_meta_meta_image_idx" ON "pages" USING btree ("meta_image_id");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_collections_fk" FOREIGN KEY ("collections_id") REFERENCES "public"."collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_collections_id_idx" ON "payload_locked_documents_rels" USING btree ("collections_id");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "collections_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "collections" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "collections_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "collections_faq" CASCADE;
  DROP TABLE "collections" CASCADE;
  DROP TABLE "collections_rels" CASCADE;
  DROP TABLE "pages_faq" CASCADE;
  DROP TABLE "pages" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_collections_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_pages_fk";
  
  DROP INDEX "payload_locked_documents_rels_collections_id_idx";
  DROP INDEX "payload_locked_documents_rels_pages_id_idx";
  ALTER TABLE "tropes" DROP COLUMN "subtitle";
  ALTER TABLE "tropes" DROP COLUMN "custom_path";
  ALTER TABLE "genres" DROP COLUMN "subtitle";
  ALTER TABLE "genres" DROP COLUMN "custom_path";
  ALTER TABLE "books" DROP COLUMN "cover_tint";
  ALTER TABLE "books" DROP COLUMN "is_demo";
  ALTER TABLE "authors" DROP COLUMN "is_demo";
  ALTER TABLE "narrators" DROP COLUMN "is_demo";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "collections_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "pages_id";
  DROP TYPE "public"."enum_collections_wave";
  DROP TYPE "public"."enum_pages_section";
  DROP TYPE "public"."enum_pages_wave";`)
}
