import Link from 'next/link'
import type { Metadata } from 'next'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Author, Book } from '@/payload-types'
import { Faq } from '@/components/Faq'
import { PageHero } from '@/components/PageHero'
import { Wrap } from '@/components/Wrap'
import { getCollectionByPath } from '@/lib/landing'
import { getPayloadClient } from '@/lib/payload'
import { staticMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = staticMetadata(
  '/pohozhie/',
  'Что почитать после любимой книги: похожие книги по сюжету | Литмоб',
  'Книги, похожие на любимые: подбираем по сюжету и настроению — развод с драконом, истинная пара, попаданки, бытовое фэнтези. Что почитать и послушать после.',
)

/** Хаб «Похожие книги»: «что почитать после», «книги как …» — ссылки на страницы /pohozhie/<книга>/. */
export default async function SimilarHub() {
  const payload = await getPayloadClient()
  const [doc, books] = await Promise.all([
    getCollectionByPath('/pohozhie/'),
    payload.find({ collection: 'books', where: { and: [{ published: { equals: true } }, { hook: { exists: true } }, { tropes: { exists: true } }] }, sort: 'title', limit: 500, depth: 1 }),
  ])
  const list = books.docs as Book[]
  return (
    <article>
      <PageHero crumbs={[{ label: 'Похожие книги', href: '/pohozhie/' }]} title={doc?.h1 && doc.h1 !== doc.title ? doc.h1 : 'Что почитать после любимой книги'} lead={doc?.lead || 'Выберите книгу, которая понравилась, — покажем похожие по сюжету и настроению.'} />
      <Wrap className="pb-12">
        <section className="mt-8">
          <h2 className="mb-3.5 text-xl md:text-2xl">Книги, похожие на…</h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((b) => (
              <Link key={b.id} href={`/pohozhie/${b.slug}/`} className="flex flex-col rounded-xl border border-line bg-white px-3.5 py-2.5">
                <span className="font-semibold leading-snug text-ink">Похожие на «{b.title}»</span>
                <span className="text-xs text-muted">{(b.authors || []).filter((a) => typeof a === 'object').map((a) => (a as Author).name).join(', ')}</span>
              </Link>
            ))}
          </div>
        </section>
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
