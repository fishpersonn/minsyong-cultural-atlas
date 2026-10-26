export const OFFICIAL_SITE_URL = 'https://dovoha.ccu.edu.tw/'
export const LNG_RANGE = [118, 123] as const
export const LAT_RANGE = [21, 26] as const
export const OUTLIER_KM = 10
export const BASEMAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty'
// 民雄車站 (120.4310, 23.5566) 附近的固定範圍：[[西, 南], [東, 北]]
export const DEFAULT_BOUNDS: [[number, number], [number, number]] = [
  [120.421, 23.5466],
  [120.441, 23.5666],
]
