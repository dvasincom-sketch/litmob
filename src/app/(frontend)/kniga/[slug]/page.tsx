import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Audio, Media, Author, Book, Narrator, Series, Trope } from '@/payload-types'
import { BookTile } from '@/components/BookCard'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { Cover } from '@/components/Cover'
import { FollowButton, ShelfButton } from '@/components/ActionButtons'
import { PlayIcon } from '@/components/Icons'
import { ChapterPlayer, type Track } from '@/components/Player'
import { JsonLd } from '@/components/JsonLd'
import { Wrap } from '@/components/Wrap'
import { getBookBySlug, getBooksFor, getBooksWhere, getChaptersOf } from '@/lib/data'
import { plural } from '@/lib/home'
import { SITE_URL } from '@/lib/payload'
import { brand, buildMetadata, sentences } from '@/lib/seo'
import { getViewer, getViewerState } from '@/lib/session'

type Props = { params: Promise<{ slug: string }> }
const objs = <T,>(v: unknown) => (Array.isArray(v) ? v.filter((x) => x && typeof x === 'object') : []) as T[]

const HEAT: Record<string, string> = { none: 'Без откровенных сцен', moderate: 'Умеренно откровенно', explicit: '18+' }
const STATUS: Record<string, string> = { ongoing: 'Пишется', completed: 'Завершена', frozen: 'Заморожена' }

/** Title по шаблону из «Структуры»: [Название] — слушать аудиокнигу, [Автор], читает [Чтец]. */
function titleFor(b: Book) {
  const authors = objs<Author>(b.authors).map((a) => a.name).join(', ')
  const narr = objs<Narrator>(b.narrators).map((n) => n.name).join(', ')
  const tr = b.isTranslation && b.originalTitle ? ` (${b.originalTitle} на русском)` : ''
  const action = b.hasAudio ? 'слушать аудиокнигу' : b.status === 'completed' ? 'читать полностью' : 'читать книгу'
  const full = `${b.title}${tr} — ${action}${authors ? `, ${authors}` : ''}${b.hasAudio && narr ? `, читает ${narr}` : ''}`
  return brand(full.length > 70 && narr ? `${b.title}${tr} — ${action}${authors ? `, ${authors}` : ''}` : full)
}

function descriptionFor(b: Book, chapters: number) {
  const authors = objs<Author>(b.authors).map((a) => a.name).join(', ')
  const narr = objs<Narrator>(b.narrators).map((n) => n.name).join(', ')
  const facts = [
    STATUS[b.status || 'ongoing'],
    chapters ? `${chapters} ${plural(chapters, 'глава', 'главы', 'глав')}` : null,
    b.hasAudio && b.audioHours ? `аудиокнига ${b.audioHours} ч` : null,
    b.happyEnding === 'yes' ? 'счастливый конец' : null,
  ].filter(Boolean).join(', ')
  return sentences(
    `«${b.title}»${authors ? ` — ${authors}` : ''}${b.hasAudio && narr ? `, читает ${narr}` : ''}`,
    b.hook,
    facts,
    b.hasAudio ? 'Первая глава бесплатно' : 'Подпишитесь — сообщим о проде и озвучке',
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const book = await getBookBySlug((await params).slug)
  if (!book) return {}
  const chapters = await getChaptersOf(book.id)
  const cover = book.cover && typeof book.cover === 'object' ? (book.cover as { url?: string | null }).url : null
  return buildMetadata({ ...book, lead: book.hook }, {
    title: titleFor(book),
    description: descriptionFor(book, chapters.length),
    kicker: book.hasAudio ? 'Аудиокнига' : 'Книга',
    image: cover || null,
    type: 'book',
  })
}

const H2 = ({ children }: { children: React.ReactNode }) => <h2 className="text-xl md:text-2xl">{children}</h2>

/** Страница книги — по макету Book.dc (шаги ①–⑨). */
export default async function BookPage({ params }: Props) {
  const book = await getBookBySlug((await params).slug)
  if (!book) notFound()
  const chapters = await getChaptersOf(book.id)
  const free = book.freeChapters ?? 1
  const first = chapters.find((c) => c.audio && typeof c.audio === 'object')
  const firstAudio = first ? (first.audio as Audio) : null
  const tropes = objs<Trope>(book.tropes)
  const authors = objs<Author>(book.authors)
  const narrators = objs<Narrator>(book.narrators)
  const series = book.series?.ref && typeof book.series.ref === 'object' ? (book.series.ref as Series) : null
  const seriesBooks = series ? await getBooksWhere('series.ref', series.id, 'series.order') : []
  const similar = (await getBooksFor('tropes', tropes.map((t) => t.id), false, 9)).docs.filter((b) => b.id !== book.id).slice(0, 8)
  const ext = book.externalLinks?.[0]
  const labels = [book.happyEnding === 'yes' ? 'ХЭ' : null, HEAT[book.heat || 'none'], STATUS[book.status || 'ongoing']].filter(Boolean) as string[]
  const crumbs = [...(tropes[0]?.path ? [{ label: tropes[0].title, href: tropes[0].path }] : []), { label: book.title, href: book.path || `/kniga/${book.slug}/` }]
  const shown = chapters.slice(0, 3)
  const rest = chapters.slice(3)
  const viewer = await getViewer()
  const state = await getViewerState(viewer?.id, { book: book.id })
  const returnTo = book.path || `/kniga/${book.slug}/`
  const track: Track | null = firstAudio?.url
    ? { src: firstAudio.url, title: book.title, subtitle: first?.title || 'Глава 1', href: returnTo, key: `ch-${first!.id}`, onProgressUrl: state.shelf ? `/api/shelf/${state.shelf.id}/` : undefined }
    : null
  const listenCard = (dark: boolean) => (
    <section id="listen" className={`flex scroll-mt-20 flex-col gap-3 rounded-2xl p-3.5 md:p-5 ${dark ? 'bg-wine-2 text-white' : 'bg-white shadow-[var(--shadow-card)]'}`}>
      <span className="font-semibold">Глава 1 · бесплатно</span>
      {track ? (
        <ChapterPlayer track={track} dark={dark} />
      ) : (
        <div className="flex items-center gap-3">
          <span className={`flex h-14 w-14 flex-none items-center justify-center rounded-full ${dark ? 'bg-white/15' : 'bg-rose/40'}`}><PlayIcon size={20} color="#FFFFFF" /></span>
          <span className={`text-sm ${dark ? 'text-blush' : 'text-muted'}`}>
            {book.status === 'ongoing' ? 'Озвучка готовится. Подпишитесь — сообщим о первой главе.' : 'Озвучки пока нет. Добавьте книгу на полку — сообщим, когда появится.'}
          </span>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <FollowButton
          target="book"
          id={book.id}
          followId={state.follow}
          loggedIn={Boolean(viewer)}
          returnTo={returnTo}
          label={book.status === 'ongoing' ? 'Сообщить о проде' : 'Сообщить о новой озвучке'}
          doneLabel="Сообщим"
          className={`rounded-xl px-4 py-2.5 text-sm font-semibold ${dark ? 'bg-white text-wine' : 'bg-rose text-white'}`}
        />
        <ShelfButton book={book.id} shelfId={state.shelf?.id ?? null} loggedIn={Boolean(viewer)} returnTo={returnTo} withLabel className={`flex h-11 items-center gap-2 rounded-xl border px-3.5 text-sm font-semibold ${dark ? 'border-white/30 bg-transparent text-white' : 'border-petal bg-white text-rose'}`} />
      </div>
      {ext && (
        <a href={ext.url} target="_blank" rel="nofollow noopener" className={`text-sm font-semibold ${dark ? 'text-pink' : 'text-rose'}`}>
          Читать текст у автора на {ext.label} ↗
        </a>
      )}
    </section>
  )
  const chapterState = (i: number, c: (typeof chapters)[number]) => (c.isFree || i < free ? { t: 'Бесплатно', cls: 'text-free' } : { t: 'По подписке', cls: 'text-muted' })

  return (
    <article className="pb-10 md:pb-12">
      <header className="on-dark bg-wine text-white">
        <Wrap className="flex flex-col gap-4 pb-[22px] pt-3.5 md:pb-10 md:pt-6">
          <Breadcrumbs items={crumbs} light />
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px] md:gap-10">
          <div className="flex items-start gap-3.5 md:gap-8">
            <div className="md:hidden"><Cover book={book} w={128} h={192} shadow /></div>
            <div className="hidden md:block"><Cover book={book} w={200} h={300} shadow /></div>
            <div className="flex min-w-0 flex-col gap-1.5">
              <h1 className="text-2xl md:text-[40px]">{book.title}</h1>
              {book.isTranslation && book.originalTitle && <span className="text-[13px] text-blush">{book.originalTitle} — официальный перевод</span>}
              <span className="font-semibold">
                {authors.map((a, i) => (
                  <span key={a.id}>{i > 0 && ', '}<Link href={a.path || '#'}>{a.name}</Link></span>
                ))}
              </span>
              {narrators.length > 0 && (
                <span className="text-[13px] text-blush">
                  Читает{' '}
                  {narrators.map((n, i) => (
                    <span key={n.id}>{i > 0 && ', '}<Link href={n.path || '#'} className="font-semibold text-pink">{n.name}</Link></span>
                  ))}
                </span>
              )}
              <span className="text-[13px] text-blush">
                {[series && book.series?.order ? `Книга ${book.series.order} из ${seriesBooks.length || book.series.order}` : null, book.audioHours ? `${book.audioHours} ч аудио` : null, chapters.length ? `${chapters.length} ${plural(chapters.length, 'глава', 'главы', 'глав')}` : null].filter(Boolean).join(' · ')}
              </span>
              <span className="text-[13px] text-pink">{labels.join(' · ')}</span>
              {book.hook && <span className="mt-1 hidden max-w-xl text-blush md:block">{book.hook}</span>}
            </div>
          </div>
          <div className="hidden lg:block">{listenCard(true)}</div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {tropes.map((t) => (
              <Link key={t.id} href={t.path || '#'} className="rounded-full bg-wine-2 px-[11px] py-1.5 text-[13px] text-white">{t.title}</Link>
            ))}
          </div>
        </Wrap>
      </header>

      <Wrap className="flex flex-col gap-6 md:pt-10 *:max-w-[820px]">
        <div className="-mt-2 lg:hidden">{listenCard(false)}</div>

        {chapters.length > 0 && (
          <section className="flex flex-col gap-2.5">
            <H2>Главы книги «{book.title}»</H2>
            <div className="flex flex-col rounded-[14px] border border-line bg-white">
              {shown.map((c, i) => {
                const s = chapterState(i, c)
                return (
                  <div key={c.id} className="flex items-center gap-3 border-b border-line-2 px-3.5 py-3 last:border-0">
                    <span className="flex-1 text-sm">{c.title}</span>
                    <span className={`text-xs font-semibold ${s.cls}`}>{s.t}</span>
                  </div>
                )
              })}
              {rest.length > 0 && (
                <details>
                  <summary className="cursor-pointer list-none px-3.5 py-3 text-sm font-semibold text-rose">Ещё {rest.length} {plural(rest.length, 'глава', 'главы', 'глав')} · Показать</summary>
                  {rest.map((c, k) => {
                    const s = chapterState(k + 3, c)
                    return (
                      <div key={c.id} className="flex items-center gap-3 border-t border-line-2 px-3.5 py-3">
                        <span className="flex-1 text-sm">{c.title}</span>
                        <span className={`text-xs font-semibold ${s.cls}`}>{s.t}</span>
                      </div>
                    )
                  })}
                </details>
              )}
            </div>
          </section>
        )}

        <section className="on-dark flex flex-col gap-2.5 rounded-2xl bg-wine p-4 text-white">
          <span className="font-display text-xl">Слушайте всю книгу</span>
          <span className="text-sm text-blush">Подписка открывает все главы этой книги и каталог аудиоверсий. Часть денег получают автор и чтец.</span>
          <Link href="/podpiska/" className="rounded-xl bg-white px-4 py-[13px] text-center font-semibold text-wine">Оформить подписку</Link>
        </section>

        <section className="flex flex-col gap-2.5">
          <H2>О чём книга «{book.title}»</H2>
          {book.about ? <div className="prose-lm"><RichText data={book.about} /></div> : book.hook ? <p className="text-ink-2">{book.hook}</p> : null}
          {tropes.length > 0 && (
            <p className="text-[13px] text-muted">
              Подойдёт, если нравятся:{' '}
              {tropes.map((t, i) => (
                <span key={t.id}>{i > 0 && ', '}<Link href={t.path || '#'} className="underline decoration-petal underline-offset-2">{t.title.toLowerCase()}</Link></span>
              ))}
            </p>
          )}
          {book.warnings?.length ? <p className="text-[13px] text-muted">Предупреждения: {book.warnings.map((w) => w.text).join(' · ')}</p> : null}
        </section>

        {narrators.length > 0 && (
          <section className="flex flex-col gap-2.5">
            <H2>{book.hasAudio ? `Аудиокнига «${book.title}»: кто читает` : 'Озвучка'}</H2>
            {narrators.map((n) => (
              <div key={n.id} className="flex items-center gap-3 rounded-[14px] border border-line bg-white p-3">
                <span className="flex h-14 w-14 flex-none items-center justify-center rounded-full bg-petal font-display text-lg text-cover-ink">{n.name.slice(0, 1)}</span>
                <Link href={n.path || '#'} className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="font-semibold">{n.name}</span>
                  {n.voice && <span className="text-xs text-muted">{n.voice}</span>}
                </Link>
                <FollowButton target="narrator" id={n.id} followId={null} loggedIn={Boolean(viewer)} returnTo={returnTo} label="Подписаться" doneLabel="Подписаны" className="flex h-11 items-center rounded-full border border-rose px-3.5 text-[13px] font-semibold text-rose" />
              </div>
            ))}
          </section>
        )}

        {series && seriesBooks.length > 1 && (
          <section className="flex flex-col gap-2.5">
            <H2>{series ? `${series.title}: книги по порядку` : 'Серия по порядку'}</H2>
            <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3">
              {seriesBooks.map((s) =>
                s.id === book.id ? (
                  <div key={s.id} className="flex flex-col gap-0.5 rounded-xl border-2 border-rose bg-white p-2.5">
                    <span className="text-xs font-semibold text-rose">Книга {s.series?.order} · вы здесь</span>
                    <span className="text-sm font-semibold">{s.title}</span>
                  </div>
                ) : (
                  <Link key={s.id} href={s.path || '#'} className="flex flex-col gap-0.5 rounded-xl border border-line bg-white p-2.5">
                    <span className="text-xs text-muted">Книга {s.series?.order}{s.hasAudio ? '' : ' · аудио скоро'}</span>
                    <span className="text-sm font-semibold">{s.title}</span>
                  </Link>
                ),
              )}
            </div>
          </section>
        )}

        {book.mode === 'reference' && !book.claimed && (
          <p className="text-[13px] text-muted">
            Это справочная страница. Вы автор? <Link href={`/pravoobladatelyam/?book=${book.id}`} className="font-semibold text-rose">Подтвердите страницу</Link> — добавим обложку, главы и озвучку.
          </p>
        )}
      </Wrap>

      {similar.length > 0 && (
        <section className="mt-6 flex flex-col gap-3">
          <Wrap><H2>Похожие книги: если понравилось «{book.title}»</H2></Wrap>
          <div className="scroll-row px-4 pb-1 md:mx-auto md:max-w-[1240px] md:px-6">
            {similar.map((b) => <BookTile key={b.id} book={b} width={120} />)}
          </div>
        </section>
      )}

      <div className="fixed inset-x-0 bottom-0 z-20 flex gap-2.5 border-t border-line bg-white px-4 pb-[max(14px,env(safe-area-inset-bottom))] pt-2.5 md:hidden">
        <a href="#listen" className="flex h-12 flex-1 items-center justify-center rounded-xl bg-rose font-semibold text-white">
          {track ? 'Слушать бесплатно' : book.status === 'ongoing' ? 'Сообщить о проде' : 'Хочу послушать'}
        </a>
        <ShelfButton book={book.id} shelfId={state.shelf?.id ?? null} loggedIn={Boolean(viewer)} returnTo={returnTo} className="flex h-12 w-12 flex-none items-center justify-center rounded-xl border border-petal bg-white" />
      </div>

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': book.hasAudio ? ['Book', 'Audiobook'] : 'Book',
          name: book.title,
          url: `${SITE_URL}${book.path}`,
          ...(book.hook ? { description: book.hook } : {}),
          ...(book.cover && typeof book.cover === 'object' && (book.cover as Media).url ? { image: (book.cover as Media).url } : {}),
          author: authors.map((a) => ({ '@type': 'Person', name: a.name, ...(a.path ? { url: `${SITE_URL}${a.path}` } : {}) })),
          ...(narrators.length ? { readBy: narrators.map((n) => ({ '@type': 'Person', name: n.name, ...(n.path ? { url: `${SITE_URL}${n.path}` } : {}) })) } : {}),
          ...(book.hasAudio ? { bookFormat: 'https://schema.org/AudiobookFormat', ...(book.audioHours ? { duration: `PT${Math.round(book.audioHours * 60)}M` } : {}) } : {}),
          ...(tropes.length ? { genre: tropes.map((t) => t.title), keywords: tropes.map((t) => t.mainQuery || t.title).join(', ') } : {}),
          ...(book.publishedAt ? { datePublished: book.publishedAt.slice(0, 10) } : {}),
          ...(book.isTranslation && book.originalTitle ? { translationOfWork: { '@type': 'Book', name: book.originalTitle } } : {}),
          inLanguage: 'ru',
          ...(series ? { isPartOf: { '@type': 'BookSeries', name: series.title, ...(series.path ? { url: `${SITE_URL}${series.path}` } : {}) }, ...(book.series?.order ? { position: book.series.order } : {}) } : {}),
          ...(book.hasAudio ? { publisher: { '@type': 'Organization', name: 'Литмоб', url: SITE_URL } } : {}),
        }}
      />
    </article>
  )
}
