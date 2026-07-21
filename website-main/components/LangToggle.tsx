import Link from 'next/link'

export default function LangToggle({ lang }: { lang: 'en' | 'ar' }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-[#2a2722] bg-[#11100e] p-1 text-xs font-medium">
      <Link
        href="/"
        className={`rounded-full px-3 py-1.5 transition-colors ${
          lang === 'en' ? 'bg-[#f5f2ec] text-[#0a0a0a]' : 'text-[#a8a29a] hover:text-[#f5f2ec]'
        }`}
      >
        EN
      </Link>
      <Link
        href="/ar"
        className={`rounded-full px-3 py-1.5 transition-colors ${
          lang === 'ar' ? 'bg-[#f5f2ec] text-[#0a0a0a]' : 'text-[#a8a29a] hover:text-[#f5f2ec]'
        }`}
      >
        AR
      </Link>
    </div>
  )
}
