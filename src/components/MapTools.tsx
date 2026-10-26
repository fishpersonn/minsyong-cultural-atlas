import { useEffect, useState } from 'react'
import { LocateFixed, Shuffle } from 'lucide-react'
import { formatDistance, nearestPlace, randomPlace } from '@/lib/nearest'
import type { Place } from '@/types'

type Props = {
  // 目前符合篩選的地點：隨機與附近都只在這些裡面找
  places: Place[]
  selectedId: string | null
  onPick: (id: string) => void
}

// 離民雄超過這個距離，「最近的地點」沒有參考價值
const NEARBY_LIMIT_M = 20_000

// 預設只有圓形圖示（安靜、不搶地圖）；滑鼠移上去或鍵盤聚焦時，文字從圖示左邊滑出來。
// 手機沒有滑鼠，圖示本身有 aria-label 與 title，點了就會動作。
const BUTTON =
  'group/tool inline-flex h-11 cursor-pointer items-center overflow-hidden rounded-full bg-white text-sm font-medium text-atlas-ink shadow-md outline-none hover:bg-atlas-hover focus-visible:ring-2 focus-visible:ring-atlas-focus disabled:cursor-wait disabled:opacity-70'
const REVEAL =
  'max-w-0 overflow-hidden whitespace-nowrap pr-0 opacity-0 transition-all duration-200 motion-reduce:transition-none group-hover/tool:max-w-32 group-hover/tool:pr-4 group-hover/tool:opacity-100 group-focus-visible/tool:max-w-32 group-focus-visible/tool:pr-4 group-focus-visible/tool:opacity-100'

function Tool({
  label,
  icon,
  onClick,
  disabled,
}: {
  label: string
  icon: React.ReactNode
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} disabled={disabled} className={BUTTON}>
      <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center">
        {icon}
      </span>
      <span aria-hidden="true" className={REVEAL}>
        {label}
      </span>
    </button>
  )
}


export default function MapTools({ places, selectedId, onPick }: Props) {
  const [notice, setNotice] = useState<string | null>(null)
  const [locating, setLocating] = useState(false)

  useEffect(() => {
    if (notice === null) return
    const timer = setTimeout(() => setNotice(null), 6000)
    return () => clearTimeout(timer)
  }, [notice])

  const random = () => {
    const place = randomPlace(places, selectedId)
    if (place) {
      setNotice(null)
      onPick(place.id)
    } else setNotice('沒有符合的地點')
  }

  const nearby = () => {
    if (!navigator.geolocation) return setNotice('這個瀏覽器不支援定位')
    if (places.length === 0) return setNotice('沒有符合的地點')
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocating(false)
        const found = nearestPlace(places, { lng: coords.longitude, lat: coords.latitude })
        if (!found) return setNotice('沒有符合的地點')
        if (found.meters > NEARBY_LIMIT_M) {
          setNotice(`你離民雄約 ${Math.round(found.meters / 1000)} 公里，來民雄再試試「身邊有什麼」吧`)
          return
        }
        setNotice(`最近的地點在${formatDistance(found.meters)}外`)
        onPick(found.place.id)
      },
      (error) => {
        setLocating(false)
        setNotice(error.code === error.PERMISSION_DENIED ? '無法定位：請在瀏覽器允許位置權限' : '暫時無法取得你的位置')
      },
      { timeout: 10_000, maximumAge: 60_000 },
    )
  }

  return (
    <div className="absolute top-44 right-2.5 z-10 flex max-w-[calc(100%-1.25rem)] flex-col items-end gap-2">
      <Tool label="隨便逛逛" icon={<Shuffle className="size-4" />} onClick={random} />
      <Tool
        label={locating ? '定位中…' : '身邊有什麼'}
        icon={<LocateFixed className={`size-4 ${locating ? 'animate-pulse' : ''}`} />}
        onClick={nearby}
        disabled={locating}
      />
      {notice !== null && (
        <p role="status" className="rounded-lg bg-atlas-ink px-3 py-2 text-sm text-atlas-paper shadow-md">
          {notice}
        </p>
      )}
    </div>
  )
}
