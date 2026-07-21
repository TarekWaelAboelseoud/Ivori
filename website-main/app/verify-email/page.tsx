import Link from 'next/link'
import { consumeVerificationToken } from '@/lib/auth/verification-tokens'
import { markCustomerEmailVerified } from '@/lib/auth/customers'

export const metadata = { robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams
  let success = false

  if (token) {
    const consumed = await consumeVerificationToken(token, 'email_verification')
    if (consumed && consumed.accountType === 'customer') {
      await markCustomerEmailVerified(consumed.accountId)
      success = true
    }
  }

  return (
    <main
      className="flex min-h-screen items-center justify-center px-4 text-center"
      style={{ background: 'var(--background)', color: 'var(--foreground)' }}
    >
      <div className="w-full max-w-sm">
        <p className="text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--text-label)' }}>
          Ivori Digitals
        </p>
        <h1
          className="mt-2 text-2xl font-semibold"
          style={{ color: 'var(--ivory)', fontFamily: 'var(--font-display)' }}
        >
          {success ? 'Email verified' : 'Link invalid or expired'}
        </h1>
        <p className="mt-4 text-sm" style={{ color: 'var(--text-body)' }}>
          {success
            ? 'Your email address has been confirmed.'
            : 'This verification link is invalid or has expired. You can request a new one from your account page.'}
        </p>
        <Link
          href="/portal"
          className="mt-8 inline-block rounded-lg px-5 py-2.5 text-sm font-medium"
          style={{ background: 'var(--gold)', color: 'var(--void)' }}
        >
          Go to your account
        </Link>
      </div>
    </main>
  )
}
