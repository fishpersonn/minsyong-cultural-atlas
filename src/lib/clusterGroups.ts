import type { Place, PlaceGroup } from '../types'

export type Cluster = { groups: PlaceGroup[]; places: Place[]; lng: number; lat: number }

type Project = (lng: number, lat: number) => { x: number; y: number }

// 把螢幕上距離小於 thresholdPx 的標記併成一個。
// 以先出現的群組為基準點（不做連鎖合併），所以縮放時結果穩定、不會一直漂移。
export function clusterGroups(groups: PlaceGroup[], project: Project, thresholdPx: number): Cluster[] {
  const anchors: { x: number; y: number; groups: PlaceGroup[] }[] = []
  for (const g of groups) {
    const p = project(g.lng, g.lat)
    const hit = anchors.find((a) => Math.hypot(a.x - p.x, a.y - p.y) < thresholdPx)
    if (hit) hit.groups.push(g)
    else anchors.push({ ...p, groups: [g] })
  }
  return anchors.map(({ groups: gs }) => ({
    groups: gs,
    places: gs.flatMap((g) => g.places),
    // 單一群組沿用原座標；多個群組取平均位置
    lng: gs.reduce((s, g) => s + g.lng, 0) / gs.length,
    lat: gs.reduce((s, g) => s + g.lat, 0) / gs.length,
  }))
}
