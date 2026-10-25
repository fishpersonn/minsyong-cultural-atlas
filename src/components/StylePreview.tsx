import { useEffect, useRef, useState } from 'react'
import * as maplibregl from 'maplibre-gl'
import { DEFAULT_BOUNDS } from '../constants'

const STYLES = [
  { id: 'liberty', label: 'OpenFreeMap Liberty', url: 'https://tiles.openfreemap.org/styles/liberty' },
  { id: 'bright', label: 'OpenFreeMap Bright', url: 'https://tiles.openfreemap.org/styles/bright' },
  { id: 'positron', label: 'OpenFreeMap Positron', url: 'https://tiles.openfreemap.org/styles/positron' },
  { id: 'carto-positron', label: 'CARTO Positron', url: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json' },
  { id: 'carto-voyager', label: 'CARTO Voyager', url: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json' },
  { id: 'carto-dark', label: 'CARTO Dark Matter', url: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json' },
]

const STATION: [number, number] = [120.431, 23.5566]
// 示意用的假路線，只用來看標記與線條在各底圖上的對比
const DEMO_LINE: [number, number][] = [
  [120.4235, 23.5466],
  [120.4275, 23.5520],
  STATION,
  [120.4345, 23.5610],
  [120.4385, 23.5660],
]

export default function StylePreview() {
  const box = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const [styleId, setStyleId] = useState(STYLES[0].id)
  const [accent, setAccent] = useState('#e8590c')
  const accentRef = useRef(accent)

  const addOverlay = (map: maplibregl.Map, color: string) => {
    map.addSource('demo-line', {
      type: 'geojson',
      data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: DEMO_LINE } },
    })
    map.addLayer({
      id: 'demo-line',
      type: 'line',
      source: 'demo-line',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': color, 'line-width': 5 },
    })
  }

  useEffect(() => {
    const map = new maplibregl.Map({
      container: box.current!,
      style: STYLES[0].url,
      bounds: DEFAULT_BOUNDS,
    })
    map.addControl(new maplibregl.NavigationControl(), 'top-right')
    new maplibregl.Marker({ color: '#e8590c' }).setLngLat(STATION).addTo(map)
    map.on('style.load', () => addOverlay(map, accentRef.current))
    mapRef.current = map
    return () => map.remove()
  }, [])

  useEffect(() => {
    accentRef.current = accent
    const map = mapRef.current
    if (map?.getLayer('demo-line')) map.setPaintProperty('demo-line', 'line-color', accent)
  }, [accent])

  const pick = (id: string) => {
    setStyleId(id)
    mapRef.current?.setStyle(STYLES.find((s) => s.id === id)!.url)
  }

  return (
    <div className="relative h-screen w-screen">
      <div ref={box} className="h-full w-full" />
      <div className="absolute left-3 top-3 flex max-w-[calc(100%-4rem)] flex-col gap-2 rounded-lg bg-white/95 p-3 text-sm shadow-lg">
        <div className="font-semibold">底圖風格預覽</div>
        <div className="flex flex-wrap gap-1.5">
          {STYLES.map((s) => (
            <button
              key={s.id}
              onClick={() => pick(s.id)}
              className={`rounded-md border px-2.5 py-1 ${
                s.id === styleId ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-300 bg-white'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2">
          強調色
          <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} />
        </label>
      </div>
    </div>
  )
}
