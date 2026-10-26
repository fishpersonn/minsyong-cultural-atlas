import railwayJson from './railway.json'
import railwayMeta from './railway.meta.json'
import type { PlaceMeta } from '@/types'

export type Theme = { id: string; name: string; data: unknown; meta?: Record<string, PlaceMeta> }

export const themes: Theme[] = [
  { id: 'railway', name: '民雄鐵路高架化', data: railwayJson, meta: railwayMeta },
]
