import { useEffect, useRef, useState } from 'react'
import * as maplibregl from 'maplibre-gl'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'
import { BASEMAP_STYLE_URL } from '@/constants'
import { placeStyle } from '@/lib/placeStyle'
import { FALLBACK_CATEGORY } from '@/lib/categories'
import { THEME_STYLES } from '@/lib/themeStyles'
import { clusterGroups, type Cluster } from '@/lib/clusterGroups'
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
  // 數字變了就把地圖拉回目前的範圍（「回到首頁」用；第一次的值不算）
  resetSignal?: number
}

type Entry = { cluster: Cluster; el: HTMLButtonElement; dot: HTMLSpanElement; marker: maplibregl.Marker }

// 外層 button 是 MapLibre 定位用的元素（會被寫入 transform），不可加 transition；
// 視覺與動畫都放在內層 span，外層保證至少 44px 的點擊範圍。
const BUTTON_CLASS =
  'group flex size-11 cursor-pointer items-center justify-center rounded-full bg-transparent p-0 outline-none'
const DOT_BASE =
  'flex items-center justify-center rounded-full border-2 border-white text-xs font-semibold text-white shadow-md transition-transform group-focus-visible:ring-4 group-focus-visible:ring-atlas-focus/70'

// 顏色用行內樣式（依分類而定）；選取時放大、加光圈
const dotClass = (count: number, active: boolean) =>
  `${DOT_BASE} ${count > 1 ? 'size-9' : 'size-8'} ${active ? 'atlas-pulse scale-125 ring-4 ring-white/80' : ''}`

// 一個標記裡有多個地點時：樣式都相同就用該樣式；否則若同屬一個主題，用主題的顏色；
// 混了不同主題才用中性灰
const clusterStyle = (c: Cluster) => {
  const first = placeStyle(c.places[0])
  if (c.places.every((p) => placeStyle(p).color === first.color)) return first
  const theme = c.places[0].theme
  if (c.places.every((p) => p.theme === theme) && THEME_STYLES[theme]) return THEME_STYLES[theme]
  return FALLBACK_CATEGORY
}

const contains = (c: Cluster, id: string | null) => id !== null && c.places.some((p) => p.id === id)

const FIT_PADDING = 40

// 把地圖移到某個範圍。卡片開著時，把被卡片蓋住的部分讓出來，免得結果藏在卡片底下
function fitToBounds(
  map: maplibregl.Map,
  bounds: [[number, number], [number, number]],
  el: HTMLElement | null,
  cardOpen: boolean,
) {
  const pad = cardOpen ? cardPadding(el) : { top: 0, right: 0, bottom: 0, left: 0 }
  map.fitBounds(bounds, {
    padding: {
      top: FIT_PADDING + pad.top,
      right: FIT_PADDING + pad.right,
      bottom: FIT_PADDING + pad.bottom,
      left: FIT_PADDING + pad.left,
    },
    maxZoom: DETAIL_ZOOM - 1,
    duration: 700,
  })
}

// 「回到全圖」按鈕：做成 MapLibre 的控制鈕，樣式與縮放鈕一致、排在它下面
const RESET_ICON =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:block;margin:auto"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>'

class ResetViewControl implements maplibregl.IControl {
  private el?: HTMLElement
  constructor(private onClick: () => void) {}
  onAdd() {
    const group = document.createElement('div')
    group.className = 'maplibregl-ctrl maplibregl-ctrl-group'
    const button = document.createElement('button')
    button.type = 'button'
    button.title = '回到全圖'
    button.setAttribute('aria-label', '回到全圖')
    button.innerHTML = RESET_ICON
    button.addEventListener('click', this.onClick)
    group.appendChild(button)
    this.el = group
    return group
  }
  onRemove() {
    this.el?.remove()
  }
}

// 螢幕上相距不到這個距離的標記會併成一個數字標記；縮到這個等級以上不再合併，
// 選取地點時也會至少放大到這個等級，讓被選的標記一定看得到。
const CLUSTER_PX = 40
const DETAIL_ZOOM = 17

export default function MapView({ groups, bounds, selectedId, onSelect, resetSignal = 0 }: Props) {
  const container = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const entries = useRef<Entry[]>([])
  const onSelectRef = useRef(onSelect)
  const boundsRef = useRef(bounds)
  const selectedRef = useRef(selectedId)
  const [failed, setFailed] = useState<FallbackReason | null>(null)
  const [ready, setReady] = useState(false)
  // 縮放等級（四捨五入到 0.25）：變了才需要重新計算哪些標記要合併
  const [zoomKey, setZoomKey] = useState(0)

  useEffect(() => {
    onSelectRef.current = onSelect
    selectedRef.current = selectedId
    boundsRef.current = bounds
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
      const created = map
      map.addControl(
        new ResetViewControl(() =>
          fitToBounds(created, boundsRef.current, container.current, selectedRef.current !== null),
        ),
        'top-right',
      )
      map.fitBounds(boundsRef.current, { padding: FIT_PADDING, animate: false })
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
    const syncZoom = () => setZoomKey(Math.round((map?.getZoom() ?? 0) * 4) / 4)
    map.on('zoomend', syncZoom)
    mapRef.current = map
    setReady(true)
    syncZoom()
    return dispose
  }, [])

  // 只在 groups 或地圖就緒時建立／移除標記
  useEffect(() => {
    const map = mapRef.current
    if (!ready || !map) return
    const clusters: Cluster[] =
      zoomKey >= DETAIL_ZOOM
        ? groups.map((g) => ({ groups: [g], places: g.places, lng: g.lng, lat: g.lat }))
        : clusterGroups(groups, (lng, lat) => map.project([lng, lat]), CLUSTER_PX)
    const created: Entry[] = clusters.map((c) => {
      const count = c.places.length
      const el = document.createElement('button')
      el.type = 'button'
      el.className = BUTTON_CLASS
      const label = count > 1 ? `${count} 個地點` : c.places[0].title
      el.setAttribute('aria-label', label)
      el.title = label
      const dot = document.createElement('span')
      const style = clusterStyle(c)
      dot.style.backgroundColor = style.color
      if (count > 1) dot.textContent = String(count)
      else dot.innerHTML = style.icon
      el.appendChild(dot)
      el.addEventListener('click', () => {
        if (c.groups.length > 1) {
          // 多個位置併成一個：放大到看得見各自的標記
          const lngs = c.groups.map((g) => g.lng)
          const lats = c.groups.map((g) => g.lat)
          map.fitBounds(
            [
              [Math.min(...lngs), Math.min(...lats)],
              [Math.max(...lngs), Math.max(...lats)],
            ],
            { padding: 120, maxZoom: DETAIL_ZOOM + 1 },
          )
        } else {
          onSelectRef.current(c.places[0].id)
        }
      })
      const marker = new maplibregl.Marker({ element: el }).setLngLat([c.lng, c.lat]).addTo(map)
      return { cluster: c, el, dot, marker }
    })
    entries.current = created
    for (const e of created) paint(e, selectedRef.current)
    return () => {
      created.forEach((e) => e.marker.remove())
      entries.current = []
    }
  }, [groups, ready, zoomKey])

  // 篩選或搜尋讓範圍改變時，把地圖移到新的範圍（第一次的範圍在建立地圖時已經套用）
  const fittedBounds = useRef(bounds)
  useEffect(() => {
    const map = mapRef.current
    if (!ready || !map || bounds === fittedBounds.current) return
    fittedBounds.current = bounds
    fitToBounds(map, bounds, container.current, selectedRef.current !== null)
  }, [bounds, ready])

  // 「回到首頁」：不管有沒有篩選、使用者縮放到哪，都拉回目前的範圍
  const lastReset = useRef(resetSignal)
  useEffect(() => {
    const map = mapRef.current
    if (!ready || !map || resetSignal === lastReset.current) return
    lastReset.current = resetSignal
    fitToBounds(map, boundsRef.current, container.current, selectedRef.current !== null)
  }, [resetSignal, ready])

  // 選取改變只更新樣式，不重建標記（保留鍵盤焦點）
  useEffect(() => {
    for (const e of entries.current) paint(e, selectedId)
  }, [selectedId, groups, ready, zoomKey])

  useEffect(() => {
    const map = mapRef.current
    if (!ready || !map || !selectedId) return
    const g = groups.find((x) => x.places.some((p) => p.id === selectedId))
    if (g) {
      map.flyTo({
        center: [g.lng, g.lat],
        zoom: Math.max(map.getZoom(), DETAIL_ZOOM),
        padding: cardPadding(container.current),
      })
    }
  }, [groups, selectedId, ready])

  if (failed) return <MapFallback reason={failed} />
  return <div ref={container} className="h-full w-full" />
}

function paint(e: Entry, selectedId: string | null) {
  const active = contains(e.cluster, selectedId)
  e.dot.className = dotClass(e.cluster.places.length, active)
  e.el.setAttribute('aria-pressed', String(active))
}
