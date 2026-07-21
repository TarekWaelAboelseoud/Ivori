import { notFound, redirect } from 'next/navigation'
import { getDb } from '@/lib/supabase-server'
import IntakeForm from './IntakeForm'

export default async function OrderPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams

  if (!token) redirect('/contact')

  const supabase = getDb()
  if (!supabase) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-xl border border-[#2a2722] bg-[#11100e] p-6 text-center sm:p-8">
          <h1 className="text-2xl font-semibold text-[#f5f2ec]">Intake is not configured locally.</h1>
          <p className="mt-3 text-sm leading-6 text-[#a8a29a]">
            Add Supabase env vars to use intake links, or contact Ivori Digitals to create the order manually.
          </p>
        </div>
      </main>
    )
  }
  const { data: order } = await supabase
    .from('orders')
    .select('id, tier, region, status')
    .eq('intake_token', token)
    .single()

  if (!order) notFound()

  const alreadySubmitted = order.status === 'intake_received'

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-xl">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#c9a96a]">
            Intake form
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[#f5f2ec]">
            Tell us about your store
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#a8a29a]">
            This takes about 5 minutes. The more context you give us, the more specific and actionable the review or implementation scope will be.
          </p>
        </div>

        {alreadySubmitted ? (
          <div className="border border-[#2a2722] bg-[#11100e] px-6 py-8 text-center">
            <p className="font-semibold text-[#f5f2ec]">Intake already submitted</p>
            <p className="mt-2 text-sm leading-6 text-[#a8a29a]">
              We have already received your intake form. Your review or next-step scope is in progress.
            </p>
          </div>
        ) : (
          <div className="border border-[#2a2722] bg-[#11100e] p-5 sm:p-8">
            <IntakeForm token={token} tier={order.tier} region={order.region} />
          </div>
        )}
      </div>
    </main>
  )
}
