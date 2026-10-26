import type { Place } from '../types'

// 主題、分類要完全相同；搜尋字串以空白分詞，每個詞都要出現在標題、摘要、分類或額外資訊裡（不分大小寫）
export function matchesFilters(
  place: Place,
  theme: string | null,
  category: string | null,
  query: string,
): boolean {
  if (theme !== null && place.theme !== theme) return false
  if (category !== null && place.category !== category) return false
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
  if (terms.length === 0) return true
  const extra = (place.extra ?? []).map(([, value]) => value).join('\n')
  const haystack = `${place.title}\n${place.summary}\n${place.category ?? ''}\n${extra}`.toLowerCase()
  return terms.every((t) => haystack.includes(t))
}
