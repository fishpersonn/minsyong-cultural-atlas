import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import PlaceList from './PlaceList'
import IntroHint from './IntroHint'
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

describe('PlaceList', () => {
  it('列出所有地點與數量，點選回報 id', () => {
    const onSelect = vi.fn()
    render(<PlaceList places={[mk('1'), mk('2')]} selectedId={null} onSelect={onSelect} onClose={() => {}} />)
    expect(screen.getByText('地點清單（2）')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: '標題2' }))
    expect(onSelect).toHaveBeenCalledWith('2')
  })

  it('目前選取的地點標示 aria-current，關閉按鈕可用', () => {
    const onClose = vi.fn()
    render(<PlaceList places={[mk('1'), mk('2')]} selectedId="1" onSelect={() => {}} onClose={onClose} />)
    expect(screen.getByRole('button', { name: '標題1' }).getAttribute('aria-current')).toBe('true')
    expect(screen.getByRole('button', { name: '標題2' }).getAttribute('aria-current')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: '關閉清單' }))
    expect(onClose).toHaveBeenCalled()
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
