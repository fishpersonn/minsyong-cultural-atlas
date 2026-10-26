import SiteHeader from '@/components/SiteHeader'
import MapView from '@/components/MapView'
import PlaceCard from '@/components/PlaceCard'
import PlaceList from '@/components/PlaceList'
import IntroHint from '@/components/IntroHint'
import { Button } from '@/components/ui/button'
import { OFFICIAL_SITE_URL } from '@/constants'
import { themes } from '@/data/themes'
import { useSelectedId } from '@/hooks/useSelectedId'
import { useIntroDismissed } from '@/hooks/useIntroDismissed'
import { useEffect, useState } from 'react'
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

// 卡片與清單共用的面板：手機為底部抽屜，桌面為左側浮動面板（MapView 的 padding 依此計算）
const PANEL_CLASS =
  'motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-8 motion-safe:duration-300 md:motion-safe:slide-in-from-bottom-0 md:motion-safe:slide-in-from-left-8 absolute inset-x-0 bottom-0 z-10 flex max-h-[60dvh] flex-col overflow-hidden rounded-t-2xl shadow-[0_-4px_20px_rgb(20_49_59/0.25)] md:inset-x-auto md:top-3 md:left-3 md:bottom-auto md:max-h-[calc(100dvh-6rem)] md:w-[400px] md:rounded-2xl md:shadow-xl'

export default function App() {
  const [selectedId, select] = useSelectedId()
  const [listOpen, setListOpen] = useState(false)
  const [introDismissed, dismissIntro] = useIntroDismissed()
  // 從清單或標記選取地點時，清單讓位給卡片
  const choose = (id: string | null) => {
    setListOpen(false)
    select(id)
  }

  // Esc：先關清單，再關卡片
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (listOpen) setListOpen(false)
      else if (selectedId) select(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [listOpen, selectedId, select])

  const selectedIndex = selectedId ? places.findIndex((p) => p.id === selectedId) : -1
  const step = (delta: number) => {
    const n = places.length
    choose(places[(selectedIndex + delta + n) % n].id)
  }
  // 找不到對應地點（網址亂填）等同無選取，不改寫網址
  const selectedGroup = selectedId
    ? groups.find((g) => g.places.some((p) => p.id === selectedId))
    : undefined

  return (
    <div className="flex h-dvh flex-col">
      <SiteHeader listOpen={listOpen} onToggleList={() => setListOpen((o) => !o)} />
      <main className="relative min-h-0 flex-1">
        {groups.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center text-atlas-ink">
            <p className="text-base">目前沒有可顯示的地點</p>
            <Button asChild className="bg-atlas-teal text-white hover:bg-atlas-ink">
              <a href={OFFICIAL_SITE_URL} target="_blank" rel="noopener noreferrer">
                前往大學路官網
              </a>
            </Button>
          </div>
        ) : (
          <>
            <div className="absolute inset-0">
              <MapView groups={groups} bounds={bounds} selectedId={selectedId} onSelect={choose} />
            </div>
            {listOpen && (
              <div className={PANEL_CLASS}>
                <PlaceList
                  places={places}
                  selectedId={selectedId}
                  onSelect={choose}
                  onClose={() => setListOpen(false)}
                />
              </div>
            )}
            {!listOpen && !selectedGroup && !introDismissed && (
              <div className="absolute inset-x-3 bottom-3 z-10 md:inset-x-auto md:top-3 md:left-3 md:bottom-auto md:w-[400px]">
                <IntroHint
                  count={places.length}
                  onOpenList={() => setListOpen(true)}
                  onDismiss={dismissIntro}
                />
              </div>
            )}
            {!listOpen && selectedGroup && selectedId && (
              <aside
                aria-label="地點資訊"
                className={PANEL_CLASS}
              >
                {/* key 讓切換地點時換一張新卡片，捲動位置回到頂端 */}
                <PlaceCard
                  key={selectedId}
                  group={selectedGroup}
                  selectedId={selectedId}
                  onSelect={choose}
                  onClose={() => select(null)}
                  nav={
                    selectedIndex >= 0
                      ? {
                          index: selectedIndex + 1,
                          total: places.length,
                          onPrev: () => step(-1),
                          onNext: () => step(1),
                        }
                      : undefined
                  }
                />
              </aside>
            )}
          </>
        )}
      </main>
    </div>
  )
}
