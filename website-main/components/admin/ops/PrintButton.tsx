'use client'

export default function PrintButton({ label = 'Download / Print PDF' }: { label?: string }) {
  return (
    <button type="button" className="admin-btn-primary bg-[#1a1814] text-white" onClick={() => window.print()}>
      {label}
    </button>
  )
}
