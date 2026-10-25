import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('顯示標題', () => {
    render(<App />)
    expect(screen.getByText('民雄鐵路高架化')).toBeTruthy()
  })
})
