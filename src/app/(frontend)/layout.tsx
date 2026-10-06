import type { Metadata, Viewport } from 'next'
import React from 'react'
import { BottomNav, SiteFooter, SiteHeader } from '@/components/SiteHeader'
import { SITE_URL } from '@/lib/payload'
import './globals.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'Литмоб — истории о любви и драконах, которые хочется слушать', template: '%s' },
  description:
    'Развод с драконом, истинная пара, попаданка, бытовое фэнтези: книги и аудиокниги по сюжетам. Первая глава бесплатно, профессиональные чтецы, литмобы авторов.',
  openGraph: { siteName: 'Литмоб', locale: 'ru_RU', type: 'website' },
}

export const viewport: Viewport = { themeColor: '#3A1424', width: 'device-width', initialScale: 1 }

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-cream pb-16 md:pb-0">
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
        <BottomNav />
      </body>
    </html>
  )
}
