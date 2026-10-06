import Link from 'next/link'
import { getPayloadClient } from '@/lib/payload'
import { getViewer } from '@/lib/session'
import { SearchIcon, UserIcon } from './Icons'
import { Logo } from './Logo'

export { BottomNav } from './BottomNav'

export const NAV = [
  { href: '/tropy/', label: 'Сюжеты' },
  { href: '/zhanr/', label: 'Жанры' },
  { href: '/podborki/', label: 'Подборки' },
  { href: '/litmoby/', label: 'Литмобы' },
  { href: '/chtecy/', label: 'Чтецы' },
]

/** Шапка: на мобильном — логотип и две круглые кнопки (макет MobileWarm), на десктопе — меню. */
export async function SiteHeader() {
  const viewer = await getViewer()
  return (
    <header className="on-dark bg-wine text-white">
      <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-6 px-4 py-3.5 md:px-6">
        <Logo />
        <nav aria-label="Разделы" className="hidden flex-1 gap-6 text-[15px] font-medium text-blush md:flex">
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
          <Link href="/polka/" aria-label={viewer ? 'Моя полка' : 'Войти'} className="flex h-11 w-11 items-center justify-center rounded-full bg-wine-2 md:hidden">
            <UserIcon color="#FFFFFF" />
          </Link>
          <Link href={viewer ? '/polka/' : '/vhod/'} className="hidden rounded-full border border-blush px-4 py-2.5 text-sm font-semibold md:inline">
            {viewer ? 'Моя полка' : 'Войти'}
          </Link>
        </div>
      </div>
    </header>
  )
}

/** Подвал: разделы, жанры (перенесены с главной), авторам и чтецам. */
export async function SiteFooter() {
  const payload = await getPayloadClient()
  const genres = await payload.find({
    collection: 'genres',
    where: { and: [{ published: { equals: true } }, { parent: { exists: false } }, { adult: { not_equals: true } }] },
    sort: '-monthlyVolume',
    limit: 10,
    depth: 0,
  })
  const col = (title: string, links: { href: string; label: string }[]) => (
    <div className="flex flex-col gap-2">
      <span className="font-semibold text-white">{title}</span>
      {links.map((l) => (
        <Link key={l.href} href={l.href} className="text-blush/90">
          {l.label}
        </Link>
      ))}
    </div>
  )
  return (
    <footer className="on-dark bg-wine text-blush">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-8 px-4 py-10 text-sm md:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 flex flex-col gap-3 md:col-span-1">
            <Logo />
            <p className="max-w-xs text-[13px] text-blush/80">Книги и аудиокниги по любимому сюжету. Первая глава бесплатно.</p>
          </div>
          {col('Разделы', NAV)}
          {col('Жанры', genres.docs.map((g) => ({ href: g.path || '#', label: g.title })))}
          {col('Авторам и чтецам', [
            { href: '/chtecam/', label: 'Стать чтецом' },
            { href: '/ozvuchka-knig/', label: 'Озвучить книгу' },
            { href: '/litmoby/sozdat/', label: 'Создать литмоб' },
            { href: '/avtoram/literaturnye-konkursy/', label: 'Конкурсы' },
            { href: '/pravoobladatelyam/', label: 'Правообладателям' },
          ])}
        </div>
        <p className="max-w-3xl border-t border-wine-2 pt-5 text-[13px] text-blush/70">
          Тексты книг размещены у авторов. Мы даём ссылки на их страницы и публикуем аудиоверсии с их согласия.
        </p>
      </div>
    </footer>
  )
}
