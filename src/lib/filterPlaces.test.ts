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
  theme: 't',
  category: '歷史故事',
}

describe('matchesFilters', () => {
  it('沒有條件時全部符合', () => {
    expect(matchesFilters(place, null, '')).toBe(true)
    expect(matchesFilters(place, null, '   ')).toBe(true)
  })

  it('分類要完全相同', () => {
    expect(matchesFilters(place, '歷史故事', '')).toBe(true)
    expect(matchesFilters(place, '建築測繪', '')).toBe(false)
    expect(matchesFilters({ ...place, category: undefined }, '歷史故事', '')).toBe(false)
  })

  it('搜尋比對標題、摘要與分類，不分大小寫', () => {
    expect(matchesFilters(place, null, '倉庫')).toBe(true)
    expect(matchesFilters(place, null, '1933')).toBe(true)
    expect(matchesFilters(place, null, 'railway')).toBe(true)
    expect(matchesFilters(place, null, '歷史故事')).toBe(true)
    expect(matchesFilters(place, null, '不存在')).toBe(false)
  })

  it('多個詞以空白分隔，每個詞都要出現', () => {
    expect(matchesFilters(place, null, '倉庫 1933')).toBe(true)
    expect(matchesFilters(place, null, '倉庫 不存在')).toBe(false)
  })

  it('分類與搜尋同時成立才符合', () => {
    expect(matchesFilters(place, '歷史故事', '倉庫')).toBe(true)
    expect(matchesFilters(place, '建築測繪', '倉庫')).toBe(false)
  })
})
