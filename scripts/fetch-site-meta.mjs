// 到大學路官網各文章頁面補抓：封面圖（og:image）與發布日期，輸出到 src/data/crawler/site-meta.json（以地點 id 為鍵）。
//
// 用法：node scripts/fetch-site-meta.mjs
//
// - 只處理 src/data/crawler/*.json 裡有官網連結的地點（鐵路高架化已有圖片與日期）。
// - 同一篇文章對應多個地點時只抓一次。對官網溫和：一次一個請求，每次間隔 300 毫秒，失敗重試 2 次。
// - 封面圖只在「檔名裡含文章編號」時才採用：沒有的通常是全站共用的預設圖，不是這篇文章的圖。
// - 抓不到的地點不會出現在輸出裡，網站會照舊顯示預設圖。
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data', 'crawler')
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const articleId = (url) => /-(\d+)(?:,c\d+)?\.php/.exec(url)?.[1]

// 蒐集：連結 → 使用這個連結的地點 id
const byUrl = new Map()
for (const file of readdirSync(dir).filter((f) => f.endsWith('.json') && f !== 'site-meta.json')) {
  const data = JSON.parse(readFileSync(join(dir, file), 'utf8'))
  for (const f of data.features) {
    const url = f.properties['查看更多']
    if (!url) continue
    if (!byUrl.has(url)) byUrl.set(url, [])
    byUrl.get(url).push(f.properties.id)
  }
}
console.log(`共 ${byUrl.size} 篇文章要抓`)

async function fetchHtml(url) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (minsyong-cultural-atlas metadata fetch)' } })
      if (res.ok) return await res.text()
    } catch {
      // 重試
    }
    await sleep(1000 * (attempt + 1))
  }
  return null
}

const out = {}
let done = 0
let withImage = 0
let withDate = 0
for (const [url, ids] of byUrl) {
  const html = await fetchHtml(url)
  done++
  if (html) {
    const aid = articleId(url)
    const img = /<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i.exec(html)?.[1]
    const date = /發布日期\s*:\s*(?:<[^>]*>\s*)*(\d{4})[-./](\d{1,2})[-./](\d{1,2})/.exec(html)
    const entry = {}
    if (img && aid && img.includes(aid)) entry.images = [img]
    if (date) entry.published = `${date[1]}-${date[2].padStart(2, '0')}-${date[3].padStart(2, '0')}`
    if (entry.images) withImage++
    if (entry.published) withDate++
    if (Object.keys(entry).length > 0) for (const id of ids) out[id] = entry
  }
  if (done % 25 === 0) console.log(`${done}/${byUrl.size}（圖片 ${withImage}、日期 ${withDate}）`)
  await sleep(300)
}
const sorted = Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b)))
writeFileSync(join(dir, 'site-meta.json'), JSON.stringify(sorted, null, 1) + '\n')
console.log(`完成：${byUrl.size} 篇文章，圖片 ${withImage}、日期 ${withDate}，寫入 ${Object.keys(sorted).length} 個地點`)
