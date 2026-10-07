import { notFound } from 'next/navigation'
import { hasLanding, LandingPage, landingMetadata } from '@/lib/landing'
import { joinPath } from '@/lib/paths'

type Props = { params: Promise<{ slug: string[] }> }

/** Раздел 18+: сюжеты (омегаверс), жанры (гаремник) и подборки (/18/podborki/…). */
async function kindOf(slug: string[]) {
  const path = joinPath('/18', ...slug)
  if (await hasLanding('tropes', path)) return 'tropes' as const
  if (await hasLanding('collections', path)) return 'collections' as const
  if (await hasLanding('genres', path)) return 'genres' as const
  return null
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const kind = await kindOf(slug)
  return kind ? landingMetadata(kind, slug, '/18') : {}
}

export default async function Page({ params }: Props) {
  const { slug } = await params
  const kind = await kindOf(slug)
  if (!kind) notFound()
  return <LandingPage kind={kind} segments={slug} prefix="/18" />
}
