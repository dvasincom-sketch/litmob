import type { Metadata } from 'next'
import { Wrap } from '@/components/Wrap'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { SITE_URL } from '@/lib/payload'

export const metadata: Metadata = {
  title: 'Что такое литмоб и как участвовать: правила | Литмоб',
  description: 'Правила литмобов: как создать литмоб, как вступить автору, сроки, модерация и голосование.',
  alternates: { canonical: `${SITE_URL}/litmoby/pravila/` },
}

export default function Rules() {
  return (
    <Wrap className="prose-lm flex flex-col gap-2  py-6 lg:py-10">
      <Breadcrumbs items={[{ label: 'Литмобы', href: '/litmoby/' }, { label: 'Правила', href: '/litmoby/pravila/' }]} />
      <h1 className="text-3xl">Что такое литмоб и как участвовать</h1>
      <p>Литмоб — литературный флешмоб: несколько авторов пишут книги на один сюжет по общим правилам и в общие сроки.</p>
      <h2>Модерация</h2>
      <p>Каждый литмоб и каждая книга проходят модерацию. Рейтинг указывается честно, книги 18+ публикуются только в разделе 18+. Запрещён контент, нарушающий законодательство РФ.</p>
      <h2>Участие автора</h2>
      <p>Подайте заявку с синопсисом. Организатор одобряет участников; после старта соблюдайте график прод — так читатели остаются с литмобом.</p>
      <h2>Озвучка</h2>
      <p>Если организатор разрешил, чтецы площадки могут предложить озвучку. Условия чтец и автор согласуют напрямую на площадке.</p>
    </Wrap>
  )
}
