export type Place = {
  id: string
  title: string
  summary: string
  links: string[]
  images: string[]
  lng: number
  lat: number
  theme: string
}

export type SkippedItem = { index: number; reason: string }

export type ParseResult = { places: Place[]; skipped: SkippedItem[] }

export type PlaceGroup = { lng: number; lat: number; places: Place[] }
