import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Page as PageDoc } from '@/payload-types'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { Faq } from '@/components/Faq'
import { Wrap } from '@/components/Wrap'
import { AudioHub } from '@/components/AudioHub'
import { LitmobTheme } from '@/components/LitmobTheme'
import { hasLanding, LandingPage, landingMetadata } from '@/lib/landing'
import { getPayloadClient } from '@/lib/payload'
import { joinPath } from '@/lib/paths'
import { brand, buildMetadata, cap, fitTitle, low, sentences } from '@/lib/seo'

type Props = { params: Promise<{ path: string[] }> }

/** Страницы со своей вёрсткой: данные из каталога + текст страницы из админки. */
const SPECIAL: Record<string, (props: { page: PageDoc }) => Promise<React.ReactElement> | React.ReactElement> = {
  '/audio/': AudioHub,
}

/**
 * Всё, у чего адрес задаётся целиком: контентные страницы (/chtecam/, /avtoram/…),
 * подборки со своим адресом (/pohozhie/) и жанры вне /zhanr/ (/audio/rasskazy/).
 */
async function resolve(segments: string[]) {
  const path = joinPath(...segments)
  const payload = await getPayloadClient()
  const page = await payload.find({ collection: 'pages', where: { and: [{ published: { equals: true } }, { path: { equals: path } }] }, limit: 1, depth: 0 })
  if (page.docs[0]) return { type: 'page' as const, page: page.docs[0] as PageDoc }
  if (await hasLanding('collections', path)) return { type: 'collections' as const }
  if (await hasLanding('genres', path)) return { type: 'genres' as const }
  if (await hasLanding('tropes', path)) return { type: 'tropes' as const }
  return null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { path } = await params
  const r = await resolve(path)
  if (!r) return {}
  if (r.type === 'page') {
    const h1 = r.page.h1 || r.page.title
    const q = r.page.mainQuery || ''
    // Главный запрос — в начало title, если его нет в H1.
    let title = q && !h1.toLowerCase().includes(q.toLowerCase()) ? `${cap(q)} — ${low(h1)}` : h1
    if (title.length > 70) title = h1
    if (title.length < 30) title = fitTitle(title.includes('Литмоб') ? `${title}: книги и аудиокниги любовного фэнтези` : `${title} — Литмоб, книги и аудиокниги любовного фэнтези`, `${title}: гид Литмоба`, title)
    const tail: Record<string, string> = {
      authors: 'Гид Литмоба для авторов: публикация, литмобы, озвучка книг',
      narrators: 'Гид Литмоба для чтецов: как начать озвучивать книги и зарабатывать',
      article: 'Литмоб — книги и аудиокниги любовного фэнтези по сюжетам',
      service: 'Литмоб — книги и аудиокниги любовного фэнтези по сюжетам',
    }
    const lead = r.page.lead || ''
    const description = lead.length >= 110 ? lead : sentences(lead || h1, tail[r.page.section || 'service'])
    return buildMetadata(r.page, { title: brand(title), description, kicker: 'Литмоб' })
  }
  return landingMetadata(r.type, path, '')
}

export default async function CatchAll({ params }: Props) {
  const { path } = await params
  const r = await resolve(path)
  if (!r) notFound()
  if (r.type !== 'page') return <LandingPage kind={r.type} segments={path} prefix="" />
  const p = r.page
  const Special = p.path ? SPECIAL[p.path] || (p.path.startsWith('/litmoby/temy/') ? LitmobTheme : undefined) : undefined
  if (Special) return <Special page={p} />
  return (
    <article>
      <header className="on-dark bg-wine text-white">
        <Wrap className="flex flex-col gap-3.5 pb-6 pt-3.5 md:pb-10 md:pt-6">
          <Breadcrumbs items={[{ label: p.title, href: p.path || '/' }]} light />
          <h1 className="max-w-4xl text-[28px] md:text-[44px]">{p.h1 || p.title}</h1>
          {p.lead && <p className="max-w-3xl text-blush">{p.lead}</p>}
          {p.cta?.href && p.cta.label && (
            <Link href={p.cta.href} className="self-start rounded-xl bg-white px-[18px] py-3 font-semibold text-wine">
              {p.cta.label}
            </Link>
          )}
        </Wrap>
      </header>
      <Wrap className="pb-12">
        {p.body ? (
          <section className="prose-lm mt-8">
            <RichText data={p.body} />
          </section>
        ) : (
          <p className="mt-8 text-sm text-muted">Текст страницы готовится.</p>
        )}
        <Faq items={p.faq} />
      </Wrap>
    </article>
  )
}
