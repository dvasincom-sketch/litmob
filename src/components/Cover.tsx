import type { Book, Media, Trope } from '@/payload-types'

const TINTS = ['#E9C7D2', '#F2D9C4', '#DCCBE6', '#F0C9C2', '#E8D3C9', '#D9C3D6']

/** Обложка книги или цветная заглушка с названием сюжета (как в макете). */
export function Cover({ book, w, h, badge, shadow = false, label = true }: { book: Book; w: number; h: number; badge?: string | null; shadow?: boolean; label?: boolean }) {
  const img = typeof book.cover === 'object' && book.cover ? (book.cover as Media) : null
  const tint = book.coverTint || TINTS[Number(book.id) % TINTS.length]
  const trope = Array.isArray(book.tropes) ? (book.tropes.find((t) => typeof t === 'object') as Trope | undefined) : undefined
  return (
    <div
      className="relative flex flex-none items-center justify-center overflow-hidden rounded-[10px] text-center text-cover-ink"
      style={{ width: w, height: h, background: tint, boxShadow: shadow ? 'var(--shadow-cover)' : undefined }}
    >
      {img?.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={img.sizes?.cover?.url || img.url} alt={img.alt || book.title} className="h-full w-full object-cover" loading="lazy" />
      ) : label ? (
        <span className="px-2 font-display leading-tight" style={{ fontSize: Math.max(11, Math.round(w / 9)) }}>
          {book.title}
          {trope && <span className="mt-1 block font-sans text-[10px] uppercase tracking-wide opacity-70">{trope.title}</span>}
        </span>
      ) : null}
      {badge && <span className="absolute bottom-2 left-2 rounded-md bg-white px-[7px] py-[3px] text-[11px] font-semibold text-wine">{badge}</span>}
      {book.isDemo && <span className="absolute right-1.5 top-1.5 rounded bg-wine/80 px-1.5 text-[9px] uppercase tracking-wide text-white">демо</span>}
    </div>
  )
}

/** Бейдж на обложке: новинка / аудио / номер в серии. */
export function bookBadge(book: Book): string | null {
  const isNew = book.publishedAt && Date.now() - new Date(book.publishedAt).getTime() < 14 * 86400000
  if (book.series?.order && book.series?.ref) return `Серия ${book.series.order}`
  if (isNew) return 'Новинка'
  if (book.hasAudio) return 'Аудио'
  return null
}
