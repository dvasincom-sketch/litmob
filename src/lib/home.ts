import { cache } from 'react'
import type { Book, Collection, Genre, Narrator, Trope } from '@/payload-types'
import { getPayloadClient } from './payload'
import { getBookCounts } from './data'

/** Данные главной одним заходом. */
export const getHomeData = cache(async () => {
  const payload = await getPayloadClient()
  const pub = { published: { equals: true } }
  const [audioBooks, newBooks, wave1, collections, narrators, genres, litmobs] = await Promise.all([
    payload.find({ collection: 'books', where: { and: [pub, { hasAudio: { equals: true } }] }, sort: '-publishedAt', limit: 8, depth: 1 }),
    payload.find({ collection: 'books', where: pub, sort: '-publishedAt', limit: 8, depth: 1 }),
    payload.find({ collection: 'tropes', where: { and: [pub, { kind: { equals: 'trope' } }, { adult: { not_equals: true } }, { wave: { equals: '1' } }] }, sort: '-monthlyVolume', limit: 12, depth: 0 }),
    payload.find({ collection: 'collections', where: { and: [pub, { adult: { not_equals: true } }] }, sort: '-monthlyVolume', limit: 6, depth: 0 }),
    payload.find({ collection: 'narrators', where: pub, limit: 4, depth: 1 }),
    payload.find({ collection: 'genres', where: { and: [pub, { parent: { exists: false } }, { adult: { not_equals: true } }] }, sort: '-monthlyVolume', limit: 8, depth: 1 }),
    payload.find({ collection: 'litmobs', where: { status: { in: ['recruiting', 'running', 'voting', 'finished'] } }, limit: 3, depth: 0 }),
  ])
  const counts = await getBookCounts('tropes')
  const genreChildren = await Promise.all(
    genres.docs.map(async (g) => {
      const kids = await payload.find({ collection: 'genres', where: { and: [pub, { parent: { equals: g.id } }] }, limit: 6, depth: 0 })
      return [g.id, kids.docs as Genre[]] as const
    }),
  )
  const featured = (audioBooks.docs[0] || newBooks.docs[0] || null) as Book | null
  const firstChapter = featured
    ? (await payload.find({ collection: 'chapters', where: { and: [pub, { book: { equals: featured.id } }, { audio: { exists: true } }] }, sort: 'order', limit: 1, depth: 1 })).docs[0]
    : null
  const tropeTotal = await payload.count({ collection: 'tropes', where: { and: [pub, { kind: { equals: 'trope' } }] } })
  return {
    firstChapter,
    tropeTotal: tropeTotal.totalDocs,
    listening: (audioBooks.docs.length ? audioBooks.docs : newBooks.docs) as Book[],
    featured,
    tropes: wave1.docs as Trope[],
    counts,
    collections: collections.docs as Collection[],
    narrators: narrators.docs as Narrator[],
    genres: genres.docs as Genre[],
    genreChildren: new Map(genreChildren),
    litmobs: litmobs.docs,
  }
})

export { plural } from './seo'
