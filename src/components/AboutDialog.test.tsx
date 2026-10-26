import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import AboutDialog from './AboutDialog'

const show = (over: Partial<React.ComponentProps<typeof AboutDialog>> = {}) =>
  render(<AboutDialog open onOpenChange={() => {}} placeCount={638} themeCount={15} {...over} />)

describe('AboutDialog', () => {
  it('開著時是一個有標題的對話框，標題是團隊的開場問句', () => {
    show()
    const dialog = screen.getByRole('dialog', { name: /歲月與情感/ })
    expect(dialog).toBeTruthy()
    expect(dialog.textContent).toContain('『重構大學路』團隊')
    expect(dialog.textContent).toContain('我們常常在想')
  })

  it('地點數與主題數由資料帶入', () => {
    show({ placeCount: 700, themeCount: 18 })
    const text = screen.getByRole('dialog').textContent!
    expect(text).toContain('700')
    expect(text).toContain('18')
    expect(text).not.toContain('638')
  })

  it('關閉時不顯示', () => {
    show({ open: false })
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('關閉鈕與 Esc 都會通知關閉', () => {
    const onOpenChange = vi.fn()
    show({ onOpenChange })
    fireEvent.click(screen.getByRole('button', { name: '關閉' }))
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    expect(onOpenChange).toHaveBeenCalledTimes(2)
  })

  it('版權與來源的說明還在，連結都以新分頁開啟', () => {
    show()
    const dialog = screen.getByRole('dialog')
    expect(dialog.textContent).toContain('版權屬大學路計畫所有')
    expect(dialog.textContent).toContain('不是大學路官網')
    const links = Array.from(dialog.querySelectorAll('a'))
    expect(links.length).toBeGreaterThanOrEqual(3)
    for (const a of links) {
      expect(a.getAttribute('target')).toBe('_blank')
      expect(a.getAttribute('rel')).toBe('noopener noreferrer')
    }
    expect(links.map((a) => a.getAttribute('href'))).toContain('https://dovoha.ccu.edu.tw/')
  })

  it('提到的兩顆地圖小圓鈕名稱與實際按鈕一致', () => {
    show()
    const text = screen.getByRole('dialog').textContent!
    expect(text).toContain('「隨便逛逛」')
    expect(text).toContain('「身邊有什麼」')
  })
})
