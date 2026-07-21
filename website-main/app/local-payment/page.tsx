import Link from 'next/link'
import { ArrowLeft, Mail, MessageCircle } from 'lucide-react'
import { env } from '@/lib/env'

const methods = [
  ['Instapay', env.instapayHandle],
  ['Vodafone Cash / mobile wallet', env.vodafoneCashNumber],
  ['Bank transfer', env.bankTransferText],
]

export default function LocalPaymentPage() {
  const whatsappHref = env.whatsappNumber
    ? `https://wa.me/${env.whatsappNumber.replace(/[^\d]/g, '')}?text=${encodeURIComponent('Hi Ivori Digitals, I want to pay locally for ecommerce growth support.')}`
    : ''

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-4 py-12 text-[#f5f2ec] sm:py-16">
      <div className="mx-auto max-w-3xl">
        <Link href="/contact" className="inline-flex items-center gap-2 text-sm text-[#a8a29a] hover:text-[#f5f2ec]">
          <ArrowLeft className="h-4 w-4" />
          Back to contact
        </Link>

        <div className="mt-10 border border-[#2a2722] bg-[#11100e] p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#c9a96a]">Local payment</p>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
            Pay Ivori Digitals locally.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[#a8a29a]">
            If card checkout is not convenient, we can book your review, implementation project, or growth partnership manually through Instapay, Vodafone Cash, mobile wallet, or bank transfer.
          </p>

          <div className="mt-8 grid gap-px overflow-hidden border border-[#2a2722] bg-[#2a2722]">
            {[
              'Choose your next step: Quick Review, Deep Audit, Growth Fix Sprint, or Monthly Growth Partner.',
              'Contact Ivori Digitals and ask for local payment details.',
              'Pay through Instapay, Vodafone Cash, wallet, or bank transfer.',
              'Send the payment screenshot or confirmation.',
              'We manually create your order and send the intake link or next-step details.',
            ].map((step, index) => (
              <div key={step} className="flex gap-4 bg-[#0a0a0a] p-5">
                <span className="text-sm font-semibold text-[#c9a96a]">0{index + 1}</span>
                <p className="text-sm leading-6 text-[#d8d0c3]">{step}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {methods.map(([label, value]) => (
              <div key={label} className="border border-[#2a2722] bg-[#0a0a0a] p-4">
                <p className="text-sm font-semibold">{label}</p>
                <p className="mt-2 text-sm leading-6 text-[#a8a29a]">
                  {value || 'Contact us to receive local payment details.'}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {whatsappHref && (
              <a href={whatsappHref} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#f5f2ec] px-6 py-3 text-sm font-semibold text-[#0a0a0a] hover:bg-white">
                <MessageCircle className="h-4 w-4" />
                Contact on WhatsApp
              </a>
            )}
            <a
              href={`mailto:${env.contactEmail}?subject=${encodeURIComponent('Local payment for Ivori Digitals growth support')}`}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-[#3a352e] px-6 py-3 text-sm font-semibold text-[#f5f2ec] hover:border-[#c9a96a]"
            >
              <Mail className="h-4 w-4" />
              Email payment request
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}
