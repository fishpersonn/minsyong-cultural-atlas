import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { themeName } from '@/data/themes'
import { placeStyle } from '@/lib/placeStyle'
import StyleDot from '@/components/StyleDot'
import type { Place } from '@/types'

type Props = {
  places: Place[]
  total: number
  selectedId: string | null
  filtered: boolean
  onClearFilters: () => void
  onSelect: (id: string) => void
  onClose: () => void
}

export default function PlaceList({
  places,
  total,
  selectedId,
  filtered,
  onClearFilters,
  onSelect,
  onClose,
}: Props) {
  return (
    <section
      aria-label="地點清單"
      className="atlas-paper flex min-h-0 w-full flex-1 flex-col overflow-hidden text-atlas-ink"
    >
      <div className="flex items-center justify-between gap-2 border-b border-atlas-ink/10 px-4 py-3">
        <h2 className="font-title text-base font-semibold">
          地點清單（{filtered ? `${places.length} / ${total}` : total}）
        </h2>
        <Button
          type="button"
          size="icon"
          aria-label="關閉清單"
          onClick={onClose}
          className="size-9 rounded-full bg-atlas-ink/80 text-atlas-paper hover:bg-atlas-ink"
        >
          <X aria-hidden="true" />
        </Button>
      </div>
      {places.length === 0 ? (
        <div className="flex flex-col items-start gap-3 p-4 text-sm text-atlas-body">
          <p>沒有符合的地點。</p>
          <Button type="button" size="sm" variant="outline" onClick={onClearFilters} className="border-atlas-ink/30 text-atlas-ink">
            清除篩選與搜尋
          </Button>
        </div>
      ) : (
        <ul className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-1">
          {places.map((p) => {
            const current = p.id === selectedId
            return (
              <li key={p.id}>
                <button
                  type="button"
                  aria-current={current ? 'true' : undefined}
                  onClick={() => onSelect(p.id)}
                  className={`flex min-h-11 w-full cursor-pointer items-start gap-2 border-l-4 px-4 py-2.5 text-left text-sm leading-snug outline-none focus-visible:ring-2 focus-visible:ring-atlas-focus focus-visible:ring-inset ${
                    current
                      ? 'border-atlas-amber bg-atlas-sand font-semibold'
                      : 'border-transparent text-atlas-body hover:bg-atlas-hover'
                  }`}
                >
                  <StyleDot {...placeStyle(p)} className="mt-0.5 size-5" />
                  <span className="min-w-0">
                    {p.title}
                    <span className="block text-xs font-normal text-atlas-muted">{themeName(p.theme)}</span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
