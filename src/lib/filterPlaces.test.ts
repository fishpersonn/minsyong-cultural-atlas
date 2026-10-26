import { describe, expect, it } from 'vitest'
import { matchesFilters } from './filterPlaces'
import type { Place } from '../types'

const place: Place = {
  id: '1',
  title: '農會倉庫歷史',
  summary: '最初於 1933 年完工，Railway 旁的倉庫',
  links: [],
  images: [],
  lng: 0,
  lat: 0,
  theme: 'railway',
  category: '歷史故事',
  extra: [['地址', '嘉義縣民雄鄉東榮路']],
}

describe('matchesFilters', () => {
  it('沒有條件時全部符合', () => {
    expect(matchesFilters(place, null, null, '')).toBe(true)
    expect(matchesFilters(place, null, null, '   ')).toBe(true)
  })

  it('主題要完全相同', () => {
    expect(matchesFilters(place, 'railway', null, '')).toBe(true)
    expect(matchesFilters(place, 'podcast', null, '')).toBe(false)
  })

  it('分類要完全相同', () => {
    expect(matchesFilters(place, null, '歷史故事', '')).toBe(true)
    expect(matchesFilters(place, null, '建築測繪', '')).toBe(false)
    expect(matchesFilters({ ...place, category: undefined }, null, '歷史故事', '')).toBe(false)
  })

  it('搜尋比對標題、摘要、分類與額外資訊，不分大小寫', () => {
    expect(matchesFilters(place, null, null, '倉庫')).toBe(true)
    expect(matchesFilters(place, null, null, '1933')).toBe(true)
    expect(matchesFilters(place, null, null, 'railway')).toBe(true)
    expect(matchesFilters(place, null, null, '歷史故事')).toBe(true)
    expect(matchesFilters(place, null, null, '東榮路')).toBe(true)
    expect(matchesFilters(place, null, null, '不存在')).toBe(false)
  })

  it('額外資訊的標籤本身不參與搜尋', () => {
    expect(matchesFilters(place, null, null, '地址')).toBe(false)
  })

  it('多個詞以空白分隔，每個詞都要出現', () => {
    expect(matchesFilters(place, null, null, '倉庫 1933')).toBe(true)
    expect(matchesFilters(place, null, null, '倉庫 不存在')).toBe(false)
  })

  it('主題、分類與搜尋同時成立才符合', () => {
    expect(matchesFilters(place, 'railway', '歷史故事', '倉庫')).toBe(true)
    expect(matchesFilters(place, 'railway', '建築測繪', '倉庫')).toBe(false)
    expect(matchesFilters(place, 'podcast', '歷史故事', '倉庫')).toBe(false)
  })
})
