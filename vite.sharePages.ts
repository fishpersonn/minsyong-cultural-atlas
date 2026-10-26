// 建置時為每個地點產生分享用的靜態頁（dist/p/<id>/index.html），做法見 src/lib/sharePage.ts。
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'
import { themes, themeName } from './src/data/themes'
import { buildSharePage, isSafeId } from './src/lib/sharePage'
import { parsePlaces } from './src/lib/parsePlaces'
import type { Place } from './src/types'

// 網站正式的網址（分享預覽用的 og:url、og:image 一定要是絕對網址）
const SITE_ORIGIN = 'https://fishpersonn.github.io'

export function allPlaces(): Place[] {
  return themes.flatMap((t) => parsePlaces(t.data, t.id, t.meta).places)
}

// 把分享頁寫進 outDir；回傳寫了幾頁。id 不安全（不是只有英數與連字號）的地點會略過
export function writeSharePages({
  outDir,
  base,
  places,
  origin = SITE_ORIGIN,
}: {
  outDir: string
  base: string
  places: readonly Place[]
  origin?: string
}): number {
  const siteUrl = `${origin}${base}`
  let count = 0
  for (const place of places) {
    if (!isSafeId(place.id)) continue
    const dir = path.join(outDir, 'p', place.id)
    mkdirSync(dir, { recursive: true })
    writeFileSync(path.join(dir, 'index.html'), buildSharePage(place, { siteUrl, themeName: themeName(place.theme) }))
    count++
  }
  return count
}

export function sharePages(): Plugin {
  let outDir = ''
  let base = '/'
  return {
    name: 'minsyong-share-pages',
    apply: 'build',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir)
      base = config.base
    },
    closeBundle() {
      const count = writeSharePages({ outDir, base, places: allPlaces() })
      console.log(`share pages: ${count} 頁 → ${path.relative(process.cwd(), path.join(outDir, 'p'))}/`)
    },
  }
}
