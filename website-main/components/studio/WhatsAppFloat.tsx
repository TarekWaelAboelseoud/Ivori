import { MessageCircle } from 'lucide-react'
import { whatsappHref } from '@/lib/contact'

export default function WhatsAppFloat() {
  return (
    <a
      href={whatsappHref('Hi Ivori Digitals, I want help improving my ecommerce store.')}
      className="fixed bottom-6 right-4 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/40 transition-transform hover:-translate-y-0.5 sm:right-6"
      style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="Chat with Ivori Digitals on WhatsApp"
    >
      <MessageCircle className="h-5 w-5" />
    </a>
  )
}
