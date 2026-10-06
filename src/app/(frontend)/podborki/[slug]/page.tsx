import { LandingPage, landingMetadata } from '@/lib/landing'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  return landingMetadata('collections', [(await params).slug], '/podborki')
}

export default async function Page({ params }: Props) {
  return <LandingPage kind="collections" segments={[(await params).slug]} prefix="/podborki" />
}
