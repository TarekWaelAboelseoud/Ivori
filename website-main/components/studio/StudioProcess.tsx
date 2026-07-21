import type { studioProcess } from '@/lib/content/process'
import Box from './Box'

type Step = (typeof studioProcess)[number]

export default function StudioProcess({ steps }: { steps: readonly Step[] }) {
  return (
    <ol className="space-y-0 divide-y divide-[var(--border)]">
      {steps.map((item) => (
        <li key={item.step} className="grid gap-6 py-10 sm:grid-cols-[80px_1fr] sm:gap-12">
          <span className="font-display text-4xl font-normal tabular-nums text-[var(--gold-mid)] sm:text-5xl">
            {item.step}
          </span>
          <Box>
            <h3 className="font-display text-2xl font-normal tracking-[-0.01em] text-[var(--foreground)] sm:text-3xl">
              {item.title}
            </h3>
            <p className="mt-3 max-w-2xl text-base font-normal leading-7 text-[var(--text-body)]">
              {item.desc}
            </p>
          </Box>
        </li>
      ))}
    </ol>
  )
}
