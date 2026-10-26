import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import SpotifyPlayer from './SpotifyPlayer'

describe('SpotifyPlayer', () => {
  it('預設只有一顆按鈕與說明，還沒載入 Spotify（沒有 iframe）', () => {
    const { container } = render(<SpotifyPlayer id="3CKWKSDbWygmnNjhkwvrdz" title="EP90" />)
    expect(screen.getByRole('button', { name: '在這裡聽這一集' })).toBeTruthy()
    expect(screen.getByText('點了才會載入 Spotify 的播放器')).toBeTruthy()
    expect(container.querySelector('iframe')).toBeNull()
  })

  it('點了才載入：iframe 指向這一集的 Spotify 播放器，有標題', () => {
    const { container } = render(<SpotifyPlayer id="3CKWKSDbWygmnNjhkwvrdz" title="EP90" />)
    fireEvent.click(screen.getByRole('button', { name: '在這裡聽這一集' }))
    const frame = container.querySelector('iframe')!
    expect(frame.getAttribute('src')).toBe('https://open.spotify.com/embed/episode/3CKWKSDbWygmnNjhkwvrdz')
    expect(frame.getAttribute('title')).toBe('EP90（Spotify 播放器）')
    expect(frame.getAttribute('allow')).toContain('encrypted-media')
    expect(screen.queryByRole('button', { name: '在這裡聽這一集' })).toBeNull()
  })
})
