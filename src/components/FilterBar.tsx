type Chip = { key: string; label: string; count: number; color: string }

type Props = {
  themes: Chip[]
  activeTheme: string | null
  onTheme: (theme: string | null) => void
  // 選了某個主題、且該主題有多種分類時才會有
  categories: Chip[]
  activeCategory: string | null
  onCategory: (category: string | null) => void
}

const CHIP =
  'inline-flex min-h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-atlas-focus'

const chipClass = (selected: boolean) =>
  `${CHIP} ${
    selected
      ? 'border-atlas-ink bg-atlas-ink text-atlas-paper'
      : 'border-atlas-ink/15 bg-white text-atlas-ink hover:bg-atlas-hover'
  }`

function Row({
  label,
  allLabel,
  chips,
  active,
  onChange,
}: {
  label: string
  allLabel: string
  chips: Chip[]
  active: string | null
  onChange: (key: string | null) => void
}) {
  return (
    <div role="group" aria-label={label} className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
      <button type="button" aria-pressed={active === null} onClick={() => onChange(null)} className={chipClass(active === null)}>
        {allLabel}
      </button>
      {chips.map((c) => (
        <button
          key={c.key}
          type="button"
          aria-pressed={active === c.key}
          onClick={() => onChange(active === c.key ? null : c.key)}
          className={chipClass(active === c.key)}
        >
          <span aria-hidden="true" className="size-2.5 rounded-full ring-1 ring-white/70" style={{ backgroundColor: c.color }} />
          {c.label}
          <span className={active === c.key ? 'text-atlas-paper/70' : 'text-atlas-muted'}>{c.count}</span>
        </button>
      ))}
    </div>
  )
}

export default function FilterBar({ themes, activeTheme, onTheme, categories, activeCategory, onCategory }: Props) {
  if (themes.length === 0) return null
  return (
    <div className="flex flex-col gap-1">
      <Row label="依主題篩選" allLabel="全部主題" chips={themes} active={activeTheme} onChange={onTheme} />
      {categories.length > 0 && (
        <Row label="依分類篩選" allLabel="全部分類" chips={categories} active={activeCategory} onChange={onCategory} />
      )}
    </div>
  )
}
