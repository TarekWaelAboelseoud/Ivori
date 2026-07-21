'use client'

import Nav from '@/components/Nav'
import Footer from '@/components/studio/Footer'
import MotionHeading from '@/components/studio/MotionHeading'
import ChapterLabel from '@/components/studio/ChapterLabel'
import InquiryFlow, { type InquiryPayload } from '@/components/studio/InquiryFlow'

export default function ContactClient() {
  async function handleSubmit(data: InquiryPayload) {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        brand: data.brand,
        about: data.about,
        needs: data.needs.join(', '),
        contact: data.contact,
        goals: data.goals,
        project_type: data.project_type,
        project_stage: data.project_stage,
        budget_range: data.budget_range,
        timeline: data.timeline,
        pain_points: data.pain_points,
        revenue_band: data.revenue_band,
        preferred_contact_method: data.preferred_contact_method,
        whatsapp: data.whatsapp,
        instagram: data.instagram,
      }),
    })
    const result = (await res.json().catch(() => ({}))) as { error?: string }
    if (!res.ok) throw new Error(result.error || 'Could not send your brief. Try email instead.')
  }

  return (
    <>
      <Nav />
      <main className="max-w-full overflow-hidden bg-[var(--background)]">
        <section className="relative border-b border-[var(--border)]">
          <div className="mx-auto max-w-2xl px-[var(--gutter)] pb-12 pt-[calc(var(--header-height)+4.5rem)] sm:pb-16">
            <ChapterLabel tone="gold">Studio inquiry</ChapterLabel>
            <MotionHeading as="h1" size="lg" className="mt-6">
              Begin the
              <br />
              <em>conversation.</em>
            </MotionHeading>
            <p className="mt-4 max-w-[20rem] text-sm leading-7 text-[var(--text-body)] [overflow-wrap:anywhere] sm:max-w-md">
              A focused brief for ecommerce growth, Shopify CRO, Meta Ads, and performance creative projects in Egypt and MENA.
            </p>
          </div>
        </section>

        <div className="mx-auto w-full max-w-2xl px-[var(--gutter)] pb-32 pt-10">
          <InquiryFlow onSubmit={handleSubmit} />
          <p className="mt-16 border-t border-[var(--border)] pt-8 text-xs text-[var(--text-dim)]">
            Prefer email?{' '}
            <a href="mailto:hello@ivoridigitals.com" className="text-[var(--text-label)] hover:text-[var(--foreground)]">
              hello@ivoridigitals.com
            </a>
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}
