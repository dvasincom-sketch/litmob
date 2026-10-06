import Link from 'next/link'
import { TropeTile } from '@/components/TropeTile'
import type { Metadata } from 'next'
import { PageHero } from '@/components/PageHero'
import { Wrap } from '@/components/Wrap'
import { getAllFamilies, getBookCounts, getFamilyTropes } from '@/lib/data'
import { SITE_URL } from '@/lib/payload'

export const metadata: Metadata = {
  title: 'Тропы в книгах: каталог сюжетов любовного фэнтези и попаданцев | Литмоб',
  description: 'Все книжные тропы по семействам: развод и брак, истинная пара и оборотни, академии, попаданки, бытовое фэнтези, мужские сюжеты.',
  alternates: { canonical: `${SITE_URL}/tropy/` },
}

export default async function TropesCatalog() {
  const families = await getAllFamilies()
  const [groups, counts] = await Promise.all([
    Promise.all(families.map(async (f) => ({ f, tropes: await getFamilyTropes(f.id) }))),
    getBookCounts('tropes'),
  ])
  return (
    <>
      <PageHero crumbs={[{ label: 'Сюжеты', href: '/tropy/' }]} title="Тропы в книгах: каталог сюжетов" lead="Вы знаете, какую историю хотите, даже если не знаете названия. Выберите сюжет — покажем книги, аудио и серии по порядку." />
      <Wrap className="flex flex-col gap-10 py-8 md:gap-14 md:py-12">
        {groups.map(({ f, tropes }) => (
          <section key={f.id}>
            <div className="mb-4 flex items-baseline md:mb-5 justify-between gap-3">
              <h2 className="text-[22px] md:text-[28px]"><Link href={f.path || '#'}>{f.title}</Link></h2>
              <Link href={f.path || '#'} className="text-sm font-semibold text-rose">Все</Link>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
              {tropes.map((t) => (
                <TropeTile key={t.id} href={t.path || '#'} title={t.title} subtitle={t.subtitle} growth={t.growth} adult={t.adult} count={counts.get(t.id) || { all: 0, audio: 0 }} />
              ))}
            </div>
          </section>
        ))}
      </Wrap>
    </>
  )
}
