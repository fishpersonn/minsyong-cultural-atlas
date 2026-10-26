// 搜尋字串以空白分詞（不分大小寫）；篩選與標示符合的字共用這個規則
export const searchTerms = (query: string): string[] => query.toLowerCase().split(/\s+/).filter(Boolean)

export type Segment = { text: string; match: boolean }

// 把 text 依搜尋詞切成「符合／不符合」的片段（不分大小寫，重疊或相連的符合會合併成一段）。
// 沒有搜尋詞或沒有符合時，整段文字就是一個不符合的片段。
export function splitByTerms(text: string, terms: readonly string[]): Segment[] {
  if (text === '' || terms.length === 0) return [{ text, match: false }]
  const lower = text.toLowerCase()
  // 少數字元轉小寫後長度會變（例如土耳其文的 İ），位置就對不上了：這種情況不標示，寧可不標也不要標錯
  if (lower.length !== text.length) return [{ text, match: false }]
  const ranges: [number, number][] = []
  for (const term of terms) {
    for (let at = lower.indexOf(term); at !== -1; at = lower.indexOf(term, at + term.length)) {
      ranges.push([at, at + term.length])
    }
  }
  if (ranges.length === 0) return [{ text, match: false }]
  ranges.sort((a, b) => a[0] - b[0])
  const merged: [number, number][] = [ranges[0]]
  for (const [start, end] of ranges.slice(1)) {
    const last = merged[merged.length - 1]
    if (start <= last[1]) last[1] = Math.max(last[1], end)
    else merged.push([start, end])
  }
  const out: Segment[] = []
  let cursor = 0
  for (const [start, end] of merged) {
    if (start > cursor) out.push({ text: text.slice(cursor, start), match: false })
    out.push({ text: text.slice(start, end), match: true })
    cursor = end
  }
  if (cursor < text.length) out.push({ text: text.slice(cursor), match: false })
  return out
}

// 第一個符合處前後各取約 radius 個字，被截掉的那一側加「…」；沒有符合就回傳 null
export function snippetAround(text: string, terms: readonly string[], radius = 24): string | null {
  const segments = splitByTerms(text, terms)
  const firstAt = segments.findIndex((s) => s.match)
  if (firstAt === -1) return null
  const before = segments.slice(0, firstAt).reduce((n, s) => n + s.text.length, 0)
  const matchLength = segments[firstAt].text.length
  const start = Math.max(0, before - radius)
  const end = Math.min(text.length, before + matchLength + radius)
  return `${start > 0 ? '…' : ''}${text.slice(start, end).replace(/\s+/g, ' ')}${end < text.length ? '…' : ''}`
}
