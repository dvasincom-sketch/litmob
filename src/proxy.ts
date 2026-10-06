import { NextResponse, type NextRequest } from 'next/server'

/**
 * www.litmob.ru → litmob.ru (301). Вход и CSRF Payload привязаны к одному
 * адресу (NEXT_PUBLIC_SITE_URL), поэтому сайт должен жить на одном хосте.
 */
export function proxy(req: NextRequest) {
  const host = (req.headers.get('x-forwarded-host') || req.headers.get('host') || '').split(',')[0].trim()
  if (host.startsWith('www.')) {
    const url = new URL(req.nextUrl.pathname + req.nextUrl.search, `https://${host.slice(4)}`)
    return NextResponse.redirect(url, 301)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|api/health).*)'],
}
