import type { Metadata, Viewport } from 'next'
import Link from 'next/link'
import React from 'react'
import { SITE_URL } from '@/lib/payload'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'Литмоб — книги и аудиокниги по любимому сюжету', template: '%s' },
  description:
    'Развод с драконом, истинная пара, попаданка, бытовое фэнтези: книги и аудиокниги по сюжетам. Первая глава бесплатно, профессиональные чтецы, литмобы авторов.',
  openGraph: { siteName: 'Литмоб', locale: 'ru_RU', type: 'website' },
}

export const viewport: Viewport = { themeColor: '#3A1424', width: 'device-width', initialScale: 1 }

const NAV = [
  { href: '/tropy/', label: 'Сюжеты' },
  { href: '/litmoby/', label: 'Литмобы' },
  { href: '/chtecy/', label: 'Чтецы' },
]

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-cream">
        <header className="bg-wine text-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
            <Link href="/" className="font-display text-2xl tracking-tight no-underline">
              Литмоб
            </Link>
            <nav aria-label="Основное меню" className="flex gap-4 text-sm text-blush">
              {NAV.map((n) => (
                <Link key={n.href} href={n.href} className="hover:text-white">
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 pb-16">{children}</main>
        <footer className="border-t border-line bg-white/60">
          <div className="mx-auto flex max-w-5xl flex-wrap gap-x-6 gap-y-2 px-4 py-6 text-sm text-muted">
            <span>© Литмоб</span>
            <Link href="/pravoobladatelyam/">Правообладателям</Link>
            <Link href="/litmoby/pravila/">Правила литмобов</Link>
          </div>
        </footer>
      </body>
    </html>
  )
}
