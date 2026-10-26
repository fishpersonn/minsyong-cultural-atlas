import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ShareButton from './ShareButton'

const setPointerCoarse = (coarse: boolean) =>
  vi.stubGlobal('matchMedia', vi.fn((query: string) => ({ matches: coarse && query === '(pointer: coarse)', media: query })))

const stubClipboard = (writeText: (t: string) => Promise<void>) =>
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
})
afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  // @ts-expect-error 還原：jsdom 預設沒有這兩個
  delete navigator.share
  // @ts-expect-error 還原：jsdom 預設沒有 clipboard
  delete navigator.clipboard
})

const URL_OF = (id: string) => `${window.location.origin}${import.meta.env.BASE_URL}p/${id}/`

describe('ShareButton', () => {
  it('電腦：複製 /p/<id>/ 連結並顯示「已複製連結」，一下子後訊息消失', async () => {
    setPointerCoarse(false)
    const writeText = vi.fn().mockResolvedValue(undefined)
    stubClipboard(writeText)
    render(<ShareButton id="podcast-61177" title="EP90" />)
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '分享這個地點' }))
    })
    expect(writeText).toHaveBeenCalledWith(URL_OF('podcast-61177'))
    expect(screen.getByRole('status').textContent).toBe('已複製連結')
    await act(async () => {
      vi.advanceTimersByTime(2600)
    })
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('手機（觸控）：有 navigator.share 就叫出系統分享選單，帶標題與連結', async () => {
    setPointerCoarse(true)
    const share = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'share', { configurable: true, value: share })
    const writeText = vi.fn()
    stubClipboard(writeText)
    render(<ShareButton id="96220" title="從鐵路到電波" />)
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '分享這個地點' }))
    })
    expect(share).toHaveBeenCalledWith({ title: '從鐵路到電波', url: URL_OF('96220') })
    expect(writeText).not.toHaveBeenCalled()
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('手機但瀏覽器沒有 navigator.share：退回複製連結', async () => {
    setPointerCoarse(true)
    const writeText = vi.fn().mockResolvedValue(undefined)
    stubClipboard(writeText)
    render(<ShareButton id="96220" title="t" />)
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '分享這個地點' }))
    })
    expect(writeText).toHaveBeenCalledWith(URL_OF('96220'))
    expect(screen.getByRole('status').textContent).toBe('已複製連結')
  })

  it('使用者自己關掉分享選單（AbortError）不算失敗', async () => {
    setPointerCoarse(true)
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: vi.fn().mockRejectedValue(new DOMException('canceled', 'AbortError')),
    })
    render(<ShareButton id="96220" title="t" />)
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '分享這個地點' }))
    })
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('複製失敗時提示手動複製', async () => {
    setPointerCoarse(false)
    stubClipboard(vi.fn().mockRejectedValue(new Error('denied')))
    render(<ShareButton id="96220" title="t" />)
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '分享這個地點' }))
    })
    expect(screen.getByRole('status').textContent).toBe('無法複製，請手動複製網址')
  })
})
