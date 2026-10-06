import Link from 'next/link'
import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { Wrap } from '@/components/Wrap'
import { getPayloadClient, SITE_URL } from '@/lib/payload'

export const metadata: Metadata = {
  title: 'Подборки книг и аудиокниг: лучшие, новинки, по сюжетам | Литмоб',
  description: 'Подборки, которые ищут: книги с драконами, новинки ромфанта, лучшие аудиокниги месяца, серии по порядку.',
  alternates: { canonical: `${SITE_URL}/podborki/` },
}

export default async function Collections() {
  const payload = await getPayloadClient()
  const res = await payload.find({ collection: 'collections', where: { and: [{ published: { equals: true } }, { adult: { not_equals: true } }] }, sort: '-monthlyVolume', limit: 100, depth: 0 })
  return (
    <>
      <header className="on-dark bg-wine text-white">
        <Wrap className="flex flex-col gap-3.5 pb-6 pt-3.5 md:pb-10 md:pt-6">
          <Breadcrumbs items={[{ label: 'Подборки', href: '/podborki/' }]} light />
          <h1 className="text-[28px] md:text-[44px]">Подборки, которые ищут</h1>
        </Wrap>
      </header>
      <Wrap className="grid gap-2.5 py-6 md:grid-cols-3 md:gap-3.5">
        {res.docs.map((c) => (
          <Link key={c.id} href={c.path || '#'} className="flex flex-col gap-1 rounded-[14px] border border-line bg-white p-4">
            <span className="font-semibold">{c.title}</span>
            {c.subtitle && <span className="text-[13px] text-muted">{c.subtitle}</span>}
          </Link>
        ))}
      </Wrap>
    </>
  )
}
