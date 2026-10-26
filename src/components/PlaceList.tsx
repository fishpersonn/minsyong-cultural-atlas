import { useEffect, useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { themeName } from '@/data/themes'
import { placeStyle } from '@/lib/placeStyle'
import type { Place } from '@/types'

type Props = {
  places: Place[]
  total: number
  selectedId: string | null
  query: string
  filtered: boolean
  onQuery: (query: string) => void
  onClearFilters: () => void
  onSelect: (id: string) => void
  onClose: () => void
}

// 每一列的預估高度（標題可能折行，實際高度由 measureElement 量測後修正）
const ROW_ESTIMATE = 64

export default function PlaceList({
  places,
  total,
  selectedId,
  query,
  filtered,
  onQuery,
  onClearFilters,
  onSelect,
  onClose,
}: Props) {
  // 長清單只渲染看得到的那幾列（加上前後各 8 列的緩衝），地點再多也不會變慢
  const scroller = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Virtual 的函式不能被記憶化，這個元件不需要編譯器最佳化
  const virtualizer = useVirtualizer({
    count: places.length,
    getScrollElement: () => scroller.current,
    estimateSize: () => ROW_ESTIMATE,
    overscan: 8,
    getItemKey: (index) => places[index].id,
    // 第一次渲染時還量不到容器大小，先假設一個合理的高度
    initialRect: { width: 400, height: 600 },
  })

  // 打開清單時，把目前選取的地點捲到中間
  const initialSelected = useRef(selectedId)
  useEffect(() => {
    const index = places.findIndex((p) => p.id === initialSelected.current)
    if (index >= 0) virtualizer.scrollToIndex(index, { align: 'center' })
    // 只在打開時做一次；之後使用者自己捲動
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
      <div className="border-b border-atlas-ink/10 px-4 py-2">
        <label className="flex items-center gap-2 rounded-lg bg-atlas-hover px-3 text-sm focus-within:ring-2 focus-within:ring-atlas-focus">
          <Search aria-hidden="true" className="size-4 shrink-0 text-atlas-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="搜尋標題、內容或分類"
            aria-label="搜尋地點"
            className="min-h-10 w-full bg-transparent outline-none placeholder:text-atlas-muted"
          />
        </label>
      </div>
      {places.length === 0 ? (
        <div className="flex flex-col items-start gap-3 p-4 text-sm text-atlas-body">
          <p>沒有符合的地點。</p>
          <Button type="button" size="sm" variant="outline" onClick={onClearFilters} className="border-atlas-ink/30 text-atlas-ink">
            清除篩選與搜尋
          </Button>
        </div>
      ) : (
        <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-1">
          <ul className="relative w-full" style={{ height: virtualizer.getTotalSize() }}>
            {virtualizer.getVirtualItems().map((row) => {
              const p = places[row.index]
              const current = p.id === selectedId
              return (
                <li
                  key={row.key}
                  data-index={row.index}
                  ref={virtualizer.measureElement}
                  aria-setsize={places.length}
                  aria-posinset={row.index + 1}
                  className="absolute top-0 left-0 w-full"
                  style={{ transform: `translateY(${row.start}px)` }}
                >
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
                    <span
                      aria-hidden="true"
                      className="mt-1 size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: placeStyle(p).color }}
                    />
                    <span className="min-w-0">
                      {p.title}
                      <span className="block text-xs font-normal text-atlas-muted">{themeName(p.theme)}</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </section>
  )
}
