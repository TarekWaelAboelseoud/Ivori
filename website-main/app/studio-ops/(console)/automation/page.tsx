import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function LegacyAutomationPage() {
  redirect('/studio-ops/internal-ops')
}
