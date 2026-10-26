import { mkdtempSync, readFileSync, existsSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { allPlaces, writeSharePages } from '../../vite.sharePages'
import type { Place } from '../types'

const dirs: string[] = []
const tmp = () => {
  const d = mkdtempSync(path.join(tmpdir(), 'share-pages-'))
  dirs.push(d)
  return d
}
afterEach(() => {
  for (const d of dirs.splice(0)) rmSync(d, { recursive: true, force: true })
})

const mk = (id: string): Place => ({ id, title: `標題${id}`, summary: '摘要', links: [], images: [], lng: 120, lat: 23, theme: 'railway' })

describe('writeSharePages', () => {
  it('每個地點寫一頁 p/<id>/index.html，網址用 origin + base', () => {
    const outDir = tmp()
    const n = writeSharePages({ outDir, base: '/atlas/', origin: 'https://x.example', places: [mk('1'), mk('podcast-2')] })
    expect(n).toBe(2)
    const html = readFileSync(path.join(outDir, 'p', '1', 'index.html'), 'utf8')
    expect(html).toContain('og:url" content="https://x.example/atlas/p/1/"')
    expect(html).toContain('location.replace("https://x.example/atlas/#p=1")')
    expect(existsSync(path.join(outDir, 'p', 'podcast-2', 'index.html'))).toBe(true)
  })

  it('id 不安全的地點略過，不會寫到 outDir 以外', () => {
    const outDir = tmp()
    const n = writeSharePages({ outDir, base: '/', origin: 'https://x.example', places: [mk('../evil'), mk('a/b'), mk('ok')] })
    expect(n).toBe(1)
    expect(existsSync(path.join(outDir, 'p', 'ok', 'index.html'))).toBe(true)
    expect(existsSync(path.join(outDir, 'evil'))).toBe(false)
    expect(existsSync(path.join(path.dirname(outDir), 'evil'))).toBe(false)
  })
})

describe('正式資料', () => {
  it('所有地點都能產生分享頁（id 全部安全）', () => {
    const places = allPlaces()
    expect(places.length).toBeGreaterThan(600)
    expect(places.every((p) => /^[A-Za-z0-9_-]+$/.test(p.id))).toBe(true)
    const outDir = tmp()
    const n = writeSharePages({ outDir, base: '/minsyong-cultural-atlas/', places })
    expect(n).toBe(places.length)
    const html = readFileSync(path.join(outDir, 'p', '96220', 'index.html'), 'utf8')
    expect(html).toContain('從鐵路到電波')
    expect(html).toContain('https://fishpersonn.github.io/minsyong-cultural-atlas/p/96220/')
  })
})
