import type { Metadata, Viewport } from 'next'
import React from 'react'
import { PlayerProvider } from '@/components/Player'
import { BottomNav, SiteFooter, SiteHeader } from '@/components/SiteHeader'
import { SITE_URL } from '@/lib/payload'
import { YandexMetrika } from '@/components/YandexMetrika'
import './globals.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: 'Литмоб',
  title: { default: 'Любовное фэнтези: книги и аудиокниги по сюжетам | Литмоб', template: '%s' },
  description:
    'Развод с драконом, истинная пара, попаданка, бытовое фэнтези: книги и аудиокниги по сюжетам. Первая глава бесплатно, профессиональные чтецы, литмобы авторов.',
  openGraph: { siteName: 'Литмоб', locale: 'ru_RU', type: 'website', images: [{ url: '/og/', width: 1200, height: 630 }] },
  twitter: { card: 'summary_large_image' },
  formatDetection: { telephone: false, email: false, address: false },
  // Коды подтверждения: Яндекс Вебмастер и Google Search Console (переменные окружения).
  verification: {
    ...(process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : {}),
    ...(process.env.YANDEX_VERIFICATION ? { yandex: process.env.YANDEX_VERIFICATION } : {}),
  },
}

export const viewport: Viewport = { themeColor: '#3A1424', width: 'device-width', initialScale: 1 }

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-cream pb-16 md:pb-0">
        <PlayerProvider>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
          <BottomNav />
        </PlayerProvider>
        <YandexMetrika />
      </body>
    </html>
  )
}
