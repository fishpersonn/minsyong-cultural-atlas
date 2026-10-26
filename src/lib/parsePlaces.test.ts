import { describe, it, expect } from 'vitest'
import { parsePlaces } from './parsePlaces'
import railway from '../data/railway.json'

const link = (id: number) => `https://dovoha.ccu.edu.tw/p/405-1159-${id},c4204.php?Lang=zh-tw`
const feat = (over: Record<string, unknown> = {}, coords: unknown = [120.4, 23.55, 0]) => ({
  type: 'Feature',
  geometry: { type: 'Point', coordinates: coords },
  properties: { name: 'T', 摘要: 's', 查看更多: link(1), 圖片: 'http://i/1.jpg', ...over },
})

describe('parsePlaces with real data', () => {
  const r = parsePlaces(railway, 'railway')
  it('parses all 24 places with unique ids', () => {
    expect(r.places).toHaveLength(24)
    expect(r.skipped).toHaveLength(0)
    expect(new Set(r.places.map((p) => p.id)).size).toBe(24)
    expect(r.places.every((p) => p.theme === 'railway')).toBe(true)
  })
  it('handles merged article', () => {
    const p = r.places.find((x) => x.title.startsWith('「民雄文化廊帶」在哪裡？訪談'))
    expect(p?.id).toBe('87111')
    expect(p?.links).toHaveLength(2)
    expect(p?.images).toHaveLength(2)
  })
})

describe('parsePlaces validation', () => {
  it('skips invalid items and keeps the rest', () => {
    const raw = {
      features: [
        feat(),
        { type: 'Feature', properties: { name: 'T', 查看更多: link(2) } },
        feat({ 查看更多: link(3) }, [0, 0, 0]),
        feat({ name: '', 查看更多: link(4) }),
        feat({ 查看更多: undefined }),
        'nope',
        feat({ 查看更多: link(6) }),
      ],
    }
    const r = parsePlaces(raw, 't')
    expect(r.places.map((p) => p.id)).toEqual(['1', '6'])
    expect(r.skipped.map((s) => s.index)).toEqual([1, 2, 3, 4, 5])
  })
  it('defaults summary and images', () => {
    const r = parsePlaces({ features: [feat({ 摘要: null, 圖片: '' })] }, 't')
    expect(r.places[0].summary).toBe('')
    expect(r.places[0].images).toEqual([])
  })
  it('returns empty result for bad input without throwing', () => {
    for (const bad of [null, {}, { features: 'x' }, undefined, 5]) {
      expect(parsePlaces(bad, 't')).toEqual({ places: [], skipped: [] })
    }
  })
  it('skips duplicate ids', () => {
    const r = parsePlaces({ features: [feat(), feat()] }, 't')
    expect(r.places).toHaveLength(1)
    expect(r.skipped).toHaveLength(1)
    expect(r.skipped[0].reason).toContain('duplicate')
  })
})
