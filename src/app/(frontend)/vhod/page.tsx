import type { Metadata } from 'next'
import { Wrap } from '@/components/Wrap'

export const metadata: Metadata = { title: 'Вход | Литмоб', robots: { index: false, follow: false } }

/** Заглушка: вход, «сообщить о проде» и кабинет автора — следующая итерация. */
export default function Login() {
  return (
    <Wrap className="flex flex-col gap-3  py-6 md:py-10">
      <h1 className="text-3xl">Вход</h1>
      <p className="text-muted">Личный кабинет, подписка на проду и заявки в литмобы откроются в ближайшем обновлении.</p>
    </Wrap>
  )
}
