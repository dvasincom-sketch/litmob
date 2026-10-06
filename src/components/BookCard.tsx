import Link from 'next/link'
import type { Author, Book, Narrator, Trope } from '@/payload-types'
import { Cover, bookBadge } from './Cover'

export const names = (list: unknown) =>
  (Array.isArray(list) ? list : [])
    .map((x) => (typeof x === 'object' && x ? (x as Author | Narrator).name : null))
    .filter(Boolean)
    .join(', ')

const firstTrope = (b: Book) => (Array.isArray(b.tropes) ? (b.tropes.find((t) => typeof t === 'object') as Trope | undefined) : undefined)

/** Тег под карточкой: «Есть аудио · серия 1», «Новинка месяца»… */
function tag(b: Book) {
  const parts = [b.hasAudio ? 'Есть аудио' : null, b.series?.order ? `серия, книга ${b.series.order}` : null, b.happyEnding === 'yes' ? 'ХЭ' : null, b.status === 'completed' ? 'завершена' : b.status === 'ongoing' ? 'пишется' : null]
  return parts.filter(Boolean).join(' · ')
}

/** Строка списка «Лучшие книги сюжета» (макет Trope, блок 3). */
export function BookRow({ book, rank }: { book: Book; rank?: number }) {
  const authors = names(book.authors)
  const narrators = names(book.narrators)
  return (
    <Link href={book.path || `/kniga/${book.slug}/`} className="flex gap-3 rounded-[14px] border border-line bg-white p-3">
      <Cover book={book} w={72} h={108} label={false} />
      <div className="flex min-w-0 flex-col gap-1">
        {rank ? <span className="text-xs text-muted">{rank} место</span> : null}
        <span className="font-semibold text-ink">{book.title}</span>
        <span className="text-[13px] text-muted">
          {authors}
          {narrators ? ` · читает ${narrators}` : ''}
        </span>
        {book.hook && <span className="text-[13px] text-ink-2">{book.hook}</span>}
        <span className="text-xs font-semibold text-rose">{tag(book)}</span>
      </div>
    </Link>
  )
}

/** Вертикальная карточка для полок «Слушают сейчас» (макет MobileWarm). */
export function BookTile({ book, width = 150 }: { book: Book; width?: number }) {
  const trope = firstTrope(book)
  const meta = [trope?.title, book.audioHours ? `${book.audioHours} ч` : null].filter(Boolean).join(' · ')
  return (
    <Link href={book.path || `/kniga/${book.slug}/`} className="flex flex-none flex-col gap-2" style={{ width }}>
      <Cover book={book} w={width} h={Math.round(width * 1.5)} badge={bookBadge(book)} />
      <span className="text-sm font-semibold leading-snug text-ink">{book.title}</span>
      <span className="text-xs text-muted">{meta || names(book.authors)}</span>
    </Link>
  )
}

export function BookList({ books, ranked = false, empty }: { books: Book[]; ranked?: boolean; empty?: string }) {
  if (!books.length)
    return <p className="rounded-[14px] border border-dashed border-petal bg-white/60 p-4 text-sm text-muted">{empty || 'Скоро здесь появятся книги. Подпишитесь на сюжет — сообщим о первых.'}</p>
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {books.map((b, i) => (
        <BookRow key={b.id} book={b} rank={ranked ? i + 1 : undefined} />
      ))}
    </div>
  )
}

/** Совместимость со старыми страницами (автор, чтец, серия, литмоб). */
export const BookGrid = BookList
export const BookCard = BookRow
