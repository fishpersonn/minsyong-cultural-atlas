import { describe, it, expect } from 'vitest'
import { parsePlaces } from './parsePlaces'
import railway from '../data/railway.json'
import railwayMeta from '../data/railway.meta.json'
import { CATEGORY_STYLES } from './categories'

const link = (id: number) => `https://dovoha.ccu.edu.tw/p/405-1159-${id},c4204.php?Lang=zh-tw`
const feat = (over: Record<string, unknown> = {}, coords: unknown = [120.4, 23.55, 0]) => ({
  type: 'Feature',
  geometry: { type: 'Point', coordinates: coords },
  properties: { name: 'T', 摘要: 's', 查看更多: link(1), 圖片: 'http://i/1.jpg', ...over },
})

describe('parsePlaces with real data', () => {
  const r = parsePlaces(railway, 'railway')
  it('補充資料與資料檔一一對應，每個地點都有已設定樣式的分類與發布日期', () => {
    const withMeta = parsePlaces(railway, 'railway', railwayMeta)
    expect(Object.keys(railwayMeta).sort()).toEqual(withMeta.places.map((p) => p.id).sort())
    for (const p of withMeta.places) {
      expect(Object.keys(CATEGORY_STYLES), p.title).toContain(p.category)
      expect(p.published, p.title).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  })
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
  it('資料裡明講 id 就用它，這時連結不是必填（匯入腳本產生的資料）', () => {
    const r = parsePlaces(
      {
        features: [
          feat({ id: 'food-i1', 查看更多: undefined, 圖片: undefined }),
          feat({ id: ' people-5 ', 查看更多: link(9) }),
          feat({ id: '   ', 查看更多: undefined }),
        ],
      },
      't',
    )
    expect(r.places.map((p) => p.id)).toEqual(['food-i1', 'people-5'])
    expect(r.places[0].links).toEqual([])
    expect(r.skipped).toEqual([{ index: 2, reason: 'missing link' }])
  })
  it('同一批資料裡 id 重複的只留第一筆', () => {
    const r = parsePlaces({ features: [feat({ id: 'a' }), feat({ id: 'a' })] }, 't')
    expect(r.places).toHaveLength(1)
    expect(r.skipped[0].reason).toBe('duplicate id a')
  })
  it('extra 只收 [標籤, 內容] 都是非空字串的項目', () => {
    const r = parsePlaces(
      {
        features: [
          feat({
            extra: [['地址', ' 民雄鄉 '], ['電話', ''], ['x'], 'bad', [1, 2], ['備註', '有']],
          }),
          feat({ extra: 'nope', 查看更多: link(2) }),
          feat({ extra: [['電話', '']], 查看更多: link(3) }),
        ],
      },
      't',
    )
    expect(r.places[0].extra).toEqual([['地址', '民雄鄉'], ['備註', '有']])
    expect(r.places[1].extra).toBeUndefined()
    expect(r.places[2].extra).toBeUndefined()
  })
  it('passes through optional category and era, ignoring blank or non-string values', () => {
    const r2 = parsePlaces(
      {
        features: [
          feat({ 分類: '歷史建築', 年代: '1905' }),
          feat({ 分類: '  ', 年代: 1905, 查看更多: link(2) }),
        ],
      },
      't',
    )
    expect(r2.places[0].category).toBe('歷史建築')
    expect(r2.places[0].era).toBe('1905')
    expect(r2.places[1].category).toBeUndefined()
    expect(r2.places[1].era).toBeUndefined()
  })
  it('fills category, era and published from meta by article id; the data file wins when both exist', () => {
    const r2 = parsePlaces(
      { features: [feat({}), feat({ 分類: '資料檔分類', 查看更多: link(2) })] },
      't',
      {
        '1': { category: '補充分類', era: '1963', published: '2026-01-02' },
        '2': { category: '被蓋掉的分類' },
      },
    )
    expect(r2.places[0]).toMatchObject({ category: '補充分類', era: '1963', published: '2026-01-02' })
    expect(r2.places[1].category).toBe('資料檔分類')
    expect(r2.places[1].published).toBeUndefined()
  })
  it('ignores meta for ids not in the data', () => {
    const r2 = parsePlaces({ features: [feat({})] }, 't', { '999': { category: 'x' } })
    expect(r2.places[0].category).toBeUndefined()
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
