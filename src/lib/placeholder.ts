export const PLACEHOLDER_COUNT = 4

// 以 id 決定預設圖，同一地點每次看到的都一樣，不同地點不會全部長得一樣
export function placeholderFor(id: string): string {
  let h = 0
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return `${import.meta.env.BASE_URL}placeholder-${(h % PLACEHOLDER_COUNT) + 1}.svg`
}
