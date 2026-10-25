import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PlaceGroup } from '@/types'

type FakeMap = {
  fitBounds: ReturnType<typeof vi.fn>
  flyTo: ReturnType<typeof vi.fn>
  remove: ReturnType<typeof vi.fn>
}

const h = vi.hoisted(() => ({
  throwOnConstruct: false,
  mapInstances: [] as FakeMap[],
}))

vi.mock('maplibre-gl', () => {
  class Map {
    fitBounds = vi.fn()
    flyTo = vi.fn()
    remove = vi.fn()
    addControl = vi.fn()
    constructor() {
      if (h.throwOnConstruct) throw new Error('no webgl')
      h.mapInstances.push(this)
    }
  }
  class Marker {
    el: HTMLElement
    constructor(opts: { element: HTMLElement }) {
      this.el = opts.element
    }
    setLngLat() {
      return this
    }
    addTo() {
      document.body.appendChild(this.el)
      return this
    }
    remove() {
      this.el.remove()
    }
  }
  class NavigationControl {}
  return { default: { Map, Marker, NavigationControl }, Map, Marker, NavigationControl }
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

beforeEach(() => {
  h.throwOnConstruct = false
  h.mapInstances.length = 0
})

describe('MapView', () => {
  it('地圖建構失敗時顯示 MapFallback', () => {
    h.throwOnConstruct = true
    render(<MapView groups={groups} bounds={bounds} selectedId={null} onSelect={() => {}} />)
    expect(screen.getByText('你的瀏覽器不支援互動地圖')).toBeTruthy()
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

  it('selectedId 改變時 flyTo 該組座標', () => {
    const { rerender } = render(
      <MapView groups={groups} bounds={bounds} selectedId={null} onSelect={() => {}} />,
    )
    rerender(<MapView groups={groups} bounds={bounds} selectedId="3" onSelect={() => {}} />)
    const arg = h.mapInstances[0].flyTo.mock.calls.at(-1)![0]
    expect(arg.center).toEqual([120.44, 23.56])
  })
})
