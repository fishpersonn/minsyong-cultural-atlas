import { CATEGORY_STYLES, FALLBACK_CATEGORY, type CategoryStyle } from './categories'
import { THEME_STYLES } from './themeStyles'
import type { Place } from '../types'

// 標記與色點的樣式：有設定樣式的分類（鐵路高架化的幾個分類）優先，其次是主題樣式，最後是灰色
export function placeStyle(place: Pick<Place, 'category' | 'theme'>): CategoryStyle {
  return (place.category && CATEGORY_STYLES[place.category]) || THEME_STYLES[place.theme] || FALLBACK_CATEGORY
}

// 篩選列分類色點的顏色：同上，分類沒有自己的樣式就沿用所屬主題的顏色
export function categoryColor(theme: string, category: string): string {
  return (CATEGORY_STYLES[category] ?? THEME_STYLES[theme] ?? FALLBACK_CATEGORY).color
}
