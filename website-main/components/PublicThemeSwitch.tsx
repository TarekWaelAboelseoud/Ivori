'use client'

import { useCallback, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

type PublicTheme = 'dark' | 'ivory'

function applyTheme(theme: PublicTheme) {
  document.documentElement.dataset.publicTheme = theme
  try {
    localStorage.setItem('ivori-public-theme', theme)
  } catch {
    /* private mode */
  }
}

/** Refined Dark / Ivory control — no cartoon bulb */
export default function PublicThemeSwitch() {
  const [theme, setTheme] = useState<PublicTheme>('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('ivori-public-theme') === 'ivory' ? 'ivory' : 'dark'
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync with layout boot script
    setTheme(stored)
    setMounted(true)
  }, [])

  const setMode = useCallback((next: PublicTheme) => {
    setTheme(next)
    applyTheme(next)
  }, [])

  if (!mounted) {
    return <span className="theme-mode-switch theme-mode-switch-skeleton" aria-hidden />
  }

  const isIvory = theme === 'ivory'

  return (
    <div
      className="theme-mode-switch"
      role="group"
      aria-label="Site appearance"
    >
      <button
        type="button"
        className={cn('theme-mode-option', !isIvory && 'theme-mode-option-active')}
        aria-pressed={!isIvory}
        onClick={() => setMode('dark')}
      >
        Dark
      </button>
      <span className="theme-mode-divider" aria-hidden />
      <button
        type="button"
        className={cn('theme-mode-option', isIvory && 'theme-mode-option-active')}
        aria-pressed={isIvory}
        onClick={() => setMode('ivory')}
      >
        Ivory
      </button>
    </div>
  )
}
