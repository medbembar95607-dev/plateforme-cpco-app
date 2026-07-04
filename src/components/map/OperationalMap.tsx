import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import ms from 'milsymbol'
import { Crosshair } from 'lucide-react'
import type { Feature, LineString, Polygon } from 'geojson'
import type { SituationDTO } from '../../api/client'
import type { CheckpointSituation, ElementSelectionne, MenaceSituation, TypeUnite, UniteSituation } from '../../types'
import { couleurAmie, typeUniteSidc } from '../../uniteStyle'

const STYLE_URL = 'https://tiles.openfreemap.org/styles/positron'
// Vue élargie au territoire mauritanien (+ Léré au Mali) depuis la répartition du 2026-07-03.
const CENTRE_INITIAL: [number, number] = [-11.0, 18.1]
const ZOOM_INITIAL = 4.9

function symboleUniteSvg(typeUnite: TypeUnite, taille: number) {
  return new ms.Symbol(typeUniteSidc[typeUnite], { size: taille, fillColor: couleurAmie }).asSVG()
}

function marqueurRond(lettre: string, couleur: string) {
  const el = document.createElement('button')
  el.className = 'grid h-[26px] w-[26px] place-items-center rounded-full border-2 border-white text-xs font-extrabold text-white shadow-lg'
  el.style.background = couleur
  el.textContent = lettre
  return el
}

function versLigneMaplibre(coordinates: [number, number][]): Feature<LineString> {
  return { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates } }
}

function versPolygoneMaplibre(coordinates: [number, number][], nom: string): Feature<Polygon> {
  return { type: 'Feature', properties: { nom }, geometry: { type: 'Polygon', coordinates: [coordinates] } }
}

interface OperationalMapProps {
  situation: SituationDTO
  onSelect: (element: ElementSelectionne) => void
}

export function OperationalMap({ situation, onSelect }: OperationalMapProps) {
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
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')
    map.addControl(new maplibregl.ScaleControl({ maxWidth: 120, unit: 'metric' }), 'bottom-right')

    const observateurTaille = new ResizeObserver(() => map.resize())
    observateurTaille.observe(conteneurRef.current)

    map.on('load', () => {
      situation.zones.forEach((zone) => {
        const estMenace = zone.typeZone === 'zone_menace'
        const couleur = estMenace ? '#b9332c' : '#6554a3'
        const sourceId = `zone-${zone.id}`
        map.addSource(sourceId, { type: 'geojson', data: versPolygoneMaplibre(zone.coordinates, zone.nom) })
        map.addLayer({ id: `${sourceId}-fill`, type: 'fill', source: sourceId, paint: { 'fill-color': couleur, 'fill-opacity': 0.1 } })
        map.addLayer({ id: `${sourceId}-line`, type: 'line', source: sourceId, paint: { 'line-color': couleur, 'line-width': 2 } })
        map.addLayer({
          id: `${sourceId}-label`,
          type: 'symbol',
          source: sourceId,
          layout: { 'text-field': ['get', 'nom'], 'text-size': 12 },
          paint: { 'text-color': couleur, 'text-halo-color': '#ffffff', 'text-halo-width': 1.5 },
        })
      })

      situation.axes.forEach((axe) => {
        const sourceId = `axe-${axe.id}`
        map.addSource(sourceId, { type: 'geojson', data: versLigneMaplibre(axe.coordinates) })
        map.addLayer({
          id: `${sourceId}-line`,
          type: 'line',
          source: sourceId,
          paint: { 'line-color': '#ba7a0b', 'line-width': 3, 'line-dasharray': [2, 2] },
        })
      })

      situation.unites.forEach((unite: UniteSituation) => {
        if (unite.lon == null || unite.lat == null) return
        const el = document.createElement('button')
        el.className = 'flex flex-col items-center'
        el.innerHTML = `
          <span class="drop-shadow-md">${symboleUniteSvg(unite.typeUnite as TypeUnite, 26)}</span>
          <span class="mt-1 whitespace-nowrap rounded border border-[#d8ded9] bg-white/95 px-1.5 py-0.5 text-[11px] text-[#17201b] shadow-sm">${unite.nom}</span>
        `
        el.addEventListener('click', (e) => {
          e.stopPropagation()
          onSelectRef.current({ kind: 'unite', data: unite })
        })
        new maplibregl.Marker({ element: el, anchor: 'bottom' }).setLngLat([unite.lon, unite.lat]).addTo(map)
      })

      situation.menaces.forEach((menace: MenaceSituation) => {
        const el = marqueurRond('!', '#b9332c')
        el.addEventListener('click', (e) => {
          e.stopPropagation()
          onSelectRef.current({ kind: 'menace', data: menace })
        })
        new maplibregl.Marker({ element: el, anchor: 'center' }).setLngLat([menace.lon, menace.lat]).addTo(map)
      })

      situation.checkpoints.forEach((checkpoint: CheckpointSituation) => {
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
  }, [situation])

  function recentrer() {
    mapRef.current?.flyTo({ center: CENTRE_INITIAL, zoom: ZOOM_INITIAL })
  }

  return (
    <div className="relative min-h-0 overflow-hidden rounded-b-lg">
      <div ref={conteneurRef} className="h-full w-full" />
      <button
        onClick={recentrer}
        className="absolute right-3 top-[76px] flex items-center gap-1.5 rounded-lg border border-[#d8ded9] bg-white/95 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-[#17201b] shadow-sm"
      >
        <Crosshair size={13} /> Recentrer
      </button>
    </div>
  )
}
