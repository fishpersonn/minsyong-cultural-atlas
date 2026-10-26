import { describe, expect, it } from 'vitest'
import { clusterGroups } from './clusterGroups'
import type { Place, PlaceGroup } from '../types'

const mk = (id: string, lng: number, lat: number): Place => ({
  id,
  title: id,
  summary: '',
  links: [],
  images: [],
  lng,
  lat,
  theme: 't',
})
const grp = (lng: number, lat: number, ...ids: string[]): PlaceGroup => ({
  lng,
  lat,
  places: ids.map((id) => mk(id, lng, lat)),
})
// 1 度 = 1000 px 的假投影
const project = (lng: number, lat: number) => ({ x: lng * 1000, y: -lat * 1000 })

describe('clusterGroups', () => {
  it('距離夠遠就各自獨立，座標沿用原值', () => {
    const gs = [grp(120.0, 23.0, 'a'), grp(120.1, 23.0, 'b')]
    const out = clusterGroups(gs, project, 36)
    expect(out).toHaveLength(2)
    expect(out[0]).toMatchObject({ lng: 120.0, lat: 23.0 })
    expect(out[0].groups).toEqual([gs[0]])
  })

  it('距離小於門檻的群組併成一個，地點數相加，座標取平均', () => {
    const out = clusterGroups([grp(120.0, 23.0, 'a'), grp(120.01, 23.0, 'b', 'c')], project, 36)
    expect(out).toHaveLength(1)
    expect(out[0].groups).toHaveLength(2)
    expect(out[0].places.map((p) => p.id)).toEqual(['a', 'b', 'c'])
    expect(out[0].lng).toBeCloseTo(120.005)
  })

  it('不做連鎖合併：以先出現的群組為基準', () => {
    // a-b 相距 30px、b-c 相距 30px、a-c 相距 60px：c 不會因為靠近 b 而併進來
    const out = clusterGroups([grp(120.0, 23, 'a'), grp(120.03, 23, 'b'), grp(120.06, 23, 'c')], project, 36)
    expect(out.map((c) => c.places.map((p) => p.id))).toEqual([['a', 'b'], ['c']])
  })

  it('空輸入得到空陣列；門檻為 0 時不合併', () => {
    expect(clusterGroups([], project, 36)).toEqual([])
    expect(clusterGroups([grp(1, 1, 'a'), grp(1.0001, 1, 'b')], project, 0)).toHaveLength(2)
  })
})
