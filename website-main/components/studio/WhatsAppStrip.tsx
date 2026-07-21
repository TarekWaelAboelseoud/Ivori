import { MessageCircle } from 'lucide-react'
import { env } from '@/lib/env'
import { whatsappHref } from '@/lib/contact'

/** Premium footer strip — not a floating popup widget */
export default function WhatsAppStrip({
  message,
  label,
}: {
  message: string
  label: string
}) {
  const channel = process.env.NEXT_PUBLIC_WHATSAPP_CHANNEL || 'footer'
  if (channel === 'off' || !env.whatsappNumber) return null

  return (
    <div
      className="whatsapp-strip fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-[var(--background)]"
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      <a
        href={whatsappHref(message)}
        className="mx-auto flex max-w-lg items-center justify-center gap-2 px-[var(--gutter)] py-3 text-sm text-[var(--text-body)] transition-colors hover:text-[var(--foreground)]"
        rel="noopener noreferrer"
        target="_blank"
      >
        <MessageCircle className="h-4 w-4 shrink-0 text-[var(--gold)]" aria-hidden />
        <span>{label}</span>
      </a>
    </div>
  )
}
