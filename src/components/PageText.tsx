import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Page } from '@/payload-types'
import { getPayloadClient } from '@/lib/payload'
import { Faq } from './Faq'

/** Текст и FAQ из коллекции «Страницы» для каталожных разделов (/tropy/, /zhanr/, /audio/ …). */
export async function getPageDoc(path: string) {
  const payload = await getPayloadClient()
  const r = await payload.find({ collection: 'pages', where: { and: [{ path: { equals: path } }, { published: { equals: true } }] }, limit: 1, depth: 0 })
  return (r.docs[0] as Page | undefined) ?? null
}

export function PageBody({ page, faqTitle }: { page: Page | null; faqTitle?: string }) {
  if (!page) return null
  return (
    <>
      {page.body && (
        <section className="prose-lm mt-10">
          <RichText data={page.body} />
        </section>
      )}
      <Faq items={page.faq} title={faqTitle} />
    </>
  )
}
