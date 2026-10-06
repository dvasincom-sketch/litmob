import Link from 'next/link'
import { SearchIcon, UserIcon } from './Icons'

export const NAV = [
  { href: '/tropy/', label: 'Сюжеты' },
  { href: '/zhanr/', label: 'Жанры' },
  { href: '/podborki/', label: 'Подборки' },
  { href: '/litmoby/', label: 'Литмобы' },
  { href: '/chtecy/', label: 'Чтецы' },
]

/** Шапка: на мобильном — логотип и две круглые кнопки (макет MobileWarm), на десктопе — меню. */
export function SiteHeader() {
  return (
    <header className="on-dark bg-wine text-white">
      <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-6 px-4 py-3.5 lg:px-6">
        <Link href="/" className="font-display text-2xl text-white">
          Литмоб
        </Link>
        <nav aria-label="Разделы" className="hidden flex-1 gap-6 text-[15px] font-medium text-blush lg:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1.5">
          <Link href="/chtecam/" className="mr-3 hidden text-sm text-blush lg:inline">
            Авторам и чтецам
          </Link>
          <Link href="/poisk/" aria-label="Поиск" className="flex h-11 w-11 items-center justify-center rounded-full bg-wine-2">
            <SearchIcon color="#FFFFFF" />
          </Link>
          <Link href="/vhod/" aria-label="Профиль" className="flex h-11 w-11 items-center justify-center rounded-full bg-wine-2 lg:hidden">
            <UserIcon color="#FFFFFF" />
          </Link>
          <Link href="/vhod/" className="hidden rounded-full border border-blush px-4 py-2.5 text-sm font-semibold lg:inline">
            Моя полка
          </Link>
        </div>
      </div>
    </header>
  )
}

/** Нижнее меню на мобильном (макет MobileWarm). */
export function BottomNav() {
  const items = [
    { href: '/', label: 'Главная' },
    { href: '/poisk/', label: 'Поиск' },
    { href: '/vhod/', label: 'Полка' },
    { href: '/vhod/', label: 'Профиль' },
  ]
  return (
    <nav aria-label="Основное меню" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-line bg-white pb-[max(10px,env(safe-area-inset-bottom))] pt-1.5 text-center text-[11px] lg:hidden">
      {items.map((i, k) => (
        <Link key={i.label} href={i.href} className={`py-1.5 ${k === 0 ? 'font-semibold text-rose' : 'text-muted'}`}>
          {i.label}
        </Link>
      ))}
    </nav>
  )
}

export function SiteFooter() {
  return (
    <footer className="on-dark bg-wine text-blush">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-4 px-4 py-8 text-sm lg:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="font-display text-xl text-white">Литмоб</span>
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href}>
                {n.label}
              </Link>
            ))}
            <Link href="/chtecam/">Чтецам</Link>
            <Link href="/ozvuchka-knig/">Авторам</Link>
            <Link href="/pravoobladatelyam/">Правообладателям</Link>
          </nav>
        </div>
        <p className="max-w-3xl text-[13px] text-blush/80">Тексты книг размещены у авторов. Мы даём ссылки на их страницы и публикуем аудиоверсии с их согласия.</p>
      </div>
    </footer>
  )
}
