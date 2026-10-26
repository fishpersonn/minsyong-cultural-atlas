import { describe, it, expect } from 'vitest'
import { extractArticleId } from './articleId'

describe('extractArticleId', () => {
  it('extracts the id from an official article url', () => {
    expect(
      extractArticleId('https://dovoha.ccu.edu.tw/p/405-1159-96220,c4204.php?Lang=zh-tw'),
    ).toBe('96220')
  })
  it('returns null for non-matching url', () => {
    expect(extractArticleId('https://example.com/x')).toBeNull()
  })
  it('returns null for empty string', () => {
    expect(extractArticleId('')).toBeNull()
  })
})
