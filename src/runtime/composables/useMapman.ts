import { ref } from 'vue'
import type { MapMarker, CitySearchResult } from '../types'

interface NominatimResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
  type: string
  class: string
}

export function useMapman() {
  const markers = ref<MapMarker[]>([])

  async function searchCities(query: string): Promise<CitySearchResult[]> {
    if (!query.trim()) return []
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=7&featuretype=city`
    const res = await fetch(url, {
      headers: { 'Accept-Language': 'en' },
    })
    if (!res.ok) return []
    const data: NominatimResult[] = await res.json()
    return data.map(item => ({
      id: String(item.place_id),
      name: item.display_name.split(',')[0]!.trim(),
      displayName: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
    }))
  }

  function addMarker(marker: MapMarker) {
    if (!markers.value.find(m => m.id === marker.id)) {
      markers.value = [...markers.value, marker]
    }
  }

  function removeMarker(id: string) {
    markers.value = markers.value.filter(m => m.id !== id)
  }

  function updateMarker(id: string, updates: Partial<Omit<MapMarker, 'id'>>) {
    markers.value = markers.value.map(m => m.id === id ? { ...m, ...updates } : m)
  }

  function clearMarkers() {
    markers.value = []
  }

  return {
    markers,
    searchCities,
    addMarker,
    removeMarker,
    updateMarker,
    clearMarkers,
  }
}
