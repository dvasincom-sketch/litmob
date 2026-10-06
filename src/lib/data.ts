import { cache } from 'react'
import type { Where } from 'payload'
import type { Book, Genre, Trope } from '@/payload-types'
import { getPayloadClient } from './payload'

type Id = number

const idOf = (v: unknown): Id | null =>
  typeof v === 'number' ? v : v && typeof v === 'object' && 'id' in v ? (v as { id: Id }).id : null

export const getSettings = cache(async () => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'site-settings', depth: 0 })
})

export const getTropeByPath = cache(async (path: string) => {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'tropes',
    where: { path: { equals: path }, published: { equals: true } },
    depth: 1,
    limit: 1,
  })
  return (res.docs[0] as Trope | undefined) ?? null
})

export const getGenreByPath = cache(async (path: string) => {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'genres',
    where: { path: { equals: path }, published: { equals: true } },
    depth: 1,
    limit: 1,
  })
  return (res.docs[0] as Genre | undefined) ?? null
})

/** Дочерние уточнения сюжета (или жанра). */
export const getChildren = cache(async (collection: 'tropes' | 'genres', id: Id) => {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection,
    where: { parent: { equals: id }, published: { equals: true } },
    depth: 0,
    limit: 50,
    sort: 'title',
  })
  return res.docs as (Trope | Genre)[]
})

/** Сюжеты семейства. */
export const getFamilyTropes = cache(async (familyId: Id) => {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'tropes',
    where: { family: { contains: familyId }, published: { equals: true } },
    depth: 0,
    limit: 100,
    sort: '-monthlyVolume',
  })
  return res.docs as Trope[]
})

export const getAllFamilies = cache(async () => {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'tropes',
    where: { kind: { equals: 'family' }, published: { equals: true }, adult: { not_equals: true } },
    depth: 0,
    limit: 50,
    sort: 'title',
  })
  return res.docs as Trope[]
})

/**
 * Книги для страницы-лендинга. Для сюжета берём книги самого сюжета и всех его
 * уточнений; для аудиостраницы — только с озвучкой.
 */
export const getBooksFor = cache(
  async (field: 'tropes' | 'genres', ids: Id[], audioOnly = false, limit = 24) => {
    if (!ids.length) return { docs: [] as Book[], total: 0 }
    const payload = await getPayloadClient()
    const where: Where = {
      and: [
        { published: { equals: true } },
        { [field]: { in: ids } },
        ...(audioOnly ? [{ hasAudio: { equals: true } } as Where] : []),
      ],
    }
    const res = await payload.find({ collection: 'books', where, depth: 1, limit, sort: '-publishedAt' })
    return { docs: res.docs as Book[], total: res.totalDocs }
  },
)

export const getBookBySlug = cache(async (slug: string) => {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'books',
    where: { slug: { equals: slug }, published: { equals: true } },
    depth: 2,
    limit: 1,
  })
  return (res.docs[0] as Book | undefined) ?? null
})

export const getChaptersOf = cache(async (bookId: Id) => {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'chapters',
    where: { book: { equals: bookId }, published: { equals: true } },
    depth: 1,
    limit: 500,
    sort: 'order',
  })
  return res.docs
})

export const getBySlug = cache(
  async (collection: 'series' | 'authors' | 'narrators', slug: string) => {
    const payload = await getPayloadClient()
    const res = await payload.find({
      collection,
      where: { slug: { equals: slug }, published: { equals: true } },
      depth: 1,
      limit: 1,
    })
    return res.docs[0] ?? null
  },
)

export const getBooksWhere = cache(async (key: string, id: Id, sort = '-publishedAt') => {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'books',
    where: { and: [{ published: { equals: true } }, { [key]: { in: [id] } }] },
    depth: 1,
    limit: 100,
    sort,
  })
  return res.docs as Book[]
})

export const getLitmobs = cache(async () => {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'litmobs',
    where: { status: { in: ['recruiting', 'running', 'voting', 'finished'] } },
    depth: 1,
    limit: 100,
    sort: '-startAt',
  })
  return res.docs
})

export const getLitmobBySlug = cache(async (slug: string) => {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'litmobs',
    where: { slug: { equals: slug }, status: { in: ['recruiting', 'running', 'voting', 'finished'] } },
    depth: 2,
    limit: 1,
  })
  return res.docs[0] ?? null
})

export const getApprovedEntries = cache(async (litmobId: Id) => {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'litmob-entries',
    where: { litmob: { equals: litmobId }, status: { equals: 'approved' } },
    depth: 2,
    limit: 50,
  })
  return res.docs
})

export { idOf }

export type BookCounts = Map<Id, { all: number; audio: number }>

/** Сколько опубликованных книг (и из них с аудио) у каждого сюжета/жанра — одним запросом. */
export const getBookCounts = cache(async (field: 'tropes' | 'genres'): Promise<BookCounts> => {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'books',
    where: { published: { equals: true } },
    select: { [field]: true, hasAudio: true } as never,
    depth: 0,
    limit: 0,
    pagination: false,
  })
  const out: BookCounts = new Map()
  for (const b of res.docs as unknown as Array<Record<string, unknown> & { hasAudio?: boolean }>) {
    for (const v of (b[field] as unknown[]) || []) {
      const id = idOf(v)
      if (id == null) continue
      const c = out.get(id) || { all: 0, audio: 0 }
      c.all++
      if (b.hasAudio) c.audio++
      out.set(id, c)
    }
  }
  return out
})
