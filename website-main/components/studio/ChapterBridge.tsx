import Box from './Box'
import ChapterLabel from './ChapterLabel'
import MotionHeading from './MotionHeading'

/** Editorial pause between narrative chapters — magazine-cover scale */
export default function ChapterBridge({
  chapter,
  title,
  subtitle,
}: {
  chapter: string
  title: string
  subtitle?: string
}) {
  return (
    <Box className="chapter-bridge relative border-y border-[var(--border)] py-14 sm:py-20">
      <Box className="relative mx-auto max-w-[var(--container-studio)] px-[var(--gutter)]">
        {chapter && chapter !== '—' && <ChapterLabel chapter={chapter}>{title}</ChapterLabel>}
        {chapter === '—' ? (
          <MotionHeading size="section" measure="section">
            {title}
          </MotionHeading>
        ) : null}
        {subtitle && (
          <p className="mt-6 max-w-2xl text-base font-light leading-8 text-[var(--text-body)] sm:text-lg">
            {subtitle}
          </p>
        )}
      </Box>
    </Box>
  )
}
