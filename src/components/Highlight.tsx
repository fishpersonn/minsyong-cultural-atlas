import { splitByTerms } from '@/lib/highlight'

// 把文字裡符合搜尋詞的部分用 <mark> 標出來；沒有搜尋詞時就是純文字
export default function Highlight({ text, terms }: { text: string; terms: readonly string[] }) {
  if (terms.length === 0) return <>{text}</>
  return (
    <>
      {splitByTerms(text, terms).map((s, i) =>
        s.match ? (
          <mark key={i} className="rounded-sm bg-atlas-focus/45 px-0.5 text-inherit">
            {s.text}
          </mark>
        ) : (
          <span key={i}>{s.text}</span>
        ),
      )}
    </>
  )
}
