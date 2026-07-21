import { notFound } from 'next/navigation'

export const metadata = {
  robots: { index: false, follow: false },
}

/** Decoy — studio console moved; do not expose legacy /admin surface. */
export default function AdminDecoyPage() {
  notFound()
}
