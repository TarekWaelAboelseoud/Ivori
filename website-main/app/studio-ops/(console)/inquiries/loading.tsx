export default function InquiriesLoading() {
  return (
    <div className="admin-console-layout">
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="admin-skeleton h-[5.5rem] w-full" aria-hidden />
        ))}
      </div>
    </div>
  )
}
