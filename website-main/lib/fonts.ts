import { Cormorant_Garamond, Inter, Noto_Sans_Arabic } from 'next/font/google'

export const fontDisplay = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
})

export const fontSans = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
})

export const fontArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-arabic',
  display: 'swap',
})

export const fontVariables = `${fontDisplay.variable} ${fontSans.variable} ${fontArabic.variable}`
