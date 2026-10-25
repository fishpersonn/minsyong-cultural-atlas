import { useEffect, useRef, useState } from 'react'
import * as maplibregl from 'maplibre-gl'
import { BASEMAP_STYLE_URL } from '@/constants'
import type { PlaceGroup } from '@/types'
import MapFallback from './MapFallback'

type Props = {
  groups: PlaceGroup[]
  bounds: [[number, number], [number, number]]
  selectedId: string | null
  onSelect: (id: string | null) => void
}

const BASE =
  'flex cursor-pointer items-center justify-center rounded-full border-2 border-white text-xs font-semibold text-white shadow-md outline-none transition-transform focus-visible:ring-4 focus-visible:ring-[#f2b134]/70'
const IDLE = 'bg-[#1f6f8b]'
const ACTIVE = 'bg-[#d98e04] scale-125'

const markerClass = (count: number, active: boolean) =>
  `${BASE} ${count > 1 ? 'size-9' : 'size-6'} ${active ? ACTIVE : IDLE}`

export default function MapView({ groups, bounds, selectedId, onSelect }: Props) {
  const container = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const onSelectRef = useRef(onSelect)
  const boundsRef = useRef(bounds)
  const [failed, setFailed] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    onSelectRef.current = onSelect
  })

  useEffect(() => {
    if (!container.current) return
    let map: maplibregl.Map
    try {
      map = new maplibregl.Map({
        container: container.current,
        style: BASEMAP_STYLE_URL,
        attributionControl: { compact: true },
      })
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')
      map.fitBounds(boundsRef.current, { padding: 40, animate: false })
    } catch {
      // 建構是否成功只有在建立外部地圖物件時才知道（例如沒有 WebGL）
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFailed(true)
      return
    }
    mapRef.current = map
    setReady(true)
    return () => {
      mapRef.current = null
      setReady(false)
      map.remove()
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!ready || !map) return
    const selectedGroup = groups.find((g) => g.places.some((p) => p.id === selectedId))
    const markers = groups.map((g) => {
      const el = document.createElement('button')
      el.type = 'button'
      const count = g.places.length
      el.className = markerClass(count, g === selectedGroup)
      el.setAttribute('aria-label', count > 1 ? `${count} 個地點` : g.places[0].title)
      if (count > 1) el.textContent = String(count)
      el.addEventListener('click', () => onSelectRef.current(g.places[0].id))
      return new maplibregl.Marker({ element: el }).setLngLat([g.lng, g.lat]).addTo(map)
    })
    return () => markers.forEach((m) => m.remove())
  }, [groups, selectedId, ready])

  useEffect(() => {
    const map = mapRef.current
    if (!ready || !map || !selectedId) return
    const g = groups.find((x) => x.places.some((p) => p.id === selectedId))
    if (g) map.flyTo({ center: [g.lng, g.lat], essential: true })
  }, [groups, selectedId, ready])

  if (failed) return <MapFallback />
  return <div ref={container} className="h-full w-full" />
}
