/** Shared Ivori monogram for ImageResponse (OG, favicon routes). Serif “I” — not a framework triangle. */
export function IvoriIconMark({ box = 512 }: { box?: number }) {
  const border = Math.max(2, Math.round(box * 0.045))
  const radius = Math.round(box * 0.14)
  const fontSize = Math.round(box * 0.48)

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#080807',
        border: `${border}px solid #c9a96a`,
        borderRadius: radius,
      }}
    >
      <span
        style={{
          color: '#c9a96a',
          fontSize,
          fontWeight: 500,
          fontFamily: 'Georgia, "Times New Roman", serif',
          lineHeight: 1,
          marginTop: Math.round(box * 0.04),
        }}
      >
        I
      </span>
    </div>
  )
}
