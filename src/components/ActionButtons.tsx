'use client'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { api, loginHref } from '@/lib/api'
import { BookmarkIcon } from './Icons'

type Base = { loggedIn: boolean; returnTo: string; className?: string }

/**
 * «Сообщить о проде» / «Подписаться на голос». Гостя ведём на вход и после
 * входа выполняем подписку автоматически.
 */
export function FollowButton({ target, id, followId, label, doneLabel, loggedIn, returnTo, className }: Base & { target: 'book' | 'litmob' | 'narrator' | 'trope'; id: number; followId: number | null; label: string; doneLabel: string }) {
  const router = useRouter()
  const [fid, setFid] = useState<number | null>(followId)
  const [pending, start] = useTransition()
  const [err, setErr] = useState('')
  const onClick = () => {
    if (!loggedIn) return router.push(loginHref(returnTo, { follow: `${target}:${id}` }))
    setErr('')
    start(async () => {
      try {
        if (fid) {
          await api.unfollow(fid)
          setFid(null)
        } else {
          const r = await api.follow(target, id)
          setFid(r.doc.id)
        }
      } catch (e) {
        setErr((e as Error).message)
      }
    })
  }
  return (
    <span className="inline-flex flex-col">
      <button type="button" onClick={onClick} disabled={pending} aria-pressed={Boolean(fid)} className={className}>
        {fid ? `✓ ${doneLabel}` : label}
      </button>
      {err && <span className="mt-1 text-xs text-rose">{err}</span>}
    </span>
  )
}

/** Кнопка «на полку» (закладка). */
export function ShelfButton({ book, shelfId, loggedIn, returnTo, className, withLabel = false }: Base & { book: number; shelfId: number | null; withLabel?: boolean }) {
  const router = useRouter()
  const [sid, setSid] = useState<number | null>(shelfId)
  const [pending, start] = useTransition()
  const onClick = () => {
    if (!loggedIn) return router.push(loginHref(returnTo, { shelf: String(book) }))
    start(async () => {
      try {
        if (sid) {
          await api.shelfRemove(sid)
          setSid(null)
        } else {
          const r = await api.shelfAdd(book)
          setSid(r.doc.id)
        }
      } catch {
        /* молча: кнопка останется в прежнем состоянии */
      }
    })
  }
  return (
    <button type="button" onClick={onClick} disabled={pending} aria-pressed={Boolean(sid)} aria-label={sid ? 'Убрать с полки' : 'Добавить на полку'} className={`${className || ''} ${sid ? '!border-rose !bg-rose !text-white' : ''}`}>
      <BookmarkIcon color={sid ? '#FFFFFF' : '#9C2B4E'} className={sid ? 'fill-rose' : ''} />
      {withLabel && <span>{sid ? 'На полке' : 'На полку'}</span>}
    </button>
  )
}
