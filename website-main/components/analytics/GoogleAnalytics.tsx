'use client'

import { useEffect, useRef, useState } from 'react'
import Script from 'next/script'
import { usePathname } from 'next/navigation'
import {
  GA_MEASUREMENT_ID,
  isAnalyticsPath,
  trackEvent,
  trackPageView,
} from '@/lib/analytics/ga'

function ensureGtag() {
  window.dataLayer = window.dataLayer || []
  window.gtag =
    window.gtag ||
    function gtag(...args: unknown[]) {
      window.dataLayer?.push(args)
    }
}

export default function GoogleAnalytics() {
  const pathname = usePathname()
  const shouldTrack = isAnalyticsPath(pathname)
  const initialized = useRef(false)
  const lastPagePath = useRef('')
  const [scriptReady, setScriptReady] = useState(false)

  useEffect(() => {
    if (!shouldTrack || initialized.current || !GA_MEASUREMENT_ID) return
    ensureGtag()
    window.gtag?.('js', new Date())
    window.gtag?.('config', GA_MEASUREMENT_ID, { send_page_view: false })
    initialized.current = true
  }, [shouldTrack])

  useEffect(() => {
    if (!shouldTrack || !scriptReady || !GA_MEASUREMENT_ID) return
    const pagePath = `${window.location.pathname}${window.location.search}`
    if (pagePath === lastPagePath.current) return
    lastPagePath.current = pagePath

    trackPageView(pagePath, document.title)

    if (pagePath.startsWith('/work/')) {
      trackEvent('view_work_case_study', { page_path: pagePath })
    } else if (pagePath.startsWith('/notes/')) {
      trackEvent('view_note_article', { page_path: pagePath })
    }
  }, [pathname, scriptReady, shouldTrack])

  useEffect(() => {
    if (!shouldTrack || !scriptReady) return

    function onClick(event: MouseEvent) {
      const target = event.target
      if (!(target instanceof Element)) return
      const anchor = target.closest('a[href]')
      if (!(anchor instanceof HTMLAnchorElement)) return
      if (!anchor.href || anchor.origin === window.location.origin) return
      trackEvent('click_outbound', {
        link_url: anchor.href,
        link_text: anchor.textContent?.trim().slice(0, 80) || undefined,
      })
    }

    document.addEventListener('click', onClick, { capture: true })
    return () => document.removeEventListener('click', onClick, { capture: true })
  }, [scriptReady, shouldTrack])

  if (!shouldTrack || !GA_MEASUREMENT_ID) return null

  return (
    <Script
      id="ga4-gtag"
      src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      strategy="afterInteractive"
      onReady={() => {
        ensureGtag()
        setScriptReady(true)
      }}
    />
  )
}
