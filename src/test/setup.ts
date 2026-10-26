import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
})

// jsdom 沒有排版，所有元素的尺寸都是 0；虛擬捲動清單需要量得到容器與列的大小才會渲染列。
// 這裡給一個固定的假尺寸：容器 400×600，每個元素高 64。
Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, get: () => 600 })
Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, get: () => 400 })
HTMLElement.prototype.getBoundingClientRect = () =>
  ({ x: 0, y: 0, top: 0, left: 0, right: 400, bottom: 64, width: 400, height: 64, toJSON: () => ({}) }) as DOMRect
// 虛擬捲動量每一列的高度是讀 offsetHeight：給一個固定的列高（容器的高度用上面的 clientHeight）
Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, get: () => 64 })
Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, get: () => 400 })
