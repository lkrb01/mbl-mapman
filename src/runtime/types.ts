export interface MapMarker {
  id: string
  name: string
  lat: number
  lng: number
  data?: Record<string, unknown>
}

export interface CitySearchResult {
  id: string
  name: string
  displayName: string
  lat: number
  lng: number
}
