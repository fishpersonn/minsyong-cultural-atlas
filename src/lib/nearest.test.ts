import { describe, expect, it } from 'vitest'
import { distanceMeters, formatDistance, nearestPlace, nearestPlaces, randomPlace } from './nearest'
import type { Place } from '../types'

const mk = (id: string, lng: number, lat: number): Place => ({
  id, title: id, summary: '', links: [], images: [], lng, lat, theme: 't',
})

describe('distanceMeters', () => {
  it('同一點為 0；緯度差 0.01 度約 1.1 公里', () => {
    expect(distanceMeters({ lng: 120.4, lat: 23.55 }, { lng: 120.4, lat: 23.55 })).toBe(0)
    expect(distanceMeters({ lng: 120.4, lat: 23.55 }, { lng: 120.4, lat: 23.56 })).toBeCloseTo(1112, -1)
  })
})

describe('nearestPlace', () => {
  it('回傳最近的地點與距離；沒有地點時為 null', () => {
    const places = [mk('far', 120.5, 23.6), mk('near', 120.431, 23.551)]
    expect(nearestPlace(places, { lng: 120.43, lat: 23.55 })?.place.id).toBe('near')
    expect(nearestPlace([], { lng: 0, lat: 0 })).toBeNull()
  })
})

describe('nearestPlaces', () => {
  const from = { lng: 120.43, lat: 23.55 }
  const places = [mk('c', 120.45, 23.55), mk('a', 120.431, 23.55), mk('d', 120.5, 23.6), mk('b', 120.433, 23.55)]

  it('由近到遠回傳前 n 個，並附上距離', () => {
    const out = nearestPlaces(places, from, 3)
    expect(out.map((x) => x.place.id)).toEqual(['a', 'b', 'c'])
    expect(out[0].meters).toBeLessThan(out[1].meters)
    expect(out[1].meters).toBeLessThan(out[2].meters)
  })

  it('skip 回傳 true 的地點不算（例如目前這個）', () => {
    const out = nearestPlaces(places, from, 2, (p) => p.id === 'a')
    expect(out.map((x) => x.place.id)).toEqual(['b', 'c'])
  })

  it('地點不夠 n 個就全部回傳；沒有地點回傳空陣列；不會改動傳入的陣列', () => {
    expect(nearestPlaces(places, from, 10)).toHaveLength(4)
    expect(nearestPlaces([], from, 3)).toEqual([])
    const copy = [...places]
    nearestPlaces(places, from, 3)
    expect(places).toEqual(copy)
  })
})

describe('formatDistance', () => {
  it('不到 1 公里：進位到 10 公尺，最少 10 公尺', () => {
    expect(formatDistance(123)).toBe('約 120 公尺')
    expect(formatDistance(126)).toBe('約 130 公尺')
    expect(formatDistance(0)).toBe('約 10 公尺')
    expect(formatDistance(999)).toBe('約 1000 公尺')
  })
  it('1 公里以上：一位小數的公里', () => {
    expect(formatDistance(1000)).toBe('約 1.0 公里')
    expect(formatDistance(2349)).toBe('約 2.3 公里')
  })
})

describe('randomPlace', () => {
  const places = [mk('a', 0, 0), mk('b', 0, 0), mk('c', 0, 0)]
  it('依亂數挑選，並避開目前的地點', () => {
    expect(randomPlace(places, null, () => 0)?.id).toBe('a')
    expect(randomPlace(places, 'a', () => 0)?.id).toBe('b')
    expect(randomPlace(places, null, () => 0.999)?.id).toBe('c')
  })
  it('只有一個時就是它；沒有時為 null', () => {
    expect(randomPlace([places[0]], 'a')?.id).toBe('a')
    expect(randomPlace([], null)).toBeNull()
  })
})
