'use client'

export default function LogoutButton() {
  async function logout() {
    await fetch('/api/studio-ops/auth', { method: 'DELETE', credentials: 'same-origin' })
    window.location.assign('/studio-ops/login')
  }

  return (
    <button
      onClick={logout}
      className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
    >
      Sign out
    </button>
  )
}
