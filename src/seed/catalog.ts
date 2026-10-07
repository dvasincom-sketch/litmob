/**
 * Справочный каталог авторов: content/catalog/authors/*.json → авторы, серии и книги.
 * Книги создаются как справочные карточки (mode: reference): без сюжетов и жанров,
 * поэтому не попадают в подборки и страницы сюжетов, а только на страницы автора и серии.
 * Идемпотентно: существующие записи ищутся по slug и не перезаписываются
 * (кроме связей серия ↔ книга и порядка), правки из админки сохраняются.
 *
 * content/catalog/books/*.json — карточки книг с нашим описанием (hook + about), сюжетами и жанрами:
 * они попадают на страницы сюжетов и получают страницу «Книги, похожие на …».
 *   npm run seed:catalog
 */
import 'dotenv/config'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import config from '../payload.config'
import { getPayload } from 'payload'
import { slugify } from '../lib/paths'
import { convertMarkdownToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'

type BookIn = { title: string; year?: number }
type AuthorIn = {
  name: string
  slug: string
  about?: string
  links?: { label: string; url: string }[]
  series?: { title: string; books: BookIn[] }[]
  standalone?: BookIn[]
}

const payload = await getPayload({ config })
const o = { overrideAccess: true, depth: 0 } as const
const DIR = path.join(process.cwd(), 'content/catalog/authors')
const THIS_YEAR = new Date().getFullYear()

async function findBySlug(collection: 'authors' | 'series' | 'books', slug: string) {
  const r = await payload.find({ collection, where: { slug: { equals: slug } }, limit: 1, ...o })
  return r.docs[0] as unknown as { id: number; authors?: (number | { id: number })[] } | undefined
}

/** Свободный slug: сначала по названию, при занятости — с суффиксом автора, затем с номером. */
async function freeSlug(collection: 'series' | 'books', base: string, suffix: string) {
  for (const s of [base, `${base}-${suffix}`, `${base}-${suffix}-2`, `${base}-${suffix}-3`]) if (!(await findBySlug(collection, s))) return s
  return `${base}-${suffix}-${Date.now() % 100000}`
}

let nAuthors = 0
let nSeries = 0
let nBooks = 0
let nSkipped = 0

const files = (await readdir(DIR).catch(() => [] as string[])).filter((f) => f.endsWith('.json')).sort()
for (const f of files) {
  const a = JSON.parse(await readFile(path.join(DIR, f), 'utf8')) as AuthorIn
  let author = await findBySlug('authors', a.slug)
  if (!author) {
    author = (await payload.create({
      collection: 'authors',
      data: { name: a.name, slug: a.slug, about: a.about, links: a.links ?? [], published: true } as never,
      ...o,
    })) as never
    nAuthors++
  }
  const authorId = author!.id

  // Книги автора, которые уже есть (по названию), — чтобы не плодить дубли при повторном запуске.
  const existing = await payload.find({ collection: 'books', where: { authors: { contains: authorId } }, limit: 0, pagination: false, ...o })
  const byTitle = new Map((existing.docs as unknown as { id: number; title: string }[]).map((b) => [b.title.toLowerCase(), b.id]))

  async function ensureBook(b: BookIn, series?: { id: number; order: number }) {
    const known = byTitle.get(b.title.toLowerCase())
    if (known) {
      if (series) await payload.update({ collection: 'books', id: known, data: { series: { ref: series.id, order: series.order } } as never, ...o })
      nSkipped++
      return
    }
    const slug = await freeSlug('books', slugify(b.title), a.slug)
    const created = await payload.create({
      collection: 'books',
      data: {
        title: b.title,
        slug,
        authors: [authorId],
        mode: 'reference',
        status: !b.year || b.year < THIS_YEAR ? 'completed' : 'ongoing',
        ...(series ? { series: { ref: series.id, order: series.order } } : {}),
        ...(b.year ? { publishedAt: new Date(Date.UTC(b.year, 0, 1)).toISOString() } : {}),
        published: true,
      } as never,
      ...o,
    })
    byTitle.set(b.title.toLowerCase(), (created as { id: number }).id)
    nBooks++
  }

  for (const s of a.series ?? []) {
    if (!s.books?.length) continue
    const base = slugify(s.title)
    let ser = await findBySlug('series', base)
    // Серия с тем же названием у другого автора — отдельная запись.
    const sameAuthor = ser ? await payload.count({ collection: 'books', where: { and: [{ 'series.ref': { equals: ser.id } }, { authors: { contains: authorId } }] } }) : null
    if (ser && sameAuthor && sameAuthor.totalDocs === 0) {
      const alt = await findBySlug('series', `${base}-${a.slug}`)
      ser = alt
    }
    if (!ser) {
      const slug = await freeSlug('series', base, a.slug)
      ser = (await payload.create({ collection: 'series', data: { title: s.title, slug, published: true } as never, ...o })) as never
      nSeries++
    }
    for (const [i, b] of s.books.entries()) await ensureBook(b, { id: ser!.id, order: i + 1 })
  }
  for (const b of a.standalone ?? []) await ensureBook(b)
}

// ── Карточки книг с описанием ────────────────────────────────────────────────
type CardIn = {
  title: string
  slug: string
  author: string
  authorSlug: string
  year?: number
  status?: 'completed' | 'ongoing' | 'frozen'
  heat?: 'none' | 'moderate' | 'explicit'
  series?: { title: string; order?: number }
  tropes?: string[]
  genres?: string[]
  hook?: string
  about?: string
  links?: { label: string; url: string }[]
}
const editorConfig = await editorConfigFactory.default({ config: payload.config })
const idBySlug = async (collection: 'tropes' | 'genres', slug: string) => {
  const where = collection === 'tropes' ? { and: [{ slug: { equals: slug } }, { kind: { equals: 'trope' } }] } : { and: [{ slug: { equals: slug } }, { parent: { exists: false } }] }
  const r = await payload.find({ collection, where: where as never, limit: 1, ...o })
  return (r.docs[0] as { id: number } | undefined)?.id
}
let nCards = 0
const BOOKS_DIR = path.join(process.cwd(), 'content/catalog/books')
const cardFiles = (await readdir(BOOKS_DIR).catch(() => [] as string[])).filter((f) => f.endsWith('.json')).sort()
for (const f of cardFiles) {
  const c = JSON.parse(await readFile(path.join(BOOKS_DIR, f), 'utf8')) as CardIn
  if (await findBySlug('books', c.slug)) continue
  let author = await findBySlug('authors', c.authorSlug)
  if (!author) author = (await payload.create({ collection: 'authors', data: { name: c.author, slug: c.authorSlug, links: [], published: true } as never, ...o })) as never
  let series: { id: number } | undefined
  if (c.series?.title) {
    const base = slugify(c.series.title)
    series = (await findBySlug('series', base)) || (await findBySlug('series', `${base}-${c.authorSlug}`))
    if (!series) series = (await payload.create({ collection: 'series', data: { title: c.series.title, slug: await freeSlug('series', base, c.authorSlug), published: true } as never, ...o })) as never
  }
  const tropes = (await Promise.all((c.tropes || []).map((t) => idBySlug('tropes', t)))).filter(Boolean)
  const genres = (await Promise.all((c.genres || []).map((g) => idBySlug('genres', g)))).filter(Boolean)
  await payload.create({
    collection: 'books',
    data: {
      title: c.title,
      slug: c.slug,
      authors: [author!.id],
      mode: 'reference',
      status: c.status || 'ongoing',
      heat: c.heat || 'none',
      tropes,
      genres,
      hook: c.hook,
      ...(c.about ? { about: convertMarkdownToLexical({ editorConfig, markdown: c.about }) } : {}),
      externalLinks: c.links || [],
      ...(series ? { series: { ref: series.id, order: c.series?.order } } : {}),
      ...(c.year ? { publishedAt: new Date(Date.UTC(c.year, 0, 1)).toISOString() } : {}),
      published: true,
    } as never,
    ...o,
  })
  nCards++
}
console.log(`Карточки книг: +${nCards} из ${cardFiles.length}.`)

console.log(`Каталог: авторов +${nAuthors}, серий +${nSeries}, книг +${nBooks}, уже были ${nSkipped}. Файлов: ${files.length}.`)
process.exit(0)
