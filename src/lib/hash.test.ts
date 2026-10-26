import { describe, it, expect } from 'vitest'
import { parseHash, buildHash, EMPTY_HASH_STATE } from './hash'

describe('parseHash', () => {
  it('parses #p=<id>：數字（鐵路高架化）或帶主題前綴的 id', () => {
    expect(parseHash('#p=96220').id).toBe('96220')
    expect(parseHash('#p=podcast-61177').id).toBe('podcast-61177')
    expect(parseHash('#p=food-i3-2').id).toBe('food-i3-2')
  })
  it.each(['', '#', '#p=', '#x=1', '#p=a b', '#p=1/2', '#p=<x>'])('%j 沒有地點 id', (h) => {
    expect(parseHash(h)).toEqual(EMPTY_HASH_STATE)
  })
  it('讀取主題、分類、搜尋字', () => {
    expect(parseHash('#t=people,stele&c=%E6%AD%B7%E5%8F%B2%E6%95%85%E4%BA%8B&q=%E8%BE%B2%20%E6%9C%83')).toEqual({
      id: null,
      themes: ['people', 'stele'],
      category: '歷史故事',
      query: '農 會',
    })
  })
  it('可同時帶地點與篩選；不認得的欄位與不安全的主題 id 被忽略', () => {
    expect(parseHash('#p=96220&t=railway,<x>&x=2')).toEqual({
      id: '96220',
      themes: ['railway'],
      category: null,
      query: '',
    })
  })
})

describe('buildHash', () => {
  it('builds hash from id', () => {
    expect(buildHash({ ...EMPTY_HASH_STATE, id: '96220' })).toBe('#p=96220')
  })
  it('returns empty string for empty state', () => {
    expect(buildHash(EMPTY_HASH_STATE)).toBe('')
  })
  it('寫入篩選並與 parseHash 互為反運算', () => {
    const state = { id: 'people-1', themes: ['people', 'stele'], category: '歷史故事', query: '農會 倉庫&?' }
    const hash = buildHash(state)
    expect(hash).toBe('#p=people-1&t=people,stele&c=%E6%AD%B7%E5%8F%B2%E6%95%85%E4%BA%8B&q=%E8%BE%B2%E6%9C%83%20%E5%80%89%E5%BA%AB%26%3F')
    expect(parseHash(hash)).toEqual(state)
  })
})
