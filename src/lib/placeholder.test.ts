import { describe, expect, it } from 'vitest'
import { PLACEHOLDER_COUNT, placeholderFor } from './placeholder'

describe('placeholderFor', () => {
  it('同一個 id 永遠得到同一張', () => {
    expect(placeholderFor('96220')).toBe(placeholderFor('96220'))
  })

  it('只會落在既有的預設圖範圍內', () => {
    const base = import.meta.env.BASE_URL
    const allowed = Array.from({ length: PLACEHOLDER_COUNT }, (_, i) => `${base}placeholder-${i + 1}.svg`)
    for (const id of ['1', '96220', 'abc', '', '999999999999']) {
      expect(allowed).toContain(placeholderFor(id))
    }
  })

  it('不同 id 會分散到多張預設圖', () => {
    const urls = new Set(Array.from({ length: 40 }, (_, i) => placeholderFor(String(1000 + i))))
    expect(urls.size).toBeGreaterThan(1)
  })
})
