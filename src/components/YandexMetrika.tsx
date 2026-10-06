'use client'

import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useRef } from 'react'

/**
 * Яндекс Метрика на публичных страницах (layout группы (frontend); админка не входит).
 * Счётчик грузится один раз; при переходах внутри сайта (без перезагрузки страницы)
 * отправляем hit вручную — иначе Метрика видела бы только первую страницу визита.
 * Включён только в продакшене, чтобы локальная разработка не портила статистику.
 */
export const YM_ID = Number(process.env.NEXT_PUBLIC_YM_ID || 113484327)

declare global {
  interface Window {
    ym?: (id: number, action: string, ...args: unknown[]) => void
  }
}

function Hits() {
  const pathname = usePathname()
  const search = useSearchParams()
  const prev = useRef<string | null>(null)
  useEffect(() => {
    const url = `${pathname}${search?.toString() ? `?${search}` : ''}`
    if (prev.current === null) {
      prev.current = url // первый просмотр Метрика считает сама при init
      return
    }
    if (prev.current === url) return
    window.ym?.(YM_ID, 'hit', window.location.href, { referer: `${window.location.origin}${prev.current}`, title: document.title })
    prev.current = url
  }, [pathname, search])
  return null
}

export function YandexMetrika() {
  if (process.env.NODE_ENV !== 'production' || !YM_ID) return null
  return (
    <>
      <Script id="yandex-metrika" strategy="afterInteractive">
        {`(function(m,e,t,r,i,k,a){
    m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
    m[i].l=1*new Date();
    for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
    k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
})(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=${YM_ID}', 'ym');
ym(${YM_ID}, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});`}
      </Script>
      <noscript>
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`https://mc.yandex.ru/watch/${YM_ID}`} style={{ position: 'absolute', left: '-9999px' }} alt="" />
        </div>
      </noscript>
      <Suspense fallback={null}>
        <Hits />
      </Suspense>
    </>
  )
}
