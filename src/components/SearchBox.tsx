import { useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'

type Props = {
  query: string
  onQuery: (query: string) => void
  // 篩選中才有：符合的地點數
  resultCount?: number
  // 外層的額外樣式（寬度、顯示與否由使用的地方決定）
  className?: string
  // 變成 true 的那一刻把游標放進輸入框（手機上點了搜尋鈕之後用）
  focusWhen?: boolean
}

export default function SearchBox({ query, onQuery, resultCount, className = '', focusWhen = false }: Props) {
  const input = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (focusWhen) input.current?.focus()
  }, [focusWhen])

  return (
    <div
      role="search"
      className={`items-center gap-2 rounded-lg bg-white px-3 text-atlas-ink ring-1 ring-atlas-paper/20 focus-within:ring-2 focus-within:ring-atlas-focus ${className}`}
    >
      <Search aria-hidden="true" className="size-4 shrink-0 text-atlas-muted" />
      <input
        ref={input}
        type="search"
        value={query}
        onChange={(e) => onQuery(e.target.value)}
        placeholder="搜尋標題、內容或分類"
        aria-label="搜尋地點"
        className="min-h-9 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-atlas-muted [&::-webkit-search-cancel-button]:hidden"
      />
      {query !== '' && (
        <button
          type="button"
          aria-label="清除搜尋"
          onClick={() => onQuery('')}
          className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-atlas-muted outline-none hover:bg-atlas-hover focus-visible:ring-2 focus-visible:ring-atlas-focus"
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
