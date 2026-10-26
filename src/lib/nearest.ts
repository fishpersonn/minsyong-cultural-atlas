import type { Place } from '../types'

// 兩點的球面距離（公尺）
export function distanceMeters(a: { lng: number; lat: number }, b: { lng: number; lat: number }): number {
  const rad = Math.PI / 180
  const dLat = (b.lat - a.lat) * rad
  const dLng = (b.lng - a.lng) * rad
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2
  return 2 * 6371000 * Math.asin(Math.sqrt(h))
}

export function nearestPlace(
  places: readonly Place[],
  from: { lng: number; lat: number },
): { place: Place; meters: number } | null {
  let best: { place: Place; meters: number } | null = null
  for (const place of places) {
    const meters = distanceMeters(from, place)
    if (best === null || meters < best.meters) best = { place, meters }
  }
  return best
}

// 隨機挑一個；有多個可選時避開目前這個，連按才不會停在原地
export function randomPlace(places: readonly Place[], currentId: string | null, rng: () => number = Math.random): Place | null {
  const pool = places.length > 1 ? places.filter((p) => p.id !== currentId) : places
  return pool.length === 0 ? null : pool[Math.min(pool.length - 1, Math.floor(rng() * pool.length))]
}
