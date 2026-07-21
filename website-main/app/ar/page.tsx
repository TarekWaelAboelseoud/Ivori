import Nav from '@/components/Nav'
import { getAdminSettings } from '@/lib/admin/settings'
import Footer from '@/components/studio/Footer'
import CinematicHero from '@/components/studio/CinematicHero'
import MotionHeading from '@/components/studio/MotionHeading'
import SectionShell, { SectionContainer } from '@/components/studio/SectionShell'
import ChapterLabel from '@/components/studio/ChapterLabel'
import StatRow from '@/components/studio/StatRow'
import ImmersiveQuote from '@/components/studio/ImmersiveQuote'
import StudioCTA from '@/components/studio/StudioCTA'
import EditorialContrast from '@/components/studio/EditorialContrast'
import WhatsAppStrip from '@/components/studio/WhatsAppStrip'
import { campaigns } from '@/lib/content/visual-assets'
import { whatsappHref } from '@/lib/contact'
import { studioPrinciplesAr } from '@/lib/content/studio-principles'
import { serviceGroupsAr } from '@/lib/content/studio-services'
import EditorialSystems from '@/components/studio/EditorialSystems'
import ChapterBridge from '@/components/studio/ChapterBridge'

export default async function ArabicPage() {
  const settings = await getAdminSettings()
  const showWhatsApp =
    settings.whatsapp.enabled &&
    settings.whatsapp.channel !== 'off' &&
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER

  return (
    <>
      <Nav lang="ar" />
      <main className="bg-[var(--background)] pb-20 font-[family-name:var(--font-arabic)]" dir="rtl">
        <CinematicHero
          label="القاهرة · مصر والمنطقة"
          imageSrc={campaigns.hero}
          lead="استوديو واحد من الإعلان للدفع — مبني لعلامات التجارة في المنطقة."
          title={
            <MotionHeading as="h1" size="hero" animate measure="hero">
              تقنية
              <br />
              إبداعية
              <br />
              <em className="text-[var(--gold)]">للتجارة.</em>
            </MotionHeading>
          }
          cta={{ href: '/contact', label: 'ابدأ مشروعك' }}
          secondaryCta={{
            href: whatsappHref('أهلا Ivori Digitals، أريد مناقشة نمو متجري.'),
            label: 'واتساب',
          }}
          footer={
            <p className="text-[10px] font-medium text-white/40">
              CRO · AI · MEDIA · SHOPIFY
            </p>
          }
        />

        <SectionShell size="lg" border="top">
          <SectionContainer>
            <div className="grid gap-12 lg:grid-cols-[minmax(0,11rem)_1fr] lg:gap-20">
              <ChapterLabel chapter="02">المشكلة</ChapterLabel>
              <div>
                <MotionHeading size="display" measure="display">
                  النمو ينكسر بين
                  <br />
                  <em>الإعلان والمتجر.</em>
                </MotionHeading>
                <p className="prose-lead mt-8 max-w-2xl text-[var(--foreground)]">
                  الإعلانات تجيب زيارات. المتجر هو اللي يغلق البيع. معظم مشاكل التحويل بين الكليك والدفع — خاصة على الموبايل.
                </p>
              </div>
            </div>
          </SectionContainer>
        </SectionShell>

        <SectionShell size="md" reveal={false}>
          <SectionContainer narrow>
            <ChapterLabel className="mb-10">التحول</ChapterLabel>
            <EditorialContrast locale="ar" />
          </SectionContainer>
        </SectionShell>

        <ChapterBridge chapter="—" title="استوديو متكامل" subtitle="قدرات تحريرية — طريقة عملنا." />

        <SectionShell size="lg" border="y">
          <SectionContainer narrow>
            <ChapterLabel className="mb-10">القدرات</ChapterLabel>
            <EditorialSystems groups={serviceGroupsAr} />
          </SectionContainer>
        </SectionShell>

        <SectionShell size="lg" reveal={false}>
          <SectionContainer>
            <ChapterLabel chapter="04" tone="gold">
              الإنتاج
            </ChapterLabel>
            <MotionHeading size="display" measure="display" className="mt-[var(--stack-sm)]">
              إبداع
              <br />
              <em className="text-[var(--gold)]">مبني للتحويل.</em>
            </MotionHeading>
            <p className="prose-lead mt-6 max-w-xl">
              بنية إنتاج حديثة — ذكاء اصطناعي، أداء، وتجارة في إطار واحد.
            </p>
          </SectionContainer>
        </SectionShell>

        <SectionShell size="md" reveal={false}>
          <SectionContainer>
            <ChapterLabel className="mb-10">الاستوديو</ChapterLabel>
            <StatRow stats={[...studioPrinciplesAr]} />
          </SectionContainer>
        </SectionShell>

        <SectionShell size="lg">
          <SectionContainer narrow>
            <ImmersiveQuote
              quote={
                <>
                  ننفّذ عملاً،
                  <br />
                  لا <em>عروضاً فقط.</em>
                </>
              }
              body="استوديو واحد من القاهرة — للعلامات التي تنافس على التحويل."
              cta={{ href: '/contact', label: 'ابدأ المحادثة' }}
            />
          </SectionContainer>
        </SectionShell>

        <SectionShell size="lg" border="top">
          <SectionContainer>
            <div className="flex flex-col gap-10 sm:flex-row sm:items-end sm:justify-between">
              <MotionHeading size="display" measure="display">ابدأ بموجز واضح.</MotionHeading>
              <StudioCTA href="/contact" variant="pill">
                تواصل معنا
              </StudioCTA>
            </div>
          </SectionContainer>
        </SectionShell>
      </main>
      <Footer lang="ar" />
      {showWhatsApp && settings.whatsapp.channel === 'footer' && (
        <WhatsAppStrip
          label="واتساب — محادثة مباشرة مع الاستوديو"
          message="أهلا Ivori Digitals، أريد مناقشة نمو متجري."
        />
      )}
    </>
  )
}
