import { ImageResponse } from 'next/og'
import { IvoriIconMark } from '@/lib/brand/icon-mark'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'
export const alt = 'Ivori Digitals Apple touch icon'

export default function AppleIcon() {
  return new ImageResponse(<IvoriIconMark box={180} />, size)
}
