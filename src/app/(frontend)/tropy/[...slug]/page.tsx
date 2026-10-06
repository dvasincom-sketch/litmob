import { LandingPage, landingMetadata } from '@/lib/landing'

type Props = { params: Promise<{ slug: string[] }> }

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  return landingMetadata('tropes', slug, '/tropy')
}

export default async function Page({ params }: Props) {
  const { slug } = await params
  return <LandingPage kind="tropes" segments={slug} prefix="/tropy" />
}
