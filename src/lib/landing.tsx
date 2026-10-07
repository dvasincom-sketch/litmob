import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { Where } from 'payload'
import type { Book, Collection, Genre, Trope } from '@/payload-types'
import { LandingView } from '@/components/LandingView'
import type { Crumb } from '@/components/Breadcrumbs'
import { getChildren, getFamilyTropes, getGenreByPath, getSettings, getTropeByPath } from './data'
import { getPayloadClient } from './payload'
import { joinPath } from './paths'
import { buildMetadata } from './seo'
import { landingSeo } from './landingSeo'

type Kind = 'tropes' | 'genres' | 'collections'
const pub: Where = { published: { equals: true } }
const objs = <T,>(v: unknown): T[] => (Array.isArray(v) ? v.filter((x) => x && typeof x === 'object') : []) as T[]
const ids = (v: unknown) => (Array.isArray(v) ? v.map((x) => (typeof x === 'object' && x ? (x as { id: number }).id : (x as number))) : [])

async function findBooks(where: Where[], audioOnly: boolean, limit = 30) {
  const payload = await getPayloadClient()
  // Справочные карточки каталога (без нашего описания и аудио) в подборки не попадают.
  const quality: Where = { or: [{ hasAudio: { equals: true } }, { hook: { exists: true } }] }
  const base: Where = { and: [pub, quality, ...where] }
  const [list, audio] = await Promise.all([
    payload.find({ collection: 'books', where: audioOnly ? { and: [base, { hasAudio: { equals: true } }] } : base, depth: 1, limit, sort: '-publishedAt' }),
    payload.count({ collection: 'books', where: { and: [base, { hasAudio: { equals: true } }] } }),
  ])
  return { docs: list.docs as Book[], total: list.totalDocs, audio: audio.totalDocs }
}

export async function getCollectionByPath(path: string) {
  const payload = await getPayloadClient()
  const r = await payload.find({ collection: 'collections', where: { and: [pub, { path: { equals: path } }] }, depth: 1, limit: 1 })
  return (r.docs[0] as Collection | undefined) ?? null
}

async function load(kind: Kind, path: string) {
  const settings = await getSettings()
  const minBooks = settings.minBooksToIndex ?? 5
  const adultGateText = settings.adultGateText || undefined

  if (kind === 'collections') {
    const doc = await getCollectionByPath(path)
    if (!doc) return null
    const or: Where[] = []
    if (ids(doc.tropes).length) or.push({ tropes: { in: ids(doc.tropes) } })
    if (ids(doc.genres).length) or.push({ genres: { in: ids(doc.genres) } })
    if (ids(doc.books).length) or.push({ id: { in: ids(doc.books) } })
    const books = await findBooks(or.length ? [{ or }] : [], Boolean(doc.audioOnly))
    return {
      doc, books: books.docs, totalBooks: books.total, audioCount: books.audio,
      seo: landingSeo('collections', { doc, totalBooks: books.total, audioCount: books.audio }),
      crumbs: [{ label: 'Подборки', href: '/podborki/' }, { label: doc.title, href: doc.path || path }],
      related: objs<Trope>(doc.tropes), adultGateText, indexable: books.total >= minBooks,
    }
  }

  const doc = kind === 'tropes' ? await getTropeByPath(path) : await getGenreByPath(path)
  if (!doc) return null
  const parent = doc.parent && typeof doc.parent === 'object' ? (doc.parent as Trope | Genre) : null
  const ownChildren = await getChildren(kind, doc.id)
  const siblings = parent ? await getChildren(kind, parent.id) : []
  const isFamily = kind === 'tropes' && (doc as Trope).kind === 'family'
  const tiles = isFamily ? await getFamilyTropes(doc.id) : []
  const field = kind === 'tropes' ? 'tropes' : 'genres'
  // Жанр показывает и книги своих сюжетов; сюжет — свои и уточнений; уточнение-аудио — книги родителя с озвучкой.
  let scope = isFamily ? tiles.map((t) => t.id) : [doc.id, ...ownChildren.map((c) => c.id)]
  if (parent && doc.audioOnly) scope = [parent.id, ...siblings.map((s) => s.id)]
  const where: Where[] = [{ or: [{ [field]: { in: scope } }, ...(kind === 'genres' && ids((doc as Genre).tropes).length ? [{ tropes: { in: ids((doc as Genre).tropes) } }] : [])] }]
  const books = await findBooks(where, Boolean(doc.audioOnly))
  const audioChild = (ownChildren as (Trope | Genre)[]).find((c) => c.audioOnly) || (parent ? (siblings as (Trope | Genre)[]).find((s) => s.audioOnly && s.id !== doc.id) : null) || null
  const chips = (parent ? siblings.filter((s) => s.id !== doc.id) : ownChildren).filter((c) => !c.audioOnly)

  const crumbs: Crumb[] = []
  if (kind === 'tropes') {
    if (!doc.adult) crumbs.push({ label: 'Сюжеты', href: '/tropy/' })
    const fam = objs<Trope>((doc as Trope).family)[0] || (parent ? objs<Trope>((parent as Trope).family)[0] : undefined)
    if (fam?.path && !isFamily) crumbs.push({ label: fam.title, href: fam.path })
  } else crumbs.push({ label: 'Жанры', href: '/zhanr/' })
  if (parent?.path) crumbs.push({ label: parent.title, href: parent.path })
  crumbs.push({ label: doc.title, href: doc.path || path })

  return {
    doc, crumbs, books: books.docs, totalBooks: books.total, audioCount: books.audio,
    seo: landingSeo(kind, { doc, parent, totalBooks: books.total, audioCount: books.audio, tiles }),
    children: chips as (Trope | Genre)[], tiles,
    related: kind === 'tropes' ? objs<Trope>((doc as Trope).related) : objs<Trope>((doc as Genre).tropes),
    audioChild: doc.audioOnly ? null : audioChild, adultGateText,
    indexable: isFamily ? tiles.length >= 3 : books.total >= minBooks,
  }
}

export async function landingMetadata(kind: Kind, segments: string[], prefix: string): Promise<Metadata> {
  const data = await load(kind, joinPath(prefix, ...segments))
  if (!data) return {}
  return buildMetadata(data.doc, { title: data.seo.title, description: data.seo.description, indexable: data.indexable, kicker: data.seo.kicker })
}

export async function hasLanding(kind: Kind, path: string) {
  if (kind === 'collections') return Boolean(await getCollectionByPath(path))
  return Boolean(kind === 'tropes' ? await getTropeByPath(path) : await getGenreByPath(path))
}

export async function LandingPage({ kind, segments, prefix }: { kind: Kind; segments: string[]; prefix: string }) {
  const data = await load(kind, joinPath(prefix, ...segments))
  if (!data) notFound()
  return <LandingView {...data} />
}
