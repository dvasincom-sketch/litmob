import Link from 'next/link'
import { Wrap } from '@/components/Wrap'
import type { Metadata } from 'next'
import { getPageDoc, PageBody } from '@/components/PageText'
import { staticMetadata } from '@/lib/seo'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { Faq } from '@/components/Faq'
import { getLitmobs } from '@/lib/data'
import { LITMOB_THEMES } from '@/lib/litmobThemes'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = staticMetadata(
  '/litmoby/',
  'Литмобы: книги разных авторов на один сюжет | Литмоб',
  'Все литмобы: серии книг разных авторов на один сюжет — развод, попаданка, драконы. Читайте и слушайте, подписывайтесь на проду участников или создайте свой литмоб.',
)

const STATUS: Record<string, string> = { recruiting: 'Набор авторов', running: 'Идёт', voting: 'Голосование', finished: 'Завершён' }

const FAQ = [
  { q: 'Что такое литмоб?', a: 'Литературный флешмоб: несколько авторов пишут книги на один сюжет по общим правилам и в общие сроки. Книги связаны темой, а не героями — читать можно в любом порядке.' },
  { q: 'Как подписаться на проду?', a: 'На странице литмоба нажмите «Сообщать о проде» — придёт уведомление о новой главе любого участника.' },
  { q: 'Как создать свой литмоб?', a: 'Нужен аккаунт автора. Задайте тему, обязательные элементы, рамки и сроки — после модерации литмоб откроется для набора участников.' },
]

export default async function Litmobs() {
  const pageDoc = await getPageDoc('/litmoby/')
  const list: any[] = await getLitmobs()
  return (
    <Wrap className="flex flex-col gap-6  py-6 md:py-10">
      <Breadcrumbs items={[{ label: 'Литмобы', href: '/litmoby/' }]} />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-3xl">Литмобы: книги разных авторов на один сюжет</h1>
        <Link href="/litmoby/sozdat/" className="rounded-xl bg-rose px-4 py-2 font-semibold text-white no-underline">Создать литмоб</Link>
      </div>
      {list.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-petal bg-white/60 p-4 text-sm text-muted">Первый литмоб площадки — «Развод с драконом» — скоро откроет набор авторов.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {list.map((l) => (
            <Link key={l.id} href={l.path} className="rounded-2xl border border-line bg-white p-4 no-underline">
              <span className="text-xs font-semibold text-rose">{STATUS[l.status] || ''}</span>
              <span className="block font-display text-xl">{l.title}</span>
              <span className="block text-sm text-muted">{l.pitch}</span>
            </Link>
          ))}
        </div>
      )}
      <section>
        <h2 className="mb-3 text-xl md:text-2xl">Темы литмобов</h2>
        <div className="flex flex-wrap gap-2">
          <Link href="/litmoby/kalendar/" className="rounded-full bg-rose px-[13px] py-[9px] text-sm font-semibold text-white no-underline">Календарь литмобов</Link>
          {Object.entries(LITMOB_THEMES).map(([slug, t]) => (
            <Link key={slug} href={`/litmoby/temy/${slug}/`} className="rounded-full border border-petal bg-white px-[13px] py-[9px] text-sm no-underline">Литмоб «{t.title}»</Link>
          ))}
        </div>
      </section>
      <Faq items={FAQ} />
      <PageBody page={pageDoc} />
    </Wrap>
  )
}
