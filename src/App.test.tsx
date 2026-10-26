import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mapProps = vi.hoisted(() => ({ groups: [] as unknown[] }))

vi.mock('@/components/MapView', () => ({
  default: (props: { groups: unknown[]; onSelect: (id: string) => void }) => {
    mapProps.groups.push(props.groups)
    return <button onClick={() => props.onSelect('96220')}>mock-map</button>
  },
}))

async function load() {
  vi.resetModules()
  return (await import('./App')).default
}

beforeEach(() => {
  window.location.hash = ''
  localStorage.clear()
  mapProps.groups = []
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.doUnmock('@/data/themes')
})

describe('App', () => {
  it('顯示標題與地圖', async () => {
    const App = await load()
    render(<App />)
    expect(screen.getByText('Minsyong Cultural Atlas')).toBeTruthy()
    expect(screen.getByText('mock-map')).toBeTruthy()
    expect(screen.queryByRole('complementary')).toBeNull()
  })

  it('正式資料沒有略過項目，載入時不會 console.warn', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const App = await load()
    render(<App />)
    expect(warn).not.toHaveBeenCalled()
  })

  it('#p=96220 顯示該地點卡片', async () => {
    window.location.hash = '#p=96220'
    const App = await load()
    render(<App />)
    expect(screen.getByRole('heading', { name: /從鐵路到電波/ })).toBeTruthy()
  })

  it.each(['#p=999999', '#p=abc'])('%s 不顯示卡片也不改寫網址', async (hash) => {
    window.location.hash = hash
    const App = await load()
    render(<App />)
    expect(screen.queryByRole('heading', { level: 2 })).toBeNull()
    expect(window.location.hash).toBe(hash)
  })

  it('切換地點時卡片捲動位置回到頂端', async () => {
    window.location.hash = '#p=96220'
    const App = await load()
    render(<App />)
    const aside = screen.getByRole('complementary')
    const scroller = aside.querySelector('.overflow-y-auto') as HTMLElement
    scroller.scrollTop = 300
    act(() => {
      window.location.hash = '#p=93677'
      window.dispatchEvent(new HashChangeEvent('hashchange'))
    })
    const next = screen.getByRole('complementary').querySelector('.overflow-y-auto') as HTMLElement
    expect(next).not.toBe(scroller)
    expect(next.scrollTop).toBe(0)
  })

  it('點關閉後 hash 為空', async () => {
    window.location.hash = '#p=96220'
    const App = await load()
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: '關閉' }))
    expect(window.location.hash).toBe('')
    expect(screen.queryByRole('heading', { level: 2 })).toBeNull()
  })

  it('選取地點不會改變傳給 MapView 的 groups 參照', async () => {
    const App = await load()
    render(<App />)
    fireEvent.click(screen.getByText('mock-map'))
    expect(screen.getByRole('heading', { name: /從鐵路到電波/ })).toBeTruthy()
    expect(mapProps.groups.length).toBeGreaterThan(1)
    expect(new Set(mapProps.groups).size).toBe(1)
  })

  it('資料為空時顯示友善訊息與官網連結', async () => {
    vi.doMock('@/data/themes', () => ({ themes: [{ id: 't', name: 't', data: { features: [] } }] }))
    const App = await load()
    render(<App />)
    expect(screen.getByText('目前沒有可顯示的地點')).toBeTruthy()
    const link = within(screen.getByRole('main')).getByRole('link', { name: '前往大學路官網' })
    expect(link.getAttribute('href')).toBe('https://dovoha.ccu.edu.tw/')
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toBe('noopener noreferrer')
    expect(screen.getByText('Minsyong Cultural Atlas')).toBeTruthy()
  })

  it('首次顯示使用說明，按「知道了」後隱藏並記住', async () => {
    const App = await load()
    const { unmount } = render(<App />)
    expect(screen.getByRole('region', { name: '使用說明' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: '知道了' }))
    expect(screen.queryByRole('region', { name: '使用說明' })).toBeNull()
    unmount()
    const App2 = await load()
    render(<App2 />)
    expect(screen.queryByRole('region', { name: '使用說明' })).toBeNull()
  })

  it('標頭按鈕開關地點清單，點清單項目會選取並關閉清單', async () => {
    const App = await load()
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: '地點清單' }))
    const list = screen.getByRole('region', { name: '地點清單' })
    expect(screen.queryByRole('region', { name: '使用說明' })).toBeNull()
    fireEvent.click(within(list).getByRole('button', { name: /從鐵路到電波/ }))
    expect(screen.queryByRole('region', { name: '地點清單' })).toBeNull()
    expect(screen.getByRole('heading', { name: /從鐵路到電波/ })).toBeTruthy()
    expect(window.location.hash).toBe('#p=96220')
  })

  it('使用說明的「看地點清單」會開啟清單', async () => {
    const App = await load()
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: '看地點清單' }))
    expect(screen.getByRole('region', { name: '地點清單' })).toBeTruthy()
  })

  it('localStorage 不可用時仍可使用', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    const App = await load()
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: '知道了' }))
    expect(screen.queryByRole('region', { name: '使用說明' })).toBeNull()
  })

  it('有略過的資料時只 warn 一次並列出 index 與原因', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.doMock('@/data/themes', () => ({
      themes: [{ id: 't', name: 't', data: { type: 'FeatureCollection', features: [{}, null] } }],
    }))
    const App = await load()
    render(<App />)
    expect(warn).toHaveBeenCalledTimes(1)
    const msg = String(warn.mock.calls[0][0])
    expect(msg).toMatch(/#0: missing properties/)
    expect(msg).toMatch(/#1: not an object/)
  })
})
