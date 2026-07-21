import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { ServiceGroup } from '@/lib/content/studio-services'
import Box from './Box'

export default function EditorialSystems({ groups }: { groups: ServiceGroup[] }) {
  return (
    <Box className="space-y-14">
      {groups.map((group) => (
        <Box key={group.id} className="border-t border-[var(--border)] pt-10 first:border-t-0 first:pt-0">
          <Box className="mb-7 flex items-baseline gap-6">
            <span className="font-display text-3xl font-light text-[var(--gold-mid)]">{group.chapter}</span>
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[var(--text-label)]">
              {group.label}
            </h3>
          </Box>
          <ul className="divide-y divide-[var(--border-subtle)]">
            {group.services.map((service) => (
              <li key={service.id}>
                {service.href ? (
                  <Link
                    href={service.href}
                    className="group flex items-start justify-between gap-6 py-5 transition-colors"
                  >
                    <Box>
                      <span className="font-display text-[clamp(1.15rem,2.8vw,1.65rem)] font-light text-[var(--foreground)] group-hover:text-[var(--ivory)]">
                        {service.title}
                      </span>
                      <p className="mt-1 max-w-xl text-sm leading-6 text-[var(--text-body)]">
                        Ivori system / {service.desc}
                      </p>
                    </Box>
                    <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-[var(--text-ghost)] transition-all group-hover:text-[var(--gold)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                ) : (
                  <Box className="py-5">
                    <span className="font-display text-xl font-light text-[var(--foreground)]">{service.title}</span>
                    <p className="mt-1 text-sm text-[var(--text-body)]">{service.desc}</p>
                  </Box>
                )}
              </li>
            ))}
          </ul>
        </Box>
      ))}
    </Box>
  )
}
