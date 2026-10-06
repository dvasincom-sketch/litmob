import Link from 'next/link'
import { trendLabel } from '@/lib/trend'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Book, Collection, Genre, Series, Trope } from '@/payload-types'
import { BookList } from './BookCard'
import { Breadcrumbs, type Crumb } from './Breadcrumbs'
import { Faq } from './Faq'
import { AdultGate } from './AdultGate'
import { Wrap } from './Wrap'
import { plural } from '@/lib/home'

type Doc = Trope | Genre | Collection

export type LandingProps = {
  doc: Doc
  crumbs: Crumb[]
  books: Book[]
  totalBooks: number
  audioCount: number
  children?: (Trope | Genre)[]
  tiles?: Trope[]
  related?: (Trope | Genre)[]
  audioChild?: Trope | Genre | null
  adultGateText?: string
}

const H2 = ({ children }: { children: React.ReactNode }) => <h2 className="mb-3.5 text-xl md:text-2xl">{children}</h2>

/** Страница сюжета / жанра / подборки — по макету Trope.dc (шаги ①–⑦). */
export function LandingView({ doc, crumbs, books, totalBooks, audioCount, children = [], tiles = [], related = [], audioChild, adultGateText }: LandingProps) {
  const h1 = doc.h1 || doc.title
  const audioOnly = 'audioOnly' in doc && doc.audioOnly
  const adult = 'adult' in doc && doc.adult
  const counter = totalBooks
    ? audioOnly
      ? `Собрали ${totalBooks} ${plural(totalBooks, 'аудиокнигу', 'аудиокниги', 'аудиокниг')}.`
      : `Собрали ${totalBooks} ${plural(totalBooks, 'книгу', 'книги', 'книг')}, из них ${audioCount} в аудио.`
    : ''
  const series = Array.from(
    new Map(
      books
        .map((b) => (b.series?.ref && typeof b.series.ref === 'object' ? (b.series.ref as Series) : null))
        .filter(Boolean)
        .map((s) => [s!.id, s!]),
    ).values(),
  )
  const listing = (
    <section className="mt-8">
      <H2>{audioOnly ? 'Аудиокниги' : tiles.length ? 'Лучшие книги семейства' : 'Лучшие книги сюжета'}</H2>
      <BookList books={books} ranked={!audioOnly} />
    </section>
  )

  return (
    <article>
      <header className="on-dark bg-wine text-white">
        <Wrap className="flex flex-col gap-3.5 pb-[22px] pt-3.5 md:pb-10 md:pt-6">
          <Breadcrumbs items={crumbs} light />
          <h1 className="max-w-4xl text-[28px] md:text-[44px]">{h1}</h1>
          {(doc.lead || counter) && (
            <p className="max-w-3xl text-sm text-blush md:text-base">
              {doc.lead} {counter}
            </p>
          )}
          {!audioOnly && audioChild?.path && (
            <Link href={audioChild.path} className="self-start rounded-xl bg-white px-[18px] py-3 font-semibold text-wine">
              Слушать первую главу
            </Link>
          )}
        </Wrap>
      </header>

      <Wrap className="pb-12">
        {children.length > 0 && (
          <section className="mt-8">
            <H2>Уточните сюжет</H2>
            <div className="flex flex-wrap gap-2">
              {children.map((c) => (
                <Link key={c.id} href={c.path || '#'} className="rounded-full border border-petal bg-white px-[13px] py-[9px] text-sm">
                  {c.title}
                </Link>
              ))}
            </div>
          </section>
        )}

        {tiles.length > 0 && (
          <section className="mt-8">
            <H2>Сюжеты</H2>
            <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3">
              {tiles.map((t) => (
                <Link key={t.id} href={t.path || '#'} className="flex flex-col gap-1 rounded-[14px] border border-line bg-white p-3.5">
                  <span className="font-semibold">{t.title}</span>
                  {t.subtitle && <span className="text-xs text-muted">{t.subtitle}</span>}
                  {trendLabel(t.growth) && <span className="self-start rounded-full bg-blush px-2 py-0.5 text-xs font-semibold text-rose">{trendLabel(t.growth)}</span>}
                </Link>
              ))}
            </div>
          </section>
        )}

        {adult ? (
          <div className="mt-6">
            <AdultGate text={adultGateText || 'Вам есть 18 лет?'}>{listing}</AdultGate>
          </div>
        ) : (
          listing
        )}

        {!audioOnly && audioChild?.path && (
          <section id="audio" className="on-dark mt-8 flex flex-col gap-2.5 rounded-2xl bg-wine p-4 text-white md:p-6">
            <span className="font-display text-xl">Слушать: аудиоверсии</span>
            <span className="text-sm text-blush">
              {audioCount ? `${audioCount} ${plural(audioCount, 'аудиокнига', 'аудиокниги', 'аудиокниг')} по сюжету. ` : ''}Первая глава бесплатно, дальше по подписке.
            </span>
            <Link href={audioChild.path} className="self-start rounded-xl bg-white px-4 py-[11px] font-semibold text-wine">
              Все аудиокниги сюжета
            </Link>
          </section>
        )}

        {series.length > 0 && (
          <section className="mt-8">
            <H2>Серии по порядку</H2>
            <div className="grid gap-2.5 md:grid-cols-2">
              {series.map((s) => (
                <Link key={s.id} href={s.path || '#'} className="flex flex-col gap-1 rounded-[14px] border border-line bg-white px-3.5 py-3">
                  <span className="font-semibold">{s.title}</span>
                  <span className="text-[13px] text-muted">Все книги цикла по порядку</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {'body' in doc && doc.body && (
          <section className="prose-lm mt-8">
            <RichText data={doc.body} />
          </section>
        )}

        <Faq items={doc.faq} />

        {related.length > 0 && (
          <section className="mt-8">
            <H2>Похожие сюжеты</H2>
            <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
              {related.map((r) => (
                <Link key={r.id} href={r.path || '#'} className="rounded-xl border border-line bg-white p-3 text-sm font-semibold">
                  {r.title}
                </Link>
              ))}
            </div>
          </section>
        )}
      </Wrap>
    </article>
  )
}
