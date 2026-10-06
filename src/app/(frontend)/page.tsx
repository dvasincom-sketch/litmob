import Link from 'next/link'
import { TropeTile } from '@/components/TropeTile'
import type { Audio } from '@/payload-types'
import { BookTile, names } from '@/components/BookCard'
import { Cover } from '@/components/Cover'
import { PlayButton, type Track } from '@/components/Player'
import { SectionHead, Wrap } from '@/components/Wrap'
import type { Metadata } from 'next'
import { JsonLd } from '@/components/JsonLd'
import { getHomeData, plural } from '@/lib/home'
import { SITE_URL } from '@/lib/payload'
import { staticMetadata } from '@/lib/seo'

export const metadata: Metadata = staticMetadata(
  '/',
  'Любовное фэнтези: книги и аудиокниги по сюжетам | Литмоб',
  'Развод с драконом, истинная пара, попаданка, бытовое фэнтези и академии магии: книги и аудиокниги по сюжетам. Первая глава бесплатно, профессиональные чтецы, литмобы.',
  { kicker: 'Литмоб' },
)

/**
 * Главная (вариант А). Порядок по важности для читательницы: что послушать
 * сейчас → выбрать сюжет → литмобы (наше отличие) → подборки → голоса.
 * Жанры перенесены в подвал, блоки для авторов и чтецов — в одну полосу.
 */
export default async function Home() {
  const d = await getHomeData()
  const chips = d.tropes.slice(0, 8)
  const audio = d.firstChapter?.audio && typeof d.firstChapter.audio === 'object' ? (d.firstChapter.audio as Audio) : null
  const featuredTrack: Track | null =
    d.featured && audio?.url ? { src: audio.url, title: d.featured.title, subtitle: d.firstChapter?.title || 'Глава 1', href: d.featured.path || '#', key: `ch-${d.firstChapter!.id}` } : null
  const byline = d.featured ? `${names(d.featured.authors)}${names(d.featured.narrators) ? ` · читает ${names(d.featured.narrators)}` : ''}` : ''

  return (
    <>
      <section className="on-dark bg-wine text-white">
        <Wrap className="grid gap-8 pb-7 pt-5 lg:grid-cols-[minmax(0,1fr)_360px] md:items-end md:pb-14 md:pt-12">
          <div className="flex min-w-0 flex-col gap-[18px]">
            <h1 className="font-sans text-[12px] font-normal uppercase tracking-[0.12em] text-pink md:text-[13px]">Любовное фэнтези и ромфант: книги и аудиокниги по сюжетам</h1>
            <p className="font-display text-[30px] leading-[1.15] md:text-[clamp(34px,4.2vw,54px)]">Истории о любви и драконах, которые хочется слушать</p>
            <p className="text-blush md:text-lg">Первая глава бесплатно. Профессиональные чтецы.</p>
            <form action="/poisk/" role="search" className="hidden max-w-[640px] gap-2.5 md:flex">
              <label htmlFor="q" className="sr-only">Поиск</label>
              <input id="q" name="q" type="search" placeholder="Книга, автор, сюжет или чтец" className="h-[52px] min-w-0 flex-1 rounded-xl border-0 bg-white px-[18px] text-base text-ink" />
              <button type="submit" className="h-[52px] rounded-xl bg-rose px-6 font-semibold text-white">Найти</button>
            </form>
            <div className="scroll-row fade-right -mx-4 px-4 pb-0.5 md:mx-0 md:flex-wrap md:px-0 md:[mask-image:none]">
              {chips.map((t) => (
                <Link key={t.id} href={t.path || '#'} className="flex-none whitespace-nowrap rounded-full bg-wine-2 px-3.5 py-2.5 text-sm text-white">
                  {t.title}
                </Link>
              ))}
            </div>
          </div>
          {d.featured && (
            <aside aria-label="Первая глава бесплатно" className="hidden flex-col gap-4 rounded-[18px] bg-wine-2 p-5 lg:flex">
              <Link href={d.featured.path || '#'} className="flex items-center gap-3.5">
                <Cover book={d.featured} w={76} h={114} label={false} />
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="text-xs text-pink">Первая глава бесплатно</span>
                  <span className="text-[17px] font-semibold">{d.featured.title}</span>
                  <span className="text-sm text-blush">{byline}</span>
                </span>
              </Link>
              <div className="flex items-center gap-3 text-sm text-blush">
                {featuredTrack ? <PlayButton track={featuredTrack} size={52} /> : null}
                {featuredTrack ? 'Слушать бесплатно, дальше — по подписке' : <Link href={d.featured.path || '#'} className="font-semibold text-pink">Открыть книгу →</Link>}
              </div>
            </aside>
          )}
        </Wrap>
      </section>

      {d.featured && (
        <Wrap className="pt-5 lg:hidden">
          <div className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-[var(--shadow-card)]">
            <Link href={d.featured.path || '#'} className="flex min-w-0 flex-1 items-center gap-3">
              <Cover book={d.featured} w={56} h={84} label={false} />
              <span className="flex min-w-0 flex-col gap-1">
                <span className="text-xs font-semibold text-rose">Первая глава бесплатно</span>
                <span className="font-semibold leading-snug">{d.featured.title}</span>
                <span className="text-xs text-muted">{byline}</span>
              </span>
            </Link>
            {featuredTrack && <PlayButton track={featuredTrack} size={48} />}
          </div>
        </Wrap>
      )}

      {d.listening.length > 0 && (
        <section className="pt-7 md:pt-14">
          <Wrap>
            <SectionHead title="Слушают сейчас: популярные аудиокниги" href="/podborki/audio-romfant-mesyaca/" />
          </Wrap>
          <div className="scroll-row px-4 pb-1 md:mx-auto md:max-w-[1240px] md:px-6">
            {d.listening.map((b) => (
              <BookTile key={b.id} book={b} width={150} />
            ))}
          </div>
        </section>
      )}

      <section className="pt-7 md:pt-14">
        <Wrap>
          <SectionHead title="Книги по сюжетам: выберите свой троп" lead="Вы знаете, какую историю хотите, даже если не знаете названия." />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
            {d.tropes.slice(0, 9).map((t, i) => (
              <TropeTile key={t.id} href={t.path || '#'} title={t.title} subtitle={t.subtitle} growth={t.growth} count={d.counts.get(t.id) || { all: 0, audio: 0 }} className={i >= 6 ? 'max-md:hidden' : ''} />
            ))}
          </div>
          <Link href="/tropy/" className="mt-3.5 flex h-12 items-center justify-center rounded-xl border border-petal bg-white font-semibold text-rose md:inline-flex md:px-6">
            Все {d.tropeTotal} {plural(d.tropeTotal, 'сюжет', 'сюжета', 'сюжетов')}
          </Link>
        </Wrap>
      </section>

      <section className="pt-7 md:pt-14">
        <Wrap>
          <div className="on-dark grid gap-5 rounded-[20px] bg-wine p-5 text-white md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:p-8">
            <div className="flex flex-col gap-2.5">
              <span className="text-xs uppercase tracking-[0.12em] text-pink">Только у нас</span>
              <span className="font-display text-2xl md:text-[32px]">Литмобы</span>
              <span className="text-sm text-blush md:text-base">Авторы пишут на один сюжет по общим правилам и в общие сроки. Подпишитесь на литмоб — и получайте проду всех участников.</span>
              <span className="mt-1 flex flex-wrap gap-2.5">
                <Link href="/litmoby/" className="rounded-xl bg-white px-[18px] py-3 font-semibold text-wine">Все литмобы</Link>
                <Link href="/litmoby/sozdat/" className="rounded-xl border border-blush px-[18px] py-3 font-semibold text-white">Создать свой</Link>
              </span>
            </div>
            <div className="flex flex-col gap-2.5">
              {d.litmobs.map((l) => (
                <Link key={l.id} href={l.path || '#'} className="flex flex-col gap-1 rounded-2xl bg-wine-2 p-4">
                  <span className="text-xs font-semibold text-pink">{l.status === 'recruiting' ? 'Набор авторов' : l.status === 'running' ? 'Идёт' : 'Литмоб'}</span>
                  <span className="font-display text-xl">{l.title}</span>
                  {l.pitch && <span className="line-clamp-2 text-sm text-blush">{l.pitch}</span>}
                </Link>
              ))}
            </div>
          </div>
        </Wrap>
      </section>

      {d.collections.length > 0 && (
        <section className="pt-7 md:pt-14">
          <Wrap>
            <SectionHead title="Подборки книг и аудиокниг" href="/podborki/" />
            <div className="grid gap-2.5 md:grid-cols-3 md:gap-3.5">
              {d.collections.map((c, i) => (
                <Link key={c.id} href={c.path || '#'} className={`${i >= 4 ? 'hidden md:flex' : 'flex'} items-center gap-4 rounded-[14px] border border-line bg-white p-4`}>
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="font-semibold">{c.title}</span>
                    {c.subtitle && <span className="text-[13px] text-muted">{c.subtitle}</span>}
                  </span>
                  <span aria-hidden className="text-xl text-rose">→</span>
                </Link>
              ))}
            </div>
          </Wrap>
        </section>
      )}

      {d.narrators.length > 0 && (
        <section className="pt-7 md:pt-14">
          <Wrap>
            <SectionHead title="Чтецы аудиокниг: голоса, которые любят" href="/chtecy/" lead="Послушайте голос — и выберите книгу в его исполнении." />
            <div className="grid gap-2.5 md:grid-cols-4 md:gap-3.5">
              {d.narrators.map((n) => {
                const demo = n.demo && typeof n.demo === 'object' ? (n.demo as Audio) : null
                return (
                  <div key={n.id} className="flex items-center gap-3 rounded-[14px] border border-line bg-white p-3">
                    <Link href={n.path || '#'} className="flex min-w-0 flex-1 items-center gap-3">
                      <span className="flex h-[52px] w-[52px] flex-none items-center justify-center rounded-full bg-petal font-display text-lg text-cover-ink">{n.name.slice(0, 1)}</span>
                      <span className="flex min-w-0 flex-col gap-0.5">
                        <span className="font-semibold">{n.name}</span>
                        {n.voice && <span className="text-xs text-muted">{n.voice}</span>}
                      </span>
                    </Link>
                    {demo?.url && <PlayButton track={{ src: demo.url, title: `Голос: ${n.name}`, subtitle: 'демо', href: n.path || '#', key: `voice-${n.id}` }} size={44} light label={`Послушать голос: ${n.name}`} />}
                  </div>
                )
              })}
            </div>
          </Wrap>
        </section>
      )}

      <section className="pb-10 pt-7 md:pb-16 md:pt-14">
        <Wrap className="grid gap-3 md:grid-cols-3">
          <Link href="/polka/" className="flex flex-col gap-1.5 rounded-[18px] border border-line bg-white p-5">
            <span className="font-display text-xl">Ваша полка</span>
            <span className="text-sm text-muted">Место, где остановились, и новые главы любимых серий.</span>
            <span className="mt-1 font-semibold text-rose">Открыть полку →</span>
          </Link>
          <Link href="/chtecam/" className="flex flex-col gap-1.5 rounded-[18px] bg-blush/50 p-5">
            <span className="font-display text-xl">Вы чтец?</span>
            <span className="text-sm text-ink-2">Озвучивайте книги и зарабатывайте на прослушиваниях.</span>
            <span className="mt-1 font-semibold text-rose">Стать чтецом →</span>
          </Link>
          <Link href="/ozvuchka-knig/" className="flex flex-col gap-1.5 rounded-[18px] bg-blush/50 p-5">
            <span className="font-display text-xl">Вы автор?</span>
            <span className="text-sm text-ink-2">Добавьте книгу — чтецы сами предложат озвучку.</span>
            <span className="mt-1 font-semibold text-rose">Добавить книгу →</span>
          </Link>
        </Wrap>
      </section>
      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Литмоб',
            alternateName: 'Litmob',
            url: `${SITE_URL}/`,
            inLanguage: 'ru',
            potentialAction: { '@type': 'SearchAction', target: `${SITE_URL}/poisk/?q={search_term_string}`, 'query-input': 'required name=search_term_string' },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Литмоб',
            url: `${SITE_URL}/`,
            logo: `${SITE_URL}/apple-icon.png`,
          },
        ]}
      />
    </>
  )
}
