import MotionHeading from './MotionHeading'

const en = [
  {
    phase: 'Before',
    title: (
      <>
        A promise in the ad.
        <br />
        <em>A different story in store.</em>
      </>
    ),
    body: 'Creative, landing, and checkout rarely align.',
  },
  {
    phase: 'After',
    title: (
      <>
        One editorial line
        <br />
        <em>from click to purchase.</em>
      </>
    ),
    body: 'Aligned copy, product presentation, and MENA-native payment clarity — built as a single experience.',
    accent: true,
  },
] as const

const ar = [
  {
    phase: 'قبل',
    title: (
      <>
        وعد في الإعلان.
        <br />
        <em>قصة مختلفة في المتجر.</em>
      </>
    ),
    body: 'الإبداع والصفحة والدفع نادراً ما يحكوا نفس القصة. المشتري على الموبايل يحس الفجوة فوراً.',
  },
  {
    phase: 'بعد',
    title: (
      <>
        خط تحريري واحد
        <br />
        <em>من الكليك للشراء.</em>
      </>
    ),
    body: 'رسالة متسقة، عرض منتج واضح، ودفع مناسب للسوق — تجربة واحدة متماسكة.',
    accent: true,
  },
] as const

export default function EditorialContrast({ locale = 'en' }: { locale?: 'en' | 'ar' }) {
  const pairs = locale === 'ar' ? ar : en

  return (
    <div className="grid gap-12 md:grid-cols-2 md:gap-14 lg:gap-16">
      {pairs.map((item) => (
        <article key={item.phase} className="relative">
          <p
            className={`type-caption ${
              'accent' in item && item.accent ? '!text-[var(--gold)]' : ''
            }`}
          >
            {item.phase}
          </p>
          <MotionHeading size="title" className="mt-4 max-w-[var(--measure-section)]">
            {item.title}
          </MotionHeading>
          <p className="prose-body mt-4">{item.body}</p>
        </article>
      ))}
    </div>
  )
}
