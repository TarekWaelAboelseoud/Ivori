/** Soft hero wash — single gradient, no orb boxes */
export default function HeroAtmosphere({ className = '' }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden
      style={{
        background:
          'radial-gradient(ellipse 90% 70% at 50% 35%, color-mix(in srgb, var(--gold) 8%, transparent) 0%, transparent 62%)',
      }}
    />
  )
}
