import { useMemo } from 'react'
import SiteHeader from '@/components/SiteHeader'
import MapView from '@/components/MapView'
import { themes } from '@/data/themes'
import { useSelectedId } from '@/hooks/useSelectedId'
import { parsePlaces } from '@/lib/parsePlaces'
import { groupByLocation, initialBounds } from '@/lib/groupPlaces'

export default function App() {
  const [selectedId, select] = useSelectedId()
  const { groups, bounds } = useMemo(() => {
    const places = themes.flatMap((t) => parsePlaces(t.data, t.id).places)
    return { groups: groupByLocation(places), bounds: initialBounds(places) }
  }, [])

  return (
    <div className="flex h-dvh flex-col">
      <SiteHeader />
      <main className="min-h-0 flex-1">
        <MapView groups={groups} bounds={bounds} selectedId={selectedId} onSelect={select} />
      </main>
    </div>
  )
}
