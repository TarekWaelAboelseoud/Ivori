import { cn } from '@/lib/utils'

/** Inline Ivori monogram — nav, footer, admin, invoices */
export default function IvoriMark({
  size = 'md',
  className,
  variant = 'dark',
}: {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  variant?: 'dark' | 'light'
}) {
  const sizes = {
    sm: 'h-7 w-7 text-sm rounded-md',
    md: 'h-8 w-8 text-base rounded-lg',
    lg: 'h-12 w-12 text-2xl rounded-xl',
  }

  return (
    <span
      className={cn(
        'grid shrink-0 place-items-center border font-display font-medium leading-none',
        sizes[size],
        variant === 'light'
          ? 'border-[#8f7139] bg-[#faf5ed] text-[#8f7139]'
          : 'border-[var(--gold-mid)] bg-[var(--surface)] text-[var(--gold)]',
        className
      )}
      aria-hidden
    >
      I
    </span>
  )
}
