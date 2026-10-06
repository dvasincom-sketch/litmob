import Link from 'next/link'
import type { Metadata } from 'next'
import { PageHero } from '@/components/PageHero'
import { Wrap } from '@/components/Wrap'
import { getAllFamilies, getFamilyTropes } from '@/lib/data'
import { SITE_URL } from '@/lib/payload'

export const metadata: Metadata = {
  title: 'Тропы в книгах: каталог сюжетов любовного фэнтези и попаданцев | Литмоб',
  description: 'Все книжные тропы по семействам: развод и брак, истинная пара и оборотни, академии, попаданки, бытовое фэнтези, мужские сюжеты.',
  alternates: { canonical: `${SITE_URL}/tropy/` },
}

export default async function TropesCatalog() {
  const families = await getAllFamilies()
  const groups = await Promise.all(families.map(async (f) => ({ f, tropes: await getFamilyTropes(f.id) })))
  return (
    <>
      <PageHero crumbs={[{ label: 'Сюжеты', href: '/tropy/' }]} title="Тропы в книгах: каталог сюжетов" lead="Вы знаете, какую историю хотите, даже если не знаете названия. Выберите сюжет — покажем книги, аудио и серии по порядку." />
      <Wrap className="flex flex-col gap-8 py-6 lg:py-10">
        {groups.map(({ f, tropes }) => (
          <section key={f.id}>
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <h2 className="text-[22px] lg:text-[28px]"><Link href={f.path || '#'}>{f.title}</Link></h2>
              <Link href={f.path || '#'} className="text-sm font-semibold text-rose">Все</Link>
            </div>
            <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-3 lg:gap-3.5">
              {tropes.map((t) => (
                <Link key={t.id} href={t.path || '#'} className="flex flex-col gap-1.5 rounded-[14px] border border-line bg-white p-3.5 lg:p-[18px]">
                  <span className="font-semibold leading-tight lg:text-lg">{t.title}{t.adult ? ' · 18+' : ''}</span>
                  {t.subtitle && <span className="text-xs text-muted lg:text-sm">{t.subtitle}</span>}
                  {t.growth && <span className="text-xs font-semibold text-rose">{t.growth === 'новый' ? 'Новый сюжет 2025–2026' : `Интерес ${t.growth} за год`}</span>}
                </Link>
              ))}
            </div>
          </section>
        ))}
      </Wrap>
    </>
  )
}
