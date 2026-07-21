import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function LegacyOutreachPage() {
  redirect('/studio-ops/inquiries')
}
