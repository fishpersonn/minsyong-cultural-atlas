import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Place } from '@/types'

type Props = {
  places: Place[]
  selectedId: string | null
  onSelect: (id: string) => void
  onClose: () => void
}

export default function PlaceList({ places, selectedId, onSelect, onClose }: Props) {
  return (
    <section
      aria-label="地點清單"
      className="flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-white text-atlas-ink"
    >
      <div className="flex items-center justify-between gap-2 border-b border-atlas-ink/10 px-4 py-3">
        <h2 className="text-base font-semibold">地點清單（{places.length}）</h2>
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
      <ul className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-1">
        {places.map((p) => {
          const current = p.id === selectedId
          return (
            <li key={p.id}>
              <button
                type="button"
                aria-current={current ? 'true' : undefined}
                onClick={() => onSelect(p.id)}
                className={`block min-h-11 w-full cursor-pointer border-l-4 px-4 py-2.5 text-left text-sm leading-snug outline-none focus-visible:ring-2 focus-visible:ring-atlas-focus focus-visible:ring-inset ${
                  current
                    ? 'border-atlas-amber bg-atlas-sand font-semibold'
                    : 'border-transparent text-atlas-body hover:bg-atlas-hover'
                }`}
              >
                {p.title}
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
