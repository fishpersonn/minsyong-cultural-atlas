// 站標：深色圓角底、鐵軌與一個標記，和 favicon 同一個圖案
export default function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <rect width="64" height="64" rx="14" fill="#1d4452" />
      <path d="M8 42h48M8 50h48" stroke="#7fa3b1" strokeWidth="3" />
      <path d="M16 38v16M28 38v16M40 38v16M52 38v16" stroke="#7fa3b1" strokeWidth="3" />
      <circle cx="32" cy="22" r="10" fill="#d98e04" stroke="#f4f6f3" strokeWidth="3" />
    </svg>
  )
}
