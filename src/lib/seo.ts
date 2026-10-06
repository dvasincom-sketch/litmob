import type { Metadata } from 'next'
import { SITE_URL } from './payload'

type SeoDoc = {
  title?: string | null
  name?: string | null
  h1?: string | null
  lead?: string | null
  path?: string | null
  meta?: { title?: string | null; description?: string | null } | null
}

/** Title/description/canonical + noindex для «тонких» страниц (меньше N книг). */
export function buildMetadata(doc: SeoDoc, opts: { fallbackTitle?: string; indexable?: boolean } = {}): Metadata {
  const base = doc.h1 || doc.title || doc.name || ''
  const title = doc.meta?.title || opts.fallbackTitle || `${base} — Литмоб`
  const description = doc.meta?.description || doc.lead?.slice(0, 200) || undefined
  const url = `${SITE_URL}${doc.path || '/'}`
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url },
    robots: opts.indexable === false ? { index: false, follow: true } : undefined,
  }
}
