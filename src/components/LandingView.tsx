import Link from 'next/link'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Book, Genre, Trope } from '@/payload-types'
import { BookGrid } from './BookCard'
import { Breadcrumbs, type Crumb } from './Breadcrumbs'
import { Faq } from './Faq'
import { AdultGate } from './AdultGate'

type Doc = Trope | Genre

export type LandingProps = {
  doc: Doc
  crumbs: Crumb[]
  books: Book[]
  totalBooks: number
  children?: Doc[]
  tiles?: Trope[]
  related?: Trope[]
  audioChild?: Doc | null
  adultGateText?: string
}

const cta = (doc: Doc, audioChild?: Doc | null) =>
  doc.audioOnly ? null : audioChild?.path ? { href: audioChild.path, label: 'Слушать первую главу' } : null

export function LandingView({ doc, crumbs, books, totalBooks, children = [], tiles = [], related = [], audioChild, adultGateText }: LandingProps) {
  const h1 = doc.h1 || doc.title
  const button = cta(doc, audioChild)
  const list = (
    <section className="mt-8">
      <h2 className="mb-3 text-2xl">{doc.audioOnly ? 'Аудиокниги' : 'Лучшие книги'}</h2>
      <BookGrid books={books} ranked={!doc.audioOnly} />
      {totalBooks > books.length && <p className="mt-2 text-sm text-muted">Всего книг: {totalBooks}</p>}
    </section>
  )
  return (
    <article>
      <header className="-mx-4 mb-6 flex flex-col gap-3 bg-wine px-4 pb-6 pt-3 text-white">
        <Breadcrumbs items={crumbs} light />
        <h1 className="text-3xl sm:text-4xl">{h1}</h1>
        {doc.lead && <p className="max-w-2xl text-blush">{doc.lead}</p>}
        {button && (
          <Link href={button.href} className="self-start rounded-xl bg-white px-4 py-3 font-semibold text-wine no-underline">
            {button.label}
          </Link>
        )}
      </header>

      {children.length > 0 && (
        <section>
          <h2 className="mb-2 text-xl">Уточните сюжет</h2>
          <div className="flex flex-wrap gap-2">
            {children.map((c) => (
              <Link key={c.id} href={c.path || '#'} className="rounded-full border border-petal bg-white px-3 py-2 text-sm no-underline">
                {c.title}
              </Link>
            ))}
          </div>
        </section>
      )}

      {tiles.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-3 text-2xl">Сюжеты</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {tiles.map((t) => (
              <Link key={t.id} href={t.path || '#'} className="rounded-2xl border border-line bg-white p-3 font-semibold no-underline hover:border-petal">
                {t.title}
              </Link>
            ))}
          </div>
        </section>
      )}

      {doc.adult ? <div className="mt-8"><AdultGate text={adultGateText || 'Вам есть 18 лет?'}>{list}</AdultGate></div> : list}

      {audioChild && !doc.audioOnly && (
        <section className="mt-8 rounded-2xl bg-wine p-4 text-white">
          <h2 className="text-xl">Слушать: аудиоверсии</h2>
          <p className="mb-3 text-sm text-blush">Первая глава бесплатно, дальше по подписке. Часть денег получают автор и чтец.</p>
          <Link href={audioChild.path || '#'} className="inline-block rounded-xl bg-white px-4 py-2 font-semibold text-wine no-underline">
            Все аудиокниги сюжета
          </Link>
        </section>
      )}

      {doc.body && (
        <section className="prose-lm mt-10">
          <RichText data={doc.body} />
        </section>
      )}

      <Faq items={doc.faq} />

      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-2xl">Похожие сюжеты</h2>
          <div className="grid grid-cols-2 gap-3">
            {related.map((r) => (
              <Link key={r.id} href={r.path || '#'} className="rounded-xl border border-line bg-white p-3 text-sm font-semibold no-underline">
                {r.title}
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  )
}
