import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAtlasHash } from './useAtlasHash'

describe('useAtlasHash', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/')
  })

  it('reads the initial state from the URL', () => {
    window.history.replaceState(null, '', '/#p=96220&t=people')
    const { result } = renderHook(() => useAtlasHash())
    expect(result.current[0].id).toBe('96220')
    expect(result.current[0].themes).toEqual(['people'])
  })

  it('is empty without a hash', () => {
    const { result } = renderHook(() => useAtlasHash())
    expect(result.current[0]).toEqual({ id: null, themes: [], category: null, query: '' })
  })

  it('選取地點時更新 hash 並保留篩選', () => {
    window.history.replaceState(null, '', '/#t=people')
    const { result } = renderHook(() => useAtlasHash())
    act(() => result.current[1]({ id: '87111' }))
    expect(window.location.hash).toBe('#p=87111&t=people')
    expect(result.current[0].id).toBe('87111')
  })

  it('清空後 hash 為空，並保留 path 與 search', () => {
    window.history.replaceState(null, '', '/a?q=1#p=1')
    const { result } = renderHook(() => useAtlasHash())
    act(() => result.current[1]({ id: null }))
    expect(window.location.hash).toBe('')
    expect(window.location.pathname + window.location.search).toBe('/a?q=1')
  })

  it('選取地點會新增歷史紀錄；只改篩選或搜尋不會', () => {
    const { result } = renderHook(() => useAtlasHash())
    const len = window.history.length
    act(() => result.current[1]({ id: '5' }))
    expect(window.history.length).toBe(len + 1)
    act(() => result.current[1]({ query: '農會' }))
    act(() => result.current[1]({ themes: ['people'] }))
    expect(window.history.length).toBe(len + 1)
    expect(window.location.hash).toBe('#p=5&t=people&q=%E8%BE%B2%E6%9C%83')
  })

  it('does not push history when the hash is unchanged', () => {
    const { result } = renderHook(() => useAtlasHash())
    act(() => result.current[1]({ id: '5' }))
    const len = window.history.length
    act(() => result.current[1]({ id: '5' }))
    expect(window.history.length).toBe(len)
  })

  it('follows hashchange and popstate', () => {
    const { result } = renderHook(() => useAtlasHash())
    act(() => {
      window.history.replaceState(null, '', '/#p=42')
      window.dispatchEvent(new HashChangeEvent('hashchange'))
    })
    expect(result.current[0].id).toBe('42')
    act(() => {
      window.history.replaceState(null, '', '/#p=7&q=a')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    expect(result.current[0]).toMatchObject({ id: '7', query: 'a' })
  })
})
