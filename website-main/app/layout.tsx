import type { Metadata } from 'next'
import { fontVariables, fontDisplay, fontSans, fontArabic } from '@/lib/fonts'
import Atmosphere from '@/components/studio/Atmosphere'
import ScrollRestoration from '@/components/studio/ScrollRestoration'
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics'
import { defaultMetadata, jsonLd, organizationJsonLd } from '@/lib/seo/site'
import './globals.css'

export const metadata: Metadata = defaultMetadata()

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`h-full ${fontVariables}`}
      style={
        {
          '--font-display-fallback': fontDisplay.style.fontFamily,
          '--font-sans-fallback': fontSans.style.fontFamily,
          '--font-arabic-fallback': fontArabic.style.fontFamily,
        } as React.CSSProperties
      }
    >
      <body className={`min-h-full antialiased ${fontSans.className}`}>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('ivori-public-theme');document.documentElement.dataset.publicTheme=t==='ivory'?'ivory':'dark'}catch(e){document.documentElement.dataset.publicTheme='dark'}",
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(organizationJsonLd()) }}
        />
        <Atmosphere />
        <ScrollRestoration />
        <div className="relative z-[1]">{children}</div>
        <GoogleAnalytics />
      </body>
    </html>
  )
}
