<script setup lang="ts">
import type { MapMarker } from '../src/runtime/types'

const { markers, searchCities, addMarker, removeMarker } = useMapman()

const query = ref('')
const results = ref<Awaited<ReturnType<typeof searchCities>>>([])
const hovered = ref<MapMarker | null>(null)
const searching = ref(false)

async function search() {
  if (!query.value.trim()) return
  searching.value = true
  results.value = await searchCities(query.value)
  searching.value = false
}

function pick(city: (typeof results.value)[0]) {
  addMarker({ id: city.id, name: city.name, lat: city.lat, lng: city.lng })
  results.value = []
  query.value = ''
}

function onMarkerEnter(m: MapMarker) { hovered.value = m }
function onMarkerLeave() { hovered.value = null }
function onMarkerClick(m: MapMarker) { removeMarker(m.id) }
</script>

<template>
  <div style="display:flex; flex-direction:column; height:100vh; background:#0f1923; color:#e0e8f0; font-family:system-ui,sans-serif;">
    <!-- Toolbar -->
    <div style="padding:1rem 1.5rem; background:#13212e; border-bottom:1px solid #1e3448; display:flex; gap:1rem; align-items:center; flex-wrap:wrap;">
      <h1 style="margin:0; font-size:1.1rem; font-weight:600; color:#7eb8d4; letter-spacing:0.05em;">mbl-mapman</h1>

      <div style="display:flex; gap:0.5rem; flex:1; max-width:420px;">
        <input
          v-model="query"
          placeholder="Search city..."
          style="flex:1; padding:0.45rem 0.75rem; background:#1e3448; color:#e0e8f0; border:1px solid #2a4a66; border-radius:6px; outline:none; font-size:0.9rem;"
          @keyup.enter="search"
        />
        <button
          style="padding:0.45rem 1rem; background:#2a6496; color:#fff; border:none; border-radius:6px; cursor:pointer; font-size:0.9rem;"
          :disabled="searching"
          @click="search"
        >
          {{ searching ? '...' : 'Search' }}
        </button>
      </div>

      <!-- Search results -->
      <div v-if="results.length" style="display:flex; gap:0.4rem; flex-wrap:wrap;">
        <button
          v-for="city in results"
          :key="city.id"
          style="padding:0.3rem 0.7rem; background:#1d4a2e; color:#a8d8b0; border:1px solid #2d6a3e; border-radius:4px; cursor:pointer; font-size:0.85rem;"
          @click="pick(city)"
        >
          {{ city.name }}
        </button>
      </div>

      <!-- Markers list -->
      <div style="display:flex; gap:0.4rem; flex-wrap:wrap; margin-left:auto;">
        <span
          v-for="m in markers"
          :key="m.id"
          style="padding:0.3rem 0.7rem; background:#2a1f1f; color:#ff9999; border:1px solid #5a3030; border-radius:4px; font-size:0.85rem; display:flex; align-items:center; gap:0.4rem;"
        >
          {{ m.name }}
          <button
            style="background:none; border:none; color:#ff6b6b; cursor:pointer; padding:0; font-size:0.9rem; line-height:1;"
            @click="removeMarker(m.id)"
          >×</button>
        </span>
      </div>
    </div>

    <!-- Hover tooltip -->
    <div
      v-if="hovered"
      style="position:absolute; top:4.5rem; left:50%; transform:translateX(-50%); background:#13212e; border:1px solid #2a4a66; border-radius:6px; padding:0.4rem 0.9rem; font-size:0.85rem; color:#a8d8f0; z-index:10;"
    >
      {{ hovered.name }} — {{ hovered.lat.toFixed(2) }}°, {{ hovered.lng.toFixed(2) }}°
    </div>

    <!-- Map -->
    <div style="flex:1; overflow:hidden;">
      <WorldMap
        :markers="markers"
        @marker-mouseenter="onMarkerEnter"
        @marker-mouseleave="onMarkerLeave"
        @marker-click="onMarkerClick"
      />
    </div>
  </div>
</template>
