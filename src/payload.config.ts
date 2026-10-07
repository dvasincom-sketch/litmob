import { ru } from '@payloadcms/translations/languages/ru'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Audio } from './collections/Audio'
import { Books } from './collections/Books'
import { Chapters } from './collections/Chapters'
import { Collections } from './collections/Collections'
import { Pages } from './collections/Pages'
import { Follows } from './collections/Follows'
import { Shelf } from './collections/Shelf'
import { Reviews } from './collections/Reviews'
import { Genres } from './collections/Genres'
import { LitmobEntries, Litmobs } from './collections/Litmobs'
import { Media } from './collections/Media'
import { Authors, Narrators, Series } from './collections/People'
import { Tropes } from './collections/Tropes'
import { Users } from './collections/Users'
import { SiteSettings } from './globals/SiteSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Ограничение памяти sharp — опыт content-box на маленьких контейнерах.
sharp.cache(false)
sharp.concurrency(1)

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
const useS3 = Boolean(process.env.S3_BUCKET)

export default buildConfig({
  serverURL: SITE_URL,
  // Вход читателей идёт через REST Payload с cookie; разрешаем запросы со своего домена.
  csrf: [SITE_URL],
  cors: [SITE_URL],
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: ' · Литмоб' },
  },
  i18n: { supportedLanguages: { ru }, fallbackLanguage: 'ru' },
  collections: [Tropes, Genres, Collections, Books, Chapters, Series, Authors, Narrators, Litmobs, LitmobEntries, Follows, Shelf, Reviews, Users, Pages, Media, Audio],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  email: process.env.SMTP_HOST
    ? nodemailerAdapter({
        defaultFromAddress: process.env.EMAIL_FROM_ADDRESS || 'noreply@litmob.ru',
        defaultFromName: process.env.EMAIL_FROM_NAME || 'Литмоб',
        transportOptions: {
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 587),
          secure: Number(process.env.SMTP_PORT || 587) === 465,
          auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS || '' } : undefined,
        },
      })
    : undefined,
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
      keepAlive: true,
      // Маленькие managed-базы Timeweb дают ~20 подключений; при деплое старый и новый
      // контейнеры работают одновременно, поэтому пул держим небольшим.
      max: Number(process.env.DB_POOL_MAX || 5),
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 10_000,
    },
    // Схема только через миграции (как в content-box).
    push: false,
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  sharp,
  plugins: [
    seoPlugin({
      collections: ['tropes', 'genres', 'collections', 'pages', 'books', 'series', 'authors', 'narrators', 'litmobs'],
      uploadsCollection: 'media',
      tabbedUI: false,
      generateTitle: ({ doc }: any) => `${doc?.h1 || doc?.title || doc?.name || ''} — Литмоб`,
      generateURL: ({ doc }: any) => `${SITE_URL}${doc?.path || ''}`,
    }),
    ...(useS3
      ? [
          s3Storage({
            collections: {
              media: { disablePayloadAccessControl: true, generateFileURL: ({ filename }) => `${process.env.S3_PUBLIC_URL}/${filename}` },
              audio: { disablePayloadAccessControl: true, generateFileURL: ({ filename }) => `${process.env.S3_PUBLIC_URL}/${filename}` },
            },
            bucket: process.env.S3_BUCKET || '',
            config: {
              endpoint: process.env.S3_ENDPOINT || 'https://s3.twcstorage.ru',
              region: process.env.S3_REGION || 'ru-1',
              forcePathStyle: true,
              credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
                secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
              },
            },
          }),
        ]
      : []),
  ],
})
