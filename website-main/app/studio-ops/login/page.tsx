import { Suspense } from 'react'
import { connection } from 'next/server'
import LoginForm from './LoginForm'
import '../admin.css'

export const metadata = { robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export default async function LoginPage() {
  await connection()

  return (
    <main className="admin-panel flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="admin-label">Ivori Digitals</p>
          <h1 className="mt-2 text-2xl font-semibold text-[var(--admin-ivory)]">Console</h1>
        </div>
        <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6">
          <Suspense fallback={<p className="text-sm text-zinc-500">Loading…</p>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  )
}
