import { PALETTES, type Motif } from '@/lib/coverArt'

/** Тематическая иллюстрация жанра: градиент палитры, мягкий ореол и линейная пиктограмма. */
const ICONS: Record<string, string> = {
  // чашка с паром — уют и своё дело
  'bytovoe-fentezi': 'M5 10h11v4a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5z M16 11h1.5a2.5 2.5 0 0 1 0 5H16 M8.5 3.5c-1 1.4 1 2.4 0 4 M12.5 3.5c-1 1.4 1 2.4 0 4 M4 21h13',
  // сердце с крыльями
  'lyubovnoe-fentezi': 'M12 19.5s-5.5-3.4-5.5-7.6A3.1 3.1 0 0 1 12 10a3.1 3.1 0 0 1 5.5 1.9c0 4.2-5.5 7.6-5.5 7.6z M6.6 11.5C3.6 11 2 8.5 1.5 6c1.8 1.1 3.6 1.2 5 2.6 M17.4 11.5c3-.5 4.6-3 5.1-5.5-1.8 1.1-3.6 1.2-5 2.6',
  // портал
  popadanka: 'M12 3.5c3.6 0 6 3.8 6 8.5s-2.4 8.5-6 8.5-6-3.8-6-8.5 2.4-8.5 6-8.5z M12 7.5c1.7 0 3 2 3 4.5s-1.3 4.5-3 4.5-3-2-3-4.5 1.3-4.5 3-4.5z M20.5 4.5v3 M19 6h3 M3.5 16.5v3 M2 18h3',
  // кольца
  'lyubovnye-romany': 'M9 9.5a5 5 0 1 0 0 10 5 5 0 0 0 0-10z M15 9.5a5 5 0 1 0 0 10 5 5 0 0 0 0-10z M7.5 7.5 9 5.5l1.5 2 M7.5 7.5h3',
  // роза с шипами
  'dark-romans': 'M12 6.5c2 0 3.5 1.6 3.5 3.6S14 13.5 12 13.5s-3.5-1.4-3.5-3.4S10 6.5 12 6.5z M10.5 9.5c.6-1 2.4-1 3 .3 M12 13.5V22 M12 18c-1.8-1.8-3.8-1.4-4.5-.2 1.4.9 3 .8 4.5.2 M12 16.5c1.5-1.3 3.2-1 3.8 0-1.2.8-2.6.6-3.8 0 M10 20.5l-1 .8 M14 19.5l1 .8',
  // башня академии со звездой
  'akademiya-magii': 'M7 21V10l5-5.5L17 10v11z M10 21v-3.5a2 2 0 0 1 4 0V21 M10.5 12.5h3 M5 21h14 M19.5 3l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4L17.5 5l1.4-.6z',
  // песочные часы
  popadancy: 'M7 3h10 M7 21h10 M8 3c0 5 8 5 8 9s-8 4-8 9 M16 3c0 5-8 5-8 9s8 4 8 9 M10 18.5h4',
  // уровни и прокачка
  litrpg: 'M4 21h17 M6 21v-5 M11 21v-9 M16 21V7 M13.5 6.5 16 4l2.5 2.5',
  // корона рода
  boyarka: 'M4 17.5h16l1-10-5 4-4-7-4 7-5-4z M4 21h16 M12 12.5v.01',
  // лупа
  detektivy: 'M10 4a6 6 0 1 0 0 12 6 6 0 0 0 0-12z M14.5 14.5 20.5 20.5 M7.5 8.5a3 3 0 0 1 2.5-1.5',
  // наушники
  'audio-rasskazy': 'M4 15.5V12a8 8 0 0 1 16 0v3.5 M3.5 14.5h3v6h-3z M17.5 14.5h3v6h-3z',
}
const BOOK = 'M4 5.5c3-1 5.5-.8 8 1 2.5-1.8 5-2 8-1V19c-3-1-5.5-.8-8 1-2.5-1.8-5-2-8-1z M12 6.5V20'

const GENRE_PALETTE: Record<string, [Motif, number]> = {
  'bytovoe-fentezi': ['flowers', 0],
  'lyubovnoe-fentezi': ['scales', 0],
  popadanka: ['portal', 0],
  'lyubovnye-romany': ['scales', 1],
  'dark-romans': ['crown', 0],
  'akademiya-magii': ['arches', 0],
  popadancy: ['runes', 0],
  litrpg: ['portal', 1],
  boyarka: ['crown', 1],
  detektivy: ['runes', 1],
  'audio-rasskazy': ['moon', 0],
}

const SPARKS = [
  [34, 26, 2.2], [62, 98, 1.6], [96, 40, 1.2], [248, 30, 1.8], [282, 92, 2.4], [222, 104, 1.3], [300, 46, 1.1], [18, 74, 1.4],
]

export function GenreArt({ slug, className = '' }: { slug: string; className?: string }) {
  const [motif, i] = GENRE_PALETTE[slug] || ['arches', 2]
  const [top, bottom, accent] = PALETTES[motif][i]
  const id = `g-${slug}`
  return (
    <svg viewBox="0 0 320 130" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={bottom} />
        </linearGradient>
        <radialGradient id={`${id}-halo`}>
          <stop offset="0" stopColor={accent} stopOpacity="0.32" />
          <stop offset="1" stopColor={accent} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="320" height="130" fill={`url(#${id})`} />
      <circle cx="160" cy="65" r="70" fill={`url(#${id}-halo)`} />
      <circle cx="160" cy="65" r="50" fill="none" stroke={accent} strokeOpacity="0.25" />
      {SPARKS.map(([x, y, r], k) => (
        <circle key={k} cx={x} cy={y} r={r} fill={accent} fillOpacity={0.55} />
      ))}
      <g transform="translate(160 65) scale(3.1) translate(-12 -12)" fill="none" stroke={accent} strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round">
        <path d={ICONS[slug] || BOOK} />
      </g>
    </svg>
  )
}
