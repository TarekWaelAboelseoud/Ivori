import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function LegacyPartnershipsPage() {
  redirect('/studio-ops/inquiries')
}
