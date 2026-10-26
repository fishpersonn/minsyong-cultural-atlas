// 把爬蟲 repo（dovoha-Web-Crawle）各主題的 GeoJSON 轉成本站統一格式，輸出到 src/data/crawler/。
//
// 用法：node scripts/import-crawler.mjs <爬蟲 repo 路徑>
//
// 各主題的欄位名稱不一致（地點／name／名稱…），這裡集中對照；輸出的每個 feature 欄位統一為：
//   name、摘要、查看更多、圖片、id、分類、年代、extra（[標籤, 內容] 的陣列）
// 鐵路高架化（src/data/railway.json）格式已經是標準的，不經過這個腳本。
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = process.argv[2]
if (!root) {
  console.error('用法：node scripts/import-crawler.mjs <爬蟲 repo 路徑>')
  process.exit(1)
}
const base = join(root, '2025-民雄文化地圖整理')
const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data', 'crawler')

// extra：[顯示標籤, 原始欄位名]，值為空白就略過
const THEMES = [
  { id: 'culture-map', file: '民雄文化地圖/民雄文化地圖已合併1101.geojson', title: '地點', summary: '介紹', link: '更多連結' },
  {
    id: 'podcast',
    file: 'Podcast我的民雄朋友們/我的民雄朋友們1110.geojson',
    title: 'name',
    summary: '摘要',
    link: '查看更多',
    extra: [['集數', '【我的民雄朋友】Podcast 集數']],
  },
  { id: 'arong', file: '在地報導-民雄阿榮文化小站/民雄阿榮文化小站.geojson', title: 'name', summary: '摘要', link: '查看更多' },
  { id: 'damao', file: '在地報導_打貓街坊文化協會/在地報導_打貓街坊文化協會2.geojson', title: 'name', summary: '摘要', link: '查看更多' },
  { id: 'farmers', file: '我的農民朋友們/我的農民朋友.geojson', title: 'name', summary: '摘要', link: '查看更多' },
  { id: 'pineapple', file: '文獻-鳳梨急行軍-田野筆記/文獻-鳳梨急行軍-田野筆記書出.geojson', title: 'name', summary: '摘要', link: '查看更多' },
  {
    id: 'food',
    file: '東南亞美食/southeastasia.geojson',
    title: 'name',
    category: '國家',
    extra: [
      ['地址', '地址'],
      ['電話', 'phone'],
      ['營業時間', 'openHours'],
      ['公休', 'offDay'],
      ['狀態', 'status'],
      ['餐點', 'food'],
      ['備註', 'note'],
    ],
  },
  {
    id: 'people',
    file: '民雄人物/民雄人物.geojson',
    title: '名稱',
    category: '主分類',
    era: '時間',
    link: '詳細資訊',
    extra: [['次分類', '次分類'], ['小分類', '小分類']],
  },
  { id: 'stele', file: '民雄古碑文/民雄古碑文.geojson', title: 'name', summary: '摘要', link: '查看更多' },
  { id: 'temple-art', file: '民雄廟宇裝飾藝術/民雄廟宇裝飾藝術.geojson', title: 'name', summary: '介紹', link: '查看更多' },
  {
    id: 'walk',
    file: '民雄街區走踏路線/民雄街區走踏路線.geojson',
    title: '名稱',
    category: '主分類',
    era: '時間',
    link: '詳細資訊',
    extra: [['次分類', '次分類'], ['小分類', '小分類']],
  },
  { id: 'workshops', file: '活動-工作坊/活動-工作坊輸出.geojson', title: 'name', summary: '摘要', link: '查看更多' },
  { id: 'courses', file: '課程/課程成果/課程結果2.geojson', title: 'name', summary: '摘要', link: '查看更多' },
  { id: 'course-notes', file: '課程/課程筆記/課程筆記.geojson', title: 'name', summary: '摘要', link: '查看看多' }, // 原始欄位名就是「查看看多」
]

// 全形空白換成一般空白，前後空白去掉；空值回傳 undefined
const clean = (v) => {
  if (typeof v !== 'string') return undefined
  const s = v.replace(/　/g, ' ').trim()
  return s === '' ? undefined : s
}
const isUrl = (s) => typeof s === 'string' && /^https?:\/\//.test(s)

// 官網文章網址有兩種寫法：…-30063.php 與 …-61177,c286.php
const articleId = (url) => /-(\d+)(?:,c\d+)?\.php/.exec(url)?.[1]

mkdirSync(outDir, { recursive: true })
let total = 0
for (const t of THEMES) {
  const src = JSON.parse(readFileSync(join(base, t.file), 'utf8'))
  const used = new Set()
  const features = []
  src.features.forEach((f, index) => {
    const p = f.properties ?? {}
    const coords = f.geometry?.coordinates
    const name = clean(p[t.title])
    if (!name || !Array.isArray(coords)) return
    const linkRaw = t.link ? clean(p[t.link]) : undefined
    const link = isUrl(linkRaw) ? linkRaw : undefined
    // 欄位裡不是網址的文字（例如人物的「詳細資訊」若是說明文字）當作摘要
    const summary = clean(t.summary ? p[t.summary] : undefined) ?? (linkRaw && !link ? linkRaw : undefined)
    // id：同一主題內唯一；多個地點共用一篇文章時加上序號
    const aid = link ? articleId(link) : undefined
    let id = aid ? `${t.id}-${aid}` : `${t.id}-i${index + 1}`
    for (let n = 2; used.has(id); n++) id = `${aid ? `${t.id}-${aid}` : `${t.id}-i${index + 1}`}-${n}`
    used.add(id)
    const extra = (t.extra ?? [])
      .map(([label, key]) => [label, clean(p[key])])
      .filter(([, value]) => value !== undefined)
    const props = { id, name }
    if (summary) props['摘要'] = summary
    if (link) props['查看更多'] = link
    const category = clean(t.category ? p[t.category] : undefined)
    if (category) props['分類'] = category
    const era = clean(t.era ? p[t.era] : undefined)
    if (era) props['年代'] = era
    if (extra.length > 0) props.extra = extra
    features.push({ type: 'Feature', geometry: { type: 'Point', coordinates: coords.slice(0, 2) }, properties: props })
  })
  writeFileSync(join(outDir, `${t.id}.json`), JSON.stringify({ type: 'FeatureCollection', features }, null, 1) + '\n')
  console.log(`${t.id}: ${features.length} / ${src.features.length}`)
  total += features.length
}
console.log(`共 ${total} 筆`)
