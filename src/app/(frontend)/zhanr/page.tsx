import Link from 'next/link'
import type { Metadata } from 'next'
import { getPageDoc, PageBody } from '@/components/PageText'
import { staticMetadata } from '@/lib/seo'
import { GenreArt } from '@/components/GenreArt'
import { PageHero } from '@/components/PageHero'
import { Wrap } from '@/components/Wrap'
import { getBookCounts } from '@/lib/data'
import { plural } from '@/lib/home'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = staticMetadata(
  '/zhanr/',
  'Жанры книг и аудиокниг: любовное фэнтези, попаданцы, детективы',
  'Жанры Литмоба: любовное и бытовое фэнтези, попаданки и попаданцы, академии магии, ЛитРПГ, боярка, детективы и аудиорассказы. Читайте и слушайте онлайн.',
)

export default async function Genres() {
  const pageDoc = await getPageDoc('/zhanr/')
  const payload = await getPayloadClient()
  const [res, counts] = await Promise.all([
    payload.find({ collection: 'genres', where: { published: { equals: true }, parent: { exists: false }, adult: { not_equals: true } }, limit: 100, depth: 0, sort: '-monthlyVolume' }),
    getBookCounts('genres'),
  ])
  return (
    <>
      <PageHero crumbs={[{ label: 'Жанры', href: '/zhanr/' }]} title="Жанры книг и аудиокниг" lead="От уютного бытового фэнтези до детективов. Внутри каждого жанра — сюжеты, серии по порядку и аудиоверсии." />
      <Wrap className="py-8 md:py-12">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
          {res.docs.map((g) => {
            const c = counts.get(g.id)
            return (
              <Link key={g.id} href={g.path || '#'} className="group flex h-[240px] flex-col overflow-hidden rounded-2xl border border-line bg-white transition-colors hover:border-petal md:h-[268px]">
                <GenreArt slug={g.slug || ''} className="h-[104px] w-full shrink-0 md:h-[124px]" />
                <span className="flex flex-1 flex-col p-4 md:p-5">
                  <span className="line-clamp-2 text-[15px] font-semibold leading-[1.25] text-ink md:text-lg">{g.title}</span>
                  <span className="mt-1.5 line-clamp-2 text-xs leading-snug text-muted md:text-sm">{g.subtitle || ' '}</span>
                  <span className="mt-auto truncate pt-2 text-xs text-muted">
                    {c?.all ? `${c.all} ${plural(c.all, 'книга', 'книги', 'книг')}${c.audio ? ` · ${c.audio} в аудио` : ''}` : 'Скоро книги'}
                  </span>
                </span>
              </Link>
            )
          })}
        </div>
        <PageBody page={pageDoc} />
      </Wrap>
    </>
  )
}
