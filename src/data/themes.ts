import railwayJson from './railway.json'

export type Theme = { id: string; name: string; data: unknown }

export const themes: Theme[] = [
  { id: 'railway', name: '民雄鐵路高架化', data: railwayJson },
]
