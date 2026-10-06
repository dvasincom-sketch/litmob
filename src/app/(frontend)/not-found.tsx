import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col gap-3 pt-10">
      <h1 className="text-3xl">Страница не найдена</h1>
      <p className="text-muted">Возможно, сюжет переехал. Загляните в <Link href="/tropy/">каталог сюжетов</Link>.</p>
    </div>
  )
}
