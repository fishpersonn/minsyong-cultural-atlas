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
}

export type PlaceMeta = { category?: string; era?: string; published?: string }

export type SkippedItem = { index: number; reason: string }

export type ParseResult = { places: Place[]; skipped: SkippedItem[] }

export type PlaceGroup = { lng: number; lat: number; places: Place[] }
