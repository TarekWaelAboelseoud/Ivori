import { ImageResponse } from 'next/og'
import { IvoriIconMark } from '@/lib/brand/icon-mark'

export const runtime = 'edge'
export const alt = 'Ivori Digitals — premium ecommerce growth studio · Egypt & MENA'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          background: '#0a0a0a',
          color: '#f5f2ec',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 72, height: 72 }}>
            <IvoriIconMark box={72} />
          </div>
          <p style={{ fontSize: 14, letterSpacing: 6, color: '#c9a96a', textTransform: 'uppercase', margin: 0 }}>
            Ivori Digitals · Cairo · Egypt & MENA
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{ fontSize: 58, fontWeight: 500, lineHeight: 0.98, margin: 0, fontFamily: 'Georgia, serif' }}>
            Ecommerce growth studio
          </p>
          <p style={{ fontSize: 58, fontWeight: 500, lineHeight: 0.98, margin: 0, color: '#c9a96a', fontFamily: 'Georgia, serif' }}>
            Shopify CRO · Meta Ads · Creative
          </p>
        </div>
        <p style={{ fontSize: 22, color: '#a09890', margin: 0 }}>ivoridigitals.com</p>
      </div>
    ),
    { ...size }
  )
}
