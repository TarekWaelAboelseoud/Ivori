import { ImageResponse } from 'next/og'
import { IvoriIconMark } from '@/lib/brand/icon-mark'

const iconSizes = {
  32: { width: 32, height: 32 },
  192: { width: 192, height: 192 },
  512: { width: 512, height: 512 },
} as const

export function generateImageMetadata() {
  return Object.entries(iconSizes).map(([id, size]) => ({
    id,
    size,
    contentType: 'image/png',
    alt: 'Ivori Digitals icon',
  }))
}

export default async function Icon({ id }: { id: Promise<string | number> }) {
  const iconId = Number(await id)
  const size = iconSizes[iconId as keyof typeof iconSizes] ?? iconSizes[32]

  return new ImageResponse(<IvoriIconMark box={size.width} />, size)
}
