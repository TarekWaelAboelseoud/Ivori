import Link from 'next/link'
import { CheckCircle2, Clock, Mail } from 'lucide-react'

export default function SuccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-4 py-12">
      <div className="w-full max-w-lg text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-[#2a2722] bg-[#11100e]">
          <CheckCircle2 className="h-7 w-7 text-[#c9a96a]" />
        </div>

        <h1 className="text-3xl font-semibold tracking-tight text-[#f5f2ec]">Payment confirmed.</h1>
        <p className="mt-3 text-sm leading-6 text-[#a8a29a]">
          Your Ivori order is booked. Check your email for the intake form link so we can understand the store and start the right next step.
        </p>

        <div className="mt-10 grid gap-px overflow-hidden border border-[#2a2722] bg-[#2a2722] text-left">
          {[
            {
              icon: Mail,
              title: 'Complete the intake form',
              desc: 'The form takes about 5 minutes and gives us your store URL, traffic context, and current concerns.',
            },
            {
              icon: Clock,
              title: 'Clear next step after intake',
              desc: 'Quick reviews and audits are delivered within 48 hours. Implementation scopes are confirmed directly after we review the context.',
            },
          ].map((item) => {
            const Icon = item.icon
            return (
              <div key={item.title} className="flex gap-4 bg-[#11100e] p-5">
                <Icon className="mt-1 h-5 w-5 flex-shrink-0 text-[#c9a96a]" />
                <div>
                  <p className="text-sm font-semibold text-[#f5f2ec]">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-[#a8a29a]">{item.desc}</p>
                </div>
              </div>
            )
          })}
        </div>

        <p className="mt-8 text-xs leading-5 text-[#756b5d]">
          Did not get the email? Check spam or{' '}
          <a href="mailto:hello@ivoridigitals.com" className="text-[#c9a96a] underline">
            contact us
          </a>
          .
        </p>

        <Link href="/" className="mt-8 inline-block text-sm text-[#756b5d] underline hover:text-[#f5f2ec]">
          Back to home
        </Link>
      </div>
    </main>
  )
}
