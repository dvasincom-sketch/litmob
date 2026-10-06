import Link from 'next/link'
import { SITE_URL } from '@/lib/payload'
import { JsonLd } from './JsonLd'

export type Crumb = { label: string; href: string }

export function Breadcrumbs({ items, light = false }: { items: Crumb[]; light?: boolean }) {
  const all = [{ label: 'Главная', href: '/' }, ...items]
  return (
    <>
      <nav aria-label="Хлебные крошки" className={`text-xs ${light ? 'text-blush' : 'text-muted'}`}>
        {all.map((c, i) => (
          <span key={c.href} className={i > 0 && i < all.length - 2 ? 'hidden md:inline' : undefined}>
            {i > 0 && ' › '}
            {i < all.length - 1 ? <Link href={c.href}>{c.label}</Link> : <span>{c.label}</span>}
          </span>
        ))}
      </nav>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: all.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.label, item: `${SITE_URL}${c.href}` })),
        }}
      />
    </>
  )
}
