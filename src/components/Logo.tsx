import Link from 'next/link'

/**
 * Знак Литмоба: буква «Л», собранная из двух страниц раскрытой книги,
 * и две звуковые волны — книга, которую слушают.
 */
export function LogoMark({ size = 32, bg = '#9C2B4E', fg = '#FFFFFF', wave = '#F2A7C3' }: { size?: number; bg?: string; fg?: string; wave?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill={bg} />
      <path d="M7.2 23.5c1.6 0 2.3-.8 2.9-2.4L14.6 8.5 20.4 23.5" fill="none" stroke={fg} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.6 8.5v15" fill="none" stroke={fg} strokeWidth="1.4" strokeLinecap="round" opacity=".55" />
      <path d="M23.3 12.6a4.6 4.6 0 0 1 0 6.8" fill="none" stroke={wave} strokeWidth="2" strokeLinecap="round" />
      <path d="M26 10a8.4 8.4 0 0 1 0 12" fill="none" stroke={wave} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function Logo({ className = '' }: { className?: string }) {
  return (
    <Link href="/" aria-label="Литмоб — на главную" className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark />
      <span className="font-display text-2xl leading-none text-white">Литмоб</span>
    </Link>
  )
}
