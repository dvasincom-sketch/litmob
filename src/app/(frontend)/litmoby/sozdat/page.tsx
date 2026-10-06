import Link from 'next/link'
import { Wrap } from '@/components/Wrap'
import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/Breadcrumbs'

export const metadata: Metadata = { title: 'Создать литмоб | Литмоб', robots: { index: false, follow: true } }

const STEPS = [
  ['Тема и сюжет', 'Выберите сюжет из каталога или предложите свой. Покажем спрос и рост по теме.'],
  ['Обязательные элементы и запреты', '3–5 пунктов, которые должны быть в каждой книге, и то, чего быть не должно.'],
  ['Рамки книги', 'Объём, рейтинг (без 18+ или 18+), обязателен ли ХЭ, от чьего лица рассказ.'],
  ['Сроки', 'Приём заявок, старт, первая глава, график прод и финал.'],
  ['Участники', 'От 3 до 30 авторов: открытый набор, по заявке с синопсисом или по приглашению.'],
  ['Оформление', 'Единый стиль обложек и плашка литмоба.'],
  ['Озвучка', 'Разрешите чтецам предложить озвучку — книги попадут в аудиоподписку.'],
  ['Финал', 'Голосование читателей и приз от площадки.'],
]

export default function CreateLitmob() {
  return (
    <Wrap className="flex flex-col gap-6  py-6 lg:py-10">
      <Breadcrumbs items={[{ label: 'Литмобы', href: '/litmoby/' }, { label: 'Создать', href: '/litmoby/sozdat/' }]} />
      <h1 className="text-3xl">Создать свой литмоб</h1>
      <p className="max-w-2xl text-muted">Вы задаёте границы — мы помогаем собрать авторов и читателей. Перед публикацией литмоб проходит модерацию.</p>
      <ol className="flex flex-col gap-3">
        {STEPS.map(([t, d], i) => (
          <li key={t} className="rounded-2xl border border-line bg-white p-4">
            <span className="font-semibold">{i + 1}. {t}</span>
            <p className="text-sm text-muted">{d}</p>
          </li>
        ))}
      </ol>
      <Link href="/vhod/?next=/litmoby/sozdat/&role=author" className="self-start rounded-xl bg-rose px-4 py-3 font-semibold text-white no-underline">Войти как автор и начать</Link>
    </Wrap>
  )
}
