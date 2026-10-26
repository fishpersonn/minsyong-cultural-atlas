export function extractArticleId(url: string): string | null {
  if (typeof url !== 'string') return null
  const m = /-(\d+),c\d+/.exec(url)
  return m ? m[1] : null
}
