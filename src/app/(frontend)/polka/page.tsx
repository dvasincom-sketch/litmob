import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import type { Book, Litmob, Narrator, Trope } from '@/payload-types'
import { BookTile } from '@/components/BookCard'
import { LogoutButton } from '@/components/LogoutButton'
import { PageHero } from '@/components/PageHero'
import { Wrap } from '@/components/Wrap'
import { getPayloadClient } from '@/lib/payload'
import { getViewer } from '@/lib/session'

export const metadata: Metadata = { title: 'Моя полка | Литмоб', robots: { index: false, follow: false } }

const STATUS = { listening: 'Слушаю', want: 'Хочу послушать', done: 'Прослушано' } as const

/** Полка читателя: что слушает, что отложил, чего ждёт (проды), на кого подписан. */
export default async function Shelf() {
  const viewer = await getViewer()
  if (!viewer) redirect('/vhod/?next=/polka/')
  const payload = await getPayloadClient()
  const [shelf, follows] = await Promise.all([
    payload.find({ collection: 'shelf', where: { user: { equals: viewer.id } }, depth: 2, limit: 200, sort: '-updatedAt', overrideAccess: true }),
    payload.find({ collection: 'follows', where: { user: { equals: viewer.id } }, depth: 1, limit: 200, sort: '-createdAt', overrideAccess: true }),
  ])
  const groups = (Object.keys(STATUS) as (keyof typeof STATUS)[]).map((k) => ({
    key: k,
    title: STATUS[k],
    items: shelf.docs.filter((s) => s.status === k && typeof s.book === 'object').map((s) => ({ book: s.book as Book, pos: s.positionSec || 0 })),
  }))
  const waitBooks = follows.docs.map((f) => f.book).filter((b): b is Book => Boolean(b) && typeof b === 'object')
  const narrators = follows.docs.map((f) => f.narrator).filter((n): n is Narrator => Boolean(n) && typeof n === 'object')
  const mobs = follows.docs.map((f) => f.litmob).filter((m): m is Litmob => Boolean(m) && typeof m === 'object')
  const tropes = follows.docs.map((f) => f.trope).filter((t): t is Trope => Boolean(t) && typeof t === 'object')
  const empty = !shelf.docs.length && !follows.docs.length

  return (
    <>
      <PageHero title="Моя полка" lead={`${viewer.name || viewer.email}: книги, проды и голоса, на которые вы подписаны.`}>
        <LogoutButton />
      </PageHero>
      <Wrap className="flex flex-col gap-8 py-6 md:py-10">
        {empty && (
          <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-petal bg-white p-6">
            <p>Полка пока пустая. Нажмите на закладку у любой книги или «Сообщить о проде» — книга появится здесь.</p>
            <Link href="/tropy/" className="self-start rounded-xl bg-rose px-4 py-3 font-semibold text-white">
              Выбрать по сюжету
            </Link>
          </div>
        )}
        {groups.map(
          (g) =>
            g.items.length > 0 && (
              <section key={g.key}>
                <h2 className="mb-3.5 text-[22px]">
                  {g.title} <span className="font-sans text-base text-muted">{g.items.length}</span>
                </h2>
                <div className="scroll-row pb-1">
                  {g.items.map(({ book }) => (
                    <BookTile key={book.id} book={book} width={140} />
                  ))}
                </div>
              </section>
            ),
        )}
        {waitBooks.length > 0 && (
          <section>
            <h2 className="mb-1.5 text-[22px]">Жду проду</h2>
            <p className="mb-3.5 text-sm text-muted">Сообщим, когда выйдет новая глава.</p>
            <div className="scroll-row pb-1">
              {waitBooks.map((b) => (
                <BookTile key={b.id} book={b} width={140} />
              ))}
            </div>
          </section>
        )}
        {(narrators.length > 0 || mobs.length > 0 || tropes.length > 0) && (
          <section className="grid gap-3 md:grid-cols-3">
            {[
              { title: 'Голоса', items: narrators.map((n) => ({ id: n.id, label: n.name, href: n.path })) },
              { title: 'Литмобы', items: mobs.map((m) => ({ id: m.id, label: m.title, href: m.path })) },
              { title: 'Сюжеты', items: tropes.map((t) => ({ id: t.id, label: t.title, href: t.path })) },
            ]
              .filter((c) => c.items.length)
              .map((c) => (
                <div key={c.title} className="flex flex-col gap-2 rounded-[14px] border border-line bg-white p-4">
                  <span className="font-semibold">{c.title}</span>
                  {c.items.map((i) => (
                    <Link key={i.id} href={i.href || '#'} className="text-sm text-rose">
                      {i.label}
                    </Link>
                  ))}
                </div>
              ))}
          </section>
        )}
      </Wrap>
    </>
  )
}
