import { Search, X } from 'lucide-react'

type Props = {
  query: string
  onQuery: (query: string) => void
  // 篩選中才有：符合的地點數
  resultCount?: number
}

export default function SearchBox({ query, onQuery, resultCount }: Props) {
  return (
    <div role="search" className="flex items-center gap-2 rounded-lg bg-white px-3 ring-1 ring-atlas-ink/15 focus-within:ring-2 focus-within:ring-atlas-focus">
      <Search aria-hidden="true" className="size-4 shrink-0 text-atlas-muted" />
      <input
        type="search"
        value={query}
        onChange={(e) => onQuery(e.target.value)}
        placeholder="搜尋標題、內容或分類"
        aria-label="搜尋地點"
        className="min-h-10 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-atlas-muted [&::-webkit-search-cancel-button]:hidden"
      />
      {query !== '' && (
        <button
          type="button"
          aria-label="清除搜尋"
          onClick={() => onQuery('')}
          className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-atlas-muted outline-none hover:bg-atlas-hover focus-visible:ring-2 focus-visible:ring-atlas-focus"
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      )}
      {resultCount !== undefined && (
        <span role="status" className="shrink-0 text-xs text-atlas-muted">
          {resultCount} 個符合
        </span>
      )}
    </div>
  )
}
