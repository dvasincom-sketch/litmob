import { notFound } from 'next/navigation'
import { Wrap } from './Wrap'
import type { Metadata } from 'next'
import { BookGrid } from './BookCard'
import { Breadcrumbs } from './Breadcrumbs'
import { getBooksWhere, getBySlug } from '@/lib/data'
import { buildMetadata } from '@/lib/seo'

type Kind = 'series' | 'authors' | 'narrators'
const CFG: Record<Kind, { key: string; sort: string; crumb: { label: string; href: string } | null; title: (n: string) => string; h1: (n: string) => string }> = {
  series: { key: 'series.ref', sort: 'series.order', crumb: null, title: (n) => `${n}: все книги по порядку — читать и слушать | Литмоб`, h1: (n) => `${n}: книги по порядку` },
  authors: { key: 'authors', sort: 'publishedAt', crumb: null, title: (n) => `${n} — все книги и аудиокниги по порядку | Литмоб`, h1: (n) => `${n}: все книги по порядку` },
  narrators: { key: 'narrators', sort: '-publishedAt', crumb: { label: 'Чтецы', href: '/chtecy/' }, title: (n) => `${n}: аудиокниги в исполнении чтеца | Литмоб`, h1: (n) => `Читает ${n}` },
}

export async function personMetadata(kind: Kind, slug: string): Promise<Metadata> {
  const doc: any = await getBySlug(kind, slug)
  if (!doc) return {}
  const name = doc.title || doc.name
  return buildMetadata({ ...doc, lead: doc.lead || doc.about }, { fallbackTitle: CFG[kind].title(name) })
}

export async function PersonPage({ kind, slug }: { kind: Kind; slug: string }) {
  const doc: any = await getBySlug(kind, slug)
  if (!doc) notFound()
  const name = doc.title || doc.name
  const books = await getBooksWhere(CFG[kind].key, doc.id, CFG[kind].sort)
  const crumbs = [...(CFG[kind].crumb ? [CFG[kind].crumb!] : []), { label: name, href: doc.path }]
  return (
    <Wrap className="flex flex-col gap-4  py-6 lg:py-10">
      <Breadcrumbs items={crumbs} />
      <h1 className="text-3xl">{CFG[kind].h1(name)}</h1>
      {(doc.lead || doc.about) && <p className="max-w-2xl text-muted">{doc.lead || doc.about}</p>}
      {doc.voice && <p className="text-sm">Голос: {doc.voice}</p>}
      {Array.isArray(doc.links) && doc.links.length > 0 && (
        <p className="text-sm">Страницы автора: {doc.links.map((l: any, i: number) => <span key={l.url}>{i > 0 && ', '}<a href={l.url} rel="nofollow noopener" target="_blank">{l.label}</a></span>)}</p>
      )}
      <BookGrid books={books} ranked={kind !== 'narrators'} />
    </Wrap>
  )
}
