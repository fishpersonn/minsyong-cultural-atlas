import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
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
  query: '',
  filtered: false,
  onQuery: () => {},
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

  it('搜尋框回報輸入；篩選中標題顯示「符合數 / 總數」', () => {
    const onQuery = vi.fn()
    render(<PlaceList {...listProps} places={[mk('1')]} filtered query="鐵" onQuery={onQuery} />)
    expect(screen.getByText('地點清單（1 / 2）')).toBeTruthy()
    fireEvent.change(screen.getByRole('searchbox', { name: '搜尋地點' }), { target: { value: '鐵路' } })
    expect(onQuery).toHaveBeenCalledWith('鐵路')
  })

  it('沒有符合時顯示提示與清除按鈕', () => {
    const onClearFilters = vi.fn()
    render(<PlaceList {...listProps} places={[]} filtered query="zzz" onClearFilters={onClearFilters} />)
    expect(screen.getByText('沒有符合的地點。')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: '清除篩選與搜尋' }))
    expect(onClearFilters).toHaveBeenCalled()
  })
})

describe('FilterBar', () => {
  const themes = [
    { key: 'railway', label: '民雄鐵路高架化', count: 24, color: '#1f6f8b' },
    { key: 'podcast', label: 'Podcast', count: 161, color: '#c2410c' },
  ]
  const cats = [
    { key: '歷史故事', label: '歷史故事', count: 7, color: '#a8501f' },
    { key: '建築測繪', label: '建築測繪', count: 2, color: '#7b5ea7' },
  ]
  const base = {
    themes,
    activeTheme: null,
    onTheme: () => {},
    categories: [],
    activeCategory: null,
    onCategory: () => {},
  }

  it('主題列：列出全部主題與各主題（含數量），點選回報，再點同一個取消', () => {
    const onTheme = vi.fn()
    const { rerender } = render(<FilterBar {...base} onTheme={onTheme} />)
    expect(screen.getByRole('button', { name: '全部主題' }).getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(screen.getByRole('button', { name: /Podcast/ }))
    expect(onTheme).toHaveBeenLastCalledWith('podcast')
    rerender(<FilterBar {...base} activeTheme="podcast" onTheme={onTheme} />)
    expect(screen.getByRole('button', { name: /Podcast/ }).getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(screen.getByRole('button', { name: /Podcast/ }))
    expect(onTheme).toHaveBeenLastCalledWith(null)
    fireEvent.click(screen.getByRole('button', { name: '全部主題' }))
    expect(onTheme).toHaveBeenLastCalledWith(null)
  })

  it('沒有分類時只有主題列；有分類時多一列分類', () => {
    const onCategory = vi.fn()
    const { rerender } = render(<FilterBar {...base} />)
    expect(screen.queryByRole('group', { name: '依分類篩選' })).toBeNull()
    rerender(<FilterBar {...base} activeTheme="railway" categories={cats} onCategory={onCategory} />)
    expect(screen.getByRole('group', { name: '依分類篩選' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /建築測繪/ }))
    expect(onCategory).toHaveBeenLastCalledWith('建築測繪')
    fireEvent.click(screen.getByRole('button', { name: '全部分類' }))
    expect(onCategory).toHaveBeenLastCalledWith(null)
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
    expect(screen.getByText(/收錄 24 個地點/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: '看地點清單' }))
    fireEvent.click(screen.getByRole('button', { name: '知道了' }))
    expect(onOpenList).toHaveBeenCalled()
    expect(onDismiss).toHaveBeenCalled()
  })
})
