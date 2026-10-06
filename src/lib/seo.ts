import type { Metadata } from 'next'
import { SITE_URL } from './payload'

/**
 * SEO-шаблоны Литмоба. Правила из «Структуры сайта»:
 * — у страницы один главный запрос (mainQuery), он стоит в начале title и в H1;
 * — title до ~70 символов: бренд « | Литмоб» добавляем, только если влезает;
 * — description 120–160 символов: запрос, цифры (книги / аудио), выгоды (первая глава бесплатно);
 * — «тонкие» страницы (меньше N книг) — noindex, follow;
 * — ручные meta.title / meta.description из админки (плагин SEO) всегда главнее шаблона.
 */

export const SITE_NAME = 'Литмоб'
const TITLE_MAX = 70
const DESC_MAX = 160

export const cap = (s?: string | null) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '')
export const low = (s?: string | null) => (s ? s.charAt(0).toLowerCase() + s.slice(1) : '')
const norm = (s: string) => s.replace(/\s+/g, ' ').replace(/\s+([.,:;!?])/g, '$1').trim()

/** Бренд в конце, если влезает в лимит. */
export function brand(title: string) {
  const t = norm(title)
  if (t.includes(SITE_NAME)) return t
  const withBrand = `${t} | ${SITE_NAME}`
  return withBrand.length <= TITLE_MAX ? withBrand : t
}

/** Обрезка описания по границе слова. */
export function clip(text: string, max = DESC_MAX) {
  const t = norm(text)
  if (t.length <= max) return t
  const cut = t.slice(0, max - 1)
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[,:;—–-]+$/, '')}…`
}

/** Склеивает предложения, пропуская пустые, и следит за точками. */
export function sentences(...parts: (string | null | undefined | false)[]) {
  return parts
    .filter(Boolean)
    .map((p) => String(p).trim().replace(/[.…]+$/, ''))
    .filter(Boolean)
    .join('. ')
    .concat('.')
}

export const plural = (n: number, one: string, few: string, many: string) => {
  const m10 = n % 10
  const m100 = n % 100
  if (m10 === 1 && m100 !== 11) return one
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few
  return many
}
export const booksPhrase = (n: number, audio?: number) =>
  `${n} ${plural(n, 'книга', 'книги', 'книг')}${audio ? `, из них ${audio} в аудио` : ''}`

/** Динамическая OG-картинка 1200×630 с заголовком страницы. */
export const ogImage = (title: string, kicker?: string) =>
  `/og/?t=${encodeURIComponent(title.replace(/ \| Литмоб$/, '').slice(0, 110))}${kicker ? `&k=${encodeURIComponent(kicker)}` : ''}`

type SeoDoc = {
  title?: string | null
  name?: string | null
  h1?: string | null
  lead?: string | null
  path?: string | null
  meta?: { title?: string | null; description?: string | null; image?: unknown } | null
}

type Opts = {
  /** Готовый title (уже с брендом через brand()). */
  title?: string
  /** @deprecated старое имя для title */
  fallbackTitle?: string
  description?: string
  indexable?: boolean
  /** Подпись над заголовком на OG-картинке. */
  kicker?: string
  image?: string | null
  type?: 'website' | 'article' | 'book' | 'profile'
  path?: string
}

/** Полный набор мета-тегов: title, description, canonical, robots, Open Graph, Twitter. */
export function buildMetadata(doc: SeoDoc, opts: Opts = {}): Metadata {
  const base = doc.h1 || doc.title || doc.name || ''
  const title = norm(doc.meta?.title || opts.title || opts.fallbackTitle || brand(base))
  const description = clip(doc.meta?.description || opts.description || doc.lead || '') || undefined
  const path = opts.path || doc.path || '/'
  const url = `${SITE_URL}${path}`
  const metaImage = doc.meta?.image && typeof doc.meta.image === 'object' ? (doc.meta.image as { url?: string }).url : null
  const image = metaImage || opts.image || ogImage(title, opts.kicker)
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: 'ru_RU',
      type: opts.type === 'book' || opts.type === 'profile' ? opts.type : opts.type === 'article' ? 'article' : 'website',
      images: [{ url: image, width: 1200, height: 630, alt: base || title }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
    robots:
      opts.indexable === false
        ? { index: false, follow: true }
        : { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
  }
}

/** Метаданные для служебных и каталожных страниц без документа в CMS. */
export function staticMetadata(path: string, title: string, description: string, opts: Omit<Opts, 'title' | 'description' | 'path'> = {}): Metadata {
  return buildMetadata({ path }, { ...opts, title, description, path })
}
