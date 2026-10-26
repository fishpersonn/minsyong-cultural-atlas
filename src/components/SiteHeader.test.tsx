import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import SiteHeader from './SiteHeader'

const search = (over: Partial<{ query: string; resultCount: number }> = {}) => ({
  query: '',
  onQuery: vi.fn(),
  ...over,
})

describe('SiteHeader 站名', () => {
  it('站名在 h1 裡；有 onHome 時整塊可點，會回報，並有給螢幕閱讀器的說明', () => {
    const onHome = vi.fn()
    render(<SiteHeader onHome={onHome} />)
    const title = screen.getByRole('heading', { level: 1 })
    expect(title.textContent).toContain('Minsyong Cultural Atlas')
    expect(title.textContent).toContain('民雄文化地圖')
    const button = screen.getByRole('button', { name: /回到首頁/ })
    expect(button.title).toBe('回到首頁')
    fireEvent.click(button)
    expect(onHome).toHaveBeenCalledTimes(1)
  })

  it('沒傳 onHome 時只是標題：按鈕停用、沒有「回到首頁」提示', () => {
    render(<SiteHeader />)
    const button = screen.getByRole('button', { name: /Minsyong Cultural Atlas/ }) as HTMLButtonElement
    expect(button.disabled).toBe(true)
    expect(button.title).toBe('')
    expect(screen.queryByText('（回到首頁）')).toBeNull()
  })
})

describe('SiteHeader 搜尋', () => {
  const openSearch = () => fireEvent.click(screen.getByRole('button', { name: '搜尋' }))

  it('預設只有一顆搜尋鈕，輸入框是收起來的（不佔位置）', () => {
    render(<SiteHeader search={search()} />)
    expect(screen.getByRole('button', { name: '搜尋' })).toBeTruthy()
    expect(screen.queryByRole('searchbox')).toBeNull()
    expect(screen.queryByRole('button', { name: '取消' })).toBeNull()
  })

  it('點搜尋鈕後展開輸入框、游標進去，鈕本身讓位；輸入會回報', () => {
    const s = search()
    render(<SiteHeader search={s} />)
    openSearch()
    const box = screen.getByRole('searchbox', { name: '搜尋地點' })
    expect(screen.getByRole('banner').contains(box)).toBe(true)
    expect(document.activeElement).toBe(box)
    expect(screen.queryByRole('button', { name: '搜尋' })).toBeNull()
    fireEvent.change(box, { target: { value: '農會' } })
    expect(s.onQuery).toHaveBeenCalledWith('農會')
  })

  it('沒傳 search 時不顯示搜尋鈕也沒有輸入框', () => {
    render(<SiteHeader />)
    expect(screen.queryByRole('searchbox')).toBeNull()
    expect(screen.queryByRole('button', { name: '搜尋' })).toBeNull()
  })

  it('按「取消」會清掉搜尋字並收起輸入框，搜尋鈕回來', () => {
    const s = search()
    render(<SiteHeader search={s} />)
    openSearch()
    fireEvent.click(screen.getByRole('button', { name: '取消' }))
    expect(s.onQuery).toHaveBeenCalledWith('')
    expect(screen.queryByRole('searchbox')).toBeNull()
    expect(screen.getByRole('button', { name: '搜尋' })).toBeTruthy()
  })

  it('沒有搜尋字時，焦點離開輸入框會自動收起；焦點移到「取消」不算離開', () => {
    render(<SiteHeader search={search()} />)
    openSearch()
    const box = screen.getByRole('searchbox')
    fireEvent.blur(box, { relatedTarget: screen.getByRole('button', { name: '取消' }) })
    expect(screen.getByRole('searchbox')).toBeTruthy()
    fireEvent.blur(box, { relatedTarget: document.body })
    expect(screen.queryByRole('searchbox')).toBeNull()
  })

  it('有搜尋字時不會因為失去焦點而收起', () => {
    render(<SiteHeader search={search({ query: '倉庫', resultCount: 5 })} />)
    fireEvent.blur(screen.getByRole('searchbox'), { relatedTarget: document.body })
    expect(screen.getByRole('searchbox')).toBeTruthy()
  })

  it('已經有搜尋字時（例如網址帶入）直接展開，顯示符合數與「取消」，沒有搜尋鈕', () => {
    render(<SiteHeader search={search({ query: '倉庫', resultCount: 5 })} />)
    expect(screen.getByRole('searchbox')).toBeTruthy()
    expect(screen.getByRole('button', { name: '取消' })).toBeTruthy()
    expect(screen.getByText('5 個符合')).toBeTruthy()
    expect(screen.queryByRole('button', { name: '搜尋' })).toBeNull()
  })

  it('點站名回首頁時，展開的搜尋框也會收起', () => {
    const onHome = vi.fn()
    render(<SiteHeader search={search()} onHome={onHome} />)
    openSearch()
    fireEvent.click(screen.getByRole('button', { name: /回到首頁/ }))
    expect(onHome).toHaveBeenCalled()
    expect(screen.queryByRole('searchbox')).toBeNull()
  })

  it('其他按鈕照常存在：地點清單、關於、「重構大學路」（連到官網）', () => {
    render(<SiteHeader search={search()} onToggleList={() => {}} onOpenAbout={() => {}} />)
    expect(screen.getByRole('button', { name: '地點清單' })).toBeTruthy()
    expect(screen.getByRole('button', { name: '關於' })).toBeTruthy()
    const link = screen.getByRole('link', { name: '重構大學路' })
    expect(link.getAttribute('href')).toBe('https://dovoha.ccu.edu.tw/')
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toBe('noopener noreferrer')
  })
})
