import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Audio, Author, Book, Narrator, Series, Trope } from '@/payload-types'
import { BookGrid } from '@/components/BookCard'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { JsonLd } from '@/components/JsonLd'
import { getBookBySlug, getBooksFor, getChaptersOf } from '@/lib/data'
import { SITE_URL } from '@/lib/payload'
import { buildMetadata } from '@/lib/seo'

type Props = { params: Promise<{ slug: string }> }
export const dynamic = 'force-dynamic'

const objs = <T,>(v: unknown) => (Array.isArray(v) ? v.filter((x) => x && typeof x === 'object') : []) as T[]

function titleFor(b: Book) {
  const authors = objs<Author>(b.authors).map((a) => a.name).join(', ')
  const narr = objs<Narrator>(b.narrators).map((n) => n.name).join(', ')
  const verb = b.hasAudio ? 'слушать аудиокнигу' : 'читать'
  const tr = b.isTranslation && b.originalTitle ? ` (${b.originalTitle} на русском)` : ''
  return `${b.title}${tr} — ${verb}${authors ? `, ${authors}` : ''}${b.hasAudio && narr ? `, читает ${narr}` : ''} | Литмоб`
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const book = await getBookBySlug(slug)
  if (!book) return {}
  return buildMetadata({ ...book, lead: book.hook }, { fallbackTitle: titleFor(book) })
}

const HEAT: Record<string, string> = { none: 'Без откровенных сцен', moderate: 'Умеренно откровенно', explicit: '18+' }
const STATUS: Record<string, string> = { ongoing: 'Пишется', completed: 'Завершена', frozen: 'Заморожена' }
const HE: Record<string, string> = { yes: 'ХЭ', no: 'Без ХЭ', unknown: '' }

export default async function BookPage({ params }: Props) {
  const { slug } = await params
  const book = await getBookBySlug(slug)
  if (!book) notFound()
  const chapters = await getChaptersOf(book.id)
  const free = book.freeChapters ?? 1
  const first = chapters.find((c: any) => c.audio && typeof c.audio === 'object')
  const firstAudio = first ? (first.audio as Audio) : null
  const tropes = objs<Trope>(book.tropes)
  const authors = objs<Author>(book.authors)
  const narrators = objs<Narrator>(book.narrators)
  const series = book.series?.ref && typeof book.series.ref === 'object' ? (book.series.ref as Series) : null
  const similar = (await getBooksFor('tropes', tropes.map((t) => t.id), false, 7)).docs.filter((b) => b.id !== book.id).slice(0, 6)
  const labels = [book.hasAudio ? `Аудио${book.audioHours ? ` · ${book.audioHours} ч` : ''}` : null, HE[book.happyEnding || 'unknown'], HEAT[book.heat || 'none'], STATUS[book.status || 'ongoing']].filter(Boolean)
  const crumbs = [
    ...(tropes[0]?.path ? [{ label: tropes[0].title, href: tropes[0].path }] : []),
    { label: book.title, href: book.path || `/kniga/${book.slug}/` },
  ]

  return (
    <article className="pt-4">
      <Breadcrumbs items={crumbs} />
      <header className="mt-3 flex flex-col gap-2">
        <h1 className="text-3xl">{book.title}</h1>
        {book.isTranslation && book.originalTitle && <p className="text-sm text-muted">{book.originalTitle} — официальный перевод{book.translator ? `, перевод: ${book.translator}` : ''}</p>}
        <p className="text-muted">
          {authors.map((a, i) => (
            <span key={a.id}>{i > 0 && ', '}<Link href={a.path || '#'}>{a.name}</Link></span>
          ))}
          {narrators.length > 0 && ' · читает '}
          {narrators.map((n, i) => (
            <span key={n.id}>{i > 0 && ', '}<Link href={n.path || '#'}>{n.name}</Link></span>
          ))}
        </p>
        {series && <p className="text-sm">Серия: <Link href={series.path || '#'}>{series.title}</Link>{book.series?.order ? `, книга ${book.series.order}` : ''}</p>}
        <div className="flex flex-wrap gap-2 text-xs font-semibold text-rose">{labels.map((l) => <span key={l} className="rounded-full bg-white px-2 py-1">{l}</span>)}</div>
        {book.hook && <p className="text-lg">{book.hook}</p>}
      </header>

      {firstAudio?.url ? (
        <section className="mt-5 rounded-2xl bg-wine p-4 text-white">
          <h2 className="mb-2 text-xl">Первая глава бесплатно</h2>
          <audio controls preload="none" src={firstAudio.url} className="w-full" />
        </section>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-3">
        <Link href={`/vhod/?next=${encodeURIComponent(book.path || '/')}&follow=book:${book.id}`} className="rounded-xl bg-rose px-4 py-2 font-semibold text-white no-underline">
          Сообщить о проде
        </Link>
        {(book.externalLinks || []).map((l) => (
          <a key={l.id || l.url} href={l.url} rel="nofollow noopener" target="_blank" className="rounded-xl border border-petal bg-white px-4 py-2 no-underline">
            Читать у автора: {l.label}
          </a>
        ))}
      </div>

      {book.warnings?.length ? (
        <p className="mt-4 text-sm text-muted">Предупреждения: {book.warnings.map((w) => w.text).join(' · ')}</p>
      ) : null}

      {book.about && (
        <section className="prose-lm mt-8">
          <h2 className="text-2xl">О чём книга</h2>
          <RichText data={book.about} />
          {tropes.length > 0 && (
            <p className="text-sm">Подойдёт, если нравятся: {tropes.map((t, i) => <span key={t.id}>{i > 0 && ', '}<Link href={t.path || '#'}>{t.title.toLowerCase()}</Link></span>)}</p>
          )}
        </section>
      )}

      {chapters.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-2 text-2xl">Главы</h2>
          <ol className="flex flex-col divide-y divide-line rounded-2xl border border-line bg-white">
            {chapters.map((c: any, i: number) => (
              <li key={c.id} className="flex justify-between px-4 py-2 text-sm">
                <span>{c.order}. {c.title}</span>
                <span className="text-muted">{c.isFree || i < free ? 'бесплатно' : 'по подписке'}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="mt-10">
        <h2 className="mb-3 text-2xl">Похожие книги</h2>
        <BookGrid books={similar} empty="Подбираем похожие книги." />
      </section>

      {book.mode === 'reference' && !book.claimed && (
        <p className="mt-8 text-sm text-muted">
          Это справочная страница. Вы автор? <Link href={`/pravoobladatelyam/?book=${book.id}`}>Подтвердите страницу</Link> — добавим обложку, главы и озвучку.
        </p>
      )}

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': book.hasAudio ? ['Book', 'Audiobook'] : 'Book',
          name: book.title,
          url: `${SITE_URL}${book.path}`,
          author: authors.map((a) => ({ '@type': 'Person', name: a.name })),
          ...(narrators.length ? { readBy: narrators.map((n) => ({ '@type': 'Person', name: n.name })) } : {}),
          inLanguage: 'ru',
          ...(series ? { isPartOf: { '@type': 'BookSeries', name: series.title } } : {}),
        }}
      />
    </article>
  )
}
