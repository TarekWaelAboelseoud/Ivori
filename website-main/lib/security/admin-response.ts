import { NextResponse } from 'next/server'

export const ADMIN_PRIVATE_CACHE = 'private, no-store, no-cache, max-age=0, must-revalidate'

export function applyAdminNoStoreHeaders(headers: Headers) {
  headers.set('Cache-Control', ADMIN_PRIVATE_CACHE)
  headers.set('Vary', 'Cookie, Authorization')
  headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive')
}

export function adminJson<T>(body: T, init?: ResponseInit) {
  const res = NextResponse.json(body, init)
  applyAdminNoStoreHeaders(res.headers)
  return res
}
