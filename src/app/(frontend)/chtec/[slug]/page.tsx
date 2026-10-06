import { PersonPage, personMetadata } from '@/components/PersonPage'

type Props = { params: Promise<{ slug: string }> }
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props) {
  return personMetadata('narrators', (await params).slug)
}

export default async function Page({ params }: Props) {
  return <PersonPage kind="narrators" slug={(await params).slug} />
}
