'use client'
/**
 * Клиентские вызовы REST Payload. Cookie payload-token ставит сам Payload при входе,
 * поэтому достаточно credentials: 'include'.
 */
type Json = Record<string, unknown>

async function call<T = Json>(url: string, method: string, body?: Json): Promise<T> {
  const r = await fetch(url, {
    method,
    credentials: 'include',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await r.json().catch(() => ({}))
  if (!r.ok) {
    const msg = (data as { errors?: { message?: string }[] }).errors?.[0]?.message || 'Не получилось. Попробуйте ещё раз.'
    throw new Error(msg)
  }
  return data as T
}

export const api = {
  me: () => call<{ user: { id: number; name?: string; email: string } | null }>('/api/users/me/', 'GET'),
  login: (email: string, password: string) => call('/api/users/login/', 'POST', { email, password }),
  register: (email: string, password: string, name: string) => call('/api/users/', 'POST', { email, password, name }),
  logout: () => call('/api/users/logout/', 'POST'),
  follow: (target: 'book' | 'litmob' | 'narrator' | 'trope', id: number) => call<{ doc: { id: number } }>('/api/follows/', 'POST', { [target]: id }),
  unfollow: (followId: number) => call(`/api/follows/${followId}/`, 'DELETE'),
  shelfAdd: (book: number, status = 'want') => call<{ doc: { id: number } }>('/api/shelf/', 'POST', { book, status }),
  shelfUpdate: (id: number, data: Json) => call(`/api/shelf/${id}/`, 'PATCH', data),
  shelfRemove: (id: number) => call(`/api/shelf/${id}/`, 'DELETE'),
}

/** Действия, которые гость начал до входа: выполняем сразу после входа. */
export type Pending = { follow?: string; shelf?: string }

export async function runPending(p: Pending) {
  if (p.follow) {
    const [target, id] = p.follow.split(':')
    if (['book', 'litmob', 'narrator', 'trope'].includes(target) && Number(id)) await api.follow(target as 'book', Number(id)).catch(() => null)
  }
  if (p.shelf && Number(p.shelf)) await api.shelfAdd(Number(p.shelf)).catch(() => null)
}

/** Ссылка на вход с возвратом и отложенным действием. */
export const loginHref = (next: string, pending: Pending = {}) => {
  const q = new URLSearchParams({ next })
  if (pending.follow) q.set('follow', pending.follow)
  if (pending.shelf) q.set('shelf', pending.shelf)
  return `/vhod/?${q.toString()}`
}
