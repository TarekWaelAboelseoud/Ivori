'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { trackEvent } from '@/lib/analytics/ga'
import MotionHeading from './MotionHeading'
import StudioCTA from './StudioCTA'

const steps = ['Brand', 'Scope', 'Fit', 'Contact'] as const

const needsOptions = ['CRO', 'AI production', 'Media buying', 'Shopify', 'Full partnership', 'Exploring']
const projectTypes = ['Fashion / apparel', 'Beauty / skincare', 'Lifestyle / DTC', 'Electronics', 'Other ecommerce']
const brandStages = ['Pre-launch', 'Early DTC', 'Scaling paid traffic', 'Established · optimizing']
const timelines = ['ASAP', '4–8 weeks', '2–3 months', 'Flexible']
const budgetRanges = ['Under 250k EGP', '250k – 750k EGP', '750k – 2M EGP', '2M+ EGP', 'Prefer to discuss']
const revenueBands = ['Pre-revenue', 'Under 500k EGP/mo', '500k – 2M EGP/mo', '2M+ EGP/mo', 'Prefer not to say']
const contactMethods = ['Email', 'WhatsApp', 'Either']

export interface InquiryPayload {
  brand: string
  about?: string
  needs: string[]
  contact: string
  goals?: string
  project_type?: string
  project_stage?: string
  budget_range?: string
  timeline?: string
  pain_points?: string
  revenue_band?: string
  preferred_contact_method?: string
  whatsapp?: string
  instagram?: string
}

interface InquiryFlowProps {
  onSubmit: (data: InquiryPayload) => Promise<void>
}

export default function InquiryFlow({ onSubmit }: InquiryFlowProps) {
  const [step, setStep] = useState(0)
  const [brand, setBrand] = useState('')
  const [brandStage, setBrandStage] = useState('')
  const [goals, setGoals] = useState('')
  const [projectType, setProjectType] = useState('')
  const [needs, setNeeds] = useState<string[]>([])
  const [timeline, setTimeline] = useState('')
  const [budgetRange, setBudgetRange] = useState('')
  const [revenueBand, setRevenueBand] = useState('')
  const [painPoints, setPainPoints] = useState('')
  const [contactMethod, setContactMethod] = useState('')
  const [contact, setContact] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [instagram, setInstagram] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  function toggleNeed(n: string) {
    setNeeds((p) => (p.includes(n) ? p.filter((x) => x !== n) : [...p, n]))
  }

  async function submit() {
    const email = contact.trim()
    const wa = whatsapp.trim()
    const primary = contactMethod === 'WhatsApp' ? wa || email : email || wa
    if (!primary || primary.length < 3) {
      setError('Add email or WhatsApp.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await onSubmit({
        brand,
        about: painPoints.trim() || undefined,
        needs,
        contact: primary,
        goals: goals.trim() || undefined,
        project_type: projectType || undefined,
        project_stage: brandStage || undefined,
        budget_range: budgetRange || undefined,
        timeline: timeline || undefined,
        pain_points: painPoints.trim() || undefined,
        revenue_band: revenueBand || undefined,
        preferred_contact_method: contactMethod || undefined,
        whatsapp: wa || undefined,
        instagram: instagram.trim() || undefined,
      })
      trackEvent('generate_lead', {
        form_name: 'studio_inquiry',
        contact_method: contactMethod || 'unspecified',
        project_type: projectType || 'unspecified',
        project_stage: brandStage || 'unspecified',
        services: needs.join(', '),
      })
      setDone(true)
    } catch (e) {
      setError(
        e instanceof Error && e.message
          ? e.message
          : 'Something went wrong. Email hello@ivoridigitals.com'
      )
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="py-20 text-center">
        <div className="mx-auto mb-8 flex h-14 w-14 items-center justify-center rounded-full border border-[var(--gold)]/40">
          <Check className="h-6 w-6 text-[var(--gold)]" />
        </div>
        <MotionHeading as="h2" size="md">
          Brief received.
        </MotionHeading>
        <p className="mt-4 text-[var(--text-body)]">We respond personally — usually within one business day.</p>
        <div className="mt-10">
          <StudioCTA href="/">Back to studio</StudioCTA>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-12 w-full max-w-[350px] overflow-hidden sm:max-w-full">
      <div className="mb-10 grid max-w-full grid-cols-4 gap-1 overflow-hidden">
        {steps.map((s, i) => (
          <button
            key={s}
            type="button"
            onClick={() => i < step && setStep(i)}
            className={cn(
              'min-w-0 border-b pb-3 text-[9px] font-semibold uppercase tracking-0 transition-colors sm:text-[10px] sm:tracking-[0.22em]',
              i === step ? 'border-[var(--gold)] text-[var(--gold)]' : 'border-[var(--border)] text-[var(--text-ghost)]',
              i < step && 'cursor-pointer hover:text-[var(--text-label)]'
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {step === 0 && (
        <div className="space-y-8 animate-fade-in">
          <Field label="Brand or store URL">
            <input className="field-input" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="brand.com" />
          </Field>
          <Field label="Business stage">
            <ChipRow options={brandStages} value={brandStage} onChange={setBrandStage} />
          </Field>
          <Field label="Primary goal">
            <input className="field-input" value={goals} onChange={(e) => setGoals(e.target.value)} placeholder="CRO, launch, creative system…" />
          </Field>
          <button type="button" onClick={() => setStep(1)} className="studio-link text-sm font-medium text-[var(--gold)]">
            Continue →
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-8 animate-fade-in">
          <Field label="Project type">
            <ChipRow options={projectTypes} value={projectType} onChange={setProjectType} />
          </Field>
          <Field label="Services needed">
            <div className="mt-4 flex flex-wrap gap-2">
              {needsOptions.map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => toggleNeed(o)}
                  className={cn(
                    'rounded-full border px-4 py-2.5 text-xs font-medium transition-all',
                    needs.includes(o)
                      ? 'border-[var(--gold)] bg-[var(--gold-glow)] text-[var(--gold)]'
                      : 'border-[var(--border)] text-[var(--text-label)] hover:border-[var(--border-strong)]'
                  )}
                >
                  {o}
                </button>
              ))}
            </div>
          </Field>
          <NavButtons onBack={() => setStep(0)} onNext={() => setStep(2)} />
        </div>
      )}

      {step === 2 && (
        <div className="space-y-8 animate-fade-in">
          <Field label="Timeline">
            <ChipRow options={timelines} value={timeline} onChange={setTimeline} />
          </Field>
          <Field label="Budget range">
            <ChipRow options={budgetRanges} value={budgetRange} onChange={setBudgetRange} />
          </Field>
          <Field label="Monthly revenue (optional)">
            <ChipRow options={revenueBands} value={revenueBand} onChange={setRevenueBand} />
          </Field>
          <Field label="Current challenge (optional)">
            <textarea
              className="field-input min-h-[88px] resize-none"
              value={painPoints}
              onChange={(e) => setPainPoints(e.target.value)}
              placeholder="What is not working today?"
            />
          </Field>
          <NavButtons onBack={() => setStep(1)} onNext={() => setStep(3)} />
        </div>
      )}

      {step === 3 && (
        <div className="space-y-8 animate-fade-in">
          <Field label="Preferred contact">
            <ChipRow options={contactMethods} value={contactMethod} onChange={setContactMethod} />
          </Field>
          <Field label="Email">
            <input className="field-input" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="you@brand.com" />
          </Field>
          <Field label="WhatsApp (optional)">
            <input className="field-input" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+20…" />
          </Field>
          <Field label="Instagram (optional)">
            <input className="field-input" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@brand" />
          </Field>
          {error && <p className="text-sm text-red-400/90">{error}</p>}
          <div className="flex gap-6">
            <button type="button" onClick={() => setStep(2)} className="text-sm text-[var(--text-dim)]">
              ← Back
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={submit}
              className="magnetic-cta rounded-full border border-[var(--gold-mid)]/50 bg-[var(--gold-glow)] px-6 py-2.5 text-sm font-medium text-[var(--foreground)] disabled:opacity-40"
            >
              {loading ? 'Sending…' : 'Send brief'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function NavButtons({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  return (
    <div className="flex gap-6">
      <button type="button" onClick={onBack} className="text-sm text-[var(--text-dim)]">
        ← Back
      </button>
      <button type="button" onClick={onNext} className="studio-link text-sm font-medium text-[var(--gold)]">
        Continue →
      </button>
    </div>
  )
}

function ChipRow({
  options,
  value,
  onChange,
}: {
  options: string[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(value === o ? '' : o)}
          className={cn(
            'rounded-full border px-3 py-2 text-xs font-medium transition-all',
            value === o
              ? 'border-[var(--gold)] bg-[var(--gold-glow)] text-[var(--gold)]'
              : 'border-[var(--border)] text-[var(--text-label)] hover:border-[var(--border-strong)]'
          )}
        >
          {o}
        </button>
      ))}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-[var(--border)] pb-6">
      <span className="text-[10px] font-semibold uppercase tracking-[var(--tracking-label)] text-[var(--text-label)] [overflow-wrap:anywhere]">
        {label}
      </span>
      {children}
    </div>
  )
}
