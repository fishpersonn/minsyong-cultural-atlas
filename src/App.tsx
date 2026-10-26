import SiteHeader from '@/components/SiteHeader'
import MapView from '@/components/MapView'
import PlaceCard from '@/components/PlaceCard'
import PlaceList from '@/components/PlaceList'
import IntroHint from '@/components/IntroHint'
import FilterBar from '@/components/FilterBar'
import { Button } from '@/components/ui/button'
import { OFFICIAL_SITE_URL } from '@/constants'
import { themes } from '@/data/themes'
import { useSelectedId } from '@/hooks/useSelectedId'
import { useIntroDismissed } from '@/hooks/useIntroDismissed'
import { useEffect, useMemo, useState } from 'react'
import { parsePlaces } from '@/lib/parsePlaces'
import { groupByLocation, initialBounds } from '@/lib/groupPlaces'
import { CATEGORY_STYLES } from '@/lib/categories'
import { matchesFilters } from '@/lib/filterPlaces'

// 資料是靜態的：在模組層級算一次。篩選後的 groups 只在篩選條件改變時才重算，
// 選取地點不會讓 MapView 重建標記（會遺失鍵盤焦點）。
const parsed = themes.map((t) => ({ theme: t.id, ...parsePlaces(t.data, t.id, t.meta) }))
const places = parsed.flatMap((r) => r.places)
const skipped = parsed.flatMap((r) => r.skipped.map((s) => ({ ...s, theme: r.theme })))
const allGroups = groupByLocation(places)
const bounds = initialBounds(places)
// 篩選列依 CATEGORY_STYLES 的順序，只列出資料裡真的有的分類
const categories = Object.keys(CATEGORY_STYLES)
  .map((name) => ({ name, count: places.filter((p) => p.category === name).length }))
  .filter((c) => c.count > 0)

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
  const [category, setCategory] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const filtered = category !== null || query.trim() !== ''
  const visiblePlaces = useMemo(
    () => (filtered ? places.filter((p) => matchesFilters(p, category, query)) : places),
    [filtered, category, query],
  )
  const groups = useMemo(
    () => (filtered ? groupByLocation(visiblePlaces) : allGroups),
    [filtered, visiblePlaces],
  )

  // 篩選或搜尋改變後，目前選取的地點若被排除就取消選取（卡片不會停在看不見的地點上）
  const applyFilters = (nextCategory: string | null, nextQuery: string) => {
    setCategory(nextCategory)
    setQuery(nextQuery)
    const current = selectedId ? places.find((p) => p.id === selectedId) : undefined
    if (current && !matchesFilters(current, nextCategory, nextQuery)) select(null)
  }
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

  const selectedIndex = selectedId ? visiblePlaces.findIndex((p) => p.id === selectedId) : -1
  const step = (delta: number) => {
    const n = visiblePlaces.length
    choose(visiblePlaces[(selectedIndex + delta + n) % n].id)
  }
  // 找不到對應地點（網址亂填）等同無選取，不改寫網址
  const selectedGroup = selectedId
    ? groups.find((g) => g.places.some((p) => p.id === selectedId))
    : undefined

  return (
    <div className="flex h-dvh flex-col">
      <SiteHeader listOpen={listOpen} onToggleList={() => setListOpen((o) => !o)} />
      {allGroups.length > 0 && categories.length > 0 && (
        <div className="shrink-0 border-b border-atlas-ink/10 bg-atlas-paper px-3 py-2">
          <FilterBar categories={categories} active={category} onChange={(c) => applyFilters(c, query)} />
        </div>
      )}
      <main className="relative min-h-0 flex-1">
        {allGroups.length === 0 ? (
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
            {filtered && visiblePlaces.length === 0 && !listOpen && (
              <p className="absolute top-3 left-3 z-10 inline-flex items-center gap-2 rounded-lg bg-white/95 px-3 py-2 text-sm shadow-md md:left-[424px]">
                沒有符合的地點
                <button
                  type="button"
                  onClick={() => applyFilters(null, '')}
                  className="cursor-pointer font-medium text-atlas-teal underline"
                >
                  清除篩選
                </button>
              </p>
            )}
            {listOpen && (
              <div className={PANEL_CLASS}>
                <PlaceList
                  places={visiblePlaces}
                  total={places.length}
                  filtered={filtered}
                  query={query}
                  onQuery={(q) => applyFilters(category, q)}
                  onClearFilters={() => applyFilters(null, '')}
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
                          total: visiblePlaces.length,
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
