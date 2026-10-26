import type { Place } from '../types'

// 每個地點在建置時會多產生一頁輕量的靜態頁（/p/<地點 id>/）。
// 分享連結用這一頁：LINE、Facebook 等的預覽爬蟲不會執行 JavaScript、也讀不到網址 # 之後的部分，
// 所以預覽要靠這一頁的 <meta>；真人點開時，頁面會立刻轉到 `#p=<id>` 的地圖畫面。

export const escapeHtml = (text: string): string =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

// 路徑裡只放安全的字元（地點 id 本來就只有英數與連字號）
export const isSafeId = (id: string): boolean => /^[A-Za-z0-9_-]+$/.test(id)

// 分享連結：<網站網址>p/<id>/，siteUrl 結尾一定有斜線
export const sharePath = (siteUrl: string, id: string): string => `${siteUrl}p/${encodeURIComponent(id)}/`

const MAX_DESCRIPTION = 110

// 預覽的說明文字：優先用摘要，其次是額外資訊（如美食的地址），最後是主題名；超過長度就截斷加「…」
export function shareDescription(place: Place, themeName: string): string {
  const raw =
    place.summary.trim() ||
    (place.extra ?? []).map(([label, value]) => `${label}：${value}`).join('　') ||
    themeName
  const oneLine = raw.replace(/\s+/g, ' ')
  return oneLine.length > MAX_DESCRIPTION ? `${oneLine.slice(0, MAX_DESCRIPTION - 1)}…` : oneLine
}

// 預覽圖：用地點自己的封面圖（必須是 https），沒有就用站台的預設分享圖
export function shareImage(place: Place, siteUrl: string): string {
  const first = place.images[0]
  return first && /^https:\/\//.test(first) ? first : `${siteUrl}og.png`
}

export function buildSharePage(
  place: Place,
  { siteUrl, themeName, siteName = 'Minsyong Cultural Atlas' }: { siteUrl: string; themeName: string; siteName?: string },
): string {
  const title = `${place.title}｜${siteName}`
  const description = shareDescription(place, themeName)
  const image = shareImage(place, siteUrl)
  const pageUrl = sharePath(siteUrl, place.id)
  // 真人點開後要去的地圖畫面
  const target = `${siteUrl}#p=${encodeURIComponent(place.id)}`
  const t = escapeHtml(title)
  const d = escapeHtml(description)
  const img = escapeHtml(image)
  const url = escapeHtml(pageUrl)
  const to = escapeHtml(target)
  return `<!doctype html>
<html lang="zh-Hant">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${t}</title>
    <meta name="description" content="${d}" />
    <link rel="canonical" href="${url}" />
    <meta property="og:type" content="article" />
    <meta property="og:locale" content="zh_TW" />
    <meta property="og:site_name" content="${escapeHtml(siteName)}" />
    <meta property="og:title" content="${t}" />
    <meta property="og:description" content="${d}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${img}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${t}" />
    <meta name="twitter:description" content="${d}" />
    <meta name="twitter:image" content="${img}" />
    <script>location.replace(${JSON.stringify(target).replace(/</g, '\\u003c')})</script>
    <noscript><meta http-equiv="refresh" content="0;url=${to}" /></noscript>
  </head>
  <body>
    <p><a href="${to}">${t}</a></p>
  </body>
</html>
`
}
