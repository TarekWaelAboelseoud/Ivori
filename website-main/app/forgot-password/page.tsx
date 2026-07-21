import ForgotPasswordClient from './ForgotPasswordClient'

export const metadata = { robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export default function ForgotPasswordPage() {
  return (
    <main
      className="flex min-h-screen items-center justify-center px-4"
      style={{ background: 'var(--background)', color: 'var(--foreground)' }}
    >
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--text-label)' }}>
            Ivori Digitals
          </p>
          <h1 className="mt-2 text-2xl font-semibold" style={{ color: 'var(--ivory)', fontFamily: 'var(--font-display)' }}>
            Reset your password
          </h1>
        </div>
        <div className="rounded-xl border p-6" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
          <ForgotPasswordClient />
        </div>
      </div>
    </main>
  )
}
