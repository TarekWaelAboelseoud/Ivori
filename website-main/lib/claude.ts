import Anthropic from '@anthropic-ai/sdk'
import { SYSTEM_PROMPT, buildUserPrompt } from '@/prompts/audit'
import { env, isAnthropicConfigured } from '@/lib/env'

export function getAnthropic() {
  if (!isAnthropicConfigured()) {
    throw new Error('Anthropic is not configured. Add ANTHROPIC_API_KEY before generating reports.')
  }
  return new Anthropic({ apiKey: env.anthropicApiKey })
}

export async function generateAuditReport(intakeData: Record<string, unknown>): Promise<Record<string, unknown>> {
  const client = getAnthropic()

  const message = await client.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: buildUserPrompt(intakeData),
      },
    ],
  })

  const text = message.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as { type: 'text'; text: string }).text)
    .join('')

  // Strip any accidental markdown fences
  const clean = text.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim()

  const report = JSON.parse(clean)
  report.generated_at = new Date().toISOString()
  return report
}
