import type { Book, Media, Trope } from '@/payload-types'
import { coverStyle } from '@/lib/coverArt'
import { CoverArt } from './CoverArt'

/**
 * Обложка книги. Есть картинка — показываем её; нет — рисуем заглушку
 * с фактурой семейства сюжета и названием (как у настоящей обложки).
 */
export function Cover({ book, w, h, badge, shadow = false, label = true }: { book: Book; w: number; h: number; badge?: string | null; shadow?: boolean; label?: boolean }) {
  const img = typeof book.cover === 'object' && book.cover ? (book.cover as Media) : null
  const trope = Array.isArray(book.tropes) ? (book.tropes.find((t) => typeof t === 'object') as Trope | undefined) : undefined
  const st = coverStyle(trope?.kind === 'refinement' ? undefined : (trope?.slug ?? undefined), Number(book.id))
  const small = w < 90
  return (
    <div
      className="relative flex flex-none flex-col items-center justify-center overflow-hidden rounded-[10px] text-center"
      style={{ width: w, height: h, boxShadow: shadow ? 'var(--shadow-cover)' : undefined, color: st.text }}
    >
      {img?.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={img.sizes?.cover?.url || img.url} alt={img.alt || book.title} className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <>
          <CoverArt motif={st.motif} top={st.top} bottom={st.bottom} pattern={st.pattern} id={`${book.id}-${w}`} />
          {label && !small && (
            <span className="relative px-3 font-display leading-[1.15]" style={{ fontSize: Math.max(12, Math.round(w / 8.5)) }}>
              {book.title}
            </span>
          )}
          {label && !small && trope && <span className="relative mt-2 px-3 text-[10px] uppercase tracking-[0.14em] opacity-80">{trope.title}</span>}
        </>
      )}
      {badge && <span className="absolute bottom-2 left-2 rounded-md bg-white px-[7px] py-[3px] text-[11px] font-semibold text-wine">{badge}</span>}
      {book.isDemo && <span className="absolute right-1.5 top-1.5 rounded bg-black/40 px-1.5 text-[9px] uppercase tracking-wide text-white">демо</span>}
    </div>
  )
}

/** Бейдж на обложке: серия / новинка / аудио. */
export function bookBadge(book: Book): string | null {
  const isNew = book.publishedAt && Date.now() - new Date(book.publishedAt).getTime() < 14 * 86400000
  if (book.series?.order && book.series?.ref) return `Серия ${book.series.order}`
  if (isNew) return 'Новинка'
  if (book.hasAudio) return 'Аудио'
  return null
}
