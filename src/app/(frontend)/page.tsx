import Link from 'next/link'
import type { Genre, Trope } from '@/payload-types'
import { BookTile, names } from '@/components/BookCard'
import { Cover } from '@/components/Cover'
import { PlayIcon } from '@/components/Icons'
import { SectionHead, Wrap } from '@/components/Wrap'
import { getHomeData, plural } from '@/lib/home'

const trend = (t: Trope) => (t.growth === 'новый' ? 'Новый сюжет 2025–2026' : t.growth ? `Интерес ${t.growth} за год` : '')

export default async function Home() {
  const d = await getHomeData()
  const chips = d.tropes.slice(0, 8)
  return (
    <>
      {/* Первый экран: макет MobileWarm + раскладка Main на десктопе */}
      <section className="on-dark bg-wine text-white">
        <Wrap className="grid gap-8 pb-7 pt-5 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-end lg:pb-14 lg:pt-14">
          <div className="flex min-w-0 flex-col gap-[18px]">
            <p className="hidden text-[13px] uppercase tracking-[0.12em] text-pink lg:block">Ромфант, попаданки, бытовое фэнтези</p>
            <h1 className="text-[30px] lg:text-[clamp(34px,4.2vw,54px)]">Истории о любви и драконах, которые хочется слушать</h1>
            <p className="text-blush lg:text-lg">Первая глава бесплатно. Профессиональные чтецы.</p>
            <form action="/poisk/" role="search" className="hidden max-w-[680px] gap-2.5 lg:flex">
              <label htmlFor="q" className="sr-only">
                Поиск
              </label>
              <input id="q" name="q" type="search" placeholder="Книга, автор, сюжет или чтец" className="h-[52px] min-w-0 flex-1 rounded-xl border-0 bg-white px-[18px] text-base text-ink" />
              <button type="submit" className="h-[52px] rounded-xl bg-rose px-6 font-semibold text-white">
                Найти
              </button>
            </form>
            <div className="scroll-row -mx-4 px-4 pb-0.5 lg:mx-0 lg:flex-wrap lg:px-0">
              {chips.map((t) => (
                <Link key={t.id} href={t.path || '#'} className="flex-none whitespace-nowrap rounded-full bg-wine-2 px-3.5 py-2.5 text-sm text-white">
                  {t.title}
                </Link>
              ))}
            </div>
          </div>
          {d.featured && (
            <aside aria-label="Первая глава бесплатно" className="hidden flex-col gap-4 rounded-[18px] bg-wine-2 p-5 lg:flex">
              <div className="flex items-center gap-3.5">
                <Cover book={d.featured} w={76} h={114} label={false} />
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="text-xs text-pink">Первая глава бесплатно</span>
                  <span className="text-[17px] font-semibold">{d.featured.title}</span>
                  <span className="text-sm text-blush">
                    {names(d.featured.authors)}
                    {names(d.featured.narrators) ? ` · читает ${names(d.featured.narrators)}` : ''}
                  </span>
                </div>
              </div>
              <Link href={d.featured.path || '#'} className="flex items-center gap-3 text-sm text-blush">
                <span className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-white">
                  <PlayIcon size={20} color="#3A1424" />
                </span>
                Слушать бесплатно, дальше — по подписке
              </Link>
            </aside>
          )}
        </Wrap>
      </section>

      {/* Карточка «первая глава» на мобильном — на месте «Продолжить» из макета */}
      {d.featured && (
        <Wrap className="pt-5 lg:hidden">
          <Link href={d.featured.path || '#'} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-[var(--shadow-card)]">
            <Cover book={d.featured} w={56} h={84} label={false} />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="text-xs text-muted">Первая глава бесплатно</span>
              <span className="font-semibold">{d.featured.title}</span>
              <div className="h-1 rounded bg-track" />
            </div>
            <span aria-hidden className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-rose">
              <PlayIcon color="#FFFFFF" />
            </span>
          </Link>
        </Wrap>
      )}

      {d.listening.length > 0 && (
        <section className="pt-7 lg:pt-14">
          <Wrap>
            <SectionHead title="Слушают сейчас" href="/podborki/audio-romfant-mesyaca/" />
          </Wrap>
          <div className="scroll-row px-4 pb-1 lg:mx-auto lg:max-w-[1240px] lg:px-6">
            {d.listening.map((b) => (
              <BookTile key={b.id} book={b} width={150} />
            ))}
          </div>
        </section>
      )}

      <section className="pt-7 lg:pt-14">
        <Wrap>
          <SectionHead
            title="Выберите по сюжету"
            href="/tropy/"
            lead="Вы знаете, какую историю хотите, даже если не знаете названия. Каждый сюжет — подборка с аудио, новинками и сериями по порядку."
          />
          <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-3 lg:gap-3.5">
            {d.tropes.slice(0, 9).map((t) => {
              const c = d.counts.get(t.id) || { all: 0, audio: 0 }
              return (
                <Link key={t.id} href={t.path || '#'} className="flex min-h-24 flex-col gap-1.5 rounded-[14px] border border-line bg-white p-3.5 lg:p-[18px]">
                  <span className="text-[15px] font-semibold leading-tight text-ink lg:text-lg">{t.title}</span>
                  {t.subtitle && <span className="hidden text-sm text-muted lg:block">{t.subtitle}</span>}
                  <span className="text-xs text-muted">
                    {c.all ? `${c.all} ${plural(c.all, 'книга', 'книги', 'книг')} · ${c.audio} в аудио` : 'Скоро книги'}
                  </span>
                  {trend(t) && <span className="text-xs font-semibold text-rose">{trend(t)}</span>}
                </Link>
              )
            })}
          </div>
        </Wrap>
      </section>

      {d.collections.length > 0 && (
        <section className="pt-7 lg:pt-14">
          <Wrap>
            <SectionHead title="Подборки, которые ищут" href="/podborki/" />
            <div className="grid gap-2.5 lg:grid-cols-3 lg:gap-3.5">
              {d.collections.map((c) => (
                <Link key={c.id} href={c.path || '#'} className="flex items-center gap-4 rounded-[14px] border border-line bg-white p-4">
                  <span className="flex flex-none" aria-hidden>
                    <span className="h-[62px] w-11 rounded-md bg-petal" />
                    <span className="-ml-[18px] h-[62px] w-11 rounded-md bg-rose" />
                    <span className="-ml-[18px] h-[62px] w-11 rounded-md bg-wine" />
                  </span>
                  <span className="flex min-w-0 flex-col gap-1">
                    <span className="font-semibold">{c.title}</span>
                    {c.subtitle && <span className="text-[13px] text-muted">{c.subtitle}</span>}
                  </span>
                </Link>
              ))}
            </div>
          </Wrap>
        </section>
      )}

      {d.narrators.length > 0 && (
        <section className="pt-7 lg:pt-14">
          <Wrap>
            <SectionHead title="Голоса, которые любят" href="/chtecy/" lead="Послушайте 30 секунд и подпишитесь на голос, чтобы не пропустить новые озвучки." />
            <div className="grid gap-2.5 lg:grid-cols-4 lg:gap-3.5">
              {d.narrators.map((n) => (
                <Link key={n.id} href={n.path || '#'} className="flex items-center gap-3 rounded-[14px] border border-line bg-white p-3">
                  <span className="flex h-[52px] w-[52px] flex-none items-center justify-center rounded-full bg-petal font-display text-lg text-cover-ink">{n.name.slice(0, 1)}</span>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="font-semibold">{n.name}</span>
                    {n.voice && <span className="text-xs text-muted">{n.voice}</span>}
                  </span>
                  <span aria-hidden className="flex h-11 w-11 flex-none items-center justify-center rounded-full border border-rose bg-white">
                    <PlayIcon size={16} color="#9C2B4E" />
                  </span>
                </Link>
              ))}
            </div>
          </Wrap>
        </section>
      )}

      {d.genres.length > 0 && (
        <section className="pt-7 lg:pt-14">
          <Wrap>
            <SectionHead title="Жанры" href="/zhanr/" />
            <div className="grid grid-cols-2 gap-x-6 gap-y-6 lg:grid-cols-4">
              {d.genres.map((g) => {
                const links = [...(d.genreChildren.get(g.id) || []), ...((g.tropes || []).filter((t) => typeof t === 'object') as Trope[])].slice(0, 5) as (Genre | Trope)[]
                return (
                  <div key={g.id} className="flex flex-col gap-2">
                    <Link href={g.path || '#'} className="text-[17px] font-bold">
                      {g.title}
                    </Link>
                    {links.map((l) => (
                      <Link key={`${l.id}-${l.path}`} href={l.path || '#'} className="text-[15px] text-muted">
                        {l.title}
                      </Link>
                    ))}
                  </div>
                )
              })}
            </div>
          </Wrap>
        </section>
      )}

      <section className="pt-7 lg:pt-14">
        <Wrap className="grid gap-3.5 lg:grid-cols-2">
          <div className="on-dark flex flex-col gap-2.5 rounded-2xl bg-wine p-[18px] text-white lg:p-7">
            <span className="font-display text-xl lg:text-2xl">Литмобы</span>
            <span className="text-sm text-blush">Авторы пишут на один сюжет по общим правилам. Подпишитесь — и получайте проду всех участников.</span>
            {d.litmobs.map((l) => (
              <Link key={l.id} href={l.path || '#'} className="text-sm font-semibold text-pink">
                «{l.title}» →
              </Link>
            ))}
            <Link href="/litmoby/" className="self-start rounded-xl bg-white px-[18px] py-3 font-semibold text-wine">
              Все литмобы
            </Link>
          </div>
          <div className="flex flex-col gap-2.5 rounded-2xl border border-line bg-white p-[18px] lg:p-7">
            <span className="font-display text-xl lg:text-2xl">Ваша полка</span>
            <span className="text-sm text-muted">Отмечайте прослушанное и получайте новые главы любимых серий.</span>
            <Link href="/vhod/" className="self-start rounded-xl bg-rose px-[18px] py-3 font-semibold text-white">
              Создать полку
            </Link>
          </div>
        </Wrap>
      </section>

      <section className="pb-10 pt-7 lg:pb-16 lg:pt-14">
        <Wrap className="grid gap-3.5 lg:grid-cols-2">
          <Link href="/chtecam/" className="flex flex-col gap-2.5 rounded-[18px] bg-blush/50 p-6">
            <span className="text-lg font-bold">Вы чтец?</span>
            <span className="text-ink-2">Озвучивайте книги, которые вам нравятся, договаривайтесь с авторами прямо на площадке и зарабатывайте на прослушиваниях.</span>
            <span className="font-semibold text-rose">Стать чтецом →</span>
          </Link>
          <Link href="/ozvuchka-knig/" className="flex flex-col gap-2.5 rounded-[18px] bg-blush/50 p-6">
            <span className="text-lg font-bold">Вы автор?</span>
            <span className="text-ink-2">Добавьте книгу в каталог со ссылкой на вашу страницу, а чтецы сами предложат озвучку. Или соберите свой литмоб.</span>
            <span className="font-semibold text-rose">Добавить книгу →</span>
          </Link>
        </Wrap>
      </section>
    </>
  )
}
