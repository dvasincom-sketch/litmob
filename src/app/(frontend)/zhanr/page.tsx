import Link from 'next/link'
import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { getPayloadClient, SITE_URL } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Жанры | Литмоб', alternates: { canonical: `${SITE_URL}/zhanr/` } }

export default async function Genres() {
  const payload = await getPayloadClient()
  const res = await payload.find({ collection: 'genres', where: { published: { equals: true }, parent: { exists: false } }, limit: 100, depth: 0, sort: 'title' })
  return (
    <div className="flex flex-col gap-6 pt-4">
      <Breadcrumbs items={[{ label: 'Жанры', href: '/zhanr/' }]} />
      <h1 className="text-3xl">Жанры</h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {res.docs.map((g) => (
          <Link key={g.id} href={g.path || '#'} className="rounded-2xl border border-line bg-white p-3 font-semibold no-underline">{g.title}</Link>
        ))}
      </div>
    </div>
  )
}
