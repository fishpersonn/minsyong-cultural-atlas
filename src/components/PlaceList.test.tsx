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
    fireEvent.click(screen.getByRole('button', { name: '標題2' }))
    expect(onSelect).toHaveBeenCalledWith('2')
  })

  it('目前選取的地點標示 aria-current，關閉按鈕可用', () => {
    const onClose = vi.fn()
    render(<PlaceList {...listProps} places={[mk('1'), mk('2')]} selectedId="1" onClose={onClose} />)
    expect(screen.getByRole('button', { name: '標題1' }).getAttribute('aria-current')).toBe('true')
    expect(screen.getByRole('button', { name: '標題2' }).getAttribute('aria-current')).toBeNull()
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
  const cats = [
    { name: '歷史故事', count: 7 },
    { name: '建築測繪', count: 2 },
  ]

  it('列出全部與各分類（含數量），點選回報分類，再點同一個取消', () => {
    const onChange = vi.fn()
    const { rerender } = render(<FilterBar categories={cats} active={null} onChange={onChange} />)
    expect(screen.getByRole('button', { name: '全部' }).getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(screen.getByRole('button', { name: /歷史故事/ }))
    expect(onChange).toHaveBeenLastCalledWith('歷史故事')
    rerender(<FilterBar categories={cats} active="歷史故事" onChange={onChange} />)
    expect(screen.getByRole('button', { name: /歷史故事/ }).getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(screen.getByRole('button', { name: /歷史故事/ }))
    expect(onChange).toHaveBeenLastCalledWith(null)
    fireEvent.click(screen.getByRole('button', { name: '全部' }))
    expect(onChange).toHaveBeenLastCalledWith(null)
  })

  it('沒有任何分類時不顯示', () => {
    const { container } = render(<FilterBar categories={[]} active={null} onChange={() => {}} />)
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
