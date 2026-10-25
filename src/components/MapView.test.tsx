import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PlaceGroup } from '@/types'

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
}))

vi.mock('maplibre-gl', () => {
  class Map {
    fitBounds = vi.fn()
    flyTo = vi.fn()
    remove = vi.fn()
    addControl = vi.fn()
    handlers: Record<string, Handler[]> = {}
    options: Record<string, unknown>
    constructor(options: Record<string, unknown>) {
      this.options = options
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
  return {
    default: { Map, Marker, NavigationControl, AttributionControl },
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

describe('MapView', () => {
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
    expect(screen.getByText('你的瀏覽器不支援互動地圖')).toBeTruthy()
  })

  it('load 之前發生 error 視為初始化失敗，顯示 MapFallback 並移除地圖', () => {
    render(<MapView groups={groups} bounds={bounds} selectedId={null} onSelect={noop} />)
    expect(screen.queryByText('你的瀏覽器不支援互動地圖')).toBeNull()
    const map = h.mapInstances[0]
    act(() => map.emit('error'))
    expect(screen.getByText('你的瀏覽器不支援互動地圖')).toBeTruthy()
    expect(map.remove).toHaveBeenCalledTimes(1)
  })

  it('load 之後的 error 不顯示 MapFallback', () => {
    render(<MapView groups={groups} bounds={bounds} selectedId={null} onSelect={noop} />)
    const map = h.mapInstances[0]
    act(() => {
      map.emit('load')
      map.emit('error')
    })
    expect(screen.queryByText('你的瀏覽器不支援互動地圖')).toBeNull()
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

  it('卸載時移除標記與地圖', () => {
    const { unmount } = render(
      <MapView groups={groups} bounds={bounds} selectedId={null} onSelect={noop} />,
    )
    unmount()
    expect(h.markers.every((m) => m.remove.mock.calls.length === 1)).toBe(true)
    expect(h.mapInstances[0].remove).toHaveBeenCalledTimes(1)
  })
})
