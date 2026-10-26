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
  it('搜尋框在標題列裡，輸入會回報', () => {
    const s = search()
    render(<SiteHeader search={s} />)
    const box = screen.getByRole('searchbox', { name: '搜尋地點' })
    expect(screen.getByRole('banner').contains(box)).toBe(true)
    fireEvent.change(box, { target: { value: '農會' } })
    expect(s.onQuery).toHaveBeenCalledWith('農會')
  })

  it('沒傳 search 時不顯示搜尋框，也沒有手機的搜尋鈕', () => {
    render(<SiteHeader />)
    expect(screen.queryByRole('searchbox')).toBeNull()
    expect(screen.queryByRole('button', { name: '搜尋' })).toBeNull()
  })

  it('手機：點搜尋鈕後游標進入輸入框，並出現「取消」', () => {
    render(<SiteHeader search={search()} />)
    expect(screen.queryByRole('button', { name: '取消' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: '搜尋' }))
    expect(document.activeElement).toBe(screen.getByRole('searchbox'))
    expect(screen.getByRole('button', { name: '取消' })).toBeTruthy()
  })

  it('按「取消」會清掉搜尋字並收起搜尋列', () => {
    const s = search()
    render(<SiteHeader search={s} />)
    fireEvent.click(screen.getByRole('button', { name: '搜尋' }))
    fireEvent.click(screen.getByRole('button', { name: '取消' }))
    expect(s.onQuery).toHaveBeenCalledWith('')
    expect(screen.queryByRole('button', { name: '取消' })).toBeNull()
  })

  it('已經有搜尋字時（例如網址帶入），手機直接顯示搜尋列與「取消」', () => {
    render(<SiteHeader search={search({ query: '倉庫', resultCount: 5 })} />)
    expect(screen.getByRole('button', { name: '取消' })).toBeTruthy()
    expect(screen.getByText('5 個符合')).toBeTruthy()
  })

  it('其他按鈕照常存在：地點清單、關於、前往大學路官網', () => {
    render(<SiteHeader search={search()} onToggleList={() => {}} onOpenAbout={() => {}} />)
    expect(screen.getByRole('button', { name: '地點清單' })).toBeTruthy()
    expect(screen.getByRole('button', { name: '關於' })).toBeTruthy()
    expect(screen.getByRole('link', { name: '前往大學路官網' }).getAttribute('target')).toBe('_blank')
  })
})
