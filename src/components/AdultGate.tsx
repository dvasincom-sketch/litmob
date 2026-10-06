'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const KEY = 'lm_age18'

/**
 * Возрастное окно раздела 18+. Вводный текст страницы виден поисковику и
 * гостю, а список книг закрыт до подтверждения. Подтверждение хранится в
 * cookie на год.
 */
export function AdultGate({ text, children }: { text: string; children: React.ReactNode }) {
  const [ok, setOk] = useState<boolean | null>(null)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOk(document.cookie.split('; ').some((c) => c === `${KEY}=1`))
  }, [])
  if (ok) return <>{children}</>
  return (
    <div className="rounded-2xl bg-wine p-5 text-white">
      <p className="mb-4">{text}</p>
      <div className="flex gap-3">
        <button
          type="button"
          className="rounded-xl bg-white px-4 py-2 font-semibold text-wine"
          onClick={() => {
            document.cookie = `${KEY}=1; path=/; max-age=31536000; samesite=lax`
            setOk(true)
          }}
        >
          Мне есть 18
        </button>
        <Link href="/" className="rounded-xl border border-blush px-4 py-2 text-blush no-underline">
          Уйти
        </Link>
      </div>
    </div>
  )
}
