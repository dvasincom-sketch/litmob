import Link from 'next/link'
import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { getAllFamilies, getFamilyTropes } from '@/lib/data'
import { SITE_URL } from '@/lib/payload'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Тропы в книгах: каталог сюжетов любовного фэнтези и попаданцев | Литмоб',
  description: 'Все книжные тропы по семействам: развод и брак, истинная пара и оборотни, академии, попаданки, бытовое фэнтези, мужские сюжеты.',
  alternates: { canonical: `${SITE_URL}/tropy/` },
}

export default async function TropesCatalog() {
  const families = await getAllFamilies()
  const groups = await Promise.all(families.map(async (f) => ({ f, tropes: await getFamilyTropes(f.id) })))
  return (
    <div className="flex flex-col gap-8 pt-4">
      <Breadcrumbs items={[{ label: 'Сюжеты', href: '/tropy/' }]} />
      <h1 className="text-3xl">Тропы в книгах: каталог сюжетов</h1>
      {groups.map(({ f, tropes }) => (
        <section key={f.id}>
          <h2 className="mb-3 text-2xl"><Link href={f.path || '#'}>{f.title}</Link></h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {tropes.map((t) => (
              <Link key={t.id} href={t.path || '#'} className="rounded-2xl border border-line bg-white p-3 font-semibold no-underline">
                {t.title}
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
