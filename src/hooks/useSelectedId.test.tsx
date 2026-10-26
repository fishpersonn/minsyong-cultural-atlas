import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSelectedId } from './useSelectedId'

describe('useSelectedId', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/')
  })

  it('reads the initial id from the URL', () => {
    window.history.replaceState(null, '', '/#p=96220')
    const { result } = renderHook(() => useSelectedId())
    expect(result.current[0]).toBe('96220')
  })

  it('is null without a hash', () => {
    const { result } = renderHook(() => useSelectedId())
    expect(result.current[0]).toBeNull()
  })

  it('setter updates location.hash', () => {
    const { result } = renderHook(() => useSelectedId())
    act(() => result.current[1]('87111'))
    expect(window.location.hash).toBe('#p=87111')
    expect(result.current[0]).toBe('87111')
  })

  it('setting null clears the hash and keeps path/search', () => {
    window.history.replaceState(null, '', '/a?q=1#p=1')
    const { result } = renderHook(() => useSelectedId())
    act(() => result.current[1](null))
    expect(window.location.hash).toBe('')
    expect(window.location.pathname + window.location.search).toBe('/a?q=1')
    expect(result.current[0]).toBeNull()
  })

  it('does not push history when the hash is unchanged', () => {
    const { result } = renderHook(() => useSelectedId())
    act(() => result.current[1]('5'))
    const len = window.history.length
    act(() => result.current[1]('5'))
    expect(window.history.length).toBe(len)
  })

  it('follows hashchange', () => {
    const { result } = renderHook(() => useSelectedId())
    act(() => {
      window.history.replaceState(null, '', '/#p=42')
      window.dispatchEvent(new HashChangeEvent('hashchange'))
    })
    expect(result.current[0]).toBe('42')
  })

  it('follows popstate', () => {
    const { result } = renderHook(() => useSelectedId())
    act(() => {
      window.history.replaceState(null, '', '/#p=7')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    expect(result.current[0]).toBe('7')
  })
})
