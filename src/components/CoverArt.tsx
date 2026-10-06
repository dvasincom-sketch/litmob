import type { Motif } from '@/lib/coverArt'

/** Векторные фактуры для обложек-заглушек. Узор рисуется поверх градиента. */
export function CoverArt({ motif, top, bottom, pattern, id }: { motif: Motif; top: string; bottom: string; pattern: string; id: string }) {
  const pid = `p-${id}`
  const gid = `g-${id}`
  const tile: Record<Motif, React.ReactNode> = {
    scales: (
      <pattern id={pid} width="24" height="16" patternUnits="userSpaceOnUse">
        <path d="M0 16a12 12 0 0 1 24 0M-12 8a12 12 0 0 1 24 0M12 8a12 12 0 0 1 24 0" fill="none" stroke={pattern} strokeWidth="1" />
      </pattern>
    ),
    moon: (
      <pattern id={pid} width="40" height="40" patternUnits="userSpaceOnUse">
        <circle cx="6" cy="8" r="1" fill={pattern} />
        <circle cx="28" cy="20" r="0.8" fill={pattern} />
        <circle cx="16" cy="34" r="1.2" fill={pattern} />
        <path d="M33 4l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" fill={pattern} />
      </pattern>
    ),
    arches: (
      <pattern id={pid} width="28" height="40" patternUnits="userSpaceOnUse">
        <path d="M4 40V18a10 10 0 0 1 20 0v22" fill="none" stroke={pattern} strokeWidth="1" />
        <path d="M14 8v32" stroke={pattern} strokeWidth=".6" />
      </pattern>
    ),
    portal: (
      <pattern id={pid} width="60" height="60" patternUnits="userSpaceOnUse">
        <circle cx="30" cy="30" r="8" fill="none" stroke={pattern} strokeWidth=".8" />
        <circle cx="30" cy="30" r="16" fill="none" stroke={pattern} strokeWidth=".6" />
        <circle cx="30" cy="30" r="24" fill="none" stroke={pattern} strokeWidth=".4" />
      </pattern>
    ),
    flowers: (
      <pattern id={pid} width="36" height="36" patternUnits="userSpaceOnUse">
        <g fill="none" stroke={pattern} strokeWidth="1">
          <circle cx="10" cy="10" r="2.2" />
          <path d="M10 5.5c1.5 1.4 1.5 3 0 4.5-1.5-1.5-1.5-3.1 0-4.5zM10 14.5c1.5-1.4 1.5-3 0-4.5-1.5 1.5-1.5 3.1 0 4.5zM5.5 10c1.4-1.5 3-1.5 4.5 0-1.5 1.5-3.1 1.5-4.5 0zM14.5 10c-1.4-1.5-3-1.5-4.5 0 1.5 1.5 3.1 1.5 4.5 0z" />
          <path d="M26 28c2-4 6-4 8-2M26 28c-1 3 1 6 4 6" />
        </g>
      </pattern>
    ),
    crown: (
      <pattern id={pid} width="22" height="22" patternUnits="userSpaceOnUse">
        <path d="M11 2l9 9-9 9-9-9z" fill="none" stroke={pattern} strokeWidth=".8" />
        <circle cx="11" cy="11" r="1.2" fill={pattern} />
      </pattern>
    ),
    runes: (
      <pattern id={pid} width="26" height="30" patternUnits="userSpaceOnUse">
        <path d="M13 0l13 7.5v15L13 30 0 22.5v-15z" fill="none" stroke={pattern} strokeWidth=".8" />
        <path d="M13 9v12M9 13l4-4 4 4" fill="none" stroke={pattern} strokeWidth=".7" />
      </pattern>
    ),
  }
  return (
    <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 200 300" aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={bottom} />
        </linearGradient>
        {tile[motif]}
      </defs>
      <rect width="200" height="300" fill={`url(#${gid})`} />
      <rect width="200" height="300" fill={`url(#${pid})`} opacity=".35" />
      <rect x="10" y="10" width="180" height="280" rx="6" fill="none" stroke={pattern} strokeOpacity=".55" strokeWidth="1.2" />
      {motif === 'moon' && <path d="M140 60a28 28 0 1 0 22 46 22 22 0 1 1-22-46z" fill={pattern} opacity=".55" />}
      {motif === 'scales' && <path d="M100 236c-18 0-34 10-40 22h80c-6-12-22-22-40-22z" fill={pattern} opacity=".25" />}
      {motif === 'crown' && <path d="M72 70l10 22 18-26 18 26 10-22 6 34H66z" fill="none" stroke={pattern} strokeWidth="2" opacity=".7" />}
    </svg>
  )
}
