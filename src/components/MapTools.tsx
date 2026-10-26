import { useEffect, useState } from 'react'
import { LocateFixed, Shuffle } from 'lucide-react'
import { nearestPlace, randomPlace } from '@/lib/nearest'
import type { Place } from '@/types'

type Props = {
  // 目前符合篩選的地點：隨機與附近都只在這些裡面找
  places: Place[]
  selectedId: string | null
  onPick: (id: string) => void
}

// 離民雄超過這個距離，「最近的地點」沒有參考價值
const NEARBY_LIMIT_M = 20_000

const BUTTON =
  'inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full bg-white px-3.5 text-sm font-medium text-atlas-ink shadow-md outline-none hover:bg-atlas-hover focus-visible:ring-2 focus-visible:ring-atlas-focus disabled:cursor-wait disabled:opacity-70'

const formatDistance = (m: number) => (m < 1000 ? `${Math.round(m / 10) * 10} 公尺` : `${(m / 1000).toFixed(1)} 公里`)

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
          setNotice(`你離民雄約 ${Math.round(found.meters / 1000)} 公里，來民雄再試試「我附近」吧`)
          return
        }
        setNotice(`最近的地點在約 ${formatDistance(found.meters)} 外`)
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
      <button type="button" onClick={random} className={BUTTON}>
        <Shuffle aria-hidden="true" className="size-4" />
        隨機一個
      </button>
      <button type="button" onClick={nearby} disabled={locating} className={BUTTON}>
        <LocateFixed aria-hidden="true" className="size-4" />
        {locating ? '定位中…' : '我附近'}
      </button>
      {notice !== null && (
        <p role="status" className="rounded-lg bg-atlas-ink px-3 py-2 text-sm text-atlas-paper shadow-md">
          {notice}
        </p>
      )}
    </div>
  )
}
