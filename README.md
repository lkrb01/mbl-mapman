# mbl-mapman

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

A portable Nuxt 4 module that provides a clean, label-free world map with searchable city markers. Drop it into any Nuxt 4 app, search for cities by name, pin them as markers, and attach your own data and event handlers to each one.

- [✨ Release Notes](/CHANGELOG.md)

## Features

- Clean SVG world map — no city names, no country labels
- Search cities by name (powered by OpenStreetMap Nominatim, no API key needed)
- Attach arbitrary custom data to any marker (flags, descriptions, stats, etc.)
- Full event API: `marker-mouseenter`, `marker-mouseleave`, `marker-click`
- Responsive — redraws automatically when the container resizes
- Fully typed with TypeScript

---

## Installation

### From npm (once published)

```bash
npm install mbl-mapman
```

### Local / monorepo

```json
// your-app/package.json
{
  "dependencies": {
    "mbl-mapman": "file:../mbl-mapman"
  }
}
```

Then register the module in your Nuxt config:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['mbl-mapman'],
})
```

That's it. `<WorldMap>` and `useMapman()` are auto-imported everywhere in your app.

---

## Quick start

```vue
<script setup lang="ts">
const { markers, searchCities, addMarker, removeMarker } = useMapman()

const results = ref([])

async function search(query: string) {
  results.value = await searchCities(query)
}
</script>

<template>
  <!-- Search box -->
  <input placeholder="Search city…" @change="search($event.target.value)" />
  <button v-for="city in results" :key="city.id" @click="addMarker(city)">
    {{ city.name }}
  </button>

  <!-- Map fills its container -->
  <div style="height: 600px;">
    <WorldMap
      :markers="markers"
      @marker-click="m => removeMarker(m.id)"
    />
  </div>
</template>
```

---

## Attaching custom data to markers

Every marker accepts a `data` field — a free-form object you define. Whatever you put in comes back on every event, so your app can render tooltips, panels, or anything else without the module needing to know about your data shape.

```ts
addMarker({
  id: city.id,
  name: city.name,
  lat: city.lat,
  lng: city.lng,
  data: {
    flag: '🇸🇪',
    population: '975 000',
    founded: '1252',
    description: 'Capital of Sweden',
  },
})
```

Then use it in events:

```vue
<script setup lang="ts">
import type { MapMarker } from 'mbl-mapman/runtime/types'

const tooltip = ref<{ marker: MapMarker; x: number; y: number } | null>(null)
</script>

<template>
  <WorldMap
    :markers="markers"
    @marker-mouseenter="(m, e) => tooltip = { marker: m, x: e.clientX, y: e.clientY }"
    @marker-mouseleave="tooltip = null"
    @marker-click="m => openPanel(m)"
  />

  <div
    v-if="tooltip"
    class="tooltip"
    :style="{ position: 'fixed', left: tooltip.x + 12 + 'px', top: tooltip.y + 'px' }"
  >
    <strong>{{ tooltip.marker.data.flag }} {{ tooltip.marker.name }}</strong>
    <p>{{ tooltip.marker.data.description }}</p>
    <small>Pop. {{ tooltip.marker.data.population }}</small>
  </div>
</template>
```

---

## Admin / public split

A common pattern is to put the search and marker management in an admin route, and show the map read-only on public pages. Because `useMapman()` returns reactive state, wire it through a Pinia store or an API to share markers across routes.

**Admin route** — full control:

```vue
<script setup>
const { markers, searchCities, addMarker, removeMarker } = useMapman()
</script>

<template>
  <CitySearch @pick="addMarker" />
  <WorldMap :markers="markers" @marker-click="m => removeMarker(m.id)" />
</template>
```

**Public route** — display only:

```vue
<script setup>
// markers come from a store or API — no search, no mutation
const { markers } = useMapStore()
</script>

<template>
  <WorldMap
    :markers="markers"
    @marker-mouseenter="(m, e) => showTooltip(m, e)"
    @marker-mouseleave="hideTooltip"
  />
</template>
```

---

## API reference

### `useMapman()`

```ts
const {
  markers,       // Ref<MapMarker[]>  — reactive list of pinned markers
  searchCities,  // (query: string) => Promise<CitySearchResult[]>
  addMarker,     // (marker: MapMarker) => void   — no-op if id already exists
  removeMarker,  // (id: string) => void
  updateMarker,  // (id: string, updates: Partial<Omit<MapMarker, 'id'>>) => void
  clearMarkers,  // () => void
} = useMapman()
```

### `<WorldMap>` props

| Prop | Type | Default | Description |
|---|---|---|---|
| `markers` | `MapMarker[]` | `[]` | Markers to display |
| `landColor` | `string` | `#2d5a3d` | Fill colour for land |
| `seaColor` | `string` | `#1a3a5c` | Fill colour for the ocean |
| `borderColor` | `string` | `rgba(255,255,255,0.2)` | Country border stroke |
| `markerColor` | `string` | `#ff6b6b` | Default marker fill |
| `markerRadius` | `number` | `6` | Marker radius in pixels |
| `markerHoverColor` | `string` | `#ff3333` | Marker fill on hover |
| `markerHoverRadius` | `number` | `9` | Marker radius on hover |

### `<WorldMap>` events

| Event | Payload | Description |
|---|---|---|
| `marker-mouseenter` | `(marker: MapMarker, event: MouseEvent)` | Pointer entered a marker |
| `marker-mouseleave` | `(marker: MapMarker, event: MouseEvent)` | Pointer left a marker |
| `marker-click` | `(marker: MapMarker, event: MouseEvent)` | Marker was clicked |

### Types

```ts
interface MapMarker {
  id: string
  name: string
  lat: number
  lng: number
  data?: Record<string, unknown>   // your custom payload
}

interface CitySearchResult {
  id: string
  name: string        // short city name
  displayName: string // full Nominatim display string
  lat: number
  lng: number
}
```

---

## Module development

```bash
# Install dependencies
npm install

# Generate type stubs and prepare the playground
npm run dev:prepare

# Start the playground dev server
npm run dev

# Type-check
npm run test:types

# Lint
npm run lint

# Build for publishing
npm run prepack
```

---

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/mbl-mapman/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/mbl-mapman

[npm-downloads-src]: https://img.shields.io/npm/dm/mbl-mapman.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npm.chart.dev/mbl-mapman

[license-src]: https://img.shields.io/npm/l/mbl-mapman.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/mbl-mapman

[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt
[nuxt-href]: https://nuxt.com
