import { RichText, type JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'
import type { ComponentProps } from 'react'
import { isOwnUrl } from '@/lib/links'

type LinkNode = { fields: { url?: string; linkType?: string; newTab?: boolean }; children: unknown[] }

/**
 * RichText без ссылок на сторонние сайты: внешняя ссылка выводится обычным текстом
 * (см. src/lib/links.ts). Свои ссылки — как есть.
 */
const converters: JSXConvertersFunction = ({ defaultConverters }) => {
  const render = (kind: 'link' | 'autolink') => (args: { node: unknown; nodesToJSX: (a: { nodes: unknown[] }) => React.ReactNode[] }) => {
    const node = args.node as LinkNode
    const children = args.nodesToJSX({ nodes: node.children })
    const url = node.fields?.url ?? ''
    if (node.fields?.linkType !== 'internal' && !isOwnUrl(url)) return <span>{children}</span>
    const fallback = defaultConverters[kind]
    return typeof fallback === 'function' ? (fallback as (a: unknown) => React.ReactNode)(args) : <a href={url}>{children}</a>
  }
  return { ...defaultConverters, link: render('link'), autolink: render('autolink') } as ReturnType<JSXConvertersFunction>
}

export function SafeRichText(props: Omit<ComponentProps<typeof RichText>, 'converters'>) {
  return <RichText {...props} converters={converters} />
}
