import type { NextConfig } from 'next'
import path from 'path'
import { securityHeaders } from './lib/security/headers'

const nextConfig: NextConfig = {
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  turbopack: {
    root: path.resolve(__dirname),
  },
  async headers() {
    return [{ source: '/:path*', headers: [...securityHeaders] }]
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'ivoridigitals.com' }],
        destination: 'https://www.ivoridigitals.com/:path*',
        permanent: true,
      },
      { source: '/favicon.ico', destination: '/icon/32', permanent: false },
      { source: '/approach', destination: '/process', permanent: true },
    ]
  },
}

export default nextConfig
