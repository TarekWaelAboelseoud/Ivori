import Link from 'next/link'
import { SectionContainer } from './SectionShell'

const servicesEn = [
  { href: '/cro', label: 'Shopify CRO Egypt' },
  { href: '/shopify', label: 'Shopify Agency Egypt' },
  { href: '/media-buying', label: 'Meta Ads Ecommerce' },
  { href: '/ai-production', label: 'Performance Creative MENA' },
]

const servicesAr = [
  { href: '/cro', label: 'CRO' },
  { href: '/shopify', label: 'Shopify' },
  { href: '/media-buying', label: 'الإعلانات' },
  { href: '/ai-production', label: 'إنتاج AI' },
]

export default function Footer({ lang = 'en' }: { lang?: 'en' | 'ar' }) {
  const isAr = lang === 'ar'
  const services = isAr ? servicesAr : servicesEn

  return (
    <footer
      className="border-t border-[var(--border)] bg-[var(--background)] py-12 pb-[max(3rem,env(safe-area-inset-bottom))]"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <SectionContainer>
        <div className="grid gap-12 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.16em] text-[var(--foreground)]">
              IVORI DIGITALS
            </p>
            <p className="mt-2 text-[11px] text-[var(--text-dim)]">
              {isAr ? 'القاهرة · مصر والمنطقة' : 'Cairo · Egypt & MENA'}
            </p>
            <p className="mt-6 max-w-md text-sm leading-6 text-[var(--text-body)]">
              {isAr
                ? 'إيفوري ديجيتالز استوديو نمو للتجارة الإلكترونية وتحسين التحويل والإنتاج الإبداعي في مصر والمنطقة.'
                : 'Ivori Digitals is a premium ecommerce growth studio for Shopify CRO, Meta Ads, performance creative, and conversion optimization in Egypt and MENA.'}
            </p>
          </div>
          <div className="flex flex-col gap-8 sm:items-end">
            <nav className="flex max-w-xl flex-wrap gap-x-6 gap-y-3 text-[11px] text-[var(--text-dim)]">
              <Link href="/work" className="transition-colors hover:text-[var(--foreground)]">
                {isAr ? 'الأعمال' : 'Work'}
              </Link>
              <Link href="/process" className="transition-colors hover:text-[var(--foreground)]">
                {isAr ? 'العملية' : 'Process'}
              </Link>
              {services.map((s) => (
                <Link key={s.href} href={s.href} className="transition-colors hover:text-[var(--foreground)]">
                  {s.label}
                </Link>
              ))}
              <Link href="/contact" className="transition-colors hover:text-[var(--foreground)]">
                {isAr ? 'تواصل' : 'Contact'}
              </Link>
              {!isAr && (
                <Link href="/ar" className="transition-colors hover:text-[var(--foreground)]">
                  العربية
                </Link>
              )}
              {isAr && (
                <Link href="/" className="transition-colors hover:text-[var(--foreground)]">
                  English
                </Link>
              )}
            </nav>
            <a href="mailto:hello@ivoridigitals.com" className="text-[11px] text-[var(--text-label)] transition-colors hover:text-[var(--foreground)]">
              hello@ivoridigitals.com
            </a>
            <p className="text-[10px] text-[var(--text-ghost)]">
              © {new Date().getFullYear()} Ivori Digitals
            </p>
          </div>
        </div>
      </SectionContainer>
    </footer>
  )
}
