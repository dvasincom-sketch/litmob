'use client'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { api, runPending } from '@/lib/api'

/**
 * Вход и регистрация в одной форме. После входа выполняем отложенное действие
 * (подписка на проду, полка) и возвращаем читателя туда, откуда он пришёл.
 */
export function LoginForm() {
  const router = useRouter()
  const sp = useSearchParams()
  const next = sp.get('next') || '/polka/'
  const pending = { follow: sp.get('follow') || undefined, shelf: sp.get('shelf') || undefined }
  const [mode, setMode] = useState<'login' | 'register'>(sp.get('follow') || sp.get('shelf') ? 'register' : 'login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const why = pending.follow ? 'Войдите, чтобы мы сообщили о новой главе.' : pending.shelf ? 'Войдите, чтобы сохранить книгу на полку.' : 'Полка, проды и место, где вы остановились, — на всех устройствах.'

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr('')
    setBusy(true)
    try {
      if (mode === 'register') await api.register(email.trim(), password, name.trim())
      await api.login(email.trim(), password)
      await runPending(pending)
      router.push(next.startsWith('/') ? next : '/polka/')
      router.refresh()
    } catch (e2) {
      const m = (e2 as Error).message
      setErr(/credentials|incorrect|неверн/i.test(m) ? 'Неверная почта или пароль.' : /unique|exists|занят/i.test(m) ? 'Такая почта уже зарегистрирована — войдите.' : m)
    } finally {
      setBusy(false)
    }
  }

  const tab = (m: 'login' | 'register', label: string) => (
    <button type="button" onClick={() => setMode(m)} aria-pressed={mode === m} className={`flex-1 rounded-xl py-2.5 text-sm font-semibold ${mode === m ? 'bg-wine text-white' : 'text-muted'}`}>
      {label}
    </button>
  )

  return (
    <form onSubmit={submit} className="flex w-full max-w-[420px] flex-col gap-4 rounded-2xl border border-line bg-white p-5 shadow-[var(--shadow-card)] md:p-7">
      <h1 className="text-[28px]">{mode === 'login' ? 'Вход' : 'Регистрация'}</h1>
      <p className="text-sm text-muted">{why}</p>
      <div className="flex gap-1 rounded-2xl bg-cream p-1">
        {tab('login', 'Войти')}
        {tab('register', 'Создать аккаунт')}
      </div>
      {mode === 'register' && (
        <label className="flex flex-col gap-1 text-sm">
          Как к вам обращаться
          <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className="h-12 rounded-xl border border-petal px-3.5 text-base" />
        </label>
      )}
      <label className="flex flex-col gap-1 text-sm">
        Почта
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className="h-12 rounded-xl border border-petal px-3.5 text-base" />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Пароль
        <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} className="h-12 rounded-xl border border-petal px-3.5 text-base" />
      </label>
      {err && <p role="alert" className="text-sm text-rose">{err}</p>}
      <button type="submit" disabled={busy} className="h-12 rounded-xl bg-rose font-semibold text-white disabled:opacity-60">
        {busy ? 'Секунду…' : mode === 'login' ? 'Войти' : 'Создать аккаунт'}
      </button>
      <p className="text-xs text-muted">
        Регистрируясь, вы соглашаетесь с <Link href="/o-proekte/" className="underline">условиями площадки</Link>.
      </p>
    </form>
  )
}
