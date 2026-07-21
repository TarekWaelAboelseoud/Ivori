export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-3V577VGD8Y'

type GtagCommand = 'js' | 'config' | 'event' | 'set' | 'consent'
type GtagValue = string | Date | Record<string, unknown>

declare global {
  interface Window {
    dataLayer?: unknown[][]
    gtag?: (command: GtagCommand, target: GtagValue, params?: Record<string, unknown>) => void
  }
}

export function isAnalyticsPath(pathname: string | null | undefined) {
  if (!pathname) return false
  return !(
    pathname.startsWith('/studio-ops') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api')
  )
}

export function trackPageView(path: string, title?: string) {
  if (typeof window === 'undefined' || !window.gtag || !GA_MEASUREMENT_ID) return
  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title || document.title,
    page_location: window.location.href,
  })
}

export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined' || !window.gtag || !GA_MEASUREMENT_ID) return
  window.gtag('event', name, params)
}
