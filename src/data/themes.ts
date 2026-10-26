import railwayJson from './railway.json'
import railwayMeta from './railway.meta.json'
// 以下由 scripts/import-crawler.mjs 從爬蟲 repo 轉出（README「如何更新資料」）
import cultureMap from './crawler/culture-map.json'
import podcast from './crawler/podcast.json'
import arong from './crawler/arong.json'
import damao from './crawler/damao.json'
import farmers from './crawler/farmers.json'
import pineapple from './crawler/pineapple.json'
import food from './crawler/food.json'
import people from './crawler/people.json'
import stele from './crawler/stele.json'
import templeArt from './crawler/temple-art.json'
import walk from './crawler/walk.json'
import workshops from './crawler/workshops.json'
import courses from './crawler/courses.json'
import courseNotes from './crawler/course-notes.json'
import siteMeta from './crawler/site-meta.json'
import type { PlaceMeta } from '@/types'

export type Theme = { id: string; name: string; data: unknown; meta?: Record<string, PlaceMeta> }

// 其他主題的封面圖與發布日期（scripts/fetch-site-meta.mjs 從官網抓的）。地點 id 全站不重複，所有主題共用同一份
const crawlerMeta = siteMeta as Record<string, PlaceMeta>

// 順序就是篩選列的顯示順序；標記樣式（顏色、圖示）在 lib/themeStyles.ts，以 id 對應
// 鐵路高架化的補充資料（分類、年代、發布日期）再加上官網補抓的 Spotify 單集編號
const railwayWithAudio: Record<string, PlaceMeta> = Object.fromEntries(
  Object.entries(railwayMeta as Record<string, PlaceMeta>).map(([id, meta]) => [
    id,
    crawlerMeta[id]?.audio ? { ...meta, audio: crawlerMeta[id].audio } : meta,
  ]),
)

export const themes: Theme[] = [
  { id: 'railway', name: '民雄鐵路高架化', data: railwayJson, meta: railwayWithAudio },
  { id: 'culture-map', name: '民雄文化地圖', data: cultureMap, meta: crawlerMeta },
  { id: 'podcast', name: '我的民雄朋友們 Podcast', data: podcast, meta: crawlerMeta },
  { id: 'arong', name: '民雄阿榮文化小站', data: arong, meta: crawlerMeta },
  { id: 'damao', name: '打貓街坊文化協會', data: damao, meta: crawlerMeta },
  { id: 'farmers', name: '我的農民朋友們', data: farmers, meta: crawlerMeta },
  { id: 'pineapple', name: '鳳梨急行軍田野筆記', data: pineapple, meta: crawlerMeta },
  { id: 'food', name: '東南亞美食', data: food, meta: crawlerMeta },
  { id: 'people', name: '民雄人物', data: people, meta: crawlerMeta },
  { id: 'stele', name: '民雄古碑文', data: stele, meta: crawlerMeta },
  { id: 'temple-art', name: '廟宇裝飾藝術', data: templeArt, meta: crawlerMeta },
  { id: 'walk', name: '街區走踏路線', data: walk, meta: crawlerMeta },
  { id: 'workshops', name: '工作坊紀錄', data: workshops, meta: crawlerMeta },
  { id: 'courses', name: '課程成果', data: courses, meta: crawlerMeta },
  { id: 'course-notes', name: '課程筆記', data: courseNotes, meta: crawlerMeta },
]

export const themeName = (id: string): string => themes.find((t) => t.id === id)?.name ?? id
