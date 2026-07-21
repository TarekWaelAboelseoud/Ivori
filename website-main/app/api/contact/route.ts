import { NextRequest } from 'next/server'
import { getResend, FROM, ADMIN_EMAIL } from '@/lib/resend'
import { isResendConfigured } from '@/lib/env'
import { parseInquiryBody, escapeHtml } from '@/lib/security/sanitize'
import { rateLimit, clientIp } from '@/lib/security/rate-limit'
import { insertInquiry } from '@/lib/inquiries/persist'

export async function POST(req: NextRequest) {
  const ip = clientIp(req)
  const limited = await rateLimit(`contact:${ip}`, 6, 60_000)
  if (!limited.ok) {
    return Response.json(
      { error: 'Too many requests. Try again shortly.' },
      { status: 429, headers: limited.retryAfter ? { 'Retry-After': String(limited.retryAfter) } : {} }
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }

  const data = parseInquiryBody(body)
  if (!data) {
    return Response.json({ error: 'Contact info required' }, { status: 400 })
  }

  const saved = await insertInquiry({
    brand: data.brand,
    company_name: data.company_name,
    about: data.about,
    needs: data.needs,
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
    status: 'new',
  })

  if (!saved.ok) {
    return Response.json(
      { error: saved.error, code: saved.code },
      { status: saved.code === 'NO_DATABASE' ? 503 : 500 }
    )
  }

  if (isResendConfigured() && ADMIN_EMAIL) {
    try {
      const rows = [
        ['Brand', data.brand],
        ['Company', data.company_name],
        ['Contact', data.contact],
        ['WhatsApp', data.whatsapp],
        ['Instagram', data.instagram],
        ['Preferred', data.preferred_contact_method],
        ['Type', data.project_type],
        ['Stage', data.project_stage],
        ['Timeline', data.timeline],
        ['Budget', data.budget_range],
        ['Revenue', data.revenue_band],
        ['Goals', data.goals],
        ['Needs', data.needs],
        ['Pain', data.pain_points],
        ['Notes', data.about],
      ]
        .filter(([, v]) => v)
        .map(([k, v]) => `<p><strong>${k}:</strong> ${escapeHtml(v!)}</p>`)
        .join('')

      await getResend().emails.send({
        from: FROM,
        to: ADMIN_EMAIL,
        subject: `Studio inquiry${data.brand ? `: ${data.brand.slice(0, 80)}` : ''}`,
        html: `<div style="font-family:sans-serif;max-width:560px;line-height:1.6;color:#333;"><h2 style="color:#111;">New inquiry</h2>${rows}</div>`,
      })
    } catch {
      /* email optional */
    }
  }

  return Response.json({
    success: true,
    id: saved.inquiry.id,
    storage: saved.storage,
  })
}
