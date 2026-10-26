import { describe, expect, it } from 'vitest'
import { searchTerms, snippetAround, splitByTerms } from './highlight'

describe('searchTerms', () => {
  it('以空白分詞、轉小寫、略過空字串', () => {
    expect(searchTerms('  Podcast   農會 ')).toEqual(['podcast', '農會'])
    expect(searchTerms('')).toEqual([])
    expect(searchTerms('   ')).toEqual([])
  })
})

describe('splitByTerms', () => {
  const texts = (segs: ReturnType<typeof splitByTerms>) => segs.map((s) => `${s.match ? '[' : ''}${s.text}${s.match ? ']' : ''}`).join('')

  it('把符合的部分切出來，其餘照舊，串回去等於原文', () => {
    const segs = splitByTerms('民雄農會倉庫的故事', ['農會'])
    expect(texts(segs)).toBe('民雄[農會]倉庫的故事')
    expect(segs.map((s) => s.text).join('')).toBe('民雄農會倉庫的故事')
  })

  it('不分大小寫，並保留原文的大小寫', () => {
    expect(texts(splitByTerms('Railway 與 RAILWAY', ['railway']))).toBe('[Railway] 與 [RAILWAY]')
  })

  it('同一個詞出現多次、多個詞都標出來', () => {
    expect(texts(splitByTerms('倉庫與農會倉庫', ['倉庫', '農會']))).toBe('[倉庫]與[農會倉庫]')
  })

  it('重疊或相連的符合合併成一段', () => {
    expect(texts(splitByTerms('農會倉庫', ['農會', '會倉', '倉庫']))).toBe('[農會倉庫]')
    expect(splitByTerms('農會倉庫', ['農會', '倉庫']).filter((s) => s.match)).toHaveLength(1)
  })

  it('沒有搜尋詞、沒有符合、空字串時，整段是一個不符合的片段', () => {
    expect(splitByTerms('民雄', [])).toEqual([{ text: '民雄', match: false }])
    expect(splitByTerms('民雄', ['不存在'])).toEqual([{ text: '民雄', match: false }])
    expect(splitByTerms('', ['民'])).toEqual([{ text: '', match: false }])
  })

  it('搜尋詞裡的特殊字元當作一般文字，不會被當成規則運算式', () => {
    expect(texts(splitByTerms('a.b (c) [d] *', ['.', '(c)', '*']))).toBe('a[.]b [(c)] [d] [*]')
    expect(() => splitByTerms('x', ['['])).not.toThrow()
  })

  it('轉小寫後長度會變的字元（İ）寧可不標示，也不標錯位置', () => {
    expect(splitByTerms('İstanbul', ['stanbul'])).toEqual([{ text: 'İstanbul', match: false }])
  })
})

describe('snippetAround', () => {
  const text = '甲'.repeat(40) + '農會' + '乙'.repeat(40)

  it('取第一個符合處前後各 radius 個字，被截掉的一側加「…」', () => {
    const s = snippetAround(text, ['農會'], 5)!
    expect(s).toBe(`…${'甲'.repeat(5)}農會${'乙'.repeat(5)}…`)
  })

  it('符合處靠近開頭或結尾時，那一側不加「…」', () => {
    expect(snippetAround('農會' + '乙'.repeat(40), ['農會'], 5)).toBe(`農會${'乙'.repeat(5)}…`)
    expect(snippetAround('甲'.repeat(40) + '農會', ['農會'], 5)).toBe(`…${'甲'.repeat(5)}農會`)
    expect(snippetAround('農會', ['農會'], 5)).toBe('農會')
  })

  it('換行與連續空白壓成一個空白；沒有符合時為 null', () => {
    expect(snippetAround('第一行\n\n  農會  後面', ['農會'], 20)).toBe('第一行 農會 後面')
    expect(snippetAround('沒有', ['農會'])).toBeNull()
    expect(snippetAround('農會', [])).toBeNull()
  })
})
