import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import MapFallback from './MapFallback'
import SiteHeader from './SiteHeader'

describe('MapFallback', () => {
  it.each([
    ['unsupported', '你的瀏覽器不支援互動地圖'],
    ['load-failed', '互動地圖暫時無法載入'],
  ] as const)('reason=%s 顯示對應提示與官網連結', (reason, text) => {
    render(<MapFallback reason={reason} />)
    expect(screen.getByText(text)).toBeTruthy()
    const link = screen.getByRole('link')
    expect(link.getAttribute('href')).toBe('https://dovoha.ccu.edu.tw/')
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toBe('noopener noreferrer')
  })
})

describe('SiteHeader', () => {
  it('顯示標題與前往大學路官網連結', () => {
    render(<SiteHeader />)
    expect(screen.getByText('民雄鐵路高架化')).toBeTruthy()
    const link = screen.getByRole('link', { name: '前往大學路官網' })
    expect(link.getAttribute('href')).toBe('https://dovoha.ccu.edu.tw/')
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toBe('noopener noreferrer')
  })
})
