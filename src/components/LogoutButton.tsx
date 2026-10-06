'use client'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

export function LogoutButton() {
  const router = useRouter()
  return (
    <button
      type="button"
      onClick={async () => {
        await api.logout().catch(() => null)
        router.push('/')
        router.refresh()
      }}
      className="self-start rounded-xl border border-blush px-4 py-2 text-sm text-blush"
    >
      Выйти
    </button>
  )
}
