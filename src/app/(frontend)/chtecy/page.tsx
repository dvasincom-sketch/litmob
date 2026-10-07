import Link from 'next/link'
import { Wrap } from '@/components/Wrap'
import type { Metadata } from 'next'
import { getPageDoc, PageBody } from '@/components/PageText'
import { staticMetadata } from '@/lib/seo'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = staticMetadata(
  '/chtecy/',
  'Чтецы аудиокниг: слушать голоса онлайн | Литмоб',
  'Профессиональные чтецы любовного фэнтези, попаданцев и ЛитРПГ. Послушайте голос чтеца и выберите аудиокнигу в его исполнении — первая глава бесплатно.',
)

export default async function Narrators() {
  const pageDoc = await getPageDoc('/chtecy/')
  const payload = await getPayloadClient()
  const res = await payload.find({ collection: 'narrators', where: { published: { equals: true } }, limit: 200, depth: 0, sort: 'name' })
  return (
    <Wrap className="flex flex-col gap-4  py-6 md:py-10">
      <Breadcrumbs items={[{ label: 'Чтецы', href: '/chtecy/' }]} />
      <h1 className="text-3xl">Чтецы аудиокниг: слушать голоса</h1>
      {res.docs.length === 0 ? <p className="text-muted">Скоро здесь появятся чтецы. Вы чтец? Напишите нам — подключим кабинет.</p> : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {res.docs.map((n) => (
            <Link key={n.id} href={n.path || '#'} className="rounded-2xl border border-line bg-white p-3 no-underline">
              <span className="font-semibold">{n.name}</span>
              {n.voice && <span className="block text-xs text-muted">{n.voice}</span>}
            </Link>
          ))}
        </div>
      )}
      <PageBody page={pageDoc} />
    </Wrap>
  )
}
