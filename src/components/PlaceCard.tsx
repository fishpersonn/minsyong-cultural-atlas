import { useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { OFFICIAL_SITE_URL } from '@/constants'
import { Button } from '@/components/ui/button'
import { themeName } from '@/data/themes'
import { placeStyle } from '@/lib/placeStyle'
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
    <article className="atlas-paper relative flex min-h-0 w-full flex-1 flex-col overflow-hidden text-atlas-ink">
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
        <div className="relative aspect-[16/7] shrink-0 bg-atlas-mist md:aspect-video">
          <img
            key={src}
            src={src}
            alt={place.title}
            onError={() => {
              if (src !== PLACEHOLDER) setFailedSrc(src)
            }}
            className="size-full object-cover [filter:sepia(0.3)_contrast(1.05)_saturate(0.9)] motion-safe:animate-in motion-safe:fade-in motion-safe:duration-500"
          />
          {/* 暈影：讓圖片邊緣略暗，像老照片 */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 shadow-[inset_0_0_48px_rgb(70_45_10/0.4)]" />
        </div>

        <div className="flex flex-col gap-3 p-4">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-medium tracking-wide text-atlas-body">
            <span className="inline-flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="size-2.5 rounded-full"
                style={{ backgroundColor: placeStyle(place).color }}
              />
              {themeName(place.theme)}
            </span>
            {place.category && <span>{place.category}</span>}
            {place.era && <span className="text-atlas-muted">{place.era}</span>}
          </p>
          <h2 className="font-title text-lg leading-snug font-semibold">{place.title}</h2>
          {place.summary && <p className="text-sm leading-relaxed text-atlas-body">{place.summary}</p>}
          {place.extra && (
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
              {place.extra.map(([label, value]) => (
                <div key={label} className="contents">
                  <dt className="text-atlas-muted">{label}</dt>
                  <dd className="text-atlas-body">{value}</dd>
                </div>
              ))}
            </dl>
          )}
          {place.published && (
            <p className="text-xs text-atlas-muted">官網發布於 {place.published.replaceAll('-', '.')}</p>
          )}
          <div className="flex flex-wrap gap-2">
            {links.map((href, i) => (
              <Button
                key={href}
                asChild
                size="sm"
                className="bg-atlas-teal text-white hover:bg-atlas-ink"
              >
                <a href={href} target="_blank" rel="noopener noreferrer">
                  {place.links.length === 0 ? '前往大學路官網' : i === 0 ? '到官網閱讀全文' : `到官網閱讀全文（${i + 1}）`}
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
