import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

// ────────────────────────────────────────────────────────────
// Styles
// ────────────────────────────────────────────────────────────
const C = {
  bg:       '#0D0D0D',
  surface:  '#141414',
  surface2: '#1A1A1A',
  border:   '#242424',
  accent:   '#F97316',
  accentDim:'#7C3912',
  white:    '#FAFAFA',
  muted:    '#9CA3AF',
  dim:      '#6B7280',
  red:      '#F87171',
  yellow:   '#FCD34D',
  green:    '#4ADE80',
}

const s = StyleSheet.create({
  page:         { backgroundColor: C.bg, padding: 40, fontFamily: 'Helvetica' },
  coverPage:    { backgroundColor: C.bg, padding: 56, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },

  // Typography
  h1:           { fontSize: 28, fontFamily: 'Helvetica-Bold', color: C.white, letterSpacing: -0.5 },
  h2:           { fontSize: 16, fontFamily: 'Helvetica-Bold', color: C.white, marginBottom: 10 },
  h3:           { fontSize: 11, fontFamily: 'Helvetica-Bold', color: C.white, marginBottom: 4 },
  eyebrow:      { fontSize: 8,  fontFamily: 'Helvetica-Bold', color: C.accent, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 },
  body:         { fontSize: 9,  color: C.muted, lineHeight: 1.6 },
  label:        { fontSize: 7,  color: C.dim,   letterSpacing: 0.8, textTransform: 'uppercase', fontFamily: 'Helvetica-Bold' },
  mono:         { fontSize: 8,  color: C.accent, fontFamily: 'Courier' },

  // Layout
  section:      { marginBottom: 24 },
  card:         { backgroundColor: C.surface, borderRadius: 6, padding: 14, marginBottom: 8 },
  cardBorder:   { backgroundColor: C.surface, borderRadius: 6, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: C.border },
  row:          { flexDirection: 'row', alignItems: 'center' },
  spaceBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  divider:      { borderBottomWidth: 1, borderBottomColor: C.border, marginVertical: 12 },

  // Badges
  badgeHigh:   { backgroundColor: '#450A0A', borderRadius: 3, paddingVertical: 2, paddingHorizontal: 6 },
  badgeMed:    { backgroundColor: '#422006', borderRadius: 3, paddingVertical: 2, paddingHorizontal: 6 },
  badgeLow:    { backgroundColor: '#1A1A1A', borderRadius: 3, paddingVertical: 2, paddingHorizontal: 6 },
  badgeEasy:   { backgroundColor: '#052E16', borderRadius: 3, paddingVertical: 2, paddingHorizontal: 6 },
  badgeHard:   { backgroundColor: '#450A0A', borderRadius: 3, paddingVertical: 2, paddingHorizontal: 6 },

  // Score grid
  scoreBox:    { flex: 1, backgroundColor: C.surface2, borderRadius: 4, padding: 8, alignItems: 'center', marginHorizontal: 2 },
  scoreNum:    { fontSize: 18, fontFamily: 'Helvetica-Bold', color: C.white },
  scoreLabel:  { fontSize: 6,  color: C.dim, textAlign: 'center', marginTop: 2, textTransform: 'uppercase' },
})

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────
function badgeStyle(impact: string) {
  if (impact === 'high') return s.badgeHigh
  if (impact === 'medium') return s.badgeMed
  return s.badgeLow
}

function badgeText(impact: string) {
  if (impact === 'high') return { ...s.label, color: C.red }
  if (impact === 'medium') return { ...s.label, color: C.yellow }
  return { ...s.label, color: C.muted }
}

function scoreColor(val: number) {
  if (val >= 70) return C.green
  if (val >= 45) return C.yellow
  return C.red
}

// ────────────────────────────────────────────────────────────
// Issue Card
// ────────────────────────────────────────────────────────────
function IssueCard({ issue }: { issue: Record<string, unknown> }) {
  return (
    <View style={s.cardBorder}>
      <View style={s.spaceBetween}>
        <Text style={[s.h3, { flex: 1, marginBottom: 0, marginRight: 8 }]}>{issue.title as string}</Text>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          <View style={badgeStyle(issue.impact as string)}>
            <Text style={badgeText(issue.impact as string)}>{(issue.impact as string).toUpperCase()}</Text>
          </View>
          <View style={s.badgeLow}>
            <Text style={s.label}>{(issue.difficulty as string).toUpperCase()}</Text>
          </View>
        </View>
      </View>
      <View style={s.divider} />
      <Text style={[s.label, { marginBottom: 3 }]}>Finding</Text>
      <Text style={[s.body, { marginBottom: 8 }]}>{issue.finding as string}</Text>
      <Text style={[s.label, { marginBottom: 3 }]}>Why it matters</Text>
      <Text style={[s.body, { marginBottom: 8 }]}>{issue.why_it_matters as string}</Text>
      <Text style={[s.label, { marginBottom: 3 }]}>The fix</Text>
      <Text style={[s.body, { marginBottom: 8 }]}>{issue.fix as string}</Text>
      <View style={s.row}>
        <Text style={[s.mono, { marginRight: 16 }]}>↑ {issue.estimated_lift as string}</Text>
        <Text style={{ color: C.dim, fontSize: 7 }}>{issue.time_to_implement as string}</Text>
      </View>
    </View>
  )
}

// ────────────────────────────────────────────────────────────
// Finding Card (compact)
// ────────────────────────────────────────────────────────────
function FindingCard({ finding }: { finding: Record<string, unknown> }) {
  return (
    <View style={[s.card, { marginBottom: 6, paddingVertical: 10 }]}>
      <View style={s.spaceBetween}>
        <Text style={[s.h3, { marginBottom: 0, flex: 1 }]}>{finding.title as string}</Text>
        <View style={badgeStyle(finding.impact as string)}>
          <Text style={badgeText(finding.impact as string)}>{(finding.impact as string).toUpperCase()}</Text>
        </View>
      </View>
      <Text style={[s.body, { marginTop: 4 }]}>{finding.observation as string}</Text>
      <Text style={[s.body, { color: C.accent, marginTop: 4 }]}>→ {finding.recommendation as string}</Text>
    </View>
  )
}

// ────────────────────────────────────────────────────────────
// Main Document
// ────────────────────────────────────────────────────────────
interface ReportDocumentProps {
  report: Record<string, unknown>
  storeUrl: string
  email: string
  tier: string
  reviewerNotes?: string
}

export function ReportDocument({ report, storeUrl, email, tier, reviewerNotes }: ReportDocumentProps) {
  const scores = (report.scores as Record<string, number>) ?? {}
  const criticalIssues = (report.critical_issues as Record<string, unknown>[]) ?? []
  const quickWins = (report.quick_wins as Record<string, unknown>[]) ?? []
  const mediumTerm = (report.medium_term_improvements as Record<string, unknown>[]) ?? []
  const mobileFnds = (report.mobile_findings as Record<string, unknown>[]) ?? []
  const trustFnds  = (report.trust_findings as Record<string, unknown>[]) ?? []
  const checkoutFnds = (report.checkout_findings as Record<string, unknown>[]) ?? []
  const offerFnds  = (report.offer_findings as Record<string, unknown>[]) ?? []
  const roadmap    = (report.roadmap_30_days as Record<string, { task: string; expected_impact: string }[]>) ?? {}
  const date       = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

  const scoreEntries = [
    ['Mobile UX',       scores.mobile_ux],
    ['Trust',           scores.trust_systems],
    ['Product Pages',   scores.product_pages],
    ['Checkout',        scores.checkout_flow],
    ['Offer Clarity',   scores.offer_clarity],
    ['Funnel',          scores.funnel_consistency],
    ['CRO Maturity',    scores.cro_maturity],
  ]

  return (
    <Document>
      {/* ── PAGE 1: COVER ── */}
      <Page size="A4" style={s.coverPage}>
        <View>
          <Text style={[s.eyebrow, { marginBottom: 24 }]}>CRO AUDIT REPORT</Text>
          <Text style={s.h1}>Revenue Leak{'\n'}Analysis</Text>
          <Text style={[s.body, { marginTop: 12, fontSize: 10 }]}>{storeUrl}</Text>
        </View>
        <View>
          {/* Revenue Leak Score */}
          <View style={[s.card, { backgroundColor: C.surface, borderRadius: 8, padding: 20 }]}>
            <Text style={s.eyebrow}>Revenue Leak Score</Text>
            <Text style={{ fontSize: 56, fontFamily: 'Helvetica-Bold', color: C.accent, lineHeight: 1 }}>
              {report.revenue_leak_score as number}
            </Text>
            <Text style={[s.body, { marginTop: 4 }]}>out of 100 — higher means more revenue leaking</Text>
          </View>
          <View style={[s.row, { marginTop: 16, flexWrap: 'wrap' }]}>
            {scoreEntries.map(([label, val]) => (
              <View key={label as string} style={s.scoreBox}>
                <Text style={[s.scoreNum, { color: scoreColor(val as number) }]}>{val}</Text>
                <Text style={s.scoreLabel}>{label as string}</Text>
              </View>
            ))}
          </View>
        </View>
        <View>
          <Text style={[s.label, { marginBottom: 4 }]}>Prepared for</Text>
          <Text style={[s.body, { color: C.white }]}>{email}</Text>
          <Text style={[s.body, { marginTop: 2 }]}>{date} · {tier.toUpperCase()} AUDIT</Text>
          <Text style={[s.body, { marginTop: 8, fontSize: 7 }]}>
            Confidential. For authorized recipient only.
          </Text>
        </View>
      </Page>

      {/* ── PAGE 2: EXECUTIVE SUMMARY + CRITICAL ISSUES ── */}
      <Page size="A4" style={s.page}>
        <View style={s.section}>
          <Text style={s.eyebrow}>Executive Summary</Text>
          <Text style={[s.body, { fontSize: 10, color: C.white, lineHeight: 1.7 }]}>
            {report.executive_summary as string}
          </Text>
        </View>

        {criticalIssues.length > 0 && (
          <View style={s.section}>
            <Text style={s.eyebrow}>Critical Issues ({criticalIssues.length})</Text>
            {criticalIssues.map((issue) => (
              <IssueCard key={issue.id as string} issue={issue} />
            ))}
          </View>
        )}
      </Page>

      {/* ── PAGE 3: QUICK WINS + MEDIUM TERM ── */}
      {(quickWins.length > 0 || mediumTerm.length > 0) && (
        <Page size="A4" style={s.page}>
          {quickWins.length > 0 && (
            <View style={s.section}>
              <Text style={s.eyebrow}>Quick Wins — Under 2 Hours Each ({quickWins.length})</Text>
              {quickWins.map((issue) => (
                <IssueCard key={issue.id as string} issue={issue} />
              ))}
            </View>
          )}
          {mediumTerm.length > 0 && (
            <View style={s.section}>
              <Text style={s.eyebrow}>Medium-Term Improvements ({mediumTerm.length})</Text>
              {mediumTerm.map((issue) => (
                <IssueCard key={issue.id as string} issue={issue} />
              ))}
            </View>
          )}
        </Page>
      )}

      {/* ── PAGE 4: FINDINGS BY CATEGORY ── */}
      {(mobileFnds.length > 0 || trustFnds.length > 0 || checkoutFnds.length > 0 || offerFnds.length > 0) && (
        <Page size="A4" style={s.page}>
          {mobileFnds.length > 0 && (
            <View style={s.section}>
              <Text style={s.eyebrow}>Mobile UX Findings</Text>
              {mobileFnds.map((f, i) => <FindingCard key={i} finding={f} />)}
            </View>
          )}
          {trustFnds.length > 0 && (
            <View style={s.section}>
              <Text style={s.eyebrow}>Trust & Credibility Findings</Text>
              {trustFnds.map((f, i) => <FindingCard key={i} finding={f} />)}
            </View>
          )}
          {checkoutFnds.length > 0 && (
            <View style={s.section}>
              <Text style={s.eyebrow}>Checkout & Funnel Findings</Text>
              {checkoutFnds.map((f, i) => <FindingCard key={i} finding={f} />)}
            </View>
          )}
          {offerFnds.length > 0 && (
            <View style={s.section}>
              <Text style={s.eyebrow}>Offer & Messaging Findings</Text>
              {offerFnds.map((f, i) => <FindingCard key={i} finding={f} />)}
            </View>
          )}
        </Page>
      )}

      {/* ── PAGE 5: ROADMAP + UPSELL ── */}
      <Page size="A4" style={s.page}>
        <View style={s.section}>
          <Text style={s.eyebrow}>30-Day Implementation Roadmap</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {(['week_1', 'week_2', 'week_3', 'week_4'] as const).map((wk, i) => {
              const items = roadmap[wk] ?? []
              return (
                <View key={wk} style={[s.card, { width: '48%', margin: '1%' }]}>
                  <Text style={[s.eyebrow, { marginBottom: 6 }]}>Week {i + 1}</Text>
                  {items.map((item, j) => (
                    <View key={j} style={{ marginBottom: 5 }}>
                      <Text style={[s.body, { color: C.white }]}>→ {item.task}</Text>
                      {item.expected_impact && (
                        <Text style={[s.body, { color: C.accent, marginTop: 1 }]}>{item.expected_impact}</Text>
                      )}
                    </View>
                  ))}
                </View>
              )
            })}
          </View>
        </View>

        {reviewerNotes && (
          <View style={[s.card, { borderWidth: 1, borderColor: C.border, marginBottom: 16 }]}>
            <Text style={[s.eyebrow, { marginBottom: 6 }]}>Reviewer Notes</Text>
            <Text style={s.body}>{reviewerNotes}</Text>
          </View>
        )}

        {/* Upsell Bridge */}
        <View style={[s.card, {
          backgroundColor: '#1A0E05',
          borderWidth: 1,
          borderColor: C.accentDim,
          borderRadius: 8,
          padding: 18,
        }]}>
          <Text style={s.eyebrow}>What Happens Next</Text>
          <Text style={[s.body, { fontSize: 10, color: C.white, lineHeight: 1.7 }]}>
            {report.upsell_bridge as string}
          </Text>
        </View>

        <View style={{ marginTop: 20, borderTopWidth: 1, borderTopColor: C.border, paddingTop: 12 }}>
          <Text style={[s.body, { textAlign: 'center', fontSize: 7 }]}>
            CRO Audit — Confidential Report · Generated {date}
          </Text>
        </View>
      </Page>
    </Document>
  )
}
