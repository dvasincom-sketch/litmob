import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { Genre, Trope } from '@/payload-types'
import { LandingView } from '@/components/LandingView'
import type { Crumb } from '@/components/Breadcrumbs'
import {
  getBooksFor,
  getChildren,
  getFamilyTropes,
  getGenreByPath,
  getSettings,
  getTropeByPath,
} from './data'
import { joinPath } from './paths'
import { buildMetadata } from './seo'

type Kind = 'tropes' | 'genres'

const asDocs = <T,>(v: unknown): T[] => (Array.isArray(v) ? v.filter((x) => x && typeof x === 'object') : []) as T[]

async function load(kind: Kind, path: string) {
  const doc = kind === 'tropes' ? await getTropeByPath(path) : await getGenreByPath(path)
  if (!doc) return null
  const settings = await getSettings()
  const parent = doc.parent && typeof doc.parent === 'object' ? (doc.parent as Trope | Genre) : null
  const ownChildren = await getChildren(kind, doc.id)
  const siblings = parent ? await getChildren(kind, parent.id) : []
  const isFamily = kind === 'tropes' && (doc as Trope).kind === 'family'
  const tiles = isFamily ? await getFamilyTropes(doc.id) : []
  // Книги: свои + уточнений (на странице сюжета); для семейства — всех его сюжетов.
  const ids = isFamily ? tiles.map((t) => t.id) : [doc.id, ...ownChildren.map((c) => c.id)]
  const field = kind === 'tropes' ? 'tropes' : 'genres'
  const books = await getBooksFor(field, parent && doc.audioOnly ? [parent.id, doc.id] : ids, Boolean(doc.audioOnly))
  const audioChild = [...ownChildren].find((c) => c.audioOnly) || null
  const chips = (parent ? siblings.filter((s) => s.id !== doc.id) : ownChildren).filter((c) => !c.audioOnly)

  const crumbs: Crumb[] = []
  if (kind === 'tropes') {
    if (!doc.adult) crumbs.push({ label: 'Сюжеты', href: '/tropy/' })
    const fam = asDocs<Trope>((doc as Trope).family)[0]
    if (fam?.path) crumbs.push({ label: fam.title, href: fam.path })
  } else crumbs.push({ label: 'Жанры', href: '/zhanr/' })
  if (parent?.path) crumbs.push({ label: parent.title, href: parent.path })
  crumbs.push({ label: doc.title, href: doc.path || path })

  const minBooks = settings.minBooksToIndex ?? 5
  const indexable = isFamily ? tiles.length >= 3 : books.total >= minBooks
  return {
    doc,
    crumbs,
    books: books.docs,
    totalBooks: books.total,
    children: chips,
    tiles,
    related: kind === 'tropes' ? asDocs<Trope>((doc as Trope).related) : asDocs<Trope>((doc as Genre).tropes),
    audioChild,
    adultGateText: settings.adultGateText || undefined,
    indexable,
  }
}

export async function landingMetadata(kind: Kind, segments: string[], prefix: string): Promise<Metadata> {
  const data = await load(kind, joinPath(prefix, ...segments))
  if (!data) return {}
  const d = data.doc
  const tail = d.audioOnly ? 'слушать первую главу бесплатно' : 'читать и слушать'
  return buildMetadata(d, { fallbackTitle: `${d.h1 || d.title} — ${tail} | Литмоб`, indexable: data.indexable })
}

export async function LandingPage({ kind, segments, prefix }: { kind: Kind; segments: string[]; prefix: string }) {
  const data = await load(kind, joinPath(prefix, ...segments))
  if (!data) notFound()
  return <LandingView {...data} />
}
