import { describe, expect, it } from 'vitest'
import { distanceMeters, nearestPlace, randomPlace } from './nearest'
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
