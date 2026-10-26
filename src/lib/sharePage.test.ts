import { describe, expect, it } from 'vitest'
import { buildSharePage, escapeHtml, isSafeId, shareDescription, shareImage, sharePath } from './sharePage'
import type { Place } from '../types'

const SITE = 'https://example.github.io/atlas/'

const mk = (over: Partial<Place> = {}): Place => ({
  id: '96220',
  title: '從鐵路到電波：1963年發射機運抵民雄',
  summary: '1963年，一批由美國贈予中央廣播電台的發射設備，沿著縱貫鐵路運抵民雄。',
  links: ['https://dovoha.ccu.edu.tw/p/405-1159-96220,c4204.php?Lang=zh-tw'],
  images: ['https://dovoha.ccu.edu.tw/var/file/1.jpg'],
  lng: 120.43,
  lat: 23.55,
  theme: 'railway',
  ...over,
})

describe('escapeHtml', () => {
  it('跳脫 & < > " \'', () => {
    expect(escapeHtml(`<a href="x">Tom & 'Jerry'</a>`)).toBe('&lt;a href=&quot;x&quot;&gt;Tom &amp; &#39;Jerry&#39;&lt;/a&gt;')
  })
})

describe('isSafeId / sharePath', () => {
  it('只有英數、底線、連字號才安全', () => {
    for (const id of ['96220', 'podcast-61177', 'food-i1-2', 'a_b']) expect(isSafeId(id), id).toBe(true)
    for (const id of ['', '../x', 'a/b', 'a b', 'a.b', '<x>', '民雄']) expect(isSafeId(id), id).toBe(false)
  })
  it('分享連結是 <網站>p/<id>/', () => {
    expect(sharePath(SITE, '96220')).toBe('https://example.github.io/atlas/p/96220/')
    expect(sharePath(SITE, 'podcast-61177')).toBe('https://example.github.io/atlas/p/podcast-61177/')
  })
})

describe('shareDescription', () => {
  it('優先用摘要；很長就截斷到 110 字並加「…」', () => {
    expect(shareDescription(mk({ summary: '短摘要' }), '主題')).toBe('短摘要')
    const long = shareDescription(mk({ summary: '字'.repeat(300) }), '主題')
    expect(long).toHaveLength(110)
    expect(long.endsWith('…')).toBe(true)
  })
  it('沒有摘要就用額外資訊（美食的地址等），再沒有就用主題名', () => {
    expect(shareDescription(mk({ summary: '', extra: [['地址', '民雄鄉福權村'], ['電話', '05-123']] }), '東南亞美食')).toBe('地址：民雄鄉福權村 電話：05-123')
    expect(shareDescription(mk({ summary: '  ' }), '民雄人物')).toBe('民雄人物')
  })
  it('換行與連續空白壓成一個空白', () => {
    expect(shareDescription(mk({ summary: '第一行\n\n  第二行' }), 't')).toBe('第一行 第二行')
  })
})

describe('shareImage', () => {
  it('用地點自己的 https 封面圖', () => {
    expect(shareImage(mk(), SITE)).toBe('https://dovoha.ccu.edu.tw/var/file/1.jpg')
  })
  it('沒有圖、不是 https、或是怪網址時，改用站台的預設分享圖', () => {
    expect(shareImage(mk({ images: [] }), SITE)).toBe(`${SITE}og.png`)
    expect(shareImage(mk({ images: ['http://insecure/x.jpg'] }), SITE)).toBe(`${SITE}og.png`)
    expect(shareImage(mk({ images: ['javascript:alert(1)'] }), SITE)).toBe(`${SITE}og.png`)
  })
})

describe('buildSharePage', () => {
  const html = buildSharePage(mk(), { siteUrl: SITE, themeName: '民雄鐵路高架化' })

  it('有這個地點的標題、說明、封面圖與網址（Open Graph 與 Twitter）', () => {
    expect(html).toContain('<title>從鐵路到電波：1963年發射機運抵民雄｜Minsyong Cultural Atlas</title>')
    expect(html).toContain('<meta property="og:title" content="從鐵路到電波：1963年發射機運抵民雄｜Minsyong Cultural Atlas" />')
    expect(html).toContain('<meta property="og:description" content="1963年，一批由美國贈予中央廣播電台的發射設備')
    expect(html).toContain('<meta property="og:image" content="https://dovoha.ccu.edu.tw/var/file/1.jpg" />')
    expect(html).toContain('<meta property="og:url" content="https://example.github.io/atlas/p/96220/" />')
    expect(html).toContain('<link rel="canonical" href="https://example.github.io/atlas/p/96220/" />')
    expect(html).toContain('<meta name="twitter:card" content="summary_large_image" />')
    expect(html).toContain('<meta name="twitter:image" content="https://dovoha.ccu.edu.tw/var/file/1.jpg" />')
  })

  it('真人點開會轉到地圖畫面的 #p=<id>（腳本與沒有 JavaScript 時的 refresh 都有）', () => {
    expect(html).toContain('location.replace("https://example.github.io/atlas/#p=96220")')
    expect(html).toContain('<noscript><meta http-equiv="refresh" content="0;url=https://example.github.io/atlas/#p=96220" /></noscript>')
    expect(html).toContain('<a href="https://example.github.io/atlas/#p=96220">')
  })

  it('標題與說明裡的特殊字元都有跳脫，不會跑出多餘的標籤或屬性', () => {
    const evil = buildSharePage(
      mk({ title: '"><script>alert(1)</script>', summary: '</title><b onclick="x">', images: ['https://a/"><img src=x>'] }),
      { siteUrl: SITE, themeName: 't' },
    )
    expect(evil).not.toContain('<script>alert(1)</script>')
    expect(evil).not.toContain('<b onclick')
    expect(evil).not.toContain('"><img')
    expect(evil).toContain('&quot;&gt;&lt;script&gt;alert(1)&lt;/script&gt;')
    // 轉址腳本是頁面裡唯一的 <script>
    expect(evil.match(/<script>/g)).toHaveLength(1)
  })

  it('沒有封面圖就用預設分享圖；id 含連字號照常運作', () => {
    const page = buildSharePage(mk({ id: 'podcast-61177', images: [] }), { siteUrl: SITE, themeName: 't' })
    expect(page).toContain(`<meta property="og:image" content="${SITE}og.png" />`)
    expect(page).toContain('#p=podcast-61177')
  })
})
