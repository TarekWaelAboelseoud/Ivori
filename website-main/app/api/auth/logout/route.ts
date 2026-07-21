import { NextResponse } from 'next/server'
import { applyAdminNoStoreHeaders } from '@/lib/security/admin-response'
import { CUSTOMER_COOKIE } from '@/lib/auth/cookies'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function DELETE() {
  const res = NextResponse.json({ success: true })
  applyAdminNoStoreHeaders(res.headers)
  res.cookies.set(CUSTOMER_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  })
  return res
}
