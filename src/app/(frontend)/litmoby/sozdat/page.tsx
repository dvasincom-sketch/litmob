import Link from 'next/link'
import { Wrap } from '@/components/Wrap'
import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import type { Author, Trope } from '@/payload-types'
import { getBookBySlug } from '@/lib/data'

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

type Props = { searchParams: Promise<{ book?: string }> }
const objs = <T,>(v: unknown) => (Array.isArray(v) ? v.filter((x) => x && typeof x === 'object') : []) as T[]

export default async function CreateLitmob({ searchParams }: Props) {
  const slug = (await searchParams).book
  // Пришли со страницы книги («Вдохновились?») — показываем книгу как отправную точку литмоба.
  const book = slug ? await getBookBySlug(slug) : null
  const tropes = book ? objs<Trope>(book.tropes) : []
  const authors = book ? objs<Author>(book.authors).map((a) => a.name).join(', ') : ''
  const next = `/litmoby/sozdat/${book?.slug ? `?book=${encodeURIComponent(book.slug)}` : ''}`
  return (
    <Wrap className="flex flex-col gap-6  py-6 md:py-10">
      <Breadcrumbs items={[{ label: 'Литмобы', href: '/litmoby/' }, { label: 'Создать', href: '/litmoby/sozdat/' }]} />
      <h1 className="text-3xl">{book ? `Литмоб по мотивам «${book.title}»` : 'Создать свой литмоб'}</h1>
      {book && (
        <div className="flex max-w-2xl flex-col gap-1.5 rounded-2xl border border-petal bg-white p-4">
          <span className="text-sm text-muted">Отправная точка</span>
          <Link href={book.path || `/kniga/${book.slug}/`} className="font-semibold text-rose">«{book.title}»{authors ? ` — ${authors}` : ''}</Link>
          {tropes.length > 0 && (
            <span className="text-sm">
              Сюжеты, которые можно взять за основу:{' '}
              {tropes.map((t, i) => (
                <span key={t.id}>{i > 0 && ', '}<Link href={t.path || '#'} className="underline decoration-petal underline-offset-2">{t.title.toLowerCase()}</Link></span>
              ))}
            </span>
          )}
          <span className="text-xs text-muted">Литмоб — это новые книги на тот же сюжет, а не продолжение или пересказ чужой книги: героев, мир и текст оригинала брать нельзя.</span>
        </div>
      )}
      <p className="max-w-2xl text-muted">Вы задаёте границы — мы помогаем собрать авторов и читателей. Перед публикацией литмоб проходит модерацию.</p>
      <ol className="flex flex-col gap-3">
        {STEPS.map(([t, d], i) => (
          <li key={t} className="rounded-2xl border border-line bg-white p-4">
            <span className="font-semibold">{i + 1}. {t}</span>
            <p className="text-sm text-muted">{d}</p>
          </li>
        ))}
      </ol>
      <Link href={`/vhod/?next=${encodeURIComponent(next)}&role=author`} className="self-start rounded-xl bg-rose px-4 py-3 font-semibold text-white no-underline">Войти как автор и начать</Link>
    </Wrap>
  )
}
