import type { Metadata } from 'next'
import { connection } from 'next/server'
import AdminShell from '@/components/admin/ops/AdminShell'
import { getCurrentAdminRole } from '@/lib/admin/permissions'
import '../admin.css'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export const metadata: Metadata = {
  title: 'Console',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await connection()
  const role = await getCurrentAdminRole()

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html:
            "try{var t=localStorage.getItem('ivori-admin-theme');document.documentElement.dataset.adminTheme=t==='light'?'light':'dark'}catch(e){}",
        }}
      />
      <AdminShell role={role}>{children}</AdminShell>
    </>
  )
}
