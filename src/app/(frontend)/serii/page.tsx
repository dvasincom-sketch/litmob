import Link from 'next/link'
import { LandingPage, landingMetadata } from '@/lib/landing'
import { getPayloadClient } from '@/lib/payload'
import { Wrap } from '@/components/Wrap'

export async function generateMetadata() {
  return landingMetadata('collections', [], '/serii')
}

/** Хаб серий: текст подборки «Серии по порядку» + список циклов. */
export default async function SeriesHub() {
  const payload = await getPayloadClient()
  const res = await payload.find({ collection: 'series', where: { published: { equals: true } }, limit: 200, depth: 0, sort: 'title' })
  return (
    <>
      <LandingPage kind="collections" segments={[]} prefix="/serii" />
      {res.docs.length > 0 && (
        <Wrap className="-mt-6 grid gap-2.5 pb-12 md:grid-cols-3">
          {res.docs.map((s) => (
            <Link key={s.id} href={s.path || '#'} className="rounded-[14px] border border-line bg-white p-4 font-semibold">
              {s.title}
            </Link>
          ))}
        </Wrap>
      )}
    </>
  )
}
