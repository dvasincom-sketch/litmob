import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/** Health-check для контейнера: процесс жив и отвечает. */
export function GET() {
  return NextResponse.json({ ok: true, ts: Date.now() })
}
