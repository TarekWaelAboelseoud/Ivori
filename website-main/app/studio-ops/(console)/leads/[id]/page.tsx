import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function LegacyLeadDetailPage() {
  redirect('/studio-ops/inquiries')
}
