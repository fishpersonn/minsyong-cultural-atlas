import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
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
  'inline-flex min-h-11 shrink-0 sm:min-h-8 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-atlas-focus'

const chipClass = (selected: boolean) =>
  `${CHIP} snap-start ${
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
  // 選了排在右邊的晶片後，把它捲進可見範圍，使用者才看得到自己選了什麼
  const row = useRef<HTMLDivElement>(null)
  useEffect(() => {
    row.current?.querySelector<HTMLElement>('[aria-pressed="true"]')?.scrollIntoView?.({
      inline: 'nearest',
      block: 'nearest',
      behavior: 'smooth',
    })
  }, [active])

  // 還有晶片被捲到畫面外的那一側讓邊緣淡出，提示「這裡可以橫向滑」（手機沒有捲軸，不然很難發現）
  const [edge, setEdge] = useState({ left: false, right: false })
  useEffect(() => {
    const el = row.current
    if (!el) return
    const update = () => {
      const left = el.scrollLeft > 4
      const right = el.scrollLeft + el.clientWidth < el.scrollWidth - 4
      setEdge((prev) => (prev.left === left && prev.right === right ? prev : { left, right }))
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      el.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [chips.length])
  const fade = `linear-gradient(to right, ${edge.left ? 'transparent, black 28px' : 'black, black 0'}, ${
    edge.right ? 'black calc(100% - 36px), transparent' : 'black 100%, black'
  })`
  // 箭頭：滑鼠使用者不會「滑」，點箭頭往那一側捲大約 7 成的寬度
  const scrollRow = (direction: -1 | 1) =>
    row.current?.scrollBy?.({ left: direction * row.current.clientWidth * 0.7, behavior: 'smooth' })
  const ARROW =
    'absolute top-[calc(50%-2px)] z-10 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white text-atlas-ink shadow-md ring-1 ring-atlas-ink/15 outline-none hover:bg-atlas-hover focus-visible:ring-2 focus-visible:ring-atlas-focus'
  return (
    <div className="relative">
      <div
        ref={row}
        role="group"
        aria-label={label}
        data-fade={edge.left || edge.right ? `${edge.left ? 'left' : ''}${edge.left && edge.right ? '+' : ''}${edge.right ? 'right' : ''}` : undefined}
        style={edge.left || edge.right ? { maskImage: fade, WebkitMaskImage: fade } : undefined}
        className="flex snap-x snap-proximity gap-2 overflow-x-auto pb-1 [scrollbar-width:none]"
      >
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
      {edge.left && (
        <button type="button" aria-label={`${label}：往前`} onClick={() => scrollRow(-1)} className={`${ARROW} left-1`}>
          <ChevronLeft aria-hidden="true" className="size-5" />
        </button>
      )}
      {edge.right && (
        <button type="button" aria-label={`${label}：看更多`} onClick={() => scrollRow(1)} className={`${ARROW} right-1`}>
          <ChevronRight aria-hidden="true" className="size-5" />
        </button>
      )}
    </div>
  )
}

export default function FilterBar({ themes, activeThemes, onThemes, categories, activeCategory, onCategory }: Props) {
  if (themes.length === 0) return null
  return (
    <div className="flex flex-col gap-1.5">
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
