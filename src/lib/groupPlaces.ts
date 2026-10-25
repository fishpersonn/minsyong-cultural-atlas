import type { Place, PlaceGroup } from '../types'
import { DEFAULT_BOUNDS, OUTLIER_KM } from '../constants'

export function groupByLocation(places: Place[]): PlaceGroup[] {
  const map = new Map<string, PlaceGroup>()
  for (const p of places) {
    const key = `${p.lng},${p.lat}`
    const g = map.get(key)
    if (g) g.places.push(p)
    else map.set(key, { lng: p.lng, lat: p.lat, places: [p] })
  }
  return [...map.values()]
}

const median = (xs: number[]): number => {
  const s = [...xs].sort((a, b) => a - b)
  const m = s.length >> 1
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}

const KM_PER_DEG = 111.32
const SINGLE_POINT_PAD = 0.005

export function initialBounds(places: Place[]): [[number, number], [number, number]] {
  if (places.length === 0) return DEFAULT_BOUNDS
  const mLng = median(places.map((p) => p.lng))
  const mLat = median(places.map((p) => p.lat))
  const cos = Math.cos((mLat * Math.PI) / 180)
  const kept = places.filter(
    (p) => Math.hypot((p.lng - mLng) * cos, p.lat - mLat) * KM_PER_DEG <= OUTLIER_KM,
  )
  if (kept.length === 0) return DEFAULT_BOUNDS
  const lngs = kept.map((p) => p.lng)
  const lats = kept.map((p) => p.lat)
  let w = Math.min(...lngs)
  let e = Math.max(...lngs)
  let s = Math.min(...lats)
  let n = Math.max(...lats)
  if (kept.length === 1) {
    w -= SINGLE_POINT_PAD
    e += SINGLE_POINT_PAD
    s -= SINGLE_POINT_PAD
    n += SINGLE_POINT_PAD
  }
  return [
    [w, s],
    [e, n],
  ]
}
