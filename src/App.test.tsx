import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mapProps = vi.hoisted(() => ({ groups: [] as unknown[], bounds: [] as unknown[], resets: [] as unknown[] }))

vi.mock('@/components/MapView', () => ({
  default: (props: { groups: unknown[]; bounds: unknown; resetSignal?: number; onSelect: (id: string) => void }) => {
    mapProps.groups.push(props.groups)
    mapProps.bounds.push(props.bounds)
    mapProps.resets.push(props.resetSignal)
    return <button onClick={() => props.onSelect('96220')}>mock-map</button>
  },
}))

// 搜尋框預設收起來：沒開的話先點標題列的「搜尋」鈕，再輸入
function typeSearch(value: string) {
  if (!screen.queryByRole('searchbox')) fireEvent.click(screen.getByRole('button', { name: '搜尋' }))
  fireEvent.change(screen.getByRole('searchbox', { name: '搜尋地點' }), { target: { value } })
}

async function load() {
  vi.resetModules()
  return (await import('./App')).default
}

beforeEach(() => {
  window.location.hash = ''
  localStorage.clear()
  mapProps.groups = []
  mapProps.bounds = []
  mapProps.resets = []
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

  it('卡片的上一個／下一個依序切換並循環，網址同步', async () => {
    window.location.hash = '#p=96220'
    const App = await load()
    render(<App />)
    const position = () => screen.getByText(/^\d+ \/ \d+$/).textContent!
    const [i, total] = position().split(' / ').map(Number)
    fireEvent.click(screen.getByRole('button', { name: '下一個地點' }))
    expect(position()).toBe(`${(i % total) + 1} / ${total}`)
    expect(window.location.hash).not.toBe('#p=96220')
    fireEvent.click(screen.getByRole('button', { name: '上一個地點' }))
    expect(window.location.hash).toBe('#p=96220')
  })

  it('Esc 先關清單，再關卡片', async () => {
    window.location.hash = '#p=96220'
    const App = await load()
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: '地點清單' }))
    expect(screen.getByRole('region', { name: '地點清單' })).toBeTruthy()
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.queryByRole('region', { name: '地點清單' })).toBeNull()
    expect(screen.getByRole('heading', { name: /從鐵路到電波/ })).toBeTruthy()
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.queryByRole('heading', { level: 2 })).toBeNull()
    expect(window.location.hash).toBe('')
  })

  it('點分類只留下該分類的標記，再點「全部」恢復', async () => {
    const App = await load()
    render(<App />)
    const countPlaces = () => {
      const g = mapProps.groups.at(-1) as { places: unknown[] }[]
      return g.reduce((n, x) => n + x.places.length, 0)
    }
    const total = countPlaces()
    expect(total).toBeGreaterThan(600)
    fireEvent.click(screen.getByRole('button', { name: /^民雄鐵路高架化/ }))
    expect(countPlaces()).toBe(24)
    fireEvent.click(screen.getByRole('button', { name: /^建築測繪/ }))
    expect(countPlaces()).toBe(2)
    fireEvent.click(screen.getByRole('button', { name: '全部分類' }))
    expect(countPlaces()).toBe(24)
    fireEvent.click(screen.getByRole('button', { name: '全部主題' }))
    expect(countPlaces()).toBe(total)
  })

  it('篩選結果的範圍會傳給地圖：換主題改變範圍，回到全部恢復，沒有結果時維持不動', async () => {
    const App = await load()
    render(<App />)
    const lastBounds = () => mapProps.bounds.at(-1)
    const all = lastBounds()
    fireEvent.click(screen.getByRole('button', { name: /^民雄鐵路高架化/ }))
    const railway = lastBounds()
    expect(railway).not.toBe(all)
    expect(railway).not.toEqual(all)
    // 同一個篩選結果重繪時範圍是同一個參照，地圖才不會重複縮放
    fireEvent.click(screen.getByRole('button', { name: '地點清單' }))
    expect(lastBounds()).toBe(railway)
    typeSearch('完全不存在的字串')
    expect(lastBounds()).toBe(all)
    fireEvent.click(screen.getByRole('button', { name: '清除篩選與搜尋' }))
    expect(lastBounds()).toBe(all)
  })

  it('篩選排除了目前選取的地點時取消選取，網址只剩篩選', async () => {
    window.location.hash = '#p=96220'
    const App = await load()
    render(<App />)
    expect(screen.getByRole('heading', { name: /從鐵路到電波/ })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /^民雄鐵路高架化/ }))
    expect(screen.getByRole('heading', { name: /從鐵路到電波/ })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /^建築測繪/ }))
    expect(screen.queryByRole('heading', { level: 2 })).toBeNull()
    expect(window.location.hash).toBe('#t=railway&c=%E5%BB%BA%E7%AF%89%E6%B8%AC%E7%B9%AA')
  })

  it('篩選後上一個／下一個只在符合的地點之間切換', async () => {
    window.location.hash = '#p=93677'
    const App = await load()
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /^民雄鐵路高架化/ }))
    fireEvent.click(screen.getByRole('button', { name: /^建築測繪/ }))
    expect(screen.getByText('1 / 2')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: '下一個地點' }))
    expect(screen.getByText('2 / 2')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: '下一個地點' }))
    expect(screen.getByText('1 / 2')).toBeTruthy()
  })

  it('搜尋框縮小清單與地圖，沒有結果時可清除，並寫進網址', async () => {
    const App = await load()
    render(<App />)
    const countPlaces = () => {
      const g = mapProps.groups.at(-1) as { places: unknown[] }[]
      return g.reduce((n, x) => n + x.places.length, 0)
    }
    const total = countPlaces()
    typeSearch('農會倉庫')
    expect(countPlaces()).toBeLessThan(total)
    expect(window.location.hash).toBe('#q=%E8%BE%B2%E6%9C%83%E5%80%89%E5%BA%AB')
    expect(screen.getByRole('status', { name: '' }).textContent).toMatch(/^\d+ 個符合$/)
    fireEvent.click(screen.getByRole('button', { name: '地點清單' }))
    const list = screen.getByRole('region', { name: '地點清單' })
    expect(within(list).getAllByRole('button', { name: /農會倉庫/ }).length).toBeGreaterThan(1)
    expect(within(list).queryByRole('button', { name: /從鐵路到電波/ })).toBeNull()
    typeSearch('完全不存在的字串')
    expect(screen.getByText('沒有符合的地點。')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: '清除篩選與搜尋' }))
    expect(window.location.hash).toBe('')
    expect(within(screen.getByRole('region', { name: '地點清單' })).getAllByRole('button', { name: /從鐵路到電波/ })).toHaveLength(1)
  })

  it('主題可複選，地圖顯示聯集，網址記錄主題', async () => {
    const App = await load()
    render(<App />)
    const countPlaces = () => {
      const g = mapProps.groups.at(-1) as { places: unknown[] }[]
      return g.reduce((n, x) => n + x.places.length, 0)
    }
    fireEvent.click(screen.getByRole('button', { name: /^民雄鐵路高架化/ }))
    fireEvent.click(screen.getByRole('button', { name: /^民雄古碑文/ }))
    expect(countPlaces()).toBe(24 + 10)
    expect(window.location.hash).toBe('#t=railway,stele')
    // 選了兩個主題就沒有分類列
    expect(screen.queryByRole('group', { name: '依分類篩選' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: /^民雄鐵路高架化/ }))
    expect(countPlaces()).toBe(10)
    expect(window.location.hash).toBe('#t=stele')
  })

  it('從網址還原主題、分類與搜尋；亂填的主題被忽略', async () => {
    window.location.hash = '#t=railway,nope&c=%E5%BB%BA%E7%AF%89%E6%B8%AC%E7%B9%AA'
    const App = await load()
    render(<App />)
    const g = mapProps.groups.at(-1) as { places: unknown[] }[]
    expect(g.reduce((n, x) => n + x.places.length, 0)).toBe(2)
    expect(screen.getByRole('button', { name: /^民雄鐵路高架化/ }).getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByRole('button', { name: /^建築測繪/ }).getAttribute('aria-pressed')).toBe('true')
  })

  it('點標題列的站名回到首頁：清掉篩選、搜尋、選取，收起清單與關於，並通知地圖拉回', async () => {
    window.location.hash = '#p=96220&t=podcast&q=%E8%BE%B2%E6%9C%83'
    const App = await load()
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: '地點清單' }))
    expect(screen.getByRole('region', { name: '地點清單' })).toBeTruthy()
    const before = mapProps.resets.at(-1) as number
    fireEvent.click(screen.getByRole('button', { name: /回到首頁/ }))
    expect(screen.queryByRole('region', { name: '地點清單' })).toBeNull()
    expect(screen.queryByRole('heading', { level: 2 })).toBeNull()
    expect(screen.queryByRole('searchbox')).toBeNull()
    expect(window.location.hash).toBe('')
    expect(mapProps.resets.at(-1)).toBe(before + 1)
    // 主題篩選也清掉了：所有地點都回來
    const g = mapProps.groups.at(-1) as { places: unknown[] }[]
    expect(g.reduce((n, x) => n + x.places.length, 0)).toBeGreaterThan(600)
  })

  it('地圖上的小圓鈕有名字（aria-label 與 title），文字只是滑過時才顯示的裝飾', async () => {
    const App = await load()
    render(<App />)
    for (const name of ['隨便逛逛', '身邊有什麼']) {
      const button = screen.getByRole('button', { name })
      expect(button.title).toBe(name)
      expect(button.textContent).toBe(name) // 滑出來的文字在 DOM 裡（aria-hidden），不是額外的第二個名字
    }
  })

  it('卡片上有「附近的故事」：最近的 3 個，不含自己，點了跳過去', async () => {
    window.location.hash = '#p=96220'
    const App = await load()
    render(<App />)
    const section = screen.getByRole('region', { name: '附近的故事' })
    const items = within(section).getAllByRole('button')
    expect(items).toHaveLength(3)
    expect(section.textContent).not.toContain('從鐵路到電波') // 自己不算
    const target = items[0].textContent!.replace(/約.*$/, '')
    fireEvent.click(items[0])
    expect(window.location.hash).not.toBe('#p=96220')
    expect(window.location.hash).toMatch(/^#p=/)
    // 跳過去之後，卡片標題變成被點的那個
    expect(screen.getByRole('heading', { level: 2 }).textContent).toContain(target.trim().slice(0, 6))
  })

  it('有篩選時，「附近的故事」只在符合篩選的地點裡找', async () => {
    window.location.hash = '#p=96220&t=railway'
    const App = await load()
    render(<App />)
    const section = screen.getByRole('region', { name: '附近的故事' })
    const names = within(section).getAllByRole('button').map((b) => b.textContent!)
    // 鐵路高架化的地點裡找；每一個的主題名都不會是別的主題
    expect(names).toHaveLength(3)
    fireEvent.click(within(section).getAllByRole('button')[0])
    expect(window.location.hash).toContain('t=railway')
  })

  it('「隨便逛逛」在目前篩選的地點中挑一個並選取', async () => {
    window.location.hash = '#t=stele'
    const App = await load()
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: '隨便逛逛' }))
    expect(window.location.hash).toMatch(/^#p=stele-\d+&t=stele$/)
  })

  it('「身邊有什麼」用定位選取最近的地點；太遠或被拒絕時只顯示提示', async () => {
    const getCurrentPosition = vi.fn()
    Object.defineProperty(navigator, 'geolocation', { value: { getCurrentPosition }, configurable: true })
    const App = await load()
    render(<App />)
    // 站在鐵路高架化第一個地點上
    window.location.hash = ''
    const first = (mapProps.groups.at(-1) as { lng: number; lat: number }[])[0]
    getCurrentPosition.mockImplementationOnce((ok) => ok({ coords: { longitude: first.lng, latitude: first.lat } }))
    fireEvent.click(screen.getByRole('button', { name: '身邊有什麼' }))
    expect(window.location.hash).toMatch(/^#p=/)
    expect(screen.getByText(/最近的地點在約/)).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: '關閉' }))
    getCurrentPosition.mockImplementationOnce((ok) => ok({ coords: { longitude: 121.5, latitude: 25.04 } }))
    fireEvent.click(screen.getByRole('button', { name: '身邊有什麼' }))
    expect(screen.getByText(/你離民雄約/)).toBeTruthy()
    expect(window.location.hash).toBe('')

    getCurrentPosition.mockImplementationOnce((_ok, fail) => fail({ code: 1, PERMISSION_DENIED: 1 }))
    fireEvent.click(screen.getByRole('button', { name: '身邊有什麼' }))
    expect(screen.getByText(/允許位置權限/)).toBeTruthy()
    // @ts-expect-error 還原成 jsdom 預設（沒有定位）
    delete navigator.geolocation
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
