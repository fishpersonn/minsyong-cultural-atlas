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

export type NearbyPlace = { place: Place; meters: number }

// 離某個點最近的 n 個地點，由近到遠。skip 回傳 true 的地點不算（例如目前這個、或同一個座標的地點）
export function nearestPlaces(
  places: readonly Place[],
  from: { lng: number; lat: number },
  n: number,
  skip: (place: Place) => boolean = () => false,
): NearbyPlace[] {
  return places
    .filter((p) => !skip(p))
    .map((place) => ({ place, meters: distanceMeters(from, place) }))
    .sort((a, b) => a.meters - b.meters)
    .slice(0, n)
}

// 距離的口語寫法：不到 1 公里用「約 120 公尺」（進位到 10 公尺），否則「約 1.2 公里」
export const formatDistance = (m: number) =>
  m < 1000 ? `約 ${Math.max(10, Math.round(m / 10) * 10)} 公尺` : `約 ${(m / 1000).toFixed(1)} 公里`

// 隨機挑一個；有多個可選時避開目前這個，連按才不會停在原地
export function randomPlace(places: readonly Place[], currentId: string | null, rng: () => number = Math.random): Place | null {
  const pool = places.length > 1 ? places.filter((p) => p.id !== currentId) : places
  return pool.length === 0 ? null : pool[Math.min(pool.length - 1, Math.floor(rng() * pool.length))]
}
