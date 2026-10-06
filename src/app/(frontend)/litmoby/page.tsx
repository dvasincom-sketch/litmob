import Link from 'next/link'
import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { Faq } from '@/components/Faq'
import { getLitmobs } from '@/lib/data'
import { SITE_URL } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Литмобы: читать книги литмобов, развод, попаданка, драконы | Литмоб',
  description: 'Все литмобы: серии книг разных авторов на один сюжет. Читайте и слушайте, подписывайтесь на проду всех участников или создайте свой литмоб.',
  alternates: { canonical: `${SITE_URL}/litmoby/` },
}

const STATUS: Record<string, string> = { recruiting: 'Набор авторов', running: 'Идёт', voting: 'Голосование', finished: 'Завершён' }

const FAQ = [
  { q: 'Что такое литмоб?', a: 'Литературный флешмоб: несколько авторов пишут книги на один сюжет по общим правилам и в общие сроки. Книги связаны темой, а не героями — читать можно в любом порядке.' },
  { q: 'Как подписаться на проду?', a: 'На странице литмоба нажмите «Сообщать о проде» — придёт уведомление о новой главе любого участника.' },
  { q: 'Как создать свой литмоб?', a: 'Нужен аккаунт автора. Задайте тему, обязательные элементы, рамки и сроки — после модерации литмоб откроется для набора участников.' },
]

export default async function Litmobs() {
  const list: any[] = await getLitmobs()
  return (
    <div className="flex flex-col gap-6 pt-4">
      <Breadcrumbs items={[{ label: 'Литмобы', href: '/litmoby/' }]} />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-3xl">Литмобы</h1>
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
      <Faq items={FAQ} />
    </div>
  )
}
