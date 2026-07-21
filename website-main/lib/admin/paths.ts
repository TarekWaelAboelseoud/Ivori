/** Hidden studio console path — set ADMIN_PATH in production env. */
function normalize(path: string): string {
  const p = path.trim().replace(/\/$/, '')
  return p.startsWith('/') ? p : `/${p}`
}

export const ADMIN_PATH = normalize(process.env.ADMIN_PATH || '/studio-ops')

export const ADMIN_API_PATH = normalize(
  process.env.ADMIN_API_PATH || '/api/studio-ops'
)

export function adminPath(subpath = ''): string {
  if (!subpath) return ADMIN_PATH
  return `${ADMIN_PATH}${subpath.startsWith('/') ? subpath : `/${subpath}`}`
}

export function adminApiPath(subpath = ''): string {
  if (!subpath) return ADMIN_API_PATH
  return `${ADMIN_API_PATH}${subpath.startsWith('/') ? subpath : `/${subpath}`}`
}

/** Next.js proxy matcher paths — must stay in sync with ADMIN_PATH / ADMIN_API_PATH */
export function adminProxyMatchers(): string[] {
  return [
    ADMIN_PATH,
    `${ADMIN_PATH}/:path*`,
    ADMIN_API_PATH,
    `${ADMIN_API_PATH}/:path*`,
  ]
}
