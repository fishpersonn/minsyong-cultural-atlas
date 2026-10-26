import { LAT_RANGE, LNG_RANGE } from '../constants'
import type { ParseResult, Place, SkippedItem } from '../types'
import { extractArticleId } from './articleId'

type Rec = Record<string, unknown>

const isRec = (v: unknown): v is Rec => typeof v === 'object' && v !== null && !Array.isArray(v)
const nonEmpty = (v: unknown): v is string => typeof v === 'string' && v.trim() !== ''
const inRange = (n: number, [min, max]: readonly [number, number]) => n >= min && n <= max

function parseFeature(
  item: unknown,
  theme: string,
): { place: Place } | { reason: string } {
  if (!isRec(item)) return { reason: 'not an object' }
  const props = item.properties
  if (!isRec(props)) return { reason: 'missing properties' }

  const geometry = item.geometry
  const coords = isRec(geometry) ? geometry.coordinates : undefined
  if (!Array.isArray(coords)) return { reason: 'missing coordinates' }
  const [lng, lat] = coords
  if (typeof lng !== 'number' || typeof lat !== 'number' || !isFinite(lng) || !isFinite(lat)) {
    return { reason: 'invalid coordinates' }
  }
  if (!inRange(lng, LNG_RANGE) || !inRange(lat, LAT_RANGE)) {
    return { reason: 'coordinates out of range' }
  }

  if (!nonEmpty(props.name)) return { reason: 'missing title' }

  const links = [props['查看更多'], props['查看更多2']].filter(nonEmpty)
  if (!nonEmpty(props['查看更多'])) return { reason: 'missing link' }
  const id = extractArticleId(props['查看更多'])
  if (id === null) return { reason: 'missing link: article id not found' }

  return {
    place: {
      id,
      title: props.name,
      summary: typeof props['摘要'] === 'string' ? props['摘要'] : '',
      links,
      images: [props['圖片'], props['圖片2']].filter(nonEmpty),
      lng,
      lat,
      theme,
      // 資料目前沒有這兩個欄位；之後爬蟲補上就會自動帶進來
      ...(nonEmpty(props['分類']) && { category: props['分類'].trim() }),
      ...(nonEmpty(props['年代']) && { year: props['年代'].trim() }),
    },
  }
}

export function parsePlaces(raw: unknown, theme: string): ParseResult {
  const places: Place[] = []
  const skipped: SkippedItem[] = []
  if (!isRec(raw) || !Array.isArray(raw.features)) return { places, skipped }

  const seen = new Set<string>()
  raw.features.forEach((item: unknown, index: number) => {
    try {
      const result = parseFeature(item, theme)
      if ('reason' in result) {
        skipped.push({ index, reason: result.reason })
      } else if (seen.has(result.place.id)) {
        skipped.push({ index, reason: `duplicate id ${result.place.id}` })
      } else {
        seen.add(result.place.id)
        places.push(result.place)
      }
    } catch {
      skipped.push({ index, reason: 'unexpected error' })
    }
  })
  return { places, skipped }
}
