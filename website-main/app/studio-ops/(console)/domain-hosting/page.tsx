import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function LegacyDomainHostingPage() {
  redirect('/studio-ops/internal-ops')
}
