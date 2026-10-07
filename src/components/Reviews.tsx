'use client'

import Link from 'next/link'
import { useState } from 'react'
import { api } from '@/lib/api'

const STARS = [1, 2, 3, 4, 5]

/** Форма отзыва: оценка 1–5 и текст. Гость видит приглашение войти. */
export function ReviewForm({ book, loggedIn, returnTo, already }: { book: number; loggedIn: boolean; returnTo: string; already: boolean }) {
  const [rating, setRating] = useState(0)
  const [text, setText] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'done'>(already ? 'done' : 'idle')
  const [error, setError] = useState('')

  if (!loggedIn)
    return (
      <p className="rounded-2xl border border-dashed border-petal bg-white/60 p-4 text-sm text-muted">
        <Link href={`/vhod/?next=${encodeURIComponent(returnTo + '#reviews')}`} className="font-semibold text-rose">Войдите</Link>, чтобы оставить отзыв о книге.
      </p>
    )
  if (state === 'done')
    return <p className="rounded-2xl bg-blush/60 p-4 text-sm text-ink-2">Спасибо! Ваш отзыв появится после модерации.</p>

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rating) return setError('Поставьте оценку от 1 до 5.')
    if (text.trim().length < 20) return setError('Напишите хотя бы пару предложений — от 20 символов.')
    setError('')
    setState('sending')
    try {
      await api.review(book, rating, text.trim())
      setState('done')
    } catch (err) {
      setState('idle')
      setError(err instanceof Error ? err.message : 'Не получилось отправить отзыв.')
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-4">
      <fieldset className="flex items-center gap-1">
        <legend className="mb-1 text-sm font-semibold">Ваша оценка</legend>
        {STARS.map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`${n} из 5`}
            aria-pressed={rating === n}
            onClick={() => setRating(n)}
            className={`text-2xl leading-none ${n <= rating ? 'text-rose' : 'text-petal'}`}
          >
            ★
          </button>
        ))}
      </fieldset>
      <label className="flex flex-col gap-1 text-sm font-semibold">
        Отзыв
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          maxLength={3000}
          placeholder="Что понравилось, кому советуете, есть ли спойлеры — предупредите."
          className="rounded-xl border border-line p-3 text-[15px] font-normal"
        />
      </label>
      {error && <p className="text-sm text-rose">{error}</p>}
      <button type="submit" disabled={state === 'sending'} className="self-start rounded-xl bg-rose px-5 py-2.5 font-semibold text-white disabled:opacity-60">
        {state === 'sending' ? 'Отправляем…' : 'Отправить отзыв'}
      </button>
    </form>
  )
}
