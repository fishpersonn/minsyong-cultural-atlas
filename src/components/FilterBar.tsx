import StyleDot from './StyleDot'

export type Chip = { key: string; label: string; count: number; color: string; icon: string }

type Props = {
  themes: Chip[]
  // 主題可複選；空陣列代表全部
  activeThemes: string[]
  onThemes: (themes: string[]) => void
  // 只選了一個主題、且該主題有多種分類時才會有
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
  onAll,
  onToggle,
}: {
  label: string
  allLabel: string
  chips: Chip[]
  active: string[]
  onAll: () => void
  onToggle: (key: string) => void
}) {
  return (
    <div role="group" aria-label={label} className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
      <button type="button" aria-pressed={active.length === 0} onClick={onAll} className={chipClass(active.length === 0)}>
        {allLabel}
      </button>
      {chips.map((c) => {
        const on = active.includes(c.key)
        return (
          <button key={c.key} type="button" aria-pressed={on} onClick={() => onToggle(c.key)} className={chipClass(on)}>
            <StyleDot color={c.color} icon={c.icon} className="size-5 ring-1 ring-white/70" />
            {c.label}
            <span className={on ? 'text-atlas-paper/70' : 'text-atlas-muted'}>{c.count}</span>
          </button>
        )
      })}
    </div>
  )
}

export default function FilterBar({ themes, activeThemes, onThemes, categories, activeCategory, onCategory }: Props) {
  if (themes.length === 0) return null
  return (
    <div className="flex flex-col gap-1">
      <Row
        label="依主題篩選"
        allLabel="全部主題"
        chips={themes}
        active={activeThemes}
        onAll={() => onThemes([])}
        onToggle={(key) => onThemes(activeThemes.includes(key) ? activeThemes.filter((t) => t !== key) : [...activeThemes, key])}
      />
      {categories.length > 0 && (
        <Row
          label="依分類篩選"
          allLabel="全部分類"
          chips={categories}
          active={activeCategory === null ? [] : [activeCategory]}
          onAll={() => onCategory(null)}
          onToggle={(key) => onCategory(activeCategory === key ? null : key)}
        />
      )}
    </div>
  )
}
