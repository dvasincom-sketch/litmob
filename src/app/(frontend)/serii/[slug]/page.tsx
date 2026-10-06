import { PersonPage, personMetadata } from '@/components/PersonPage'

type Props = { params: Promise<{ slug: string }> }
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props) {
  return personMetadata('series', (await params).slug)
}

export default async function Page({ params }: Props) {
  return <PersonPage kind="series" slug={(await params).slug} />
}
