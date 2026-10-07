import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { Author, Book, Trope } from '@/payload-types'
import { BookList } from '@/components/BookCard'
import { Faq } from '@/components/Faq'
import { JsonLd } from '@/components/JsonLd'
import { PageHero } from '@/components/PageHero'
import { Wrap } from '@/components/Wrap'
import { getBookBySlug, getSimilarBooks } from '@/lib/data'
import { SITE_URL } from '@/lib/payload'
import { buildMetadata, fitTitle, sentences } from '@/lib/seo'

type Props = { params: Promise<{ slug: string }> }
export const dynamic = 'force-dynamic'
const objs = <T,>(v: unknown) => (Array.isArray(v) ? v.filter((x) => x && typeof x === 'object') : []) as T[]
const MIN_TO_INDEX = 4

/** «Книги, похожие на [название]» — запросы «что почитать после …», «если понравилось …». */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const book = await getBookBySlug((await params).slug)
  if (!book) return {}
  const similar = await getSimilarBooks(book)
  const tropes = objs<Trope>(book.tropes).map((t) => t.title.toLowerCase())
  return buildMetadata(
    { path: `/pohozhie/${book.slug}/` },
    {
      title: fitTitle(`Книги, похожие на «${book.title}»: что почитать после`, `Похожие на «${book.title}»: что почитать после`, `Книги как «${book.title}»`, `Похожие на «${book.title}»`),
      description: sentences(
        `Что почитать после «${book.title}»${similar.length ? `: ${similar.length} книг с тем же настроением` : ''}`,
        tropes.length ? `Подобрали по сюжетам: ${tropes.join(', ')}` : null,
        'Первая глава в аудио бесплатно',
      ),
      kicker: 'Похожие книги',
      path: `/pohozhie/${book.slug}/`,
      indexable: similar.length >= MIN_TO_INDEX,
    },
  )
}

export default async function SimilarPage({ params }: Props) {
  const book = await getBookBySlug((await params).slug)
  if (!book) notFound()
  const similar = await getSimilarBooks(book)
  const tropes = objs<Trope>(book.tropes)
  const authors = objs<Author>(book.authors)
  const url = `${SITE_URL}/pohozhie/${book.slug}/`
  const faq = [
    {
      q: `Что почитать после «${book.title}»?`,
      a: similar.length
        ? `Начните с ${similar.slice(0, 3).map((b) => `«${b.title}»`).join(', ')} — в них похожие сюжеты${tropes.length ? ` (${tropes.map((t) => t.title.toLowerCase()).join(', ')})` : ''}.`
        : 'Подборка пополняется: загляните на страницы сюжетов этой книги.',
    },
    ...(tropes.length ? [{ q: `Какой сюжет у книги «${book.title}»?`, a: `Книга относится к сюжетам: ${tropes.map((t) => t.title).join(', ')}. На страницах сюжетов собраны все книги с тем же тропом.` }] : []),
  ]
  return (
    <article>
      <PageHero
        crumbs={[{ label: 'Похожие книги', href: '/pohozhie/' }, { label: book.title, href: `/pohozhie/${book.slug}/` }]}
        title={`Книги, похожие на «${book.title}»`}
        lead={`Если понравилась книга «${book.title}»${authors.length ? ` (${authors.map((a) => a.name).join(', ')})` : ''} — вот что почитать и послушать после неё: истории с тем же сюжетом и настроением.`}
      >
        <Link href={book.path || '#'} className="self-start rounded-xl bg-white px-[18px] py-3 font-semibold text-wine">О книге «{book.title}»</Link>
      </PageHero>
      <Wrap className="pb-12">
        {tropes.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-3.5 text-xl md:text-2xl">Похожие по сюжету</h2>
            <div className="flex flex-wrap gap-2">
              {tropes.map((t) => (
                <Link key={t.id} href={t.path || '#'} className="rounded-full border border-petal bg-white px-[13px] py-[9px] text-sm">{t.title}</Link>
              ))}
            </div>
          </section>
        )}
        <section className="mt-8">
          <h2 className="mb-3.5 text-xl md:text-2xl">Что почитать после «{book.title}»</h2>
          <BookList books={similar as Book[]} empty="Похожие книги скоро появятся — подборка обновляется вместе с каталогом." />
        </section>
        <Faq items={faq} title={`Вопросы: что почитать после «${book.title}»`} />
      </Wrap>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: `Книги, похожие на «${book.title}»`,
          url,
          inLanguage: 'ru',
          about: { '@type': 'Book', name: book.title, url: `${SITE_URL}${book.path}` },
          ...(similar.length ? { mainEntity: { '@type': 'ItemList', itemListElement: similar.map((b, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE_URL}${b.path}`, name: b.title })) } } : {}),
        }}
      />
    </article>
  )
}
