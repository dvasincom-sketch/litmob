import Link from 'next/link'
import type { Author, Book, Media, Narrator } from '@/payload-types'

const HEAT: Record<string, string> = { none: 'без 18+', moderate: 'умеренно', explicit: '18+' }
const STATUS: Record<string, string> = { ongoing: 'пишется', completed: 'завершена', frozen: 'заморожена' }

const names = (list: unknown) =>
  (Array.isArray(list) ? list : [])
    .map((x) => (typeof x === 'object' && x ? (x as Author | Narrator).name : null))
    .filter(Boolean)
    .join(', ')

export function BookCard({ book, rank }: { book: Book; rank?: number }) {
  const cover = typeof book.cover === 'object' && book.cover ? (book.cover as Media) : null
  const authors = names(book.authors)
  const narrators = names(book.narrators)
  const tags = [
    book.hasAudio ? 'есть аудио' : null,
    book.happyEnding === 'yes' ? 'ХЭ' : null,
    book.heat ? HEAT[book.heat] : null,
    book.status ? STATUS[book.status] : null,
  ].filter(Boolean)
  return (
    <Link href={book.path || `/kniga/${book.slug}/`} className="flex gap-3 rounded-2xl border border-line bg-white p-3 no-underline hover:border-petal">
      <div className="flex h-[108px] w-[72px] flex-none items-center justify-center overflow-hidden rounded-lg bg-petal text-[10px] text-muted">
        {cover?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover.sizes?.thumb?.url || cover.url} alt={cover.alt || book.title} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          'обложка'
        )}
      </div>
      <div className="flex min-w-0 flex-col gap-1">
        {rank ? <span className="text-xs text-muted">{rank} место</span> : null}
        <span className="font-semibold">{book.title}</span>
        {authors && <span className="text-sm text-muted">{authors}{narrators ? ` · читает ${narrators}` : ''}</span>}
        {book.hook && <span className="text-sm">{book.hook}</span>}
        {tags.length > 0 && <span className="text-xs font-semibold text-rose">{tags.join(' · ')}</span>}
      </div>
    </Link>
  )
}

export function BookGrid({ books, ranked = false, empty }: { books: Book[]; ranked?: boolean; empty?: string }) {
  if (!books.length)
    return <p className="rounded-2xl border border-dashed border-petal bg-white/60 p-4 text-sm text-muted">{empty || 'Скоро здесь появятся книги.'}</p>
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {books.map((b, i) => (
        <BookCard key={b.id} book={b} rank={ranked ? i + 1 : undefined} />
      ))}
    </div>
  )
}
