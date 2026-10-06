import Link from 'next/link'
import { getAllFamilies, getFamilyTropes, getLitmobs } from '@/lib/data'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const families = await getAllFamilies()
  const groups = await Promise.all(families.map(async (f) => ({ f, tropes: await getFamilyTropes(f.id) })))
  const litmobs = (await getLitmobs()).slice(0, 3)
  return (
    <div className="flex flex-col gap-10 pt-6">
      <section className="flex flex-col gap-3">
        <h1 className="text-3xl sm:text-4xl">Книги и аудиокниги по любимому сюжету</h1>
        <p className="max-w-2xl text-muted">
          Выберите сюжет — развод с драконом, истинная пара, попаданка, своя лавка — и слушайте первую главу бесплатно. Профессиональные
          чтецы, проды по расписанию, литмобы авторов.
        </p>
      </section>
      {groups.map(({ f, tropes }) => (
        <section key={f.id}>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-2xl">{f.title}</h2>
            <Link href={f.path || '#'} className="text-sm font-semibold text-rose">Все</Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {tropes.map((t) => (
              <Link key={t.id} href={t.path || '#'} className="rounded-full border border-petal bg-white px-3 py-2 text-sm no-underline">
                {t.title}
              </Link>
            ))}
          </div>
        </section>
      ))}
      <section className="rounded-2xl bg-wine p-5 text-white">
        <h2 className="text-2xl">Литмобы</h2>
        <p className="mb-3 text-blush">Авторы пишут на один сюжет по общим правилам. Подпишитесь — и получайте проду всех участников.</p>
        <ul className="mb-3 flex flex-col gap-1">
          {litmobs.map((l: any) => (
            <li key={l.id}><Link href={l.path}>{l.title}</Link></li>
          ))}
        </ul>
        <Link href="/litmoby/" className="inline-block rounded-xl bg-white px-4 py-2 font-semibold text-wine no-underline">Все литмобы</Link>
      </section>
    </div>
  )
}
