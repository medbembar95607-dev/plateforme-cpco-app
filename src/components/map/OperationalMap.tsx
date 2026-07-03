import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import ms from 'milsymbol'
import { Crosshair } from 'lucide-react'
import type { Checkpoint, ElementSelectionne, Menace, PosteLogistique, Unite } from '../../types'
import { couleurAmie, typeUniteSidc } from '../../uniteStyle'
import { axeProgression, checkpoints, menaces, postesLogistiques, unites, zoneMenaceA3, zoneOpsSable } from '../../data/mockData'

const STYLE_URL = 'https://tiles.openfreemap.org/styles/positron'
const CENTRE_INITIAL: [number, number] = [-15.978, 18.185]
const ZOOM_INITIAL = 10.6

function symboleUniteSvg(unite: Pick<Unite, 'typeUnite'>, taille: number) {
  return new ms.Symbol(typeUniteSidc[unite.typeUnite], { size: taille, fillColor: couleurAmie }).asSVG()
}

function marqueurRond(lettre: string, couleur: string) {
  const el = document.createElement('button')
  el.className = 'grid h-9 w-9 place-items-center rounded-full border-[3px] border-white font-extrabold text-white shadow-lg'
  el.style.background = couleur
  el.textContent = lettre
  return el
}

interface OperationalMapProps {
  selection: ElementSelectionne | null
  onSelect: (element: ElementSelectionne) => void
}

export function OperationalMap({ onSelect }: OperationalMapProps) {
  const conteneurRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect

  useEffect(() => {
    if (!conteneurRef.current) return

    const map = new maplibregl.Map({
      container: conteneurRef.current,
      style: STYLE_URL,
      center: CENTRE_INITIAL,
      zoom: ZOOM_INITIAL,
    })
    mapRef.current = map
    map.dragRotate.disable()
    map.touchZoomRotate.disableRotation()
    map.addControl(new maplibregl.ScaleControl({ maxWidth: 120, unit: 'metric' }), 'bottom-right')

    const observateurTaille = new ResizeObserver(() => map.resize())
    observateurTaille.observe(conteneurRef.current)

    map.on('load', () => {
      map.addSource('zone-menace-a3', { type: 'geojson', data: zoneMenaceA3 })
      map.addLayer({
        id: 'zone-menace-a3-fill',
        type: 'fill',
        source: 'zone-menace-a3',
        paint: { 'fill-color': '#b9332c', 'fill-opacity': 0.1 },
      })
      map.addLayer({
        id: 'zone-menace-a3-line',
        type: 'line',
        source: 'zone-menace-a3',
        paint: { 'line-color': '#b9332c', 'line-width': 2 },
      })

      map.addSource('zone-ops-sable', { type: 'geojson', data: zoneOpsSable })
      map.addLayer({
        id: 'zone-ops-sable-fill',
        type: 'fill',
        source: 'zone-ops-sable',
        paint: { 'fill-color': '#6554a3', 'fill-opacity': 0.1 },
      })
      map.addLayer({
        id: 'zone-ops-sable-line',
        type: 'line',
        source: 'zone-ops-sable',
        paint: { 'line-color': '#6554a3', 'line-width': 2 },
      })

      map.addSource('axe-progression', { type: 'geojson', data: axeProgression })
      map.addLayer({
        id: 'axe-progression-line',
        type: 'line',
        source: 'axe-progression',
        paint: { 'line-color': '#ba7a0b', 'line-width': 3, 'line-dasharray': [2, 2] },
      })

      unites.forEach((unite) => {
        const el = document.createElement('button')
        el.className = 'flex flex-col items-center'
        el.innerHTML = `
          <span class="drop-shadow-md">${symboleUniteSvg(unite, 26)}</span>
          <span class="mt-1 whitespace-nowrap rounded border border-[#d8ded9] bg-white/95 px-1.5 py-0.5 text-[11px] text-[#17201b] shadow-sm">${unite.nom}</span>
        `
        el.addEventListener('click', (e) => {
          e.stopPropagation()
          onSelectRef.current({ kind: 'unite', data: unite })
        })
        new maplibregl.Marker({ element: el, anchor: 'bottom' }).setLngLat([unite.lon, unite.lat]).addTo(map)
      })

      menaces.forEach((menace: Menace) => {
        const el = marqueurRond('!', '#b9332c')
        el.addEventListener('click', (e) => {
          e.stopPropagation()
          onSelectRef.current({ kind: 'menace', data: menace })
        })
        new maplibregl.Marker({ element: el, anchor: 'center' }).setLngLat([menace.lon, menace.lat]).addTo(map)
      })

      postesLogistiques.forEach((poste: PosteLogistique) => {
        const el = marqueurRond('L', '#21835d')
        el.addEventListener('click', (e) => {
          e.stopPropagation()
          onSelectRef.current({ kind: 'logistique', data: poste })
        })
        new maplibregl.Marker({ element: el, anchor: 'center' }).setLngLat([poste.lon, poste.lat]).addTo(map)
      })

      checkpoints.forEach((checkpoint: Checkpoint) => {
        const el = marqueurRond('C', '#6554a3')
        el.addEventListener('click', (e) => {
          e.stopPropagation()
          onSelectRef.current({ kind: 'checkpoint', data: checkpoint })
        })
        new maplibregl.Marker({ element: el, anchor: 'center' }).setLngLat([checkpoint.lon, checkpoint.lat]).addTo(map)
      })
    })

    return () => {
      observateurTaille.disconnect()
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function recentrer() {
    mapRef.current?.flyTo({ center: CENTRE_INITIAL, zoom: ZOOM_INITIAL })
  }

  return (
    <div className="relative min-h-0 overflow-hidden rounded-b-lg">
      <div ref={conteneurRef} className="h-full w-full" />
      <button
        onClick={recentrer}
        className="absolute right-3 top-3 flex items-center gap-1.5 rounded-lg border border-[#d8ded9] bg-white/95 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-[#17201b] shadow-sm"
      >
        <Crosshair size={13} /> Recentrer
      </button>
    </div>
  )
}
