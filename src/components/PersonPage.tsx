import { notFound } from 'next/navigation'
import { Wrap } from './Wrap'
import type { Metadata } from 'next'
import type { Book } from '@/payload-types'
import Link from 'next/link'
import type { Series } from '@/payload-types'
import { BookGrid } from './BookCard'
import { Faq } from './Faq'
import { Breadcrumbs } from './Breadcrumbs'
import { JsonLd } from './JsonLd'
import { getBooksWhere, getBySlug } from '@/lib/data'
import { SITE_URL } from '@/lib/payload'
import { buildMetadata, fitTitle, plural, sentences } from '@/lib/seo'

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
    key: 'authors', sort: 'publishedAt', crumb: { label: 'Авторы', href: '/avtory/' },
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
    title: fitTitle(CFG[kind].title(name), kind === 'series' ? `${name}: книги по порядку` : `${name} — книги по порядку`, name),
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
      {kind === 'series' && seriesAuthors(list).length > 0 && (
        <p className="text-sm">Автор: {seriesAuthors(list).map((a, i) => <span key={a.id}>{i > 0 && ', '}<Link href={a.path || '#'} className="font-semibold text-rose">{a.name}</Link></span>)}</p>
      )}
      {(doc.lead || doc.about) && <p className="max-w-2xl text-muted">{doc.lead || doc.about}</p>}
      {doc.voice && <p className="text-sm">Голос: {doc.voice}</p>}
      {Array.isArray(doc.links) && doc.links.length > 0 && (
        <p className="text-sm">Страницы автора: {doc.links.map((l: any, i: number) => <span key={l.url}>{i > 0 && ', '}<a href={l.url} rel="nofollow noopener" target="_blank">{l.label}</a></span>)}</p>
      )}
      {kind === 'narrators' ? (
        <>
          {list.length > 0 && <h2 className="mt-2 text-xl md:text-2xl">{CFG[kind].h2(name)}</h2>}
          <BookGrid books={list} />
        </>
      ) : (
        <Bibliography kind={kind} name={name} books={list} />
      )}
      <Faq items={autoFaq(kind, name, list, doc)} title={kind === 'series' ? `Вопросы о цикле «${name}»` : `Вопросы о книгах: ${name}`} />
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

const yearOf = (b: Book) => (b.publishedAt ? new Date(b.publishedAt).getUTCFullYear() : null)
const seriesOf = (b: Book) => (b.series?.ref && typeof b.series.ref === 'object' ? (b.series.ref as Series) : null)

/** Книги автора по циклам и по порядку; у серии — один упорядоченный список. Аудиокниги — карточками сверху. */
function Bibliography({ kind, name, books }: { kind: Kind; name: string; books: Book[] }) {
  if (!books.length) return null
  const audio = books.filter((b) => b.hasAudio)
  const groups = new Map<number, { s: Series; books: Book[] }>()
  const single: Book[] = []
  for (const b of books) {
    const s = seriesOf(b)
    if (kind === 'authors' && s) {
      const g = groups.get(s.id) || { s, books: [] }
      g.books.push(b)
      groups.set(s.id, g)
    } else single.push(b)
  }
  const ord = (x: Book) => x.series?.order ?? 0
  const cycles = Array.from(groups.values())
    .map((g) => ({ ...g, books: g.books.sort((x, y) => ord(x) - ord(y)) }))
    .sort((x, y) => (yearOf(x.books[0]) ?? 9999) - (yearOf(y.books[0]) ?? 9999))
  const ordered = kind === 'series' ? [...single].sort((x, y) => ord(x) - ord(y)) : single.sort((x, y) => (yearOf(x) ?? 9999) - (yearOf(y) ?? 9999))
  const Item = ({ b, n }: { b: Book; n?: number }) => (
    <li className="flex items-baseline gap-2 border-b border-line-2 py-2 last:border-0">
      {n !== undefined && <span className="w-6 flex-none text-right text-sm text-muted">{n}.</span>}
      <Link href={b.path || '#'} className="font-semibold text-ink hover:text-rose">{b.title}</Link>
      <span className="text-sm text-muted">{[yearOf(b), b.hasAudio ? 'аудио' : null].filter(Boolean).join(' · ')}</span>
    </li>
  )
  return (
    <>
      {audio.length > 0 && (
        <section className="mt-2">
          <h2 className="mb-3 text-xl md:text-2xl">{kind === 'series' ? `Аудиокниги цикла «${name}»` : `Аудиокниги: ${name}`}</h2>
          <BookGrid books={audio} />
        </section>
      )}
      {cycles.map(({ s, books: bs }) => (
        <section key={s.id} className="mt-4">
          <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-xl md:text-2xl">Цикл «{s.title}» — книги по порядку</h2>
            {s.path && <Link href={s.path} className="text-sm font-semibold text-rose">Страница цикла</Link>}
          </div>
          <ol className="rounded-2xl border border-line bg-white px-4">{bs.map((b) => <Item key={b.id} b={b} n={ord(b) || undefined} />)}</ol>
        </section>
      ))}
      {ordered.length > 0 && (
        <section className="mt-4">
          <h2 className="mb-2 text-xl md:text-2xl">{kind === 'series' ? `В каком порядке читать «${name}»` : cycles.length ? 'Отдельные книги' : `Книги автора ${name}`}</h2>
          <ol className="rounded-2xl border border-line bg-white px-4">{ordered.map((b, i) => <Item key={b.id} b={b} n={kind === 'series' ? ord(b) || i + 1 : undefined} />)}</ol>
        </section>
      )}
    </>
  )
}

const plu = (n: number, a: string, b: string, c: string) => `${n} ${plural(n, a, b, c)}`

/** FAQ из данных каталога: порядок чтения, сколько книг, новинки, где читать. */
function autoFaq(kind: Kind, name: string, books: Book[], doc: any): { q: string; a: string }[] {
  if (kind === 'narrators' || !books.length) return []
  const ord = (x: Book) => x.series?.order ?? 0
  if (kind === 'series') {
    const list = [...books].sort((x, y) => ord(x) - ord(y))
    return [
      { q: `В каком порядке читать цикл «${name}»?`, a: list.map((b, i) => `${ord(b) || i + 1}. ${b.title}`).join('; ') + '.' },
      { q: `Сколько книг в цикле «${name}»?`, a: `В нашем справочнике ${plu(list.length, 'книга', 'книги', 'книг')} цикла. Если вышла новая книга, она появится в списке.` },
    ]
  }
  const cycles = new Map<string, number>()
  for (const b of books) {
    const s = seriesOf(b)
    if (s) cycles.set(s.title, (cycles.get(s.title) || 0) + 1)
  }
  const top = Array.from(cycles.entries()).sort((a, b) => b[1] - a[1]).slice(0, 4)
  const now = new Date().getUTCFullYear()
  const fresh = books.filter((b) => (yearOf(b) ?? 0) >= now - 1).slice(0, 5)
  const out: { q: string; a: string }[] = [
    {
      q: `В каком порядке читать книги автора ${name}?`,
      a: top.length
        ? `Циклы читайте по порядку номеров — он указан в списках выше. Главные циклы: ${top.map(([t, n]) => `«${t}» (${plu(n, 'книга', 'книги', 'книг')})`).join(', ')}. Отдельные книги можно читать в любом порядке.`
        : 'Книги автора не связаны в циклы, их можно читать в любом порядке. Список выше отсортирован по году выхода.',
    },
    { q: `Сколько книг у автора ${name}?`, a: `В нашем справочнике ${plu(books.length, 'книга', 'книги', 'книг')}${cycles.size ? `, из них ${plu(cycles.size, 'цикл', 'цикла', 'циклов')}` : ''}. Список пополняется по мере выхода новых книг.` },
  ]
  if (fresh.length) out.push({ q: `Какие новинки у автора ${name}?`, a: `Из последних книг: ${fresh.map((b) => `«${b.title}»`).join(', ')}.` })
  if (Array.isArray(doc.links) && doc.links.length)
    out.push({ q: `Где читать книги автора ${name}?`, a: `Тексты книг автор публикует на площадках: ${doc.links.map((l: any) => l.label).join(', ')}. Ссылки — в начале страницы. Аудиоверсии на Литмобе отмечены пометкой «аудио».` })
  return out
}

function seriesAuthors(books: Book[]) {
  const m = new Map<number, { id: number; name: string; path?: string | null }>()
  for (const b of books) for (const a of b.authors || []) if (a && typeof a === 'object') m.set(a.id, a as never)
  return Array.from(m.values())
}
