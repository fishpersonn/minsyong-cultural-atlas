export function extractArticleId(url: string): string | null {
  if (typeof url !== 'string') return null
  // 官網有兩種寫法：…-61177,c286.php 與 …-30063.php
  const m = /-(\d+)(?:,c\d+)?\.php/.exec(url)
  return m ? m[1] : null
}
