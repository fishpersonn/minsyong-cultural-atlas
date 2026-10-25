import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('maplibre-gl', () => {
  class Map {
    constructor() {
      throw new Error('no webgl')
    }
  }
  return { Map, Marker: class {}, NavigationControl: class {} }
})

import App from './App'

describe('App', () => {
  it('顯示標題', () => {
    render(<App />)
    expect(screen.getByText('民雄鐵路高架化')).toBeTruthy()
  })
})
