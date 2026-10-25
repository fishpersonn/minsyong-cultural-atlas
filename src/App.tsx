import SiteHeader from '@/components/SiteHeader'
import MapView from '@/components/MapView'
import PlaceCard from '@/components/PlaceCard'
import { Button } from '@/components/ui/button'
import { OFFICIAL_SITE_URL } from '@/constants'
import { themes } from '@/data/themes'
import { useSelectedId } from '@/hooks/useSelectedId'
import { parsePlaces } from '@/lib/parsePlaces'
import { groupByLocation, initialBounds } from '@/lib/groupPlaces'

// 資料是靜態的：在模組層級算一次，groups 在整個生命週期內保持同一個參照，
// MapView 才不會在每次選取時重建標記（會遺失鍵盤焦點）。
const parsed = themes.map((t) => ({ theme: t.id, ...parsePlaces(t.data, t.id) }))
const places = parsed.flatMap((r) => r.places)
const skipped = parsed.flatMap((r) => r.skipped.map((s) => ({ ...s, theme: r.theme })))
const groups = groupByLocation(places)
const bounds = initialBounds(places)

if (import.meta.env.DEV && skipped.length > 0) {
  console.warn(
    `略過 ${skipped.length} 筆無法顯示的資料：\n` +
      skipped.map((s) => `[${s.theme}] #${s.index}: ${s.reason}`).join('\n'),
  )
}

export default function App() {
  const [selectedId, select] = useSelectedId()
  // 找不到對應地點（網址亂填）等同無選取，不改寫網址
  const selectedGroup = selectedId
    ? groups.find((g) => g.places.some((p) => p.id === selectedId))
    : undefined

  return (
    <div className="flex h-dvh flex-col">
      <SiteHeader />
      <main className="relative min-h-0 flex-1">
        {groups.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center text-[#14313b]">
            <p className="text-base">目前沒有可顯示的地點</p>
            <Button asChild className="bg-[#1f6f8b] text-white hover:bg-[#14313b]">
              <a href={OFFICIAL_SITE_URL} target="_blank" rel="noopener noreferrer">
                前往大學路官網
              </a>
            </Button>
          </div>
        ) : (
          <>
            <div className="absolute inset-0">
              <MapView groups={groups} bounds={bounds} selectedId={selectedId} onSelect={select} />
            </div>
            {selectedGroup && selectedId && (
              <aside
                aria-label="地點資訊"
                className="absolute inset-x-0 bottom-0 z-10 flex max-h-[60dvh] flex-col overflow-hidden rounded-t-2xl shadow-[0_-4px_20px_rgb(20_49_59/0.25)] md:inset-x-auto md:top-3 md:left-3 md:bottom-auto md:max-h-[calc(100dvh-6rem)] md:w-[400px] md:rounded-2xl md:shadow-xl"
              >
                <PlaceCard
                  group={selectedGroup}
                  selectedId={selectedId}
                  onSelect={select}
                  onClose={() => select(null)}
                />
              </aside>
            )}
          </>
        )}
      </main>
    </div>
  )
}
