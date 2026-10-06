import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_tropes_kind" AS ENUM('family', 'trope', 'refinement');
  CREATE TYPE "public"."enum_tropes_wave" AS ENUM('1', '2', '3', '4');
  CREATE TYPE "public"."enum_genres_wave" AS ENUM('1', '2', '3', '4');
  CREATE TYPE "public"."enum_books_status" AS ENUM('ongoing', 'completed', 'frozen');
  CREATE TYPE "public"."enum_books_happy_ending" AS ENUM('yes', 'no', 'unknown');
  CREATE TYPE "public"."enum_books_heat" AS ENUM('none', 'moderate', 'explicit');
  CREATE TYPE "public"."enum_books_mode" AS ENUM('reference', 'licensed');
  CREATE TYPE "public"."enum_litmobs_status" AS ENUM('draft', 'moderation', 'recruiting', 'running', 'voting', 'finished', 'rejected');
  CREATE TYPE "public"."enum_litmobs_rating" AS ENUM('general', 'adult');
  CREATE TYPE "public"."enum_litmobs_pov" AS ENUM('any', 'first', 'third');
  CREATE TYPE "public"."enum_litmobs_join_mode" AS ENUM('open', 'application', 'invite');
  CREATE TYPE "public"."enum_litmob_entries_status" AS ENUM('pending', 'approved', 'rejected', 'dropped');
  CREATE TYPE "public"."enum_follows_channel" AS ENUM('email', 'push');
  CREATE TYPE "public"."enum_users_roles" AS ENUM('admin', 'editor', 'author', 'narrator', 'reader');
  CREATE TABLE "tropes_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"q" varchar NOT NULL,
  	"a" varchar NOT NULL
  );
  
  CREATE TABLE "tropes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"kind" "enum_tropes_kind" DEFAULT 'trope' NOT NULL,
  	"parent_id" integer,
  	"audio_only" boolean,
  	"adult" boolean,
  	"h1" varchar,
  	"lead" varchar,
  	"body" jsonb,
  	"main_query" varchar,
  	"monthly_volume" numeric,
  	"growth" varchar,
  	"wave" "enum_tropes_wave",
  	"phrases" varchar,
  	"slug" varchar,
  	"path" varchar,
  	"published" boolean DEFAULT false,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "tropes_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"tropes_id" integer
  );
  
  CREATE TABLE "genres_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"q" varchar NOT NULL,
  	"a" varchar NOT NULL
  );
  
  CREATE TABLE "genres" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"parent_id" integer,
  	"audio_only" boolean,
  	"adult" boolean,
  	"h1" varchar,
  	"lead" varchar,
  	"body" jsonb,
  	"main_query" varchar,
  	"monthly_volume" numeric,
  	"growth" varchar,
  	"wave" "enum_genres_wave",
  	"phrases" varchar,
  	"slug" varchar,
  	"path" varchar,
  	"published" boolean DEFAULT false,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "genres_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"tropes_id" integer
  );
  
  CREATE TABLE "books_warnings" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "books_external_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "books" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"cover_id" integer,
  	"about" jsonb,
  	"hook" varchar,
  	"series_ref_id" integer,
  	"series_order" numeric,
  	"status" "enum_books_status" DEFAULT 'ongoing',
  	"happy_ending" "enum_books_happy_ending" DEFAULT 'unknown',
  	"heat" "enum_books_heat" DEFAULT 'none',
  	"has_audio" boolean,
  	"audio_hours" numeric,
  	"mode" "enum_books_mode" DEFAULT 'reference',
  	"free_chapters" numeric DEFAULT 1,
  	"claimed" boolean,
  	"is_translation" boolean,
  	"original_title" varchar,
  	"translator" varchar,
  	"litmob_id" integer,
  	"slug" varchar,
  	"path" varchar,
  	"published" boolean DEFAULT false,
  	"published_at" timestamp(3) with time zone,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "books_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"authors_id" integer,
  	"narrators_id" integer,
  	"tropes_id" integer,
  	"genres_id" integer
  );
  
  CREATE TABLE "chapters" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"book_id" integer NOT NULL,
  	"order" numeric DEFAULT 1,
  	"title" varchar NOT NULL,
  	"body" jsonb,
  	"audio_id" integer,
  	"narrator_id" integer,
  	"is_free" boolean DEFAULT false,
  	"published" boolean DEFAULT false,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "series" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"lead" varchar,
  	"slug" varchar,
  	"path" varchar,
  	"published" boolean DEFAULT false,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "authors_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "authors" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"about" varchar,
  	"user_id" integer,
  	"claimed" boolean,
  	"slug" varchar,
  	"path" varchar,
  	"published" boolean DEFAULT false,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "narrators" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"photo_id" integer,
  	"about" varchar,
  	"voice" varchar,
  	"demo_id" integer,
  	"user_id" integer,
  	"slug" varchar,
  	"path" varchar,
  	"published" boolean DEFAULT false,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "narrators_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"genres_id" integer
  );
  
  CREATE TABLE "litmobs_must_have" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "litmobs_forbidden" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "litmobs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"organizer_id" integer,
  	"status" "enum_litmobs_status" DEFAULT 'draft',
  	"trope_id" integer,
  	"custom_theme" varchar,
  	"pitch" varchar NOT NULL,
  	"min_chars" numeric,
  	"max_chars" numeric,
  	"rating" "enum_litmobs_rating" DEFAULT 'general',
  	"happy_ending_required" boolean,
  	"pov" "enum_litmobs_pov",
  	"applications_until" timestamp(3) with time zone,
  	"start_at" timestamp(3) with time zone,
  	"first_chapter_by" timestamp(3) with time zone,
  	"chapters_per_week" numeric,
  	"finish_at" timestamp(3) with time zone,
  	"max_participants" numeric DEFAULT 12,
  	"join_mode" "enum_litmobs_join_mode" DEFAULT 'application',
  	"badge_id" integer,
  	"cover_style" varchar,
  	"narrators_welcome" boolean DEFAULT true,
  	"reader_voting" boolean DEFAULT true,
  	"prize" varchar,
  	"moderation_note" varchar,
  	"slug" varchar,
  	"path" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "litmob_entries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"litmob_id" integer NOT NULL,
  	"author_id" integer NOT NULL,
  	"synopsis" varchar,
  	"book_id" integer,
  	"status" "enum_litmob_entries_status" DEFAULT 'pending',
  	"votes" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "follows" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"book_id" integer,
  	"litmob_id" integer,
  	"channel" "enum_follows_channel" DEFAULT 'email',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "users_roles" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_users_roles",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"adult_confirmed_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_cover_url" varchar,
  	"sizes_cover_width" numeric,
  	"sizes_cover_height" numeric,
  	"sizes_cover_mime_type" varchar,
  	"sizes_cover_filesize" numeric,
  	"sizes_cover_filename" varchar,
  	"sizes_thumb_url" varchar,
  	"sizes_thumb_width" numeric,
  	"sizes_thumb_height" numeric,
  	"sizes_thumb_mime_type" varchar,
  	"sizes_thumb_filesize" numeric,
  	"sizes_thumb_filename" varchar
  );
  
  CREATE TABLE "audio" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"duration_sec" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"tropes_id" integer,
  	"genres_id" integer,
  	"books_id" integer,
  	"chapters_id" integer,
  	"series_id" integer,
  	"authors_id" integer,
  	"narrators_id" integer,
  	"litmobs_id" integer,
  	"litmob_entries_id" integer,
  	"follows_id" integer,
  	"users_id" integer,
  	"media_id" integer,
  	"audio_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"site_name" varchar DEFAULT 'Литмоб',
  	"tagline" varchar DEFAULT 'Книги и аудиокниги по любимому сюжету',
  	"adult_gate_text" varchar DEFAULT 'Раздел содержит откровенные сцены. Вам есть 18 лет?',
  	"min_books_to_index" numeric DEFAULT 5,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "tropes_faq" ADD CONSTRAINT "tropes_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tropes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tropes" ADD CONSTRAINT "tropes_parent_id_tropes_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."tropes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "tropes" ADD CONSTRAINT "tropes_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "tropes_rels" ADD CONSTRAINT "tropes_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."tropes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tropes_rels" ADD CONSTRAINT "tropes_rels_tropes_fk" FOREIGN KEY ("tropes_id") REFERENCES "public"."tropes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "genres_faq" ADD CONSTRAINT "genres_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."genres"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "genres" ADD CONSTRAINT "genres_parent_id_genres_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."genres"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "genres" ADD CONSTRAINT "genres_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "genres_rels" ADD CONSTRAINT "genres_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."genres"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "genres_rels" ADD CONSTRAINT "genres_rels_tropes_fk" FOREIGN KEY ("tropes_id") REFERENCES "public"."tropes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "books_warnings" ADD CONSTRAINT "books_warnings_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "books_external_links" ADD CONSTRAINT "books_external_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "books" ADD CONSTRAINT "books_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "books" ADD CONSTRAINT "books_series_ref_id_series_id_fk" FOREIGN KEY ("series_ref_id") REFERENCES "public"."series"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "books" ADD CONSTRAINT "books_litmob_id_litmobs_id_fk" FOREIGN KEY ("litmob_id") REFERENCES "public"."litmobs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "books" ADD CONSTRAINT "books_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "books_rels" ADD CONSTRAINT "books_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "books_rels" ADD CONSTRAINT "books_rels_authors_fk" FOREIGN KEY ("authors_id") REFERENCES "public"."authors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "books_rels" ADD CONSTRAINT "books_rels_narrators_fk" FOREIGN KEY ("narrators_id") REFERENCES "public"."narrators"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "books_rels" ADD CONSTRAINT "books_rels_tropes_fk" FOREIGN KEY ("tropes_id") REFERENCES "public"."tropes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "books_rels" ADD CONSTRAINT "books_rels_genres_fk" FOREIGN KEY ("genres_id") REFERENCES "public"."genres"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "chapters" ADD CONSTRAINT "chapters_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "chapters" ADD CONSTRAINT "chapters_audio_id_audio_id_fk" FOREIGN KEY ("audio_id") REFERENCES "public"."audio"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "chapters" ADD CONSTRAINT "chapters_narrator_id_narrators_id_fk" FOREIGN KEY ("narrator_id") REFERENCES "public"."narrators"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "series" ADD CONSTRAINT "series_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "authors_links" ADD CONSTRAINT "authors_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."authors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "authors" ADD CONSTRAINT "authors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "authors" ADD CONSTRAINT "authors_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "narrators" ADD CONSTRAINT "narrators_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "narrators" ADD CONSTRAINT "narrators_demo_id_audio_id_fk" FOREIGN KEY ("demo_id") REFERENCES "public"."audio"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "narrators" ADD CONSTRAINT "narrators_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "narrators" ADD CONSTRAINT "narrators_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "narrators_rels" ADD CONSTRAINT "narrators_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."narrators"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "narrators_rels" ADD CONSTRAINT "narrators_rels_genres_fk" FOREIGN KEY ("genres_id") REFERENCES "public"."genres"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "litmobs_must_have" ADD CONSTRAINT "litmobs_must_have_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."litmobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "litmobs_forbidden" ADD CONSTRAINT "litmobs_forbidden_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."litmobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "litmobs" ADD CONSTRAINT "litmobs_organizer_id_users_id_fk" FOREIGN KEY ("organizer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "litmobs" ADD CONSTRAINT "litmobs_trope_id_tropes_id_fk" FOREIGN KEY ("trope_id") REFERENCES "public"."tropes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "litmobs" ADD CONSTRAINT "litmobs_badge_id_media_id_fk" FOREIGN KEY ("badge_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "litmobs" ADD CONSTRAINT "litmobs_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "litmob_entries" ADD CONSTRAINT "litmob_entries_litmob_id_litmobs_id_fk" FOREIGN KEY ("litmob_id") REFERENCES "public"."litmobs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "litmob_entries" ADD CONSTRAINT "litmob_entries_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "litmob_entries" ADD CONSTRAINT "litmob_entries_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "follows" ADD CONSTRAINT "follows_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "follows" ADD CONSTRAINT "follows_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "follows" ADD CONSTRAINT "follows_litmob_id_litmobs_id_fk" FOREIGN KEY ("litmob_id") REFERENCES "public"."litmobs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_roles" ADD CONSTRAINT "users_roles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tropes_fk" FOREIGN KEY ("tropes_id") REFERENCES "public"."tropes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_genres_fk" FOREIGN KEY ("genres_id") REFERENCES "public"."genres"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_books_fk" FOREIGN KEY ("books_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_chapters_fk" FOREIGN KEY ("chapters_id") REFERENCES "public"."chapters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_series_fk" FOREIGN KEY ("series_id") REFERENCES "public"."series"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_authors_fk" FOREIGN KEY ("authors_id") REFERENCES "public"."authors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_narrators_fk" FOREIGN KEY ("narrators_id") REFERENCES "public"."narrators"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_litmobs_fk" FOREIGN KEY ("litmobs_id") REFERENCES "public"."litmobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_litmob_entries_fk" FOREIGN KEY ("litmob_entries_id") REFERENCES "public"."litmob_entries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_follows_fk" FOREIGN KEY ("follows_id") REFERENCES "public"."follows"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_audio_fk" FOREIGN KEY ("audio_id") REFERENCES "public"."audio"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "tropes_faq_order_idx" ON "tropes_faq" USING btree ("_order");
  CREATE INDEX "tropes_faq_parent_id_idx" ON "tropes_faq" USING btree ("_parent_id");
  CREATE INDEX "tropes_parent_idx" ON "tropes" USING btree ("parent_id");
  CREATE INDEX "tropes_slug_idx" ON "tropes" USING btree ("slug");
  CREATE UNIQUE INDEX "tropes_path_idx" ON "tropes" USING btree ("path");
  CREATE INDEX "tropes_published_idx" ON "tropes" USING btree ("published");
  CREATE INDEX "tropes_meta_meta_image_idx" ON "tropes" USING btree ("meta_image_id");
  CREATE INDEX "tropes_updated_at_idx" ON "tropes" USING btree ("updated_at");
  CREATE INDEX "tropes_created_at_idx" ON "tropes" USING btree ("created_at");
  CREATE INDEX "tropes_rels_order_idx" ON "tropes_rels" USING btree ("order");
  CREATE INDEX "tropes_rels_parent_idx" ON "tropes_rels" USING btree ("parent_id");
  CREATE INDEX "tropes_rels_path_idx" ON "tropes_rels" USING btree ("path");
  CREATE INDEX "tropes_rels_tropes_id_idx" ON "tropes_rels" USING btree ("tropes_id");
  CREATE INDEX "genres_faq_order_idx" ON "genres_faq" USING btree ("_order");
  CREATE INDEX "genres_faq_parent_id_idx" ON "genres_faq" USING btree ("_parent_id");
  CREATE INDEX "genres_parent_idx" ON "genres" USING btree ("parent_id");
  CREATE INDEX "genres_slug_idx" ON "genres" USING btree ("slug");
  CREATE UNIQUE INDEX "genres_path_idx" ON "genres" USING btree ("path");
  CREATE INDEX "genres_published_idx" ON "genres" USING btree ("published");
  CREATE INDEX "genres_meta_meta_image_idx" ON "genres" USING btree ("meta_image_id");
  CREATE INDEX "genres_updated_at_idx" ON "genres" USING btree ("updated_at");
  CREATE INDEX "genres_created_at_idx" ON "genres" USING btree ("created_at");
  CREATE INDEX "genres_rels_order_idx" ON "genres_rels" USING btree ("order");
  CREATE INDEX "genres_rels_parent_idx" ON "genres_rels" USING btree ("parent_id");
  CREATE INDEX "genres_rels_path_idx" ON "genres_rels" USING btree ("path");
  CREATE INDEX "genres_rels_tropes_id_idx" ON "genres_rels" USING btree ("tropes_id");
  CREATE INDEX "books_warnings_order_idx" ON "books_warnings" USING btree ("_order");
  CREATE INDEX "books_warnings_parent_id_idx" ON "books_warnings" USING btree ("_parent_id");
  CREATE INDEX "books_external_links_order_idx" ON "books_external_links" USING btree ("_order");
  CREATE INDEX "books_external_links_parent_id_idx" ON "books_external_links" USING btree ("_parent_id");
  CREATE INDEX "books_cover_idx" ON "books" USING btree ("cover_id");
  CREATE INDEX "books_series_series_ref_idx" ON "books" USING btree ("series_ref_id");
  CREATE INDEX "books_has_audio_idx" ON "books" USING btree ("has_audio");
  CREATE INDEX "books_litmob_idx" ON "books" USING btree ("litmob_id");
  CREATE INDEX "books_slug_idx" ON "books" USING btree ("slug");
  CREATE UNIQUE INDEX "books_path_idx" ON "books" USING btree ("path");
  CREATE INDEX "books_published_idx" ON "books" USING btree ("published");
  CREATE INDEX "books_meta_meta_image_idx" ON "books" USING btree ("meta_image_id");
  CREATE INDEX "books_updated_at_idx" ON "books" USING btree ("updated_at");
  CREATE INDEX "books_created_at_idx" ON "books" USING btree ("created_at");
  CREATE INDEX "books_rels_order_idx" ON "books_rels" USING btree ("order");
  CREATE INDEX "books_rels_parent_idx" ON "books_rels" USING btree ("parent_id");
  CREATE INDEX "books_rels_path_idx" ON "books_rels" USING btree ("path");
  CREATE INDEX "books_rels_authors_id_idx" ON "books_rels" USING btree ("authors_id");
  CREATE INDEX "books_rels_narrators_id_idx" ON "books_rels" USING btree ("narrators_id");
  CREATE INDEX "books_rels_tropes_id_idx" ON "books_rels" USING btree ("tropes_id");
  CREATE INDEX "books_rels_genres_id_idx" ON "books_rels" USING btree ("genres_id");
  CREATE INDEX "chapters_book_idx" ON "chapters" USING btree ("book_id");
  CREATE INDEX "chapters_order_idx" ON "chapters" USING btree ("order");
  CREATE INDEX "chapters_audio_idx" ON "chapters" USING btree ("audio_id");
  CREATE INDEX "chapters_narrator_idx" ON "chapters" USING btree ("narrator_id");
  CREATE INDEX "chapters_published_idx" ON "chapters" USING btree ("published");
  CREATE INDEX "chapters_updated_at_idx" ON "chapters" USING btree ("updated_at");
  CREATE INDEX "chapters_created_at_idx" ON "chapters" USING btree ("created_at");
  CREATE INDEX "series_slug_idx" ON "series" USING btree ("slug");
  CREATE UNIQUE INDEX "series_path_idx" ON "series" USING btree ("path");
  CREATE INDEX "series_published_idx" ON "series" USING btree ("published");
  CREATE INDEX "series_meta_meta_image_idx" ON "series" USING btree ("meta_image_id");
  CREATE INDEX "series_updated_at_idx" ON "series" USING btree ("updated_at");
  CREATE INDEX "series_created_at_idx" ON "series" USING btree ("created_at");
  CREATE INDEX "authors_links_order_idx" ON "authors_links" USING btree ("_order");
  CREATE INDEX "authors_links_parent_id_idx" ON "authors_links" USING btree ("_parent_id");
  CREATE INDEX "authors_user_idx" ON "authors" USING btree ("user_id");
  CREATE INDEX "authors_slug_idx" ON "authors" USING btree ("slug");
  CREATE UNIQUE INDEX "authors_path_idx" ON "authors" USING btree ("path");
  CREATE INDEX "authors_published_idx" ON "authors" USING btree ("published");
  CREATE INDEX "authors_meta_meta_image_idx" ON "authors" USING btree ("meta_image_id");
  CREATE INDEX "authors_updated_at_idx" ON "authors" USING btree ("updated_at");
  CREATE INDEX "authors_created_at_idx" ON "authors" USING btree ("created_at");
  CREATE INDEX "narrators_photo_idx" ON "narrators" USING btree ("photo_id");
  CREATE INDEX "narrators_demo_idx" ON "narrators" USING btree ("demo_id");
  CREATE INDEX "narrators_user_idx" ON "narrators" USING btree ("user_id");
  CREATE INDEX "narrators_slug_idx" ON "narrators" USING btree ("slug");
  CREATE UNIQUE INDEX "narrators_path_idx" ON "narrators" USING btree ("path");
  CREATE INDEX "narrators_published_idx" ON "narrators" USING btree ("published");
  CREATE INDEX "narrators_meta_meta_image_idx" ON "narrators" USING btree ("meta_image_id");
  CREATE INDEX "narrators_updated_at_idx" ON "narrators" USING btree ("updated_at");
  CREATE INDEX "narrators_created_at_idx" ON "narrators" USING btree ("created_at");
  CREATE INDEX "narrators_rels_order_idx" ON "narrators_rels" USING btree ("order");
  CREATE INDEX "narrators_rels_parent_idx" ON "narrators_rels" USING btree ("parent_id");
  CREATE INDEX "narrators_rels_path_idx" ON "narrators_rels" USING btree ("path");
  CREATE INDEX "narrators_rels_genres_id_idx" ON "narrators_rels" USING btree ("genres_id");
  CREATE INDEX "litmobs_must_have_order_idx" ON "litmobs_must_have" USING btree ("_order");
  CREATE INDEX "litmobs_must_have_parent_id_idx" ON "litmobs_must_have" USING btree ("_parent_id");
  CREATE INDEX "litmobs_forbidden_order_idx" ON "litmobs_forbidden" USING btree ("_order");
  CREATE INDEX "litmobs_forbidden_parent_id_idx" ON "litmobs_forbidden" USING btree ("_parent_id");
  CREATE INDEX "litmobs_organizer_idx" ON "litmobs" USING btree ("organizer_id");
  CREATE INDEX "litmobs_status_idx" ON "litmobs" USING btree ("status");
  CREATE INDEX "litmobs_trope_idx" ON "litmobs" USING btree ("trope_id");
  CREATE INDEX "litmobs_badge_idx" ON "litmobs" USING btree ("badge_id");
  CREATE INDEX "litmobs_slug_idx" ON "litmobs" USING btree ("slug");
  CREATE UNIQUE INDEX "litmobs_path_idx" ON "litmobs" USING btree ("path");
  CREATE INDEX "litmobs_meta_meta_image_idx" ON "litmobs" USING btree ("meta_image_id");
  CREATE INDEX "litmobs_updated_at_idx" ON "litmobs" USING btree ("updated_at");
  CREATE INDEX "litmobs_created_at_idx" ON "litmobs" USING btree ("created_at");
  CREATE INDEX "litmob_entries_litmob_idx" ON "litmob_entries" USING btree ("litmob_id");
  CREATE INDEX "litmob_entries_author_idx" ON "litmob_entries" USING btree ("author_id");
  CREATE INDEX "litmob_entries_book_idx" ON "litmob_entries" USING btree ("book_id");
  CREATE INDEX "litmob_entries_updated_at_idx" ON "litmob_entries" USING btree ("updated_at");
  CREATE INDEX "litmob_entries_created_at_idx" ON "litmob_entries" USING btree ("created_at");
  CREATE INDEX "follows_user_idx" ON "follows" USING btree ("user_id");
  CREATE INDEX "follows_book_idx" ON "follows" USING btree ("book_id");
  CREATE INDEX "follows_litmob_idx" ON "follows" USING btree ("litmob_id");
  CREATE INDEX "follows_updated_at_idx" ON "follows" USING btree ("updated_at");
  CREATE INDEX "follows_created_at_idx" ON "follows" USING btree ("created_at");
  CREATE INDEX "users_roles_order_idx" ON "users_roles" USING btree ("order");
  CREATE INDEX "users_roles_parent_idx" ON "users_roles" USING btree ("parent_id");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_cover_sizes_cover_filename_idx" ON "media" USING btree ("sizes_cover_filename");
  CREATE INDEX "media_sizes_thumb_sizes_thumb_filename_idx" ON "media" USING btree ("sizes_thumb_filename");
  CREATE INDEX "audio_updated_at_idx" ON "audio" USING btree ("updated_at");
  CREATE INDEX "audio_created_at_idx" ON "audio" USING btree ("created_at");
  CREATE UNIQUE INDEX "audio_filename_idx" ON "audio" USING btree ("filename");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_tropes_id_idx" ON "payload_locked_documents_rels" USING btree ("tropes_id");
  CREATE INDEX "payload_locked_documents_rels_genres_id_idx" ON "payload_locked_documents_rels" USING btree ("genres_id");
  CREATE INDEX "payload_locked_documents_rels_books_id_idx" ON "payload_locked_documents_rels" USING btree ("books_id");
  CREATE INDEX "payload_locked_documents_rels_chapters_id_idx" ON "payload_locked_documents_rels" USING btree ("chapters_id");
  CREATE INDEX "payload_locked_documents_rels_series_id_idx" ON "payload_locked_documents_rels" USING btree ("series_id");
  CREATE INDEX "payload_locked_documents_rels_authors_id_idx" ON "payload_locked_documents_rels" USING btree ("authors_id");
  CREATE INDEX "payload_locked_documents_rels_narrators_id_idx" ON "payload_locked_documents_rels" USING btree ("narrators_id");
  CREATE INDEX "payload_locked_documents_rels_litmobs_id_idx" ON "payload_locked_documents_rels" USING btree ("litmobs_id");
  CREATE INDEX "payload_locked_documents_rels_litmob_entries_id_idx" ON "payload_locked_documents_rels" USING btree ("litmob_entries_id");
  CREATE INDEX "payload_locked_documents_rels_follows_id_idx" ON "payload_locked_documents_rels" USING btree ("follows_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_audio_id_idx" ON "payload_locked_documents_rels" USING btree ("audio_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "tropes_faq" CASCADE;
  DROP TABLE "tropes" CASCADE;
  DROP TABLE "tropes_rels" CASCADE;
  DROP TABLE "genres_faq" CASCADE;
  DROP TABLE "genres" CASCADE;
  DROP TABLE "genres_rels" CASCADE;
  DROP TABLE "books_warnings" CASCADE;
  DROP TABLE "books_external_links" CASCADE;
  DROP TABLE "books" CASCADE;
  DROP TABLE "books_rels" CASCADE;
  DROP TABLE "chapters" CASCADE;
  DROP TABLE "series" CASCADE;
  DROP TABLE "authors_links" CASCADE;
  DROP TABLE "authors" CASCADE;
  DROP TABLE "narrators" CASCADE;
  DROP TABLE "narrators_rels" CASCADE;
  DROP TABLE "litmobs_must_have" CASCADE;
  DROP TABLE "litmobs_forbidden" CASCADE;
  DROP TABLE "litmobs" CASCADE;
  DROP TABLE "litmob_entries" CASCADE;
  DROP TABLE "follows" CASCADE;
  DROP TABLE "users_roles" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "audio" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TYPE "public"."enum_tropes_kind";
  DROP TYPE "public"."enum_tropes_wave";
  DROP TYPE "public"."enum_genres_wave";
  DROP TYPE "public"."enum_books_status";
  DROP TYPE "public"."enum_books_happy_ending";
  DROP TYPE "public"."enum_books_heat";
  DROP TYPE "public"."enum_books_mode";
  DROP TYPE "public"."enum_litmobs_status";
  DROP TYPE "public"."enum_litmobs_rating";
  DROP TYPE "public"."enum_litmobs_pov";
  DROP TYPE "public"."enum_litmobs_join_mode";
  DROP TYPE "public"."enum_litmob_entries_status";
  DROP TYPE "public"."enum_follows_channel";
  DROP TYPE "public"."enum_users_roles";`)
}
