import Link from 'next/link'
import type { Book, Collection, Genre, Narrator, Page, Trope } from '@/payload-types'
import { BookTile } from './BookCard'
import { PageHero } from './PageHero'
import { PageBody } from './PageText'
import { JsonLd } from './JsonLd'
import { SectionHead, Wrap } from './Wrap'
import { getBookCounts } from '@/lib/data'
import { getPayloadClient, SITE_URL } from '@/lib/payload'
import { plural } from '@/lib/seo'

const audioWord = (n: number) => `${n} ${plural(n, 'аудиокнига', 'аудиокниги', 'аудиокниг')}`

/**
 * Хаб «Аудиокниги» (/audio/): все аудиостраницы жанров и сюжетов, новые аудиокниги,
 * голоса чтецов и текст страницы из админки. Главный запрос — «аудиокниги слушать онлайн».
 */
export async function AudioHub({ page }: { page: Page }) {
  const payload = await getPayloadClient()
  const pub = { published: { equals: true } }
  const [books, total, genreAudio, tropeAudio, collections, narrators, gCounts, tCounts] = await Promise.all([
    payload.find({ collection: 'books', where: { and: [pub, { hasAudio: { equals: true } }] }, sort: '-publishedAt', limit: 12, depth: 1 }),
    payload.count({ collection: 'books', where: { and: [pub, { hasAudio: { equals: true } }] } }),
    payload.find({ collection: 'genres', where: { and: [pub, { audioOnly: { equals: true } }, { adult: { not_equals: true } }] }, limit: 50, depth: 1, sort: '-monthlyVolume' }),
    payload.find({ collection: 'tropes', where: { and: [pub, { audioOnly: { equals: true } }, { adult: { not_equals: true } }] }, limit: 50, depth: 1, sort: '-monthlyVolume' }),
    payload.find({ collection: 'collections', where: { and: [pub, { adult: { not_equals: true } }] }, limit: 20, depth: 0, sort: '-monthlyVolume' }),
    payload.find({ collection: 'narrators', where: pub, limit: 8, depth: 0 }),
    getBookCounts('genres'),
    getBookCounts('tropes'),
  ])
  const parentOf = (d: Genre | Trope) => (d.parent && typeof d.parent === 'object' ? (d.parent as Genre | Trope) : null)
  const audioCols = (collections.docs as Collection[]).filter((c) => c.audioOnly || /аудио/i.test(c.title))

  const hubs = [
    ...(genreAudio.docs as Genre[]).map((g) => ({ d: g, p: parentOf(g), n: gCounts.get(parentOf(g)?.id ?? g.id)?.audio ?? 0, kind: 'Жанр' })),
    ...(tropeAudio.docs as Trope[]).map((t) => ({ d: t, p: parentOf(t), n: tCounts.get(parentOf(t)?.id ?? t.id)?.audio ?? 0, kind: 'Сюжет' })),
  ]

  return (
    <article>
      <PageHero crumbs={[{ label: 'Аудиокниги', href: '/audio/' }]} title={page.h1 || page.title} lead={page.lead}>
        <p className="text-sm text-blush">
          {total.totalDocs ? `${audioWord(total.totalDocs)} в каталоге.` : 'Каталог аудиокниг пополняется каждую неделю.'}
        </p>
      </PageHero>
      <Wrap className="pb-12">
        {books.docs.length > 0 && (
          <section className="mt-8">
            <SectionHead title="Новые аудиокниги" href="/podborki/audio-romfant-mesyaca/" more="Лучшие за месяц" />
            <div className="scroll-row pb-1">
              {(books.docs as Book[]).map((b) => <BookTile key={b.id} book={b} width={140} />)}
            </div>
          </section>
        )}

        <section className="mt-10">
          <h2 className="mb-3.5 text-[22px] md:text-[28px]">Аудиокниги по жанрам и сюжетам</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {hubs.map(({ d, p, n, kind }) => (
              <Link key={`${kind}-${d.id}`} href={d.path || '#'} className="flex h-[92px] flex-col justify-between rounded-2xl border border-line bg-white p-4 transition-colors hover:border-petal">
                <span className="line-clamp-2 font-semibold leading-tight text-ink">Аудиокниги «{p?.title || d.title}»</span>
                <span className="text-xs text-muted">{kind}{n ? ` · ${audioWord(n)}` : ' · скоро'}</span>
              </Link>
            ))}
            <Link href="/audio/rasskazy/" className="flex h-[92px] flex-col justify-between rounded-2xl border border-line bg-white p-4 transition-colors hover:border-petal">
              <span className="font-semibold leading-tight text-ink">Аудиорассказы</span>
              <span className="text-xs text-muted">Короткие истории на один вечер</span>
            </Link>
          </div>
        </section>

        {audioCols.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-3.5 text-[22px] md:text-[28px]">Подборки аудиокниг</h2>
            <div className="flex flex-wrap gap-2">
              {audioCols.map((c) => (
                <Link key={c.id} href={c.path || '#'} className="rounded-full border border-petal bg-white px-[13px] py-[9px] text-sm">{c.title}</Link>
              ))}
            </div>
          </section>
        )}

        {narrators.docs.length > 0 && (
          <section className="mt-10">
            <SectionHead title="Чтецы аудиокниг" href="/chtecy/" lead="Выбирайте книгу по голосу — у каждого чтеца есть демо." />
            <div className="flex flex-wrap gap-2">
              {(narrators.docs as Narrator[]).map((n) => (
                <Link key={n.id} href={n.path || '#'} className="rounded-full border border-line bg-white px-[13px] py-[9px] text-sm">{n.name}</Link>
              ))}
            </div>
          </section>
        )}

        <PageBody page={page} />
      </Wrap>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: page.h1 || page.title,
          url: `${SITE_URL}/audio/`,
          inLanguage: 'ru',
          ...(books.docs.length
            ? { mainEntity: { '@type': 'ItemList', numberOfItems: total.totalDocs, itemListElement: (books.docs as Book[]).map((b, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE_URL}${b.path}`, name: b.title })) } }
            : {}),
        }}
      />
    </article>
  )
}
