import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

/** Legacy alias — settings live at /studio-ops/settings */
export default function LegacySystemPage() {
  redirect('/studio-ops/settings')
}
