import type { MetadataRoute } from 'next'
import { getPayloadClient, SITE_URL } from '@/lib/payload'

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
    for (const d of res.docs as any[]) out.push({ url: `${SITE_URL}${d.path}`, lastModified: d.updatedAt, changeFrequency: 'weekly', priority: 0.6 })
  }
  const mobs = await payload.find({ collection: 'litmobs', where: { status: { in: ['recruiting', 'running', 'voting', 'finished'] } }, limit: 0, depth: 0 })
  for (const d of mobs.docs as any[]) out.push({ url: `${SITE_URL}${d.path}`, lastModified: d.updatedAt, changeFrequency: 'daily', priority: 0.7 })
  return out
}
