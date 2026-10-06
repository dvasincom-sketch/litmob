import Link from 'next/link'
import { Wrap } from '@/components/Wrap'

export default function NotFound() {
  return (
    <Wrap className="flex flex-col gap-3  py-6 md:py-10">
      <h1 className="text-3xl">Страница не найдена</h1>
      <p className="text-muted">Возможно, сюжет переехал. Загляните в <Link href="/tropy/">каталог сюжетов</Link>.</p>
    </Wrap>
  )
}
