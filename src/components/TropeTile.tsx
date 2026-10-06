import Link from 'next/link'
import { plural } from '@/lib/home'
import { trendLabel } from '@/lib/trend'

const SHORT: Record<string, string> = { 'Новый сюжет': 'Новое', 'Сейчас популярно': 'Популярно' }

type Props = {
  href: string
  title: string
  subtitle?: string | null
  growth?: string | null
  adult?: boolean | null
  count?: { all: number; audio: number }
  className?: string
}

/**
 * Плашка сюжета. Размер фиксированный, у каждого элемента своё место:
 * счётчик книг сверху → название (до 2 строк) → описание (до 2 строк) ; метка тренда — справа в строке
 * счётчика. Счётчик всегда в одной точке, поэтому плашки в сетке не «скачут».
 */
export function TropeTile({ href, title, subtitle, growth, adult, count, className = '' }: Props) {
  const tr = SHORT[trendLabel(growth)] || ''
  const meta = !count ? '\u00a0' : count.all ? `${count.all} ${plural(count.all, 'книга', 'книги', 'книг')}${count.audio ? ` · ${count.audio} в аудио` : ''}` : 'Скоро книги'
  return (
    <Link
      href={href}
      className={`flex h-[150px] flex-col rounded-2xl border border-line bg-white p-4 transition-colors hover:border-petal md:h-[164px] md:p-5 ${className}`}
    >
      <span className="flex h-5 items-center gap-2 text-xs text-muted">
        <span className="truncate">{meta}</span>
        {tr && <span className="ml-auto shrink-0 rounded-full max-md:hidden bg-blush px-2 text-[11px] font-semibold leading-[18px] text-rose">{tr}</span>}
        {adult && <span className={`${tr ? 'max-md:ml-auto ' : 'ml-auto '}shrink-0 rounded-full bg-wine px-1.5 text-[11px] font-semibold leading-[18px] text-white`}>18+</span>}
      </span>
      <span className="mt-2.5 line-clamp-2 text-[15px] font-semibold leading-[1.25] text-ink md:text-lg">{title}</span>
      {subtitle && <span className="mt-1.5 line-clamp-2 text-xs leading-snug text-muted md:text-sm">{subtitle}</span>}
    </Link>
  )
}
