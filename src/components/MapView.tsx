import { useEffect, useRef, useState } from 'react'
import * as maplibregl from 'maplibre-gl'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'
import { BASEMAP_STYLE_URL } from '@/constants'
import type { PlaceGroup } from '@/types'
import MapFallback, { type FallbackReason } from './MapFallback'

// maplibre-gl 6 以 new URL('./maplibre-gl-worker.mjs', import.meta.url) 找 worker，
// Vite 預先打包與正式打包都不會帶上該檔，必須在建立任何 Map 前明確指定打包後的網址。
maplibregl.setWorkerUrl(workerUrl)

// 卡片覆蓋地圖的範圍：桌面為左側 400px 面板（含 12px 邊距再留一點空隙），手機為底部 60% 抽屜
const DESKTOP_QUERY = '(min-width: 768px)'
const DESKTOP_PANEL_PADDING = 424
const MOBILE_DRAWER_RATIO = 0.6

function cardPadding(el: HTMLElement | null) {
  if (window.matchMedia?.(DESKTOP_QUERY).matches) {
    return { left: DESKTOP_PANEL_PADDING, top: 0, right: 0, bottom: 0 }
  }
  return { bottom: Math.round((el?.clientHeight ?? 0) * MOBILE_DRAWER_RATIO), top: 0, left: 0, right: 0 }
}

type Props = {
  groups: PlaceGroup[]
  bounds: [[number, number], [number, number]]
  selectedId: string | null
  onSelect: (id: string | null) => void
}

type Entry = { group: PlaceGroup; el: HTMLButtonElement; dot: HTMLSpanElement; marker: maplibregl.Marker }

// 外層 button 是 MapLibre 定位用的元素（會被寫入 transform），不可加 transition；
// 視覺與動畫都放在內層 span，外層保證至少 44px 的點擊範圍。
const BUTTON_CLASS =
  'group flex size-11 cursor-pointer items-center justify-center rounded-full bg-transparent p-0 outline-none'
const DOT_BASE =
  'flex items-center justify-center rounded-full border-2 border-white text-xs font-semibold text-white shadow-md transition-transform group-focus-visible:ring-4 group-focus-visible:ring-atlas-focus/70'

const dotClass = (count: number, active: boolean) =>
  `${DOT_BASE} ${count > 1 ? 'size-9' : 'size-6'} ${active ? 'scale-125 bg-atlas-amber' : 'bg-atlas-teal'}`

const contains = (g: PlaceGroup, id: string | null) => id !== null && g.places.some((p) => p.id === id)

export default function MapView({ groups, bounds, selectedId, onSelect }: Props) {
  const container = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const entries = useRef<Entry[]>([])
  const onSelectRef = useRef(onSelect)
  const boundsRef = useRef(bounds)
  const selectedRef = useRef(selectedId)
  const [failed, setFailed] = useState<FallbackReason | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    onSelectRef.current = onSelect
    selectedRef.current = selectedId
  })

  useEffect(() => {
    if (!container.current) return
    let map: maplibregl.Map | undefined
    let removed = false
    const dispose = () => {
      if (removed || !map) return
      removed = true
      mapRef.current = null
      setReady(false)
      map.remove()
    }
    try {
      map = new maplibregl.Map({
        container: container.current,
        style: BASEMAP_STYLE_URL,
        // 預設的右下角版權標示會被手機底部抽屜遮住，改放到上方
        attributionControl: false,
      })
      map.addControl(new maplibregl.AttributionControl({ compact: true }), 'top-right')
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')
      map.fitBounds(boundsRef.current, { padding: 40, animate: false })
    } catch {
      map?.remove()
      // 建構是否成功只有在建立外部地圖物件時才知道（例如沒有 WebGL）
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFailed('unsupported')
      return
    }
    let loaded = false
    map.once('load', () => {
      loaded = true
    })
    // load 之前的錯誤代表底圖樣式或 worker 載入失敗；load 之後的個別圖磚錯誤屬正常。
    // 已移除的地圖（例如 StrictMode 重建前的那一個）晚到的錯誤不影響目前的地圖。
    map.on('error', () => {
      if (loaded || removed) return
      dispose()
      setFailed('load-failed')
    })
    mapRef.current = map
    setReady(true)
    return dispose
  }, [])

  // 只在 groups 或地圖就緒時建立／移除標記
  useEffect(() => {
    const map = mapRef.current
    if (!ready || !map) return
    const created: Entry[] = groups.map((g) => {
      const count = g.places.length
      const el = document.createElement('button')
      el.type = 'button'
      el.className = BUTTON_CLASS
      el.setAttribute('aria-label', count > 1 ? `${count} 個地點` : g.places[0].title)
      const dot = document.createElement('span')
      dot.textContent = count > 1 ? String(count) : ''
      el.appendChild(dot)
      el.addEventListener('click', () => onSelectRef.current(g.places[0].id))
      const marker = new maplibregl.Marker({ element: el }).setLngLat([g.lng, g.lat]).addTo(map)
      return { group: g, el, dot, marker }
    })
    entries.current = created
    for (const e of created) paint(e, selectedRef.current)
    return () => {
      created.forEach((e) => e.marker.remove())
      entries.current = []
    }
  }, [groups, ready])

  // 選取改變只更新樣式，不重建標記（保留鍵盤焦點）
  useEffect(() => {
    for (const e of entries.current) paint(e, selectedId)
  }, [selectedId, groups, ready])

  useEffect(() => {
    const map = mapRef.current
    if (!ready || !map || !selectedId) return
    const g = groups.find((x) => contains(x, selectedId))
    if (g) map.flyTo({ center: [g.lng, g.lat], padding: cardPadding(container.current) })
  }, [groups, selectedId, ready])

  if (failed) return <MapFallback reason={failed} />
  return <div ref={container} className="h-full w-full" />
}

function paint(e: Entry, selectedId: string | null) {
  const active = contains(e.group, selectedId)
  e.dot.className = dotClass(e.group.places.length, active)
  e.el.setAttribute('aria-pressed', String(active))
}
