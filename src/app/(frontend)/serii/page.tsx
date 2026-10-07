import Link from 'next/link'
import type { Metadata } from 'next'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { Faq } from '@/components/Faq'
import { PageHero } from '@/components/PageHero'
import { Wrap } from '@/components/Wrap'
import { getCollectionByPath } from '@/lib/landing'
import { getPayloadClient } from '@/lib/payload'
import { plural, staticMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = staticMetadata(
  '/serii/',
  'Серии книг по порядку: в каком порядке читать циклы | Литмоб',
  'В каком порядке читать серии и циклы: ромфант, любовное фэнтези, попаданцы, ЛитРПГ. Все книги цикла по порядку, годы выхода и аудиоверсии.',
)

/** Хаб серий: «в каком порядке читать» — циклы по алфавиту с автором и числом книг. */
export default async function SeriesHub() {
  const payload = await getPayloadClient()
  const [doc, series, books] = await Promise.all([
    getCollectionByPath('/serii/'),
    payload.find({ collection: 'series', where: { published: { equals: true } }, limit: 2000, depth: 0, sort: 'title', select: { title: true, path: true } as never }),
    payload.find({ collection: 'books', where: { and: [{ published: { equals: true } }, { 'series.ref': { exists: true } }] }, limit: 0, pagination: false, depth: 1, select: { series: true, authors: true } as never }),
  ])
  const info = new Map<number, { n: number; authors: Set<string> }>()
  for (const b of books.docs as unknown as { series?: { ref?: number | { id: number } }; authors?: { name?: string }[] }[]) {
    const ref = b.series?.ref
    const id = typeof ref === 'object' && ref ? ref.id : ref
    if (!id) continue
    const x = info.get(id) || { n: 0, authors: new Set<string>() }
    x.n++
    for (const a of b.authors || []) if (a && typeof a === 'object' && a.name) x.authors.add(a.name)
    info.set(id, x)
  }
  const list = (series.docs as unknown as { id: number; title: string; path: string }[]).filter((s) => (info.get(s.id)?.n || 0) >= 2)
  const groups = new Map<string, typeof list>()
  list.sort((a, b) => (/^[«"'(]?[0-9A-Za-z]/.test(a.title) ? 1 : 0) - (/^[«"'(]?[0-9A-Za-z]/.test(b.title) ? 1 : 0))
  for (const s of list) {
    const c = s.title.replace(/^[«"'(]/, '').charAt(0).toUpperCase()
    const k = /[0-9]/.test(c) ? '0–9' : /[A-Z]/.test(c) ? 'A–Z' : c
    groups.set(k, [...(groups.get(k) || []), s])
  }
  return (
    <article>
      <PageHero crumbs={[{ label: 'Серии', href: '/serii/' }]} title={doc?.h1 && doc.h1 !== doc.title ? doc.h1 : 'Серии книг по порядку'} lead={`${doc?.lead || 'В каком порядке читать и слушать циклы.'} В справочнике ${list.length} ${plural(list.length, 'цикл', 'цикла', 'циклов')}.`} />
      <Wrap className="pb-12">
        <nav aria-label="Буквы" className="mt-6 flex flex-wrap gap-1.5">
          {Array.from(groups.keys()).map((k) => (
            <a key={k} href={`#s-${encodeURIComponent(k)}`} className="flex h-9 min-w-9 items-center justify-center rounded-lg border border-line bg-white px-2 text-sm font-semibold">{k}</a>
          ))}
        </nav>
        {Array.from(groups.entries()).map(([k, ss]) => (
          <section key={k} id={`s-${encodeURIComponent(k)}`} className="mt-6 scroll-mt-20">
            <h2 className="mb-2 text-xl md:text-2xl">{k}</h2>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {ss.map((s) => {
                const x = info.get(s.id)!
                return (
                  <Link key={s.id} href={s.path} className="flex flex-col rounded-xl border border-line bg-white px-3.5 py-2.5">
                    <span className="font-semibold leading-snug text-ink">{s.title}</span>
                    <span className="text-xs text-muted">{Array.from(x.authors).join(', ')} · {x.n} {plural(x.n, 'книга', 'книги', 'книг')}</span>
                  </Link>
                )
              })}
            </div>
          </section>
        ))}
        {doc?.body && (
          <section className="prose-lm mt-10">
            <RichText data={doc.body} />
          </section>
        )}
        <Faq items={doc?.faq} />
      </Wrap>
    </article>
  )
}
