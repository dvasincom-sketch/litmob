import Link from 'next/link'
import type { Metadata } from 'next'
import { BookList } from '@/components/BookCard'
import { Wrap } from '@/components/Wrap'
import { getPayloadClient } from '@/lib/payload'
import type { Book } from '@/payload-types'

export const metadata: Metadata = { title: 'Поиск | Литмоб', robots: { index: false, follow: true } }

type Props = { searchParams: Promise<{ q?: string }> }

/** Простой поиск по названиям книг, сюжетов, авторов и чтецов. Meilisearch — следующая итерация. */
export default async function Search({ searchParams }: Props) {
  const q = ((await searchParams).q || '').trim().slice(0, 80)
  const payload = await getPayloadClient()
  const pub = { published: { equals: true } }
  const [books, tropes, people] = q
    ? await Promise.all([
        payload.find({ collection: 'books', where: { and: [pub, { or: [{ title: { like: q } }, { originalTitle: { like: q } }] }] }, limit: 20, depth: 1 }),
        payload.find({ collection: 'tropes', where: { and: [pub, { title: { like: q } }, { adult: { not_equals: true } }] }, limit: 12, depth: 0 }),
        payload.find({ collection: 'authors', where: { and: [pub, { name: { like: q } }] }, limit: 8, depth: 0 }),
      ])
    : [null, null, null]
  return (
    <>
      <header className="on-dark bg-wine text-white">
        <Wrap className="flex flex-col gap-3.5 pb-6 pt-5">
          <h1 className="text-[28px]">Поиск</h1>
          <form role="search" className="flex max-w-[680px] gap-2.5">
            <input name="q" defaultValue={q} type="search" placeholder="Книга, автор, сюжет или чтец" className="h-[52px] min-w-0 flex-1 rounded-xl bg-white px-4 text-base text-ink" />
            <button className="h-[52px] rounded-xl bg-rose px-5 font-semibold text-white">Найти</button>
          </form>
        </Wrap>
      </header>
      <Wrap className="flex flex-col gap-6 py-6">
        {tropes && tropes.docs.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tropes.docs.map((t) => (
              <Link key={t.id} href={t.path || '#'} className="rounded-full border border-petal bg-white px-3.5 py-2 text-sm">
                {t.title}
              </Link>
            ))}
          </div>
        )}
        {people && people.docs.length > 0 && (
          <p className="text-sm">
            Авторы:{' '}
            {people.docs.map((a, i) => (
              <span key={a.id}>
                {i > 0 && ', '}
                <Link href={a.path || '#'} className="font-semibold text-rose">
                  {a.name}
                </Link>
              </span>
            ))}
          </p>
        )}
        {books && <BookList books={books.docs as Book[]} empty={`По запросу «${q}» книг пока нет.`} />}
        {!q && <p className="text-muted">Начните с сюжета: <Link href="/tropy/" className="font-semibold text-rose">каталог сюжетов</Link>.</p>}
      </Wrap>
    </>
  )
}
