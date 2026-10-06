/** Иконки из макета (stroke 2, скругления). */
type P = { size?: number; color?: string; className?: string }

export const SearchIcon = ({ size = 20, color = 'currentColor', className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" aria-hidden="true" className={className}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-4-4" />
  </svg>
)
export const UserIcon = ({ size = 20, color = 'currentColor', className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" aria-hidden="true" className={className}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
  </svg>
)
export const PlayIcon = ({ size = 18, color = 'currentColor', className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true" className={className}>
    <path d="M7 4l13 8-13 8z" />
  </svg>
)
export const BookmarkIcon = ({ size = 20, color = 'currentColor', className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" aria-hidden="true" className={className}>
    <path d="M6 3h12v18l-6-4-6 4z" />
  </svg>
)
export const HomeIcon = ({ size = 20, color = 'currentColor', className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" aria-hidden="true" className={className}>
    <path d="M4 11l8-7 8 7v9H4z" />
  </svg>
)
