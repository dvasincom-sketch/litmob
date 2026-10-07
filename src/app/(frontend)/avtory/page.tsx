import Link from 'next/link'
import type { Metadata } from 'next'
import { PageHero } from '@/components/PageHero'
import { getPageDoc, PageBody } from '@/components/PageText'
import { Wrap } from '@/components/Wrap'
import { getPayloadClient } from '@/lib/payload'
import { plural, staticMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = staticMetadata(
  '/avtory/',
  'Авторы книг: все книги авторов по порядку | Литмоб',
  'Авторы любовного фэнтези, ромфанта, попаданцев и ЛитРПГ: все книги по порядку, циклы, новинки и аудиоверсии. Справочник с ссылками на страницы авторов.',
)

/** Каталог авторов: «все книги автора», «автор книги». Буквенный указатель + число книг. */
export default async function Authors() {
  const payload = await getPayloadClient()
  const [authors, page] = await Promise.all([
    payload.find({ collection: 'authors', where: { and: [{ published: { equals: true } }, { isDemo: { not_equals: true } }] }, limit: 1000, depth: 0, sort: 'name', select: { name: true, path: true } as never }),
    getPageDoc('/avtory/'),
  ])
  const counts = new Map<number, number>()
  const books = await payload.find({ collection: 'books', where: { published: { equals: true } }, limit: 0, pagination: false, depth: 0, select: { authors: true } as never })
  for (const b of books.docs as unknown as { authors?: (number | { id: number })[] }[])
    for (const a of b.authors || []) {
      const id = typeof a === 'object' ? a.id : a
      counts.set(id, (counts.get(id) || 0) + 1)
    }
  const list = (authors.docs as unknown as { id: number; name: string; path: string }[]).filter((a) => counts.get(a.id))
  const groups = new Map<string, typeof list>()
  for (const a of list) {
    const k = a.name.trim().charAt(0).toUpperCase()
    groups.set(k, [...(groups.get(k) || []), a])
  }
  return (
    <>
      <PageHero crumbs={[{ label: 'Авторы', href: '/avtory/' }]} title="Авторы: все книги по порядку" lead={page?.lead || 'Циклы и книги авторов ромфанта, любовного фэнтези, попаданцев и ЛитРПГ — по порядку, с новинками и аудиоверсиями.'} />
      <Wrap className="pb-12">
        <nav aria-label="Буквы" className="mt-6 flex flex-wrap gap-1.5">
          {Array.from(groups.keys()).map((k) => (
            <a key={k} href={`#l-${k}`} className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-white text-sm font-semibold">{k}</a>
          ))}
        </nav>
        {Array.from(groups.entries()).map(([k, as]) => (
          <section key={k} id={`l-${k}`} className="mt-6 scroll-mt-20">
            <h2 className="mb-2 text-xl md:text-2xl">{k}</h2>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {as.map((a) => (
                <Link key={a.id} href={a.path} className="flex items-baseline justify-between gap-2 rounded-xl border border-line bg-white px-3.5 py-2.5">
                  <span className="font-semibold text-ink">{a.name}</span>
                  <span className="text-xs text-muted">{counts.get(a.id)} {plural(counts.get(a.id) || 0, 'книга', 'книги', 'книг')}</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
        <PageBody page={page} />
      </Wrap>
    </>
  )
}
