<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import * as d3 from 'd3'
import * as topojson from 'topojson-client'
import type { Topology } from 'topojson-specification'
import type { MapMarker } from '../types'

const props = withDefaults(defineProps<{
  markers?: MapMarker[]
  landColor?: string
  seaColor?: string
  borderColor?: string
  markerColor?: string
  markerRadius?: number
  markerHoverColor?: string
  markerHoverRadius?: number
}>(), {
  markers: () => [],
  landColor: '#2d5a3d',
  seaColor: '#1a3a5c',
  borderColor: 'rgba(255,255,255,0.2)',
  markerColor: '#ff6b6b',
  markerRadius: 6,
  markerHoverColor: '#ff3333',
  markerHoverRadius: 9,
})

const emit = defineEmits<{
  'marker-mouseenter': [marker: MapMarker, event: MouseEvent]
  'marker-mouseleave': [marker: MapMarker, event: MouseEvent]
  'marker-click': [marker: MapMarker, event: MouseEvent]
}>()

const container = ref<HTMLDivElement>()

let svgEl: d3.Selection<SVGSVGElement, unknown, null, undefined> | null = null
let projectionFn: d3.GeoProjection | null = null
let resizeObserver: ResizeObserver | null = null
let worldTopo: Topology | null = null

async function ensureWorldData() {
  if (worldTopo) return worldTopo
  const mod = await import('world-atlas/countries-110m.json')
  worldTopo = mod.default as unknown as Topology
  return worldTopo
}

function renderMarkers() {
  if (!svgEl || !projectionFn) return

  svgEl.selectAll('.mm-marker').remove()

  svgEl
    .selectAll<SVGCircleElement, MapMarker>('.mm-marker')
    .data(props.markers ?? [], d => d.id)
    .join('circle')
    .attr('class', 'mm-marker')
    .attr('cx', d => {
      const pt = projectionFn!([d.lng, d.lat])
      return pt ? pt[0] : -9999
    })
    .attr('cy', d => {
      const pt = projectionFn!([d.lng, d.lat])
      return pt ? pt[1] : -9999
    })
    .attr('r', props.markerRadius)
    .attr('fill', d => d.color ?? props.markerColor)
    .attr('stroke', '#fff')
    .attr('stroke-width', '1.5')
    .style('cursor', 'pointer')
    .on('mouseenter', function (event: MouseEvent, d: MapMarker) {
      d3.select(this)
        .attr('fill', props.markerHoverColor)
        .attr('r', props.markerHoverRadius)
      emit('marker-mouseenter', d, event)
    })
    .on('mouseleave', function (event: MouseEvent, d: MapMarker) {
      d3.select(this)
        .attr('fill', d.color ?? props.markerColor)
        .attr('r', props.markerRadius)
      emit('marker-mouseleave', d, event)
    })
    .on('click', (event: MouseEvent, d: MapMarker) => {
      emit('marker-click', d, event)
    })
}

async function drawMap(width: number, height: number) {
  if (!container.value) return

  const topo = await ensureWorldData()

  d3.select(container.value).selectAll('*').remove()

  svgEl = d3.select(container.value)
    .append('svg')
    .attr('width', '100%')
    .attr('height', '100%')
    .attr('viewBox', `0 0 ${width} ${height}`)

  svgEl.append('rect')
    .attr('width', width)
    .attr('height', height)
    .attr('fill', props.seaColor)

  projectionFn = d3.geoNaturalEarth1()
    .fitSize([width, height], { type: 'Sphere' } as unknown as d3.ExtendedFeature)

  const pathGen = d3.geoPath().projection(projectionFn)

  const countries = topojson.feature(topo, (topo as any).objects.countries)

  svgEl.append('g')
    .selectAll('path')
    .data((countries as unknown as d3.ExtendedFeatureCollection).features)
    .join('path')
    .attr('d', pathGen)
    .attr('fill', props.landColor)
    .attr('stroke', props.borderColor)
    .attr('stroke-width', '0.5')

  renderMarkers()
}

onMounted(async () => {
  if (!container.value) return
  const { width, height } = container.value.getBoundingClientRect()
  await drawMap(width || 800, height || 450)

  let resizeTimer: ReturnType<typeof setTimeout>
  resizeObserver = new ResizeObserver((entries) => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => {
      const { width, height } = entries[0]!.contentRect
      if (width > 0 && height > 0) drawMap(width, height)
    }, 120)
  })
  resizeObserver.observe(container.value)
})

onUnmounted(() => {
  resizeObserver?.disconnect()
})

watch(() => props.markers, renderMarkers, { deep: true })
</script>

<template>
  <div ref="container" style="width: 100%; height: 100%; min-height: 300px;" />
</template>
