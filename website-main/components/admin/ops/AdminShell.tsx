'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import LogoutButton from '@/app/studio-ops/(console)/LogoutButton'
import { canAccess, type AdminModule, type AdminRole } from '@/lib/admin/permission-rules'

export const navGroups = [
  {
    label: 'Command Center',
    module: 'command',
    items: [{ href: '/studio-ops/overview', label: 'Overview' }],
  },
  {
    label: 'Leads & Inquiries',
    module: 'inquiries',
    items: [{ href: '/studio-ops/inquiries', label: 'Leads & Inquiries' }],
  },
  {
    label: 'Clients',
    module: 'clients',
    items: [
      { href: '/studio-ops/clients', label: 'Client Database' },
      { href: '/studio-ops/projects', label: 'Projects & Delivery' },
    ],
  },
  {
    label: 'Finance',
    module: 'finance',
    items: [{ href: '/studio-ops/finance', label: 'Finance' }],
  },
  {
    label: 'Receipts',
    module: 'receipts',
    items: [{ href: '/studio-ops/receipts', label: 'Receipts' }],
  },
  {
    label: 'Studio Work',
    module: 'studio',
    items: [
      { href: '/studio-ops/content', label: 'Content Calendar' },
      { href: '/studio-ops/internal-ops', label: 'Internal Ops' },
    ],
  },
  {
    label: 'Admin Users',
    module: 'users',
    items: [{ href: '/studio-ops/users', label: 'Admin Users' }],
  },
  {
    label: 'System',
    module: 'system',
    items: [{ href: '/studio-ops/system', label: 'System Settings' }],
  },
] satisfies { label: string; module: AdminModule; items: { href: string; label: string }[] }[]

function useAdminTheme() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window === 'undefined') return 'dark'
    return localStorage.getItem('ivori-admin-theme') === 'light' ? 'light' : 'dark'
  })

  useEffect(() => {
    document.documentElement.dataset.adminTheme = theme
  }, [theme])

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('ivori-admin-theme', next)
    document.documentElement.dataset.adminTheme = next
  }

  return { theme, toggleTheme }
}

function AdminNavLink({ href, label, onClick }: { href: string; label: string; onClick?: () => void }) {
  const pathname = usePathname()
  const active = pathname === href || (href !== '/studio-ops/overview' && pathname.startsWith(`${href}/`))
  return (
    <Link href={href} className={`admin-nav-link ${active ? 'admin-nav-link-active' : ''}`} onClick={onClick}>
      {label}
    </Link>
  )
}

export default function AdminShell({ children, role }: { children: React.ReactNode; role: AdminRole }) {
  const pathname = usePathname()
  const [openGroup, setOpenGroup] = useState<string | null>(null)
  const navRef = useRef<HTMLElement>(null)
  const { theme, toggleTheme } = useAdminTheme()

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!navRef.current?.contains(event.target as Node)) setOpenGroup(null)
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpenGroup(null)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  return (
    <div className="admin-panel min-h-screen" data-theme={theme}>
      <header className="admin-header sticky top-0 z-50">
        <div className="admin-container flex items-center justify-between gap-4 py-3">
          <div className="flex min-w-0 items-center gap-4">
            <Link href="/studio-ops/overview" className="flex shrink-0 items-center gap-2 text-sm font-semibold text-[var(--admin-ivory)]">
              <span className="grid h-7 w-7 place-items-center rounded-md border border-[color-mix(in_srgb,var(--admin-gold)_45%,transparent)] font-display text-sm text-[var(--admin-gold)]">
                I
              </span>
              Ivori
              <span className="admin-label ml-0.5">Console</span>
            </Link>
            <nav ref={navRef} className="hidden items-center gap-1 xl:flex" aria-label="Admin">
              {navGroups.filter((group) => canAccess(role, group.module, 'read')).map((group) => {
                const isOpen = openGroup === group.label
                const isActive = group.items.some((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
                return (
                  <div key={group.label} className="admin-nav-group">
                    <button
                      type="button"
                      className={`admin-nav-group-label ${isActive ? 'admin-nav-link-active' : ''}`}
                      aria-expanded={isOpen}
                      aria-haspopup="menu"
                      onClick={() => setOpenGroup(isOpen ? null : group.label)}
                    >
                      {group.label}
                    </button>
                    {isOpen && (
                      <div className="admin-nav-group-menu" role="menu">
                        {group.items.map((item) => (
                          <AdminNavLink key={item.href} href={item.href} label={item.label} onClick={() => setOpenGroup(null)} />
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className="admin-theme-toggle" onClick={toggleTheme} aria-label="Toggle admin theme">
              {theme === 'dark' ? 'Ivory' : 'Dark'}
            </button>
            <Link href="/" className="hidden text-xs text-[var(--admin-muted)] hover:text-[var(--admin-ivory)] sm:inline">
              Public site
            </Link>
            <Link href="/studio-ops/account" className="text-xs text-[var(--admin-muted)] hover:text-[var(--admin-ivory)]">
              My Account
            </Link>
            <LogoutButton />
          </div>
        </div>
        <nav className="admin-container flex gap-1 overflow-x-auto pb-3 xl:hidden" aria-label="Admin mobile">
          {navGroups.filter((group) => canAccess(role, group.module, 'read')).flatMap((group) => group.items).map((item) => (
            <AdminNavLink key={item.href} href={item.href} label={item.label} />
          ))}
        </nav>
      </header>
      <main className="admin-container py-6 pb-[max(2rem,env(safe-area-inset-bottom))]">{children}</main>
    </div>
  )
}
