import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import PlaceList from './PlaceList'
import IntroHint from './IntroHint'
import FilterBar from './FilterBar'
import type { Place } from '@/types'

const mk = (id: string): Place => ({
  id,
  title: `標題${id}`,
  summary: '',
  links: [],
  images: [],
  lng: 120.43,
  lat: 23.55,
  theme: 't',
})

const listProps = {
  total: 2,
  filtered: false,
  onClearFilters: () => {},
  selectedId: null,
  onSelect: () => {},
  onClose: () => {},
}

describe('PlaceList', () => {
  it('列出所有地點與數量，點選回報 id', () => {
    const onSelect = vi.fn()
    render(<PlaceList {...listProps} places={[mk('1'), mk('2')]} onSelect={onSelect} />)
    expect(screen.getByText('地點清單（2）')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /標題2/ }))
    expect(onSelect).toHaveBeenCalledWith('2')
  })

  it('目前選取的地點標示 aria-current，關閉按鈕可用', () => {
    const onClose = vi.fn()
    render(<PlaceList {...listProps} places={[mk('1'), mk('2')]} selectedId="1" onClose={onClose} />)
    expect(screen.getByRole('button', { name: /標題1/ }).getAttribute('aria-current')).toBe('true')
    expect(screen.getByRole('button', { name: /標題2/ }).getAttribute('aria-current')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: '關閉清單' }))
    expect(onClose).toHaveBeenCalled()
  })

  it('篩選中標題顯示「符合數 / 總數」', () => {
    render(<PlaceList {...listProps} places={[mk('1')]} filtered />)
    expect(screen.getByText('地點清單（1 / 2）')).toBeTruthy()
  })

  it('長清單只渲染看得到的列：1000 筆也只有一小部分在 DOM 裡，且帶有位置資訊', () => {
    const many = Array.from({ length: 1000 }, (_, i) => mk(String(i + 1)))
    render(<PlaceList {...listProps} total={1000} places={many} />)
    const rows = screen.getAllByRole('listitem')
    expect(rows.length).toBeGreaterThan(5)
    expect(rows.length).toBeLessThan(60)
    expect(rows[0].getAttribute('aria-setsize')).toBe('1000')
    expect(rows[0].getAttribute('aria-posinset')).toBe('1')
    expect(screen.getByRole('button', { name: /^標題1t/ })).toBeTruthy()
    expect(screen.queryByRole('button', { name: /標題1000/ })).toBeNull()
  })

  it('有搜尋字時，標題裡符合的字用 <mark> 標出來；沒有搜尋字就沒有標示', () => {
    const p = { ...mk('1'), title: '民雄農會倉庫' }
    const { container, rerender } = render(<PlaceList {...listProps} places={[p]} query="農會" />)
    const marks = container.querySelectorAll('mark')
    expect(marks).toHaveLength(1)
    expect(marks[0].textContent).toBe('農會')
    rerender(<PlaceList {...listProps} places={[p]} query="" />)
    expect(container.querySelectorAll('mark')).toHaveLength(0)
  })

  it('標題沒有符合、是摘要符合時，補上符合處附近的一小段並標出來', () => {
    const p = { ...mk('1'), title: '老車站的故事', summary: '1933 年完工的民雄農會倉庫，位於東榮路平交道西側。' }
    const { container } = render(<PlaceList {...listProps} places={[p]} query="倉庫" />)
    const marks = container.querySelectorAll('mark')
    expect(marks).toHaveLength(1)
    expect(marks[0].textContent).toBe('倉庫')
    expect(container.textContent).toContain('民雄農會倉庫，位於東榮路')
  })

  it('標題已經符合時，不另外顯示內文片段', () => {
    const p = { ...mk('1'), title: '農會倉庫', summary: '農會倉庫的歷史很長很長很長很長很長。' }
    const { container } = render(<PlaceList {...listProps} places={[p]} query="倉庫" />)
    expect(container.querySelectorAll('mark')).toHaveLength(1)
    expect(container.textContent).not.toContain('歷史很長')
  })

  it('額外資訊（如美食的地址）符合時，也會顯示並標出符合處', () => {
    const p = { ...mk('1'), title: '越南小館', summary: '', extra: [['地址', '嘉義縣民雄鄉三興村神農路']] as [string, string][] }
    const { container } = render(<PlaceList {...listProps} places={[p]} query="神農路" />)
    expect(container.querySelector('mark')?.textContent).toBe('神農路')
  })

  it('沒有符合時顯示提示與清除按鈕', () => {
    const onClearFilters = vi.fn()
    render(<PlaceList {...listProps} places={[]} filtered onClearFilters={onClearFilters} />)
    expect(screen.getByText('沒有符合的地點。')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: '清除篩選與搜尋' }))
    expect(onClearFilters).toHaveBeenCalled()
  })
})

describe('FilterBar', () => {
  const themes = [
    { key: 'railway', label: '民雄鐵路高架化', count: 24, color: '#1f6f8b', icon: '<svg></svg>' },
    { key: 'podcast', label: 'Podcast', count: 161, color: '#c2410c', icon: '<svg></svg>' },
  ]
  const cats = [
    { key: '歷史故事', label: '歷史故事', count: 7, color: '#a8501f', icon: '<svg></svg>' },
    { key: '建築測繪', label: '建築測繪', count: 2, color: '#7b5ea7', icon: '<svg></svg>' },
  ]
  const base = {
    themes,
    activeThemes: [] as string[],
    onThemes: () => {},
    categories: [],
    activeCategory: null,
    onCategory: () => {},
  }

  it('主題可複選：點選加入，再點同一個移除，「全部主題」清空', () => {
    const onThemes = vi.fn()
    const { rerender } = render(<FilterBar {...base} onThemes={onThemes} />)
    expect(screen.getByRole('button', { name: '全部主題' }).getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(screen.getByRole('button', { name: /Podcast/ }))
    expect(onThemes).toHaveBeenLastCalledWith(['podcast'])
    rerender(<FilterBar {...base} activeThemes={['podcast']} onThemes={onThemes} />)
    expect(screen.getByRole('button', { name: /Podcast/ }).getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByRole('button', { name: '全部主題' }).getAttribute('aria-pressed')).toBe('false')
    fireEvent.click(screen.getByRole('button', { name: /民雄鐵路高架化/ }))
    expect(onThemes).toHaveBeenLastCalledWith(['podcast', 'railway'])
    fireEvent.click(screen.getByRole('button', { name: /Podcast/ }))
    expect(onThemes).toHaveBeenLastCalledWith([])
    fireEvent.click(screen.getByRole('button', { name: '全部主題' }))
    expect(onThemes).toHaveBeenLastCalledWith([])
  })

  it('沒有分類時只有主題列；有分類時多一列分類', () => {
    const onCategory = vi.fn()
    const { rerender } = render(<FilterBar {...base} />)
    expect(screen.queryByRole('group', { name: '依分類篩選' })).toBeNull()
    rerender(<FilterBar {...base} activeThemes={['railway']} categories={cats} onCategory={onCategory} />)
    expect(screen.getByRole('group', { name: '依分類篩選' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /建築測繪/ }))
    expect(onCategory).toHaveBeenLastCalledWith('建築測繪')
    fireEvent.click(screen.getByRole('button', { name: '全部分類' }))
    expect(onCategory).toHaveBeenLastCalledWith(null)
  })

  it('選中的晶片會捲進可見範圍；jsdom 沒有 scrollIntoView 時不會壞', () => {
    const scroll = vi.fn()
    Element.prototype.scrollIntoView = scroll
    try {
      const { rerender } = render(<FilterBar {...base} />)
      scroll.mockClear()
      rerender(<FilterBar {...base} activeThemes={['podcast']} />)
      expect(scroll).toHaveBeenCalledTimes(1)
      expect(scroll.mock.instances[0]).toBe(screen.getByRole('button', { name: /Podcast/ }))
    } finally {
      // @ts-expect-error 還原成 jsdom 預設（沒有這個方法）
      delete Element.prototype.scrollIntoView
    }
    expect(() => render(<FilterBar {...base} activeThemes={['railway']} />)).not.toThrow()
  })

  describe('橫向可滑的提示（邊緣淡出）', () => {
    const stubScroll = (scrollWidth: number, clientWidth: number) => {
      Object.defineProperty(HTMLElement.prototype, 'scrollWidth', { configurable: true, get: () => scrollWidth })
      Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, get: () => clientWidth })
    }
    afterEach(() => {
      // 還原成 setup.ts 的預設假尺寸
      Object.defineProperty(HTMLElement.prototype, 'scrollWidth', { configurable: true, get: () => 0 })
      Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, get: () => 400 })
    })

    it('內容比容器寬時，右邊淡出；沒有溢出就沒有淡出', () => {
      stubScroll(2000, 300)
      const { rerender } = render(<FilterBar {...base} />)
      const group = screen.getByRole('group', { name: '依主題篩選' })
      expect(group.getAttribute('data-fade')).toBe('right')
      stubScroll(200, 300)
      rerender(<FilterBar {...base} themes={[...themes]} />)
      fireEvent.scroll(screen.getByRole('group', { name: '依主題篩選' }))
      expect(screen.getByRole('group', { name: '依主題篩選' }).getAttribute('data-fade')).toBeNull()
    })

    it('有溢出時右邊出現「看更多」箭頭，點了往右捲約 7 成寬；沒有溢出就沒有箭頭', () => {
      stubScroll(2000, 300)
      const { rerender } = render(<FilterBar {...base} />)
      const group = screen.getByRole('group', { name: '依主題篩選' }) as HTMLElement
      const scrollBy = vi.fn()
      group.scrollBy = scrollBy
      expect(screen.queryByRole('button', { name: '依主題篩選：往前' })).toBeNull()
      fireEvent.click(screen.getByRole('button', { name: '依主題篩選：看更多' }))
      expect(scrollBy).toHaveBeenCalledWith({ left: 210, behavior: 'smooth' })
      stubScroll(200, 300)
      rerender(<FilterBar {...base} themes={[...themes]} />)
      fireEvent.scroll(screen.getByRole('group', { name: '依主題篩選' }))
      expect(screen.queryByRole('button', { name: '依主題篩選：看更多' })).toBeNull()
    })

    it('捲過之後左邊出現「往前」箭頭，點了往左捲；捲到底右邊的箭頭就消失', () => {
      stubScroll(2000, 300)
      render(<FilterBar {...base} />)
      const group = screen.getByRole('group', { name: '依主題篩選' }) as HTMLElement
      const scrollBy = vi.fn()
      group.scrollBy = scrollBy
      Object.defineProperty(group, 'scrollLeft', { configurable: true, value: 600 })
      fireEvent.scroll(group)
      fireEvent.click(screen.getByRole('button', { name: '依主題篩選：往前' }))
      expect(scrollBy).toHaveBeenCalledWith({ left: -210, behavior: 'smooth' })
      Object.defineProperty(group, 'scrollLeft', { configurable: true, value: 1700 })
      fireEvent.scroll(group)
      expect(screen.queryByRole('button', { name: '依主題篩選：看更多' })).toBeNull()
      expect(screen.getByRole('button', { name: '依主題篩選：往前' })).toBeTruthy()
    })

    it('捲動之後左邊也淡出；捲到底時右邊不再淡出', () => {
      stubScroll(2000, 300)
      render(<FilterBar {...base} />)
      const group = screen.getByRole('group', { name: '依主題篩選' }) as HTMLElement
      Object.defineProperty(group, 'scrollLeft', { configurable: true, value: 500 })
      fireEvent.scroll(group)
      expect(group.getAttribute('data-fade')).toBe('left+right')
      Object.defineProperty(group, 'scrollLeft', { configurable: true, value: 1700 })
      fireEvent.scroll(group)
      expect(group.getAttribute('data-fade')).toBe('left')
    })
  })

  it('沒有任何主題時不顯示', () => {
    const { container } = render(<FilterBar {...base} themes={[]} />)
    expect(container.firstChild).toBeNull()
  })
})

describe('IntroHint', () => {
  it('顯示地點數量，按鈕觸發對應動作', () => {
    const onOpenList = vi.fn()
    const onDismiss = vi.fn()
    render(<IntroHint count={24} onOpenList={onOpenList} onDismiss={onDismiss} />)
    expect(screen.getByText('從地圖開始探索民雄的故事')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: '瀏覽 24 個地點' }))
    fireEvent.click(screen.getByRole('button', { name: '知道了' }))
    expect(onOpenList).toHaveBeenCalled()
    expect(onDismiss).toHaveBeenCalled()
  })
})
