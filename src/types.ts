export type Place = {
  id: string
  title: string
  summary: string
  links: string[]
  images: string[]
  lng: number
  lat: number
  theme: string
  category?: string
  // 年代：標題或摘要明講的時間（如 1963、日治時期），沒有明講就留空
  era?: string
  // 官網文章的發布日期，格式 YYYY-MM-DD
  published?: string
  // 額外資訊（如美食的地址、電話），依序顯示成「標籤：內容」
  extra?: [string, string][]
  // Podcast 的 Spotify 單集編號（官網文章頁嵌的播放器）；卡片上點了「聽這一集」才會載入播放器
  audio?: { spotify: string }
}

// 補充資料：資料檔沒有的欄位。images 只在資料檔沒有圖片時才採用
export type PlaceMeta = { category?: string; era?: string; published?: string; images?: string[]; audio?: { spotify: string } }

export type SkippedItem = { index: number; reason: string }

export type ParseResult = { places: Place[]; skipped: SkippedItem[] }

export type PlaceGroup = { lng: number; lat: number; places: Place[] }
