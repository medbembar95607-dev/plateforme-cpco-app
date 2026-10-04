import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import ms from 'milsymbol'
import type { FeatureCollection } from 'geojson'
import type { OperationCarteDTO } from '../../api/client'
import type { TypeUnite } from '../../types'
import { couleurAmie, typeUniteSidc } from '../../uniteStyle'

const STYLE_URL = 'https://tiles.openfreemap.org/styles/positron'
const CENTRE_INITIAL: [number, number] = [-10.5, 18.0]
const ZOOM_INITIAL = 4.6

export interface OperationAffichee {
  id: string
  nom: string
  code: string
  couleur: string
  carte: OperationCarteDTO | undefined
}

interface OperationsMapProps {
  operations: OperationAffichee[]
  selectionId: string | null
  onSelect: (id: string) => void
}

function echapper(texte: string): string {
  const el = document.createElement('span')
  el.textContent = texte
  return el.innerHTML
}

// Emprise d'une opération : point de référence, zones, axes et checkpoints (pas les unités,
// qui peuvent être loin de la zone d'action, ex. un convoi en route).
function emprise(op: OperationAffichee): maplibregl.LngLatBounds | null {
  const c = op.carte
  if (!c) return null
  const bornes = new maplibregl.LngLatBounds()
  let vide = true
  const ajouter = (lon: number, lat: number) => {
    bornes.extend([lon, lat])
    vide = false
  }
  if (c.lon !== null && c.lat !== null) ajouter(c.lon, c.lat)
  c.zones.forEach((z) => z.coordinates.forEach(([lon, lat]) => ajouter(lon, lat)))
  c.axes.forEach((a) => a.coordinates.forEach(([lon, lat]) => ajouter(lon, lat)))
  c.checkpoints.forEach((cp) => ajouter(cp.lon, cp.lat))
  return vide ? null : bornes
}

export function OperationsMap({ operations, selectionId, onSelect }: OperationsMapProps) {
  const conteneurRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const marqueursRef = useRef<maplibregl.Marker[]>([])
  // Carte créée : suffit pour poser des marqueurs. Style chargé : nécessaire pour zones et axes.
  const [carteCreee, setCarteCreee] = useState(false)
  const [carteChargee, setCarteChargee] = useState(false)
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect

  useEffect(() => {
    if (!conteneurRef.current) return
    const map = new maplibregl.Map({ container: conteneurRef.current, style: STYLE_URL, center: CENTRE_INITIAL, zoom: ZOOM_INITIAL })
    mapRef.current = map
    map.dragRotate.disable()
    map.touchZoomRotate.disableRotation()
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')
    map.addControl(new maplibregl.ScaleControl({ maxWidth: 120, unit: 'metric' }), 'bottom-right')
    const observateurTaille = new ResizeObserver(() => map.resize())
    observateurTaille.observe(conteneurRef.current)
    setCarteCreee(true)
    map.on('load', () => {
      // Zones et axes de toutes les opérations dans deux sources GeoJSON, colorées par opération.
      map.addSource('ops-zones', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
      map.addSource('ops-axes', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
      map.addLayer({ id: 'ops-zones-fill', type: 'fill', source: 'ops-zones', paint: { 'fill-color': ['get', 'couleur'], 'fill-opacity': ['case', ['get', 'selection'], 0.3, 0.14] } })
      map.addLayer({ id: 'ops-zones-line', type: 'line', source: 'ops-zones', paint: { 'line-color': ['get', 'couleur'], 'line-width': ['case', ['get', 'selection'], 3, 1.5] } })
      map.addLayer({ id: 'ops-axes-line', type: 'line', source: 'ops-axes', paint: { 'line-color': ['get', 'couleur'], 'line-width': ['case', ['get', 'selection'], 4, 2.5], 'line-dasharray': [2, 1.5] } })
      map.addLayer({
        id: 'ops-axes-label',
        type: 'symbol',
        source: 'ops-axes',
        layout: { 'symbol-placement': 'line', 'text-field': ['get', 'nom'], 'text-size': 11, 'text-font': ['Noto Sans Regular'], 'text-offset': [0, -0.9] },
        paint: { 'text-color': ['get', 'couleur'], 'text-halo-color': '#ffffff', 'text-halo-width': 1.5 },
      })
      map.on('click', 'ops-zones-fill', (e) => {
        const id = e.features?.[0]?.properties?.operationId
        if (id) onSelectRef.current(id)
      })
      map.on('mouseenter', 'ops-zones-fill', () => (map.getCanvas().style.cursor = 'pointer'))
      map.on('mouseleave', 'ops-zones-fill', () => (map.getCanvas().style.cursor = ''))
      setCarteChargee(true)
    })
    return () => {
      observateurTaille.disconnect()
      map.remove()
      mapRef.current = null
      setCarteCreee(false)
      setCarteChargee(false)
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !carteChargee) return
    const zones: FeatureCollection = { type: 'FeatureCollection', features: [] }
    const axes: FeatureCollection = { type: 'FeatureCollection', features: [] }
    operations.forEach((op) => {
      const props = { operationId: op.id, couleur: op.couleur, selection: op.id === selectionId }
      op.carte?.zones.forEach((z) =>
        zones.features.push({ type: 'Feature', properties: { ...props, nom: z.nom }, geometry: { type: 'Polygon', coordinates: [z.coordinates] } }),
      )
      op.carte?.axes.forEach((a) =>
        axes.features.push({ type: 'Feature', properties: { ...props, nom: a.nom }, geometry: { type: 'LineString', coordinates: a.coordinates } }),
      )
    })
    ;(map.getSource('ops-zones') as maplibregl.GeoJSONSource).setData(zones)
    ;(map.getSource('ops-axes') as maplibregl.GeoJSONSource).setData(axes)
  }, [operations, selectionId, carteChargee])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !carteCreee) return
    marqueursRef.current.forEach((m) => m.remove())
    marqueursRef.current = []
    operations.forEach((op) => {
      const c = op.carte
      if (!c) return
      const selection = op.id === selectionId
      // Repère de l'opération : pastille à la couleur du statut + nom.
      if (c.lon !== null && c.lat !== null) {
        const el = document.createElement('button')
        el.dataset.operationId = op.id
        el.title = op.nom
        el.className = 'flex flex-col items-center'
        el.innerHTML = `
          <span class="grid h-7 w-7 place-items-center rounded-full border-2 border-white text-[11px] font-extrabold text-white shadow-lg ${selection ? 'ring-2 ring-[#17201b]' : ''}" style="background:${op.couleur}">OP</span>
          <span class="mt-0.5 whitespace-nowrap rounded bg-white/95 px-1.5 text-[11px] font-bold shadow-sm" style="color:${op.couleur}">${echapper(op.nom)}</span>
        `
        el.addEventListener('click', (e) => {
          e.stopPropagation()
          onSelectRef.current(op.id)
        })
        marqueursRef.current.push(new maplibregl.Marker({ element: el, anchor: 'top', offset: [0, -14] }).setLngLat([c.lon, c.lat]).addTo(map))
      }
      c.checkpoints.forEach((cp) => {
        // Losange : c'est un élément intérieur qui tourne, pas le marqueur lui-même
        // (MapLibre positionne le marqueur via sa propriété transform).
        const el = document.createElement('span')
        el.title = `${cp.nom} (${op.nom})`
        el.innerHTML = `<span class="grid h-5 w-5 rotate-45 place-items-center border-2 border-white shadow" style="background:${op.couleur}"><span class="-rotate-45 text-[9px] font-extrabold text-white">CP</span></span>`
        marqueursRef.current.push(new maplibregl.Marker({ element: el }).setLngLat([cp.lon, cp.lat]).addTo(map))
      })
      // Unités engagées : affichées seulement pour l'opération sélectionnée, pour ne pas surcharger.
      if (selection) {
        c.unites.forEach((u) => {
          const el = document.createElement('span')
          el.title = `${u.nom} (engagée)`
          el.className = 'flex flex-col items-center'
          const sidc = typeUniteSidc[u.typeUnite as TypeUnite] ?? typeUniteSidc.pc
          el.innerHTML = `${new ms.Symbol(sidc, { size: 18, fillColor: couleurAmie }).asSVG()}<span class="whitespace-nowrap rounded bg-white/90 px-1 text-[10px] text-[#17201b]">${echapper(u.nom)}</span>`
          el.dataset.uniteEngagee = u.id
          marqueursRef.current.push(new maplibregl.Marker({ element: el }).setLngLat([u.lon, u.lat]).addTo(map))
        })
      }
    })
  }, [operations, selectionId, carteCreee])

  // Sélection : cadrer sur l'emprise de l'opération (avec ses unités engagées).
  // Sans sélection : cadrer sur l'ensemble des opérations affichées.
  useEffect(() => {
    const map = mapRef.current
    if (!map || !carteCreee) return
    const cible = operations.find((o) => o.id === selectionId)
    const bornes = new maplibregl.LngLatBounds()
    let vide = true
    for (const op of cible ? [cible] : operations) {
      const b = emprise(op)
      if (b) {
        bornes.extend(b)
        vide = false
      }
      if (cible)
        op.carte?.unites.forEach((u) => {
          bornes.extend([u.lon, u.lat])
          vide = false
        })
    }
    if (!vide) map.fitBounds(bornes, { padding: { top: 60, bottom: 70, left: 250, right: 80 }, maxZoom: 7.5, duration: 600 })
  }, [selectionId, operations, carteCreee])

  return (
    <div className="relative h-full min-h-[420px] overflow-hidden rounded-lg border border-[#d8ded9] bg-white shadow-sm">
      <div ref={conteneurRef} className="h-full w-full" />
    </div>
  )
}
