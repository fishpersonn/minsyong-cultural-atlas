import { StrictMode } from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { PlaceGroup } from '@/types'
import { FALLBACK_CATEGORY } from '@/lib/categories'
import { THEME_STYLES } from '@/lib/themeStyles'

type Handler = () => void
type FakeMap = {
  fitBounds: ReturnType<typeof vi.fn>
  flyTo: ReturnType<typeof vi.fn>
  remove: ReturnType<typeof vi.fn>
  emit: (type: string) => void
  options: Record<string, unknown>
  addControl: ReturnType<typeof vi.fn>
}
type FakeMarker = { el: HTMLElement; remove: ReturnType<typeof vi.fn> }

const h = vi.hoisted(() => ({
  throwOnConstruct: false,
  mapInstances: [] as FakeMap[],
  markers: [] as FakeMarker[],
  // 呼叫順序紀錄：模組載入時的 setWorkerUrl 必須早於任何 Map 建構，故不在 beforeEach 清空
  calls: [] as string[],
}))

vi.mock('maplibre-gl', () => {
  class Map {
    fitBounds = vi.fn()
    flyTo = vi.fn()
    remove = vi.fn()
    addControl = vi.fn()
    zoom = 14
    getZoom = () => this.zoom
    // 1 度 = 100000 px：測試資料的座標相距遠，預設不會被合併
    project = vi.fn(([lng, lat]: [number, number]) => ({ x: lng * 100000, y: -lat * 100000 }))
    handlers: Record<string, Handler[]> = {}
    options: Record<string, unknown>
    constructor(options: Record<string, unknown>) {
      this.options = options
      h.calls.push('Map')
      if (h.throwOnConstruct) throw new Error('no webgl')
      h.mapInstances.push(this)
    }
    on(type: string, fn: Handler) {
      ;(this.handlers[type] ||= []).push(fn)
      return this
    }
    once(type: string, fn: Handler) {
      const wrapped = () => {
        this.handlers[type] = this.handlers[type].filter((x) => x !== wrapped)
        fn()
      }
      return this.on(type, wrapped)
    }
    emit(type: string) {
      ;[...(this.handlers[type] ?? [])].forEach((fn) => fn())
    }
  }
  class Marker {
    el: HTMLElement
    remove = vi.fn(() => this.el.remove())
    constructor(opts: { element: HTMLElement }) {
      this.el = opts.element
      h.markers.push(this)
    }
    setLngLat() {
      return this
    }
    addTo() {
      document.body.appendChild(this.el)
      return this
    }
  }
  class NavigationControl {}
  class AttributionControl {}
  const setWorkerUrl = (url: string) => {
    h.calls.push(`setWorkerUrl:${url}`)
  }
  return {
    default: { Map, Marker, NavigationControl, AttributionControl, setWorkerUrl },
    setWorkerUrl,
    Map,
    Marker,
    NavigationControl,
    AttributionControl,
  }
})

import MapView from './MapView'

const mk = (id: string, title: string, lng: number, lat: number) => ({
  id,
  title,
  summary: '',
  links: [],
  images: [],
  lng,
  lat,
  theme: 'railway',
})
const groups: PlaceGroup[] = [
  { lng: 120.43, lat: 23.55, places: [mk('1', '民雄車站', 120.43, 23.55)] },
  { lng: 120.44, lat: 23.56, places: [mk('2', 'A', 120.44, 23.56), mk('3', 'B', 120.44, 23.56)] },
]
const bounds: [[number, number], [number, number]] = [
  [120.42, 23.54],
  [120.45, 23.57],
]
const noop = () => {}

beforeEach(() => {
  h.throwOnConstruct = false
  h.mapInstances.length = 0
  h.markers.length = 0
})
afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

const UNSUPPORTED = '你的瀏覽器不支援互動地圖'
const LOAD_FAILED = '互動地圖暫時無法載入'

function stubViewport(desktop: boolean, height = 800) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({ matches: desktop && query === '(min-width: 768px)', media: query })),
  )
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(height)
}

describe('MapView', () => {
  it('在任何 Map 建構之前以打包後的 worker 網址呼叫 setWorkerUrl', () => {
    render(<MapView groups={groups} bounds={bounds} selectedId={null} onSelect={noop} />)
    const first = h.calls.findIndex((c) => c.startsWith('setWorkerUrl:'))
    expect(first).toBe(0)
    expect(h.calls[first]).toContain('maplibre-gl-worker')
    expect(h.calls.indexOf('Map')).toBeGreaterThan(first)
  })

  it('版權標示放在上方（不被底部抽屜遮住），且不與縮放控制重疊在同一位置之外', () => {
    render(<MapView groups={groups} bounds={bounds} selectedId={null} onSelect={noop} />)
    const map = h.mapInstances[0]
    expect(map.options.attributionControl).toBe(false)
    const calls = map.addControl.mock.calls as [object, string][]
    const attr = calls.find(([c]) => c.constructor.name === 'AttributionControl')
    expect(attr).toBeTruthy()
    expect(attr![1]).toMatch(/^top-/)
  })

  it('地圖建構失敗時顯示 MapFallback', () => {
    h.throwOnConstruct = true
    render(<MapView groups={groups} bounds={bounds} selectedId={null} onSelect={noop} />)
    expect(screen.getByText(UNSUPPORTED)).toBeTruthy()
    expect(screen.queryByText(LOAD_FAILED)).toBeNull()
  })

  it('load 之前發生 error 視為初始化失敗，顯示 MapFallback 並移除地圖', () => {
    render(<MapView groups={groups} bounds={bounds} selectedId={null} onSelect={noop} />)
    expect(screen.queryByText(LOAD_FAILED)).toBeNull()
    const map = h.mapInstances[0]
    act(() => map.emit('error'))
    expect(screen.getByText(LOAD_FAILED)).toBeTruthy()
    expect(screen.queryByText(UNSUPPORTED)).toBeNull()
    expect(map.remove).toHaveBeenCalledTimes(1)
  })

  it('已移除的地圖晚到的 error 不顯示 MapFallback', () => {
    // StrictMode 會建立、移除再重建地圖；第一個地圖已被移除
    render(
      <StrictMode>
        <MapView groups={groups} bounds={bounds} selectedId={null} onSelect={noop} />
      </StrictMode>,
    )
    expect(h.mapInstances.length).toBe(2)
    const stale = h.mapInstances[0]
    expect(stale.remove).toHaveBeenCalledTimes(1)
    act(() => stale.emit('error'))
    expect(screen.queryByText(LOAD_FAILED)).toBeNull()
    expect(screen.queryByText(UNSUPPORTED)).toBeNull()
    expect(stale.remove).toHaveBeenCalledTimes(1)
    expect(h.mapInstances[1].remove).not.toHaveBeenCalled()
  })

  it('load 之後的 error 不顯示 MapFallback', () => {
    render(<MapView groups={groups} bounds={bounds} selectedId={null} onSelect={noop} />)
    const map = h.mapInstances[0]
    act(() => {
      map.emit('load')
      map.emit('error')
    })
    expect(screen.queryByText(LOAD_FAILED)).toBeNull()
    expect(map.remove).not.toHaveBeenCalled()
  })

  it('建立標記、顯示數量並回報選取', () => {
    const onSelect = vi.fn()
    render(<MapView groups={groups} bounds={bounds} selectedId={null} onSelect={onSelect} />)
    expect(h.mapInstances[0].fitBounds).toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: '民雄車站' }))
    expect(onSelect).toHaveBeenLastCalledWith('1')
    const multi = screen.getByRole('button', { name: '2 個地點' })
    expect(multi.textContent).toBe('2')
    fireEvent.click(multi)
    expect(onSelect).toHaveBeenLastCalledWith('2')
  })

  it('selectedId 改變時 flyTo 該組座標，且不帶 essential', () => {
    const { rerender } = render(
      <MapView groups={groups} bounds={bounds} selectedId={null} onSelect={noop} />,
    )
    rerender(<MapView groups={groups} bounds={bounds} selectedId="3" onSelect={noop} />)
    const arg = h.mapInstances[0].flyTo.mock.calls.at(-1)![0]
    expect(arg.center).toEqual([120.44, 23.56])
    expect(arg.essential).toBeUndefined()
  })

  it('桌面寬度 flyTo 時左側留出卡片面板的 padding', () => {
    stubViewport(true)
    const { rerender } = render(
      <MapView groups={groups} bounds={bounds} selectedId={null} onSelect={noop} />,
    )
    rerender(<MapView groups={groups} bounds={bounds} selectedId="1" onSelect={noop} />)
    const arg = h.mapInstances[0].flyTo.mock.calls.at(-1)![0]
    expect(arg.padding).toEqual({ left: 424, top: 0, right: 0, bottom: 0 })
  })

  it('手機寬度 flyTo 時底部留出抽屜高度（容器 60%）的 padding', () => {
    stubViewport(false, 800)
    const { rerender } = render(
      <MapView groups={groups} bounds={bounds} selectedId={null} onSelect={noop} />,
    )
    rerender(<MapView groups={groups} bounds={bounds} selectedId="1" onSelect={noop} />)
    const arg = h.mapInstances[0].flyTo.mock.calls.at(-1)![0]
    expect(arg.padding).toEqual({ bottom: 480, top: 0, left: 0, right: 0 })
  })

  it('改變選取不重建標記，並以 aria-pressed 標示選取', () => {
    const { rerender } = render(
      <MapView groups={groups} bounds={bounds} selectedId={null} onSelect={noop} />,
    )
    const before = screen.getAllByRole('button')
    const markerCount = h.markers.length
    expect(before.every((b) => b.getAttribute('aria-pressed') === 'false')).toBe(true)

    rerender(<MapView groups={groups} bounds={bounds} selectedId="3" onSelect={noop} />)
    expect(h.markers.length).toBe(markerCount)
    expect(h.markers.every((m) => m.remove.mock.calls.length === 0)).toBe(true)
    const after = screen.getAllByRole('button')
    expect(after).toEqual(before)
    expect(screen.getByRole('button', { name: '2 個地點' }).getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByRole('button', { name: '民雄車站' }).getAttribute('aria-pressed')).toBe('false')
  })

  describe('回到全圖按鈕', () => {
    const control = () => {
      const calls = h.mapInstances[0].addControl.mock.calls as [{ constructor: { name: string }; onAdd: () => HTMLElement }, string][]
      return calls.find(([c]) => c.constructor.name === 'ResetViewControl')!
    }

    it('加在右上角、排在縮放鈕之後；按鈕有無障礙名稱', () => {
      render(<MapView groups={groups} bounds={bounds} selectedId={null} onSelect={noop} />)
      const order = (h.mapInstances[0].addControl.mock.calls as [object, string][]).map(([c]) => c.constructor.name)
      expect(order.indexOf('ResetViewControl')).toBeGreaterThan(order.indexOf('NavigationControl'))
      expect(control()[1]).toBe('top-right')
      const button = control()[0].onAdd().querySelector('button')!
      expect(button.getAttribute('aria-label')).toBe('回到全圖')
      expect(button.title).toBe('回到全圖')
    })

    it('點下去縮放到「目前」的範圍（篩選後的範圍），不是最初的範圍', () => {
      const next: [[number, number], [number, number]] = [
        [120.4, 23.5],
        [120.41, 23.51],
      ]
      const { rerender } = render(<MapView groups={groups} bounds={bounds} selectedId={null} onSelect={noop} />)
      rerender(<MapView groups={groups} bounds={next} selectedId={null} onSelect={noop} />)
      const button = control()[0].onAdd().querySelector('button')!
      const fit = h.mapInstances[0].fitBounds
      const before = fit.mock.calls.length
      fireEvent.click(button)
      expect(fit.mock.calls.length).toBe(before + 1)
      expect(fit.mock.calls.at(-1)![0]).toBe(next)
    })
  })

  describe('回到首頁（resetSignal）', () => {
    it('數字變了才把地圖拉回目前的範圍；第一次的值與重複的值都不動', () => {
      const { rerender } = render(<MapView groups={groups} bounds={bounds} selectedId={null} onSelect={noop} resetSignal={0} />)
      const fit = h.mapInstances[0].fitBounds
      const before = fit.mock.calls.length
      rerender(<MapView groups={groups} bounds={bounds} selectedId={null} onSelect={noop} resetSignal={0} />)
      expect(fit.mock.calls.length).toBe(before)
      rerender(<MapView groups={groups} bounds={bounds} selectedId={null} onSelect={noop} resetSignal={1} />)
      expect(fit.mock.calls.length).toBe(before + 1)
      expect(fit.mock.calls.at(-1)![0]).toBe(bounds)
      rerender(<MapView groups={groups} bounds={bounds} selectedId={null} onSelect={noop} resetSignal={1} />)
      expect(fit.mock.calls.length).toBe(before + 1)
    })
  })

  describe('範圍改變（篩選、搜尋）', () => {
    const next: [[number, number], [number, number]] = [
      [120.4, 23.5],
      [120.41, 23.51],
    ]

    it('bounds 換成新的範圍時動畫縮放過去；同一個範圍不會重複縮放', () => {
      const { rerender } = render(<MapView groups={groups} bounds={bounds} selectedId={null} onSelect={noop} />)
      const fit = h.mapInstances[0].fitBounds
      const before = fit.mock.calls.length
      rerender(<MapView groups={groups} bounds={bounds} selectedId={null} onSelect={noop} />)
      expect(fit.mock.calls.length).toBe(before)
      rerender(<MapView groups={groups} bounds={next} selectedId={null} onSelect={noop} />)
      expect(fit.mock.calls.length).toBe(before + 1)
      const [box, opts] = fit.mock.calls.at(-1)!
      expect(box).toBe(next)
      expect(opts.duration).toBeGreaterThan(0)
      expect(opts.maxZoom).toBeLessThan(17)
      expect(opts.padding).toEqual({ top: 40, right: 40, bottom: 40, left: 40 })
      rerender(<MapView groups={groups} bounds={next} selectedId={null} onSelect={noop} />)
      expect(fit.mock.calls.length).toBe(before + 1)
    })

    it('卡片開著時（桌面）把被面板蓋住的左側讓出來', () => {
      stubViewport(true)
      const { rerender } = render(<MapView groups={groups} bounds={bounds} selectedId="1" onSelect={noop} />)
      rerender(<MapView groups={groups} bounds={next} selectedId="1" onSelect={noop} />)
      expect(h.mapInstances[0].fitBounds.mock.calls.at(-1)![1].padding).toEqual({
        top: 40,
        right: 40,
        bottom: 40,
        left: 40 + 424,
      })
    })
  })

  describe('靠得很近的標記', () => {
    const near: PlaceGroup[] = [
      { lng: 120.43, lat: 23.55, places: [mk('1', '甲', 120.43, 23.55)] },
      { lng: 120.4302, lat: 23.55, places: [mk('2', '乙', 120.4302, 23.55)] },
      { lng: 120.44, lat: 23.56, places: [mk('3', '丙', 120.44, 23.56)] },
    ]

    it('螢幕上相距太近的併成一個數字標記，遠的維持獨立', () => {
      render(<MapView groups={near} bounds={bounds} selectedId={null} onSelect={noop} />)
      expect(screen.getByRole('button', { name: '2 個地點' }).textContent).toBe('2')
      expect(screen.getByRole('button', { name: '丙' })).toBeTruthy()
      expect(screen.queryByRole('button', { name: '甲' })).toBeNull()
    })

    it('點合併的標記是放大到涵蓋成員，不選取任何地點', () => {
      const onSelect = vi.fn()
      render(<MapView groups={near} bounds={bounds} selectedId={null} onSelect={onSelect} />)
      const before = h.mapInstances[0].fitBounds.mock.calls.length
      fireEvent.click(screen.getByRole('button', { name: '2 個地點' }))
      expect(onSelect).not.toHaveBeenCalled()
      const [box, opts] = h.mapInstances[0].fitBounds.mock.calls.at(-1)!
      expect(h.mapInstances[0].fitBounds.mock.calls.length).toBe(before + 1)
      expect(box).toEqual([
        [120.43, 23.55],
        [120.4302, 23.55],
      ])
      expect(opts.maxZoom).toBeGreaterThan(17)
    })

    it('合併標記的顏色：同主題用主題色，混了不同主題才用灰色', () => {
      const withTheme = (id: string, theme: string, category: string | undefined, lng: number): PlaceGroup => ({
        lng,
        lat: 23.55,
        places: [{ ...mk(id, id, lng, 23.55), theme, category }],
      })
      const dotColor = (label: string) => (screen.getByRole('button', { name: label }).firstChild as HTMLElement).style.backgroundColor
      const css = (hex: string) => {
        const el = document.createElement('span')
        el.style.backgroundColor = hex
        return el.style.backgroundColor
      }
      // 鐵路高架化裡兩個不同分類 → 各有自己的分類色，合併後改用主題色
      const sameTheme = [withTheme('a', 'railway', '歷史故事', 120.43), withTheme('b', 'railway', '建築測繪', 120.4302)]
      const { unmount } = render(<MapView groups={sameTheme} bounds={bounds} selectedId={null} onSelect={noop} />)
      expect(dotColor('2 個地點')).toBe(css(THEME_STYLES.railway.color))
      unmount()
      const mixed = [withTheme('a', 'railway', '歷史故事', 120.43), withTheme('b', 'podcast', undefined, 120.4302)]
      render(<MapView groups={mixed} bounds={bounds} selectedId={null} onSelect={noop} />)
      expect(dotColor('2 個地點')).toBe(css(FALLBACK_CATEGORY.color))
    })

    it('放大到細節等級後不再合併', () => {
      render(<MapView groups={near} bounds={bounds} selectedId={null} onSelect={noop} />)
      const map = h.mapInstances[0] as FakeMap & { zoom: number }
      act(() => {
        map.zoom = 17
        map.emit('zoomend')
      })
      expect(screen.getByRole('button', { name: '甲' })).toBeTruthy()
      expect(screen.getByRole('button', { name: '乙' })).toBeTruthy()
      expect(screen.queryByRole('button', { name: '2 個地點' })).toBeNull()
    })

    it('選取地點時至少放大到細節等級', () => {
      const { rerender } = render(<MapView groups={near} bounds={bounds} selectedId={null} onSelect={noop} />)
      rerender(<MapView groups={near} bounds={bounds} selectedId="2" onSelect={noop} />)
      expect(h.mapInstances[0].flyTo.mock.calls.at(-1)![0].zoom).toBe(17)
    })
  })

  it('卸載時移除標記與地圖', () => {
    const { unmount } = render(
      <MapView groups={groups} bounds={bounds} selectedId={null} onSelect={noop} />,
    )
    unmount()
    expect(h.markers.every((m) => m.remove.mock.calls.length === 1)).toBe(true)
    expect(h.mapInstances[0].remove).toHaveBeenCalledTimes(1)
  })
})
