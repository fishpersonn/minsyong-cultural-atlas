import type { Place } from '../types'

// 分類要完全相同；搜尋字串以空白分詞，每個詞都要出現在標題、摘要或分類裡（不分大小寫）
export function matchesFilters(place: Place, category: string | null, query: string): boolean {
  if (category !== null && place.category !== category) return false
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
  if (terms.length === 0) return true
  const haystack = `${place.title}\n${place.summary}\n${place.category ?? ''}`.toLowerCase()
  return terms.every((t) => haystack.includes(t))
}
