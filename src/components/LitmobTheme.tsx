import Link from 'next/link'
import type { Page } from '@/payload-types'
import { PageHero } from './PageHero'
import { PageBody } from './PageText'
import { Wrap } from './Wrap'
import { getLitmobs } from '@/lib/data'
import { LITMOB_STATUS, LITMOB_THEMES } from '@/lib/litmobThemes'
import { getPayloadClient } from '@/lib/payload'

/** Страница темы литмобов: литмобы площадки на эту тему + сюжеты + как создать свой. */
export async function LitmobTheme({ page }: { page: Page }) {
  const key = (page.path || '').split('/').filter(Boolean).pop() || ''
  const theme = LITMOB_THEMES[key]
  const payload = await getPayloadClient()
  const tropes = theme?.tropes.length
    ? (await payload.find({ collection: 'tropes', where: { and: [{ slug: { in: theme.tropes } }, { kind: { equals: 'trope' } }, { published: { equals: true } }] }, limit: 20, depth: 0 })).docs
    : []
  const tropeIds = new Set(tropes.map((t) => t.id))
  const all = (await getLitmobs()) as { id: number; title: string; path: string; status: string; pitch?: string; trope?: unknown; customTheme?: string }[]
  const mobs = all.filter((l) => {
    const tid = l.trope && typeof l.trope === 'object' ? (l.trope as { id: number }).id : l.trope
    return (tid && tropeIds.has(tid as number)) || (theme && l.customTheme?.toLowerCase().includes(theme.title.toLowerCase()))
  })
  const createHref = `/litmoby/sozdat/${theme?.createTrope ? `?trope=${theme.createTrope}` : ''}`
  return (
    <article>
      <PageHero crumbs={[{ label: 'Литмобы', href: '/litmoby/' }, { label: page.title, href: page.path || '#' }]} title={page.h1 || page.title} lead={page.lead}>
        <div className="flex flex-wrap gap-2">
          <Link href={createHref} className="rounded-xl bg-white px-[18px] py-3 font-semibold text-wine">Создать литмоб на эту тему</Link>
          <Link href="/litmoby/kalendar/" className="rounded-xl border border-white/40 px-[18px] py-3 font-semibold text-white">Календарь литмобов</Link>
        </div>
      </PageHero>
      <Wrap className="pb-12">
        <section className="mt-8">
          <h2 className="mb-3.5 text-xl md:text-2xl">Литмобы на тему «{theme?.title || page.title}»</h2>
          {mobs.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {mobs.map((l) => (
                <Link key={l.id} href={l.path} className="rounded-2xl border border-line bg-white p-4">
                  <span className="text-xs font-semibold text-rose">{LITMOB_STATUS[l.status] || ''}</span>
                  <span className="block font-display text-xl">{l.title}</span>
                  {l.pitch && <span className="block text-sm text-muted">{l.pitch}</span>}
                </Link>
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-petal bg-white/60 p-4 text-sm text-muted">
              Сейчас литмобов на эту тему нет. Соберите свой — задайте правила и сроки, и мы поможем найти авторов и читателей.
            </p>
          )}
        </section>
        {tropes.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-3.5 text-xl md:text-2xl">Книги по сюжетам темы</h2>
            <div className="flex flex-wrap gap-2">
              {tropes.map((t) => (
                <Link key={t.id} href={t.path || '#'} className="rounded-full border border-petal bg-white px-[13px] py-[9px] text-sm">{t.title}</Link>
              ))}
            </div>
          </section>
        )}
        <PageBody page={page} />
      </Wrap>
    </article>
  )
}
