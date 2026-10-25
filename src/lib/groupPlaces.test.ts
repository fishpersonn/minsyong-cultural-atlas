import { describe, it, expect } from 'vitest'
import { groupByLocation, initialBounds } from './groupPlaces'
import { parsePlaces } from './parsePlaces'
import railway from '../data/railway.json'
import { DEFAULT_BOUNDS } from '../constants'

const { places } = parsePlaces(railway, 'railway')

describe('groupByLocation', () => {
  const groups = groupByLocation(places)
  it('merges identical coordinates into one group of 3', () => {
    expect(
      groups.some(
        (g) => g.places.length === 3 && g.lng === 120.43203958702237 && g.lat === 23.558337047709617,
      ),
    ).toBe(true)
  })
  it('keeps all 24 places', () => {
    expect(groups.reduce((n, g) => n + g.places.length, 0)).toBe(24)
  })
  it('preserves input order', () => {
    expect(groups[0].places[0].id).toBe(places[0].id)
  })
})

describe('initialBounds', () => {
  it('excludes outliers', () => {
    const [[w, s], [e, n]] = initialBounds(places)
    expect(n).toBeLessThan(23.6)
    expect(w).toBeGreaterThan(120.4)
    expect(w).toBeLessThan(e)
    expect(s).toBeLessThan(n)
  })
  it('falls back for empty input', () => {
    expect(initialBounds([])).toEqual(DEFAULT_BOUNDS)
  })
  it('returns a non-degenerate box for a single point', () => {
    const [[w, s], [e, n]] = initialBounds([{ ...places[0], lng: 120.43, lat: 23.55 }])
    expect(e - w).toBeGreaterThan(0)
    expect(n - s).toBeGreaterThan(0)
  })
})
