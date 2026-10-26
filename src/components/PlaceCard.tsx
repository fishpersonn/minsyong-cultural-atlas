import { useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { OFFICIAL_SITE_URL } from '@/constants'
import { Button } from '@/components/ui/button'
import { placeholderFor } from '@/lib/placeholder'
import type { PlaceGroup } from '@/types'

type Props = {
  group: PlaceGroup
  selectedId: string
  onSelect: (id: string) => void
  onClose: () => void
  // 依地點順序前後切換；沒傳就不顯示（單獨使用卡片時）
  nav?: { index: number; total: number; onPrev: () => void; onNext: () => void }
}

export default function PlaceCard({ group, selectedId, onSelect, onClose, nav }: Props) {
  const place = group.places.find((p) => p.id === selectedId) ?? group.places[0]
  // 記錄失敗的網址而非布林值：換到另一個地點時自然重置，且預設圖不會再觸發切換
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const first = place.images[0]
  const PLACEHOLDER = placeholderFor(place.id)
  const src = first && first !== failedSrc ? first : PLACEHOLDER
  const links = place.links.length > 0 ? place.links : [OFFICIAL_SITE_URL]

  return (
    <article className="relative flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-white text-atlas-ink">
      <Button
        type="button"
        size="icon"
        aria-label="關閉"
        onClick={onClose}
        className="absolute top-2 right-2 z-10 size-9 rounded-full bg-atlas-ink/80 text-atlas-paper hover:bg-atlas-ink"
      >
        <X aria-hidden="true" />
      </Button>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="relative aspect-video shrink-0 bg-atlas-mist">
          <img
            key={src}
            src={src}
            alt={place.title}
            onError={() => {
              if (src !== PLACEHOLDER) setFailedSrc(src)
            }}
            className="size-full object-cover motion-safe:animate-in motion-safe:fade-in motion-safe:duration-500"
          />
        </div>

        <div className="flex flex-col gap-3 p-4">
          {(place.category || place.year) && (
            <p className="text-xs font-medium tracking-wide text-atlas-amber">
              {[place.category, place.year].filter(Boolean).join('・')}
            </p>
          )}
          <h2 className="text-lg leading-snug font-semibold">{place.title}</h2>
          <p className="text-sm leading-relaxed text-atlas-body">{place.summary}</p>
          <div className="flex flex-wrap gap-2">
            {links.map((href, i) => (
              <Button
                key={href}
                asChild
                size="sm"
                className="bg-atlas-teal text-white hover:bg-atlas-ink"
              >
                <a href={href} target="_blank" rel="noopener noreferrer">
                  {i === 0 ? '到官網閱讀全文' : `到官網閱讀全文（${i + 1}）`}
                </a>
              </Button>
            ))}
          </div>
        </div>

        {group.places.length > 1 && (
          <ul className="border-t border-atlas-ink/10 py-1">
            {group.places.map((p) => {
              const current = p.id === place.id
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    aria-current={current ? 'true' : undefined}
                    onClick={() => onSelect(p.id)}
                    className={`block min-h-11 w-full cursor-pointer border-l-4 px-4 py-2 text-left text-sm outline-none focus-visible:ring-2 focus-visible:ring-atlas-focus focus-visible:ring-inset ${
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
        )}
      </div>

      {nav && (
        <div className="flex shrink-0 items-center justify-between gap-2 border-t border-atlas-ink/10 px-2 py-1.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label="上一個地點"
            onClick={nav.onPrev}
            className="text-atlas-ink"
          >
            <ChevronLeft aria-hidden="true" />
            上一個
          </Button>
          <span className="text-xs text-atlas-muted" aria-live="polite">
            {nav.index} / {nav.total}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label="下一個地點"
            onClick={nav.onNext}
            className="text-atlas-ink"
          >
            下一個
            <ChevronRight aria-hidden="true" />
          </Button>
        </div>
      )}
    </article>
  )
}
