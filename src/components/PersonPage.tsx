import { notFound } from 'next/navigation'
import { Wrap } from './Wrap'
import type { Metadata } from 'next'
import type { Book } from '@/payload-types'
import { BookGrid } from './BookCard'
import { Breadcrumbs } from './Breadcrumbs'
import { JsonLd } from './JsonLd'
import { getBooksWhere, getBySlug } from '@/lib/data'
import { SITE_URL } from '@/lib/payload'
import { brand, buildMetadata, plural, sentences } from '@/lib/seo'

type Kind = 'series' | 'authors' | 'narrators'

const books = (n: number) => `${n} ${plural(n, 'книга', 'книги', 'книг')}`

/**
 * Шаблоны из «Структуры сайта»:
 * автор — «[Автор] — все книги и аудиокниги по порядку»; чтец — «[Имя]: аудиокниги в исполнении чтеца»;
 * серия — «[Цикл] по порядку» (запрос «в каком порядке читать»).
 */
const CFG: Record<Kind, {
  key: string
  sort: string
  crumb: { label: string; href: string } | null
  title: (n: string) => string
  h1: (n: string) => string
  h2: (n: string) => string
  desc: (n: string, count: number, about?: string, audio?: number) => string
  kicker: string
}> = {
  series: {
    key: 'series.ref', sort: 'series.order', crumb: { label: 'Серии', href: '/serii/' },
    title: (n) => `${n}: все книги по порядку — читать и слушать`,
    h1: (n) => `${n}: книги по порядку`,
    h2: (n) => `В каком порядке читать «${n}»`,
    desc: (n, c, about, a) => sentences(`${n}: в каком порядке читать и слушать — ${c ? books(c) : 'книги'} цикла по порядку${a ? `, ${a} в аудио` : ''}`, about, 'Первая глава в аудио бесплатно'),
    kicker: 'Серия',
  },
  authors: {
    key: 'authors', sort: 'publishedAt', crumb: null,
    title: (n) => `${n} — все книги и аудиокниги по порядку`,
    h1: (n) => `${n}: все книги по порядку`,
    h2: (n) => `Книги автора ${n}`,
    desc: (n, c, about, a) => sentences(`${n}: все книги по порядку${c ? ` — ${books(c)}` : ''}${a ? `, ${a} в аудио` : ''}. Циклы, новинки и завершённые`, about, 'Слушайте первую главу бесплатно'),
    kicker: 'Автор',
  },
  narrators: {
    key: 'narrators', sort: '-publishedAt', crumb: { label: 'Чтецы', href: '/chtecy/' },
    title: (n) => `${n}: аудиокниги в исполнении чтеца — слушать онлайн`,
    h1: (n) => `${n}: аудиокниги в исполнении чтеца`,
    h2: (n) => `Аудиокниги, которые читает ${n}`,
    desc: (n, c, about) => sentences(`Аудиокниги, которые читает ${n}${c ? `: ${books(c)}` : ''}`, about, 'Послушайте голос и первую главу бесплатно'),
    kicker: 'Чтец',
  },
}

const audioCount = (list: Book[]) => list.filter((b) => b.hasAudio).length

export async function personMetadata(kind: Kind, slug: string): Promise<Metadata> {
  const doc: any = await getBySlug(kind, slug)
  if (!doc) return {}
  const name = doc.title || doc.name
  const list = await getBooksWhere(CFG[kind].key, doc.id, CFG[kind].sort)
  const about = doc.lead || doc.about || doc.voice
  return buildMetadata({ ...doc, lead: about }, {
    title: brand(CFG[kind].title(name)),
    description: CFG[kind].desc(name, list.length, about, audioCount(list)),
    kicker: CFG[kind].kicker,
    type: kind === 'series' ? 'website' : 'profile',
  })
}

export async function PersonPage({ kind, slug }: { kind: Kind; slug: string }) {
  const doc: any = await getBySlug(kind, slug)
  if (!doc) notFound()
  const name = doc.title || doc.name
  const list = await getBooksWhere(CFG[kind].key, doc.id, CFG[kind].sort)
  const crumbs = [...(CFG[kind].crumb ? [CFG[kind].crumb!] : []), { label: name, href: doc.path }]
  const url = `${SITE_URL}${doc.path}`
  const items = list.slice(0, 30).map((b, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE_URL}${b.path}`, name: b.title }))
  return (
    <Wrap className="flex flex-col gap-4  py-6 md:py-10">
      <Breadcrumbs items={crumbs} />
      <h1 className="text-3xl">{CFG[kind].h1(name)}</h1>
      {(doc.lead || doc.about) && <p className="max-w-2xl text-muted">{doc.lead || doc.about}</p>}
      {doc.voice && <p className="text-sm">Голос: {doc.voice}</p>}
      {Array.isArray(doc.links) && doc.links.length > 0 && (
        <p className="text-sm">Страницы автора: {doc.links.map((l: any, i: number) => <span key={l.url}>{i > 0 && ', '}<a href={l.url} rel="nofollow noopener" target="_blank">{l.label}</a></span>)}</p>
      )}
      {list.length > 0 && <h2 className="mt-2 text-xl md:text-2xl">{CFG[kind].h2(name)}</h2>}
      <BookGrid books={list} ranked={kind !== 'narrators'} />
      <JsonLd
        data={
          kind === 'series'
            ? { '@context': 'https://schema.org', '@type': 'BookSeries', name, url, inLanguage: 'ru', hasPart: list.map((b) => ({ '@type': 'Book', name: b.title, url: `${SITE_URL}${b.path}` })) }
            : {
                '@context': 'https://schema.org',
                '@type': 'ProfilePage',
                url,
                mainEntity: {
                  '@type': 'Person',
                  name,
                  url,
                  ...(doc.about || doc.lead ? { description: doc.about || doc.lead } : {}),
                  ...(kind === 'narrators' ? { jobTitle: 'Чтец аудиокниг' } : { jobTitle: 'Писатель' }),
                  ...(Array.isArray(doc.links) && doc.links.length ? { sameAs: doc.links.map((l: any) => l.url) } : {}),
                },
                ...(items.length ? { hasPart: { '@type': 'ItemList', itemListElement: items } } : {}),
              }
        }
      />
    </Wrap>
  )
}
