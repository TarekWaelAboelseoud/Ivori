'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import PublicThemeSwitch from './PublicThemeSwitch'
import IvoriMark from './brand/IvoriMark'

const primaryLinksEn = [
  { href: '/work', label: 'Work' },
  { href: '/process', label: 'Process' },
  { href: '/ai-production', label: 'AI Production' },
]

const serviceLinksEn = [
  { href: '/cro', label: 'CRO' },
  { href: '/media-buying', label: 'Media Buying' },
  { href: '/shopify', label: 'Shopify' },
]

const primaryLinksAr = [
  { href: '/work', label: 'الأعمال' },
  { href: '/process', label: 'العملية' },
  { href: '/ai-production', label: 'إنتاج AI' },
]

const serviceLinksAr = [
  { href: '/cro', label: 'CRO' },
  { href: '/media-buying', label: 'الإعلانات' },
  { href: '/shopify', label: 'Shopify' },
]

export default function Nav({ lang = 'en' }: { lang?: 'en' | 'ar' }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  const primaryLinks = lang === 'ar' ? primaryLinksAr : primaryLinksEn
  const serviceLinks = lang === 'ar' ? serviceLinksAr : serviceLinksEn
  const contactLabel = lang === 'ar' ? 'تواصل' : 'Contact'

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-[var(--z-header)] transition-all duration-300',
          scrolled || menuOpen
            ? 'border-b border-[var(--border)] bg-[var(--background)]/96'
            : 'bg-transparent'
        )}
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <nav
          className="mx-auto flex max-w-[var(--container-studio)] items-center justify-between px-[var(--gutter)]"
          style={{ height: 'var(--header-height)' }}
        >
          <Link href="/" title="Ivori Digitals home" className="group flex min-w-0 items-center gap-2.5">
            <IvoriMark size="md" />
            <span className="text-xs font-semibold tracking-[0.14em] text-[var(--foreground)] transition-colors group-hover:text-[var(--gold)]">
              IVORI
            </span>
            <span className="hidden text-[10px] font-medium tracking-[0.18em] text-[var(--text-label)] transition-colors group-hover:text-[var(--foreground)] sm:inline">
              DIGITALS
            </span>
          </Link>

          <div className="hidden items-center gap-7 lg:flex">
            {[...primaryLinks, ...serviceLinks].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-xs font-medium tracking-[var(--tracking-ui)] transition-colors duration-[var(--duration-ui)]',
                  isActive(link.href)
                    ? 'text-[var(--foreground)]'
                    : 'text-[var(--text-label)] hover:text-[var(--foreground)]'
                )}
              >
                {link.label}
              </Link>
            ))}
            <PublicThemeSwitch />
            {lang === 'en' ? (
              <Link
                href="/ar"
                className="text-[11px] font-medium tracking-[var(--tracking-ui)] text-[var(--text-ghost)] transition-colors hover:text-[var(--foreground)]"
              >
                ع
              </Link>
            ) : (
              <Link
                href="/"
                className="text-[11px] font-medium tracking-[var(--tracking-ui)] text-[var(--text-ghost)] transition-colors hover:text-[var(--foreground)]"
              >
                EN
              </Link>
            )}
            <Link
              href="/contact"
              className={cn(
                'rounded-full border px-4 py-1.5 text-[10px] font-medium tracking-[var(--tracking-ui)] transition-all duration-[var(--duration-ui)]',
                isActive('/contact')
                  ? 'border-[var(--gold-mid)] bg-[var(--gold-glow)] text-[var(--foreground)]'
                  : 'border-[var(--border-strong)] text-[var(--text-label)] hover:border-[var(--gold-mid)] hover:text-[var(--foreground)]'
              )}
            >
              {contactLabel}
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            className="flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-[5px] p-2 lg:hidden"
          >
            <span className={cn('block h-px w-5 bg-[var(--foreground)] transition-all duration-300', menuOpen && 'translate-y-[7px] rotate-45')} />
            <span className={cn('block h-px w-5 bg-[var(--foreground)] transition-all duration-300', menuOpen && 'opacity-0')} />
            <span className={cn('block h-px w-5 bg-[var(--foreground)] transition-all duration-300', menuOpen && '-translate-y-[7px] -rotate-45')} />
          </button>
        </nav>
      </header>

      <div
        className={cn(
          'fixed inset-0 z-[var(--z-menu)] flex flex-col bg-[var(--background)] transition-all duration-500 lg:hidden',
          menuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        )}
        style={{ paddingTop: 'calc(var(--header-height) + env(safe-area-inset-top, 0px))' }}
      >
        <div className="flex flex-1 flex-col justify-between px-[var(--gutter)] pb-12 pt-8">
          <nav className="space-y-1">
            {[...primaryLinks, ...serviceLinks, { href: '/contact', label: contactLabel }].map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'block py-3 font-display text-[clamp(1.65rem,7vw,2.45rem)] font-light transition-colors',
                  isActive(link.href)
                    ? 'text-[var(--foreground)]'
                    : 'text-[var(--text-dim)] hover:text-[var(--foreground)]'
                )}
                style={{
                  transitionDelay: menuOpen ? `${i * 45}ms` : '0ms',
                  transform: menuOpen ? 'translateX(0)' : 'translateX(-16px)',
                  opacity: menuOpen ? 1 : 0,
                  transition: 'color 0.2s, transform 0.45s var(--ease-out-expo), opacity 0.45s ease',
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="space-y-4 border-t border-[var(--border)] pt-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--text-faint)]">
              Cairo · Egypt & MENA
            </p>
            <a href="mailto:hello@ivoridigitals.com" className="block text-sm text-[var(--text-label)] transition-colors hover:text-[var(--foreground)]">
              hello@ivoridigitals.com
            </a>
            {lang === 'en' ? (
              <Link href="/ar" className="block text-sm text-[var(--text-faint)] transition-colors hover:text-[var(--foreground)]">
                العربية
              </Link>
            ) : (
              <Link href="/" className="block text-sm text-[var(--text-faint)] transition-colors hover:text-[var(--foreground)]">
                English
              </Link>
            )}
            <PublicThemeSwitch />
          </div>
        </div>
      </div>
    </>
  )
}
