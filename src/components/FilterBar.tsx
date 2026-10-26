import { categoryStyle } from '@/lib/categories'

type Props = {
  categories: { name: string; count: number }[]
  active: string | null
  onChange: (category: string | null) => void
}

const CHIP =
  'inline-flex min-h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3 text-sm shadow-md outline-none focus-visible:ring-2 focus-visible:ring-atlas-focus'

export default function FilterBar({ categories, active, onChange }: Props) {
  if (categories.length === 0) return null
  const chip = (selected: boolean) =>
    `${CHIP} ${selected ? 'bg-atlas-ink text-atlas-paper' : 'bg-white/95 text-atlas-ink hover:bg-white'}`
  return (
    <div
      role="group"
      aria-label="依分類篩選"
      className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]"
    >
      <button type="button" aria-pressed={active === null} onClick={() => onChange(null)} className={chip(active === null)}>
        全部
      </button>
      {categories.map((c) => (
        <button
          key={c.name}
          type="button"
          aria-pressed={active === c.name}
          onClick={() => onChange(active === c.name ? null : c.name)}
          className={chip(active === c.name)}
        >
          <span
            aria-hidden="true"
            className="size-2.5 rounded-full ring-1 ring-white/70"
            style={{ backgroundColor: categoryStyle(c.name).color }}
          />
          {c.name}
          <span className={active === c.name ? 'text-atlas-paper/70' : 'text-atlas-muted'}>{c.count}</span>
        </button>
      ))}
    </div>
  )
}
