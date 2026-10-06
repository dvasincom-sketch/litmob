import Link from 'next/link'
import { TropeTile } from '@/components/TropeTile'
import type { Metadata } from 'next'
import { staticMetadata } from '@/lib/seo'
import { PageHero } from '@/components/PageHero'
import { Wrap } from '@/components/Wrap'
import { getAllFamilies, getBookCounts, getFamilyTropes } from '@/lib/data'

export const metadata: Metadata = staticMetadata(
  '/tropy/',
  'Тропы в книгах: каталог сюжетов любовного фэнтези | Литмоб',
  'Все книжные тропы по семействам: развод с драконом, истинная пара, академии и отбор невест, попаданки, бытовое фэнтези, мужские сюжеты. Книги и аудиокниги.',
)

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
