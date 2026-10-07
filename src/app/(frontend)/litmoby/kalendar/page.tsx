import Link from 'next/link'
import type { Metadata } from 'next'
import { PageHero } from '@/components/PageHero'
import { getPageDoc, PageBody } from '@/components/PageText'
import { Wrap } from '@/components/Wrap'
import { getLitmobs } from '@/lib/data'
import { LITMOB_STATUS, LITMOB_THEMES } from '@/lib/litmobThemes'
import { staticMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'
const YEAR = new Date().getFullYear()
export const metadata: Metadata = staticMetadata(
  '/litmoby/kalendar/',
  `Литмобы ${YEAR}: календарь — набор авторов, старт и финал | Литмоб`,
  `Календарь литмобов ${YEAR}: какие литмобы набирают авторов, какие уже идут и когда финал. Темы: развод, попаданка, драконы, бывшие, измена.`,
)

type Mob = { id: number; title: string; path: string; status: string; pitch?: string; applicationsUntil?: string; startAt?: string; finishAt?: string }
const fmt = (d?: string) => (d ? new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) : '—')

/** «Литмобы 2026»: календарь по статусам и датам. */
export default async function Calendar() {
  const [mobs, page] = await Promise.all([getLitmobs() as Promise<Mob[]>, getPageDoc('/litmoby/kalendar/')])
  const order = ['recruiting', 'running', 'voting', 'finished']
  return (
    <article>
      <PageHero crumbs={[{ label: 'Литмобы', href: '/litmoby/' }, { label: 'Календарь', href: '/litmoby/kalendar/' }]} title={`Литмобы ${YEAR}: календарь`} lead={page?.lead || 'Набор авторов, старт, первая глава и финал — все сроки литмобов площадки в одном месте.'} />
      <Wrap className="pb-12">
        {order.map((st) => {
          const list = mobs.filter((m) => m.status === st)
          if (!list.length) return null
          return (
            <section key={st} className="mt-8">
              <h2 className="mb-3.5 text-xl md:text-2xl">{LITMOB_STATUS[st]}</h2>
              <div className="overflow-hidden rounded-2xl border border-line bg-white">
                {list.map((m) => (
                  <Link key={m.id} href={m.path} className="flex flex-col gap-1 border-b border-line-2 p-4 last:border-0 md:flex-row md:items-baseline md:justify-between">
                    <span className="font-display text-lg">{m.title}</span>
                    <span className="text-sm text-muted">
                      Заявки до {fmt(m.applicationsUntil)} · старт {fmt(m.startAt)} · финал {fmt(m.finishAt)}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )
        })}
        {!mobs.length && <p className="mt-8 text-sm text-muted">Скоро здесь появятся первые литмобы площадки.</p>}
        <section className="mt-8">
          <h2 className="mb-3.5 text-xl md:text-2xl">Темы литмобов</h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(LITMOB_THEMES).map(([slug, t]) => (
              <Link key={slug} href={`/litmoby/temy/${slug}/`} className="rounded-full border border-petal bg-white px-[13px] py-[9px] text-sm">Литмоб «{t.title}»</Link>
            ))}
          </div>
        </section>
        <PageBody page={page} />
      </Wrap>
    </article>
  )
}
