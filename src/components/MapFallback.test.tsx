import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import MapFallback from './MapFallback'
import SiteHeader from './SiteHeader'

describe('MapFallback', () => {
  it('顯示提示與官網連結', () => {
    render(<MapFallback />)
    expect(screen.getByText('你的瀏覽器不支援互動地圖')).toBeTruthy()
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
