import type { MetadataRoute } from 'next'
import { getPayloadClient, SITE_URL } from '@/lib/payload'
import { bookIndexable } from '@/lib/seo'

export const dynamic = 'force-dynamic'

/**
 * Карта сайта. Сюжеты и жанры — только опубликованные; «тонкие» страницы
 * (меньше N книг) отдаются с noindex и в карту не попадают — кроме хабов
 * семейств. 18+ в карту не кладём.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayloadClient()
  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
  const min = settings.minBooksToIndex ?? 5
  const out: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/tropy/`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/litmoby/`, changeFrequency: 'daily', priority: 0.8 },
  ]
  const count = async (field: 'tropes' | 'genres', id: number) =>
    (await payload.count({ collection: 'books', where: { published: { equals: true }, [field]: { in: [id] } } })).totalDocs

  for (const collection of ['tropes', 'genres'] as const) {
    const res = await payload.find({ collection, where: { published: { equals: true }, adult: { not_equals: true } }, limit: 0, depth: 0 })
    for (const d of res.docs as any[]) {
      if (d.kind !== 'family' && (await count(collection, d.id)) < min) continue
      out.push({ url: `${SITE_URL}${d.path}`, lastModified: d.updatedAt, changeFrequency: 'weekly', priority: 0.8 })
    }
  }
  for (const collection of ['books', 'series', 'authors', 'narrators'] as const) {
    const res = await payload.find({ collection, where: { published: { equals: true } }, limit: 0, depth: 0 })
    for (const d of res.docs as any[]) {
      if (collection === 'books' && !bookIndexable(d)) continue
      out.push({ url: `${SITE_URL}${d.path}`, lastModified: d.updatedAt, changeFrequency: 'weekly', priority: 0.6 })
      // «Похожие на …» — для книг с нашим описанием и сюжетами.
      if (collection === 'books' && d.hook && d.tropes?.length) out.push({ url: `${SITE_URL}/pohozhie/${d.slug}/`, lastModified: d.updatedAt, changeFrequency: 'weekly', priority: 0.5 })
    }
  }
  // Контентные страницы и каталожные хабы.
  for (const p of ['/zhanr/', '/podborki/', '/chtecy/', '/serii/', '/avtory/', '/litmoby/kalendar/']) out.push({ url: `${SITE_URL}${p}`, changeFrequency: 'weekly', priority: 0.7 })
  const pages = await payload.find({ collection: 'pages', where: { published: { equals: true } }, limit: 0, depth: 0 })
  for (const d of pages.docs as any[]) {
    if (out.some((x) => x.url === `${SITE_URL}${d.path}`)) continue
    out.push({ url: `${SITE_URL}${d.path}`, lastModified: d.updatedAt, changeFrequency: 'monthly', priority: d.path === '/audio/' ? 0.9 : 0.5 })
  }
  const mobs = await payload.find({ collection: 'litmobs', where: { status: { in: ['recruiting', 'running', 'voting', 'finished'] } }, limit: 0, depth: 0 })
  for (const d of mobs.docs as any[]) out.push({ url: `${SITE_URL}${d.path}`, lastModified: d.updatedAt, changeFrequency: 'daily', priority: 0.7 })
  return out
}
