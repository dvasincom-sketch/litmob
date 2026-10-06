import Link from 'next/link'
import { Wrap } from '@/components/Wrap'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { BookCard } from '@/components/BookCard'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { getApprovedEntries, getLitmobBySlug } from '@/lib/data'
import { buildMetadata } from '@/lib/seo'
import { FollowButton } from '@/components/ActionButtons'
import { getViewer, getViewerState } from '@/lib/session'

type Props = { params: Promise<{ slug: string }> }
export const dynamic = 'force-dynamic'

const fmt = (d?: string | null) => (d ? new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) : '—')

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const l: any = await getLitmobBySlug((await params).slug)
  if (!l) return {}
  return buildMetadata({ ...l, lead: l.pitch }, { fallbackTitle: `Литмоб «${l.title}»: читать все книги литмоба | Литмоб` })
}

export default async function LitmobPage({ params }: Props) {
  const l: any = await getLitmobBySlug((await params).slug)
  if (!l) notFound()
  const entries: any[] = await getApprovedEntries(l.id)
  const viewer = await getViewer()
  const state = await getViewerState(viewer?.id, { litmob: l.id })
  const books = entries.map((e) => e.book).filter((b) => b && typeof b === 'object')
  const trope = l.trope && typeof l.trope === 'object' ? l.trope : null
  return (
    <Wrap className="flex flex-col gap-6  py-6 md:py-10">
      <Breadcrumbs items={[{ label: 'Литмобы', href: '/litmoby/' }, { label: l.title, href: l.path }]} />
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl">Литмоб «{l.title}»</h1>
        <p className="max-w-2xl text-muted">{l.pitch}</p>
        {trope && <p className="text-sm">Сюжет: <Link href={trope.path}>{trope.title}</Link></p>}
      </header>
      <section className="grid gap-3 rounded-2xl border border-line bg-white p-4 text-sm sm:grid-cols-2">
        <div>
          <h2 className="mb-1 text-lg">Обязательно в книге</h2>
          <ul className="list-disc pl-5">{(l.mustHave || []).map((m: any) => <li key={m.id}>{m.text}</li>)}</ul>
          {(l.forbidden || []).length > 0 && (<><h2 className="mb-1 mt-3 text-lg">Нельзя</h2><ul className="list-disc pl-5">{l.forbidden.map((m: any) => <li key={m.id}>{m.text}</li>)}</ul></>)}
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="mb-1 text-lg">Сроки и рамки</h2>
          <span>Заявки до: {fmt(l.applicationsUntil)}</span>
          <span>Старт: {fmt(l.startAt)}</span>
          <span>Финал: {fmt(l.finishAt)}</span>
          <span>Рейтинг: {l.rating === 'adult' ? '18+' : 'без 18+'}{l.happyEndingRequired ? ' · ХЭ обязателен' : ''}</span>
          {l.prize && <span>Приз: {l.prize}</span>}
        </div>
      </section>
      <div className="flex flex-wrap gap-3">
        <FollowButton target="litmob" id={l.id} followId={state.follow} loggedIn={Boolean(viewer)} returnTo={l.path} label="Сообщать о проде всех участников" doneLabel="Подписаны на литмоб" className="rounded-xl bg-rose px-4 py-2.5 font-semibold text-white" />
        {l.status === 'recruiting' && <Link href={`/vhod/?next=${encodeURIComponent(l.path)}&join=${l.id}`} className="rounded-xl border border-petal bg-white px-4 py-2 no-underline">Подать заявку автором</Link>}
      </div>
      <section>
        <h2 className="mb-3 text-2xl">Книги литмоба</h2>
        {books.length ? <div className="grid gap-3 sm:grid-cols-2">{books.map((b: any) => <BookCard key={b.id} book={b} />)}</div> : <p className="text-sm text-muted">Книги появятся после старта.</p>}
      </section>
    </Wrap>
  )
}
