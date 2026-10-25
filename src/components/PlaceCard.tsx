import { useState } from 'react'
import { X } from 'lucide-react'
import { OFFICIAL_SITE_URL } from '@/constants'
import { Button } from '@/components/ui/button'
import type { PlaceGroup } from '@/types'

type Props = {
  group: PlaceGroup
  selectedId: string
  onSelect: (id: string) => void
  onClose: () => void
}

const PLACEHOLDER = `${import.meta.env.BASE_URL}placeholder.svg`

export default function PlaceCard({ group, selectedId, onSelect, onClose }: Props) {
  const place = group.places.find((p) => p.id === selectedId) ?? group.places[0]
  // 記錄失敗的網址而非布林值：換到另一個地點時自然重置，且預設圖不會再觸發切換
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const first = place.images[0]
  const src = first && first !== failedSrc ? first : PLACEHOLDER
  const links = place.links.length > 0 ? place.links : [OFFICIAL_SITE_URL]

  return (
    <article className="flex max-h-full w-full flex-col overflow-y-auto bg-white text-[#14313b]">
      <div className="relative aspect-video shrink-0 bg-[#e3e9e6]">
        <img
          src={src}
          alt={place.title}
          onError={() => {
            if (src !== PLACEHOLDER) setFailedSrc(src)
          }}
          className="size-full object-cover"
        />
        <Button
          type="button"
          size="icon"
          aria-label="關閉"
          onClick={onClose}
          className="absolute top-2 right-2 size-9 rounded-full bg-[#14313b]/80 text-[#f4f6f3] hover:bg-[#14313b]"
        >
          <X aria-hidden="true" />
        </Button>
      </div>

      <div className="flex flex-col gap-3 p-4">
        <h2 className="text-lg leading-snug font-semibold">{place.title}</h2>
        <p className="text-sm leading-relaxed text-[#3d4b53]">{place.summary}</p>
        <div className="flex flex-wrap gap-2">
          {links.map((href, i) => (
            <Button
              key={href}
              asChild
              size="sm"
              className="bg-[#1f6f8b] text-white hover:bg-[#14313b]"
            >
              <a href={href} target="_blank" rel="noopener noreferrer">
                {i === 0 ? '到官網閱讀全文' : `到官網閱讀全文（${i + 1}）`}
              </a>
            </Button>
          ))}
        </div>
      </div>

      {group.places.length > 1 && (
        <ul className="border-t border-[#14313b]/10 py-1">
          {group.places.map((p) => {
            const current = p.id === place.id
            return (
              <li key={p.id}>
                <button
                  type="button"
                  aria-current={current ? 'true' : undefined}
                  onClick={() => onSelect(p.id)}
                  className={`block min-h-11 w-full cursor-pointer border-l-4 px-4 py-2 text-left text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#f2b134] focus-visible:ring-inset ${
                    current
                      ? 'border-[#d98e04] bg-[#f6efe0] font-semibold'
                      : 'border-transparent text-[#3d4b53] hover:bg-[#eef1ee]'
                  }`}
                >
                  {p.title}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </article>
  )
}
