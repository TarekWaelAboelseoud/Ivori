import { env } from '@/lib/env'

const fallbackPhone = '201000000000'

export function whatsappHref(message: string) {
  const phone = (env.whatsappNumber || fallbackPhone).replace(/[^\d]/g, '')
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}

