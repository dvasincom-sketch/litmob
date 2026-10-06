import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

/**
 * OG-картинка 1200×630 для соцсетей и мессенджеров: /og/?t=Заголовок&k=Подпись.
 * Шрифт Prata (кириллица) берём из @fontsource — он уже в зависимостях.
 */
export const dynamic = 'force-dynamic'

let fonts: Promise<{ name: string; data: Buffer; style: 'normal'; weight: 400 }[]> | null = null
function loadFonts() {
  if (!fonts) {
    const dir = path.join(process.cwd(), 'node_modules/@fontsource/prata/files')
    fonts = Promise.all(
      [['PrataLat', 'prata-latin-400-normal.woff'], ['PrataCyr', 'prata-cyrillic-400-normal.woff']].map(async ([name, f]) => ({
        name, data: await readFile(path.join(dir, f)), style: 'normal' as const, weight: 400 as const,
      })),
    )
  }
  return fonts
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const title = (searchParams.get('t') || 'Истории о любви и драконах, которые хочется слушать').slice(0, 120)
  const kicker = (searchParams.get('k') || 'Книги и аудиокниги').slice(0, 40)
  const size = title.length > 70 ? 56 : title.length > 40 ? 66 : 78

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '64px 72px', background: 'linear-gradient(135deg, #57223A 0%, #3A1424 60%, #2A0E1A 100%)', color: '#FFFFFF', fontFamily: 'PrataLat, PrataCyr' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: '#9C2B4E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>Л</div>
          <div style={{ fontSize: 40 }}>Литмоб</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div style={{ fontSize: 26, letterSpacing: 4, textTransform: 'uppercase', color: '#F2A7C3' }}>{kicker}</div>
          <div style={{ fontSize: size, lineHeight: 1.12, maxWidth: 1000 }}>{title}</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 26, color: '#F0D6DE' }}>
          <div>Первая глава бесплатно · профессиональные чтецы</div>
          <div>litmob.ru</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630, fonts: await loadFonts(), headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=604800' } },
  )
}
