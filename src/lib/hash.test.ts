import { describe, it, expect } from 'vitest'
import { parseHash, buildHash } from './hash'

describe('parseHash', () => {
  it('parses #p=<digits>', () => {
    expect(parseHash('#p=96220')).toBe('96220')
  })
  it.each(['', '#', '#p=', '#p=abc', '#p=12a', '#x=1', '#p=1&x=2'])(
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
