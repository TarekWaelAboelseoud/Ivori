import { NextRequest } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import type { DocumentProps } from '@react-pdf/renderer'
import React from 'react'
import { db } from '@/lib/supabase-server'
import { ReportDocument } from '@/templates/ReportPDF'
import { adminJson } from '@/lib/security/admin-response'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function POST(req: NextRequest) {
  const { orderId } = await req.json()

  if (!orderId) return adminJson({ error: 'Missing orderId' }, { status: 400 })

  const supabase = db()

  const { data: order } = await supabase
    .from('orders')
    .select('id, email, tier, audits(id, ai_report, store_url, reviewer_notes)')
    .eq('id', orderId)
    .single()

  if (!order) return adminJson({ error: 'Order not found' }, { status: 404 })

  const audit = Array.isArray(order.audits) ? order.audits[0] : order.audits
  const report = audit?.ai_report as Record<string, unknown>

  if (!report || Object.keys(report).length === 0) {
    return adminJson({ error: 'No report generated yet' }, { status: 400 })
  }

  // Generate PDF buffer
  let buffer: Buffer
  try {
    buffer = await renderToBuffer(
      React.createElement(ReportDocument, {
        report,
        storeUrl: audit.store_url ?? order.email,
        email: order.email,
        tier: order.tier,
        reviewerNotes: audit.reviewer_notes ?? '',
      }) as React.ReactElement<DocumentProps>
    )
  } catch (err) {
    console.error('[pdf] render error', err)
    return adminJson({ error: 'PDF generation failed' }, { status: 500 })
  }

  // Ensure storage bucket exists
  await supabase.storage.createBucket('reports', {
    public: true,
    allowedMimeTypes: ['application/pdf'],
  }).catch(() => { /* bucket already exists */ })

  // Upload to Supabase Storage
  const filename = `${audit.id}.pdf`
  const { error: uploadErr } = await supabase.storage
    .from('reports')
    .upload(filename, buffer, {
      contentType: 'application/pdf',
      upsert: true,
    })

  if (uploadErr) {
    console.error('[pdf] upload error', uploadErr)
    return adminJson({ error: 'PDF upload failed' }, { status: 500 })
  }

  const { data: { publicUrl } } = supabase.storage.from('reports').getPublicUrl(filename)

  // Save URL
  await supabase.from('audits').update({ pdf_url: publicUrl }).eq('id', audit.id)

  return adminJson({ success: true, url: publicUrl })
}
