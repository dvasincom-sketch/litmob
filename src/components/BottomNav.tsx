'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

/**
 * Нижнее меню на мобильном (макет MobileWarm). На странице книги его место
 * занимает закреплённая кнопка «Слушать», чтобы внизу не было двух панелей.
 */
export function BottomNav() {
  const path = usePathname() || '/'
  if (path.startsWith('/kniga/')) return null
  const items = [
    { href: '/', label: 'Главная', active: path === '/' },
    { href: '/poisk/', label: 'Поиск', active: path.startsWith('/poisk') },
    { href: '/tropy/', label: 'Сюжеты', active: path.startsWith('/tropy') },
    { href: '/polka/', label: 'Полка', active: path.startsWith('/polka') || path.startsWith('/vhod') },
  ]
  return (
    <nav aria-label="Основное меню" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-line bg-white pb-[max(10px,env(safe-area-inset-bottom))] pt-1.5 text-center text-[11px] md:hidden">
      {items.map((i) => (
        <Link key={i.label} href={i.href} aria-current={i.active ? 'page' : undefined} className={`py-1.5 ${i.active ? 'font-semibold text-rose' : 'text-muted'}`}>
          {i.label}
        </Link>
      ))}
    </nav>
  )
}
