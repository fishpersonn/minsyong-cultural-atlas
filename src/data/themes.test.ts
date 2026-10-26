import { describe, expect, it } from 'vitest'
import { themes, themeName } from './themes'
import { parsePlaces } from '@/lib/parsePlaces'
import { THEME_STYLES } from '@/lib/themeStyles'
import siteMeta from './crawler/site-meta.json'

const parsed = themes.map((t) => ({ theme: t.id, ...parsePlaces(t.data, t.id, t.meta) }))

describe('themes', () => {
  it('每個主題的資料都能解析、沒有被略過的項目', () => {
    for (const r of parsed) {
      expect(r.places.length, r.theme).toBeGreaterThan(0)
      expect(r.skipped, `${r.theme} 略過：${JSON.stringify(r.skipped)}`).toEqual([])
    }
  })

  it('所有主題合起來的地點 id 不重複（網址 #p= 是全站共用的）', () => {
    const ids = parsed.flatMap((r) => r.places.map((p) => p.id))
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('每個主題都有標記樣式、主題 id 不重複', () => {
    const ids = themes.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(THEME_STYLES[id], id).toBeTruthy()
  })

  it('鐵路高架化的地點 id 維持純數字（已經分享出去的網址不能失效）', () => {
    const railway = parsed.find((r) => r.theme === 'railway')!
    expect(railway.places.every((p) => /^\d+$/.test(p.id))).toBe(true)
    expect(railway.places.find((p) => p.id === '96220')).toBeTruthy()
  })

  it('官網補抓的資料（site-meta.json）每一筆都對應到實際存在的地點', () => {
    const ids = new Set(parsed.flatMap((r) => r.places.map((p) => p.id)))
    for (const id of Object.keys(siteMeta)) expect(ids.has(id), id).toBe(true)
  })

  it('有官網連結的地點，絕大多數都有封面圖與發布日期；圖片網址都指向官網', () => {
    const linked = parsed.flatMap((r) => r.places).filter((p) => p.links.length > 0 && p.theme !== 'railway')
    const withImage = linked.filter((p) => p.images.length > 0)
    const withDate = linked.filter((p) => p.published)
    expect(withImage.length / linked.length).toBeGreaterThan(0.95)
    expect(withDate.length / linked.length).toBeGreaterThan(0.95)
    for (const p of withImage) expect(p.images[0], p.id).toMatch(/^https:\/\/dovoha\.ccu\.edu\.tw\//)
  })

  it('themeName 找不到時回傳 id 本身', () => {
    expect(themeName('railway')).toBe('民雄鐵路高架化')
    expect(themeName('nope')).toBe('nope')
  })
})
