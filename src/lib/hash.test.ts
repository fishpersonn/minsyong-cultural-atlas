import { describe, it, expect } from 'vitest'
import { parseHash, buildHash } from './hash'

describe('parseHash', () => {
  it('parses #p=<id>：數字（鐵路高架化）或帶主題前綴的 id', () => {
    expect(parseHash('#p=96220')).toBe('96220')
    expect(parseHash('#p=podcast-61177')).toBe('podcast-61177')
    expect(parseHash('#p=food-i3-2')).toBe('food-i3-2')
  })
  it.each(['', '#', '#p=', '#x=1', '#p=1&x=2', '#p=a b', '#p=1/2', '#p=<x>'])(
    'returns null for %j',
    (h) => {
      expect(parseHash(h)).toBeNull()
    },
  )
})

describe('buildHash', () => {
  it('builds hash from id', () => {
    expect(buildHash('96220')).toBe('#p=96220')
  })
  it('returns empty string for null', () => {
    expect(buildHash(null)).toBe('')
  })
})
