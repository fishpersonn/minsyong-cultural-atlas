import type { Place } from '../types'
import { searchTerms } from './highlight'

// 主題（可複選，空陣列代表不限）、分類要完全相同；搜尋字串以空白分詞，每個詞都要出現在標題、摘要、分類或額外資訊裡（不分大小寫）
export function matchesFilters(
  place: Place,
  themes: readonly string[],
  category: string | null,
  query: string,
): boolean {
  if (themes.length > 0 && !themes.includes(place.theme)) return false
  if (category !== null && place.category !== category) return false
  const terms = searchTerms(query)
  if (terms.length === 0) return true
  const extra = (place.extra ?? []).map(([, value]) => value).join('\n')
  const haystack = `${place.title}\n${place.summary}\n${place.category ?? ''}\n${extra}`.toLowerCase()
  return terms.every((t) => haystack.includes(t))
}
