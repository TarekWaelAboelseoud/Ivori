import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function LegacyHighPriorityPage() {
  redirect('/studio-ops/internal-ops')
}
