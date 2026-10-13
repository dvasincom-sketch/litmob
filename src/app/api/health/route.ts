import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Health-check для контейнера: процесс жив и отвечает (всегда 200).
 * Поле db — состояние подключения к БД и миграций: pending | ready | failed.
 * По нему фоновые сиды в Dockerfile ждут, пока сервер применит миграции.
 */
export function GET() {
  const db = (globalThis as { __litmobDb?: string }).__litmobDb ?? 'pending'
  return NextResponse.json({ ok: true, db, ts: Date.now() })
}
