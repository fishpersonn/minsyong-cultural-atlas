import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import PlaceCard from './PlaceCard'
import { placeholderFor } from '@/lib/placeholder'
import type { Place, PlaceGroup } from '@/types'

const mk = (id: string, over: Partial<Place> = {}): Place => ({
  id,
  title: `標題${id}`,
  summary: `摘要${id}...`,
  links: [`https://dovoha.ccu.edu.tw/p/405-1159-${id},c4204.php?Lang=zh-tw`],
  images: [`https://dovoha.ccu.edu.tw/img/${id}.jpg`],
  lng: 120.43,
  lat: 23.55,
  theme: 't',
  ...over,
})
const group = (...places: Place[]): PlaceGroup => ({ lng: 120.43, lat: 23.55, places })
const noop = () => {}

describe('PlaceCard', () => {
  it('顯示標題、摘要、第一張圖與官網連結', () => {
    const p = mk('1')
    render(<PlaceCard group={group(p)} selectedId="1" onSelect={noop} onClose={noop} />)
    expect(screen.getByRole('heading', { name: '標題1' })).toBeTruthy()
    expect(screen.getByText('摘要1...')).toBeTruthy()
    const img = screen.getByRole('img', { name: '標題1' })
    expect(img.getAttribute('src')).toBe(p.images[0])
    const link = screen.getByRole('link', { name: '到官網閱讀全文' })
    expect(link.getAttribute('href')).toBe(p.links[0])
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toBe('noopener noreferrer')
    expect(screen.queryByRole('list')).toBeNull()
  })

  it('兩個連結都顯示，只顯示第一張圖', () => {
    const p = mk('2', {
      links: ['https://dovoha.ccu.edu.tw/a', 'https://dovoha.ccu.edu.tw/b'],
      images: ['https://x/1.jpg', 'https://x/2.jpg'],
    })
    render(<PlaceCard group={group(p)} selectedId="2" onSelect={noop} onClose={noop} />)
    expect(screen.getByRole('link', { name: '到官網閱讀全文' }).getAttribute('href')).toBe('https://dovoha.ccu.edu.tw/a')
    const second = screen.getByRole('link', { name: '到官網閱讀全文（2）' })
    expect(second.getAttribute('href')).toBe('https://dovoha.ccu.edu.tw/b')
    expect(second.getAttribute('target')).toBe('_blank')
    expect(second.getAttribute('rel')).toBe('noopener noreferrer')
    expect(screen.getAllByRole('img')).toHaveLength(1)
  })

  it('圖片載入失敗改用預設圖，且不會重複觸發', () => {
    render(<PlaceCard group={group(mk('3'))} selectedId="3" onSelect={noop} onClose={noop} />)
    fireEvent.error(screen.getByRole('img', { name: '標題3' }))
    // 換圖時 img 會重新掛載（淡入動畫），所以每次都重新取得元素
    expect(screen.getByRole('img', { name: '標題3' }).getAttribute('src')).toBe(placeholderFor('3'))
    fireEvent.error(screen.getByRole('img', { name: '標題3' }))
    expect(screen.getByRole('img', { name: '標題3' }).getAttribute('src')).toBe(placeholderFor('3'))
  })

  it('有 nav 時顯示位置與前後按鈕，沒有時不顯示', () => {
    const onPrev = vi.fn()
    const onNext = vi.fn()
    const { rerender } = render(
      <PlaceCard
        group={group(mk('1'))}
        selectedId="1"
        onSelect={noop}
        onClose={noop}
        nav={{ index: 3, total: 24, onPrev, onNext }}
      />,
    )
    expect(screen.getByText('3 / 24')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: '上一個地點' }))
    fireEvent.click(screen.getByRole('button', { name: '下一個地點' }))
    expect(onPrev).toHaveBeenCalledTimes(1)
    expect(onNext).toHaveBeenCalledTimes(1)
    rerender(<PlaceCard group={group(mk('1'))} selectedId="1" onSelect={noop} onClose={noop} />)
    expect(screen.queryByRole('button', { name: '上一個地點' })).toBeNull()
  })

  it('顯示主題名；有額外資訊時列成「標籤 內容」，沒有摘要不留空段落', () => {
    const p = mk('7', {
      theme: 'food',
      summary: '',
      links: [],
      category: '越南',
      extra: [['地址', '嘉義縣民雄鄉福權4-3號'], ['電話', '05-2269177']],
    })
    const { container } = render(<PlaceCard group={group(p)} selectedId="7" onSelect={noop} onClose={noop} />)
    expect(screen.getByText('東南亞美食')).toBeTruthy()
    expect(screen.getByText('越南')).toBeTruthy()
    expect(screen.getByText('地址')).toBeTruthy()
    expect(screen.getByText('嘉義縣民雄鄉福權4-3號')).toBeTruthy()
    expect(screen.getByText('05-2269177')).toBeTruthy()
    // 沒有摘要：標題後面直接是額外資訊，不會有空的 <p>
    expect(Array.from(container.querySelectorAll('p')).some((el) => el.textContent === '')).toBe(false)
    // 沒有連結時按鈕改成前往官網首頁，不假裝有文章
    expect(screen.getByRole('link', { name: '前往大學路官網' }).getAttribute('href')).toBe('https://dovoha.ccu.edu.tw/')
  })

  it('有 nearby 時列出「附近的故事」：標題與距離，點了回報 id', () => {
    const onSelect = vi.fn()
    const near = [
      { place: mk('8', { title: '鄰居甲' }), meters: 120 },
      { place: mk('9', { title: '鄰居乙' }), meters: 1500 },
    ]
    render(<PlaceCard group={group(mk('7'))} selectedId="7" onSelect={onSelect} onClose={noop} nearby={near} />)
    const section = screen.getByRole('region', { name: '附近的故事' })
    expect(section.textContent).toContain('鄰居甲')
    expect(section.textContent).toContain('約 120 公尺')
    expect(section.textContent).toContain('約 1.5 公里')
    fireEvent.click(screen.getByRole('button', { name: /鄰居乙/ }))
    expect(onSelect).toHaveBeenCalledWith('9')
  })

  it('有 query 時，卡片的標題、摘要與額外資訊裡符合的字會被標出來', () => {
    const p = mk('7', {
      title: '農會倉庫測繪',
      summary: '倉庫完工於 1933 年。',
      extra: [['地址', '東榮路倉庫旁']],
    })
    const { container } = render(
      <PlaceCard group={group(p)} selectedId="7" onSelect={noop} onClose={noop} query="倉庫 1933" />,
    )
    const marked = Array.from(container.querySelectorAll('mark')).map((m) => m.textContent)
    expect(marked).toEqual(['倉庫', '倉庫', '1933', '倉庫'])
    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe('農會倉庫測繪')
  })

  it('沒有 query 時卡片沒有任何標示', () => {
    const { container } = render(<PlaceCard group={group(mk('7'))} selectedId="7" onSelect={noop} onClose={noop} />)
    expect(container.querySelectorAll('mark')).toHaveLength(0)
  })

  it('有 Spotify 單集的地點顯示「在這裡聽這一集」；沒有的就不顯示', () => {
    const withAudio = mk('7', { audio: { spotify: '3CKWKSDbWygmnNjhkwvrdz' } })
    const { rerender, container } = render(<PlaceCard group={group(withAudio)} selectedId="7" onSelect={noop} onClose={noop} />)
    expect(screen.getByRole('button', { name: '在這裡聽這一集' })).toBeTruthy()
    expect(container.querySelector('iframe')).toBeNull() // 點了才載入
    rerender(<PlaceCard group={group(mk('8'))} selectedId="8" onSelect={noop} onClose={noop} />)
    expect(screen.queryByRole('button', { name: '在這裡聽這一集' })).toBeNull()
  })

  it('有「分享這個地點」鈕', () => {
    render(<PlaceCard group={group(mk('7'))} selectedId="7" onSelect={noop} onClose={noop} />)
    expect(screen.getByRole('button', { name: '分享這個地點' })).toBeTruthy()
  })

  it('沒有 nearby 或是空的，就不顯示「附近的故事」', () => {
    const { rerender } = render(<PlaceCard group={group(mk('7'))} selectedId="7" onSelect={noop} onClose={noop} />)
    expect(screen.queryByRole('region', { name: '附近的故事' })).toBeNull()
    rerender(<PlaceCard group={group(mk('7'))} selectedId="7" onSelect={noop} onClose={noop} nearby={[]} />)
    expect(screen.queryByRole('region', { name: '附近的故事' })).toBeNull()
  })

  it('沒有圖片時直接顯示預設圖', () => {
    render(<PlaceCard group={group(mk('4', { images: [] }))} selectedId="4" onSelect={noop} onClose={noop} />)
    expect(screen.getByRole('img', { name: '標題4' }).getAttribute('src')).toBe(placeholderFor('4'))
  })

  it('切換地點後圖片備援狀態重置', () => {
    const g = group(mk('5'), mk('6'))
    const { rerender } = render(<PlaceCard group={g} selectedId="5" onSelect={noop} onClose={noop} />)
    fireEvent.error(screen.getByRole('img', { name: '標題5' }))
    rerender(<PlaceCard group={g} selectedId="6" onSelect={noop} onClose={noop} />)
    expect(screen.getByRole('img', { name: '標題6' }).getAttribute('src')).toBe('https://dovoha.ccu.edu.tw/img/6.jpg')
  })

  it('links 為空時連到官網首頁', () => {
    render(<PlaceCard group={group(mk('7', { links: [] }))} selectedId="7" onSelect={noop} onClose={noop} />)
    const link = screen.getByRole('link', { name: '前往大學路官網' })
    expect(link.getAttribute('href')).toBe('https://dovoha.ccu.edu.tw/')
    expect(link.getAttribute('target')).toBe('_blank')
  })

  it('組內多筆時列出所有標題、標記目前項並可切換', () => {
    const onSelect = vi.fn()
    render(<PlaceCard group={group(mk('1'), mk('2'), mk('3'))} selectedId="2" onSelect={onSelect} onClose={noop} />)
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
    expect(screen.getByRole('button', { name: '標題2' }).getAttribute('aria-current')).toBe('true')
    expect(screen.getByRole('button', { name: '標題1' }).getAttribute('aria-current')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: '標題3' }))
    expect(onSelect).toHaveBeenCalledWith('3')
  })

  it('selectedId 不在組內時顯示第一筆', () => {
    render(<PlaceCard group={group(mk('1'), mk('2'))} selectedId="zzz" onSelect={noop} onClose={noop} />)
    expect(screen.getByRole('heading', { name: '標題1' })).toBeTruthy()
    expect(screen.getByRole('button', { name: '標題1' }).getAttribute('aria-current')).toBe('true')
  })

  it('按關閉鈕呼叫 onClose', () => {
    const onClose = vi.fn()
    render(<PlaceCard group={group(mk('1'))} selectedId="1" onSelect={noop} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: '關閉' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
