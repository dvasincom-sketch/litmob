import { headers } from 'next/headers'
import type { User } from '@/payload-types'
import { getPayloadClient } from './payload'

/** Текущий пользователь по cookie payload-token (или null). */
export async function getViewer(): Promise<User | null> {
  const payload = await getPayloadClient()
  try {
    // Payload принимает cookie только у запросов «со своего сайта» (CSRF-защита).
    // Рендер страницы — чтение, не изменение данных, поэтому помечаем его как same-origin:
    // иначе при открытии /polka/ из адресной строки (Sec-Fetch-Site: none) вход «терялся».
    const h = new Headers(await headers())
    h.set('sec-fetch-site', 'same-origin')
    const { user } = await payload.auth({ headers: h })
    return (user as User) ?? null
  } catch {
    return null
  }
}

/** Что из книги/чтеца/литмоба уже у читателя: подписка на проду и полка. */
export async function getViewerState(userId: number | undefined, q: { book?: number; narrator?: number; litmob?: number }) {
  if (!userId) return { follow: null as number | null, shelf: null as { id: number; status: string; positionSec?: number | null } | null }
  const payload = await getPayloadClient()
  const key = q.book ? 'book' : q.narrator ? 'narrator' : 'litmob'
  const val = q.book ?? q.narrator ?? q.litmob
  const [f, s] = await Promise.all([
    payload.find({ collection: 'follows', where: { and: [{ user: { equals: userId } }, { [key]: { equals: val } }] }, limit: 1, depth: 0, overrideAccess: true }),
    q.book ? payload.find({ collection: 'shelf', where: { and: [{ user: { equals: userId } }, { book: { equals: q.book } }] }, limit: 1, depth: 0, overrideAccess: true }) : null,
  ])
  const sh = s?.docs[0]
  return { follow: (f.docs[0]?.id as number) ?? null, shelf: sh ? { id: sh.id as number, status: sh.status as string, positionSec: sh.positionSec } : null }
}
