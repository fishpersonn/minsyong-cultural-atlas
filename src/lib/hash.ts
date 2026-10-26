// 網址 hash 記錄整個畫面狀態：#p=<地點 id>&t=<主題,主題>&c=<分類>&q=<搜尋字>
// 每個欄位都可省略；只有 #p=<id> 的舊連結照常可用。
export type HashState = {
  id: string | null
  themes: string[]
  category: string | null
  query: string
}

export const EMPTY_HASH_STATE: HashState = { id: null, themes: [], category: null, query: '' }

const SAFE_ID = /^[\w-]+$/

export function parseHash(hash: string): HashState {
  const params = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash)
  const id = params.get('p')
  return {
    id: id !== null && SAFE_ID.test(id) ? id : null,
    themes: (params.get('t') ?? '').split(',').filter((t) => SAFE_ID.test(t)),
    category: params.get('c') || null,
    query: params.get('q') ?? '',
  }
}

export function buildHash({ id, themes, category, query }: HashState): string {
  const parts: string[] = []
  if (id !== null) parts.push(`p=${id}`)
  if (themes.length > 0) parts.push(`t=${themes.join(',')}`)
  if (category !== null) parts.push(`c=${encodeURIComponent(category)}`)
  if (query !== '') parts.push(`q=${encodeURIComponent(query)}`)
  return parts.length === 0 ? '' : `#${parts.join('&')}`
}
