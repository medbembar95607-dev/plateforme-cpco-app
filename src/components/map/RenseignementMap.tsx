import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import ms from 'milsymbol'
import type { RapportRensDTO } from '../../api/client'

const STYLE_URL = 'https://tiles.openfreemap.org/styles/positron'
const CENTRE_INITIAL: [number, number] = [-10.5, 18.0]
const ZOOM_INITIAL = 4.6

// SIDC APP-6/2525C par statut : menace = hostile, observation = suspect, stabilisé = inconnu.
const sidcParStatut: Record<string, string> = {
  menace: 'SHGPU---------------',
  observation: 'SSGPU---------------',
  stabilise: 'SUGPU---------------',
}

function symboleRapportSvg(statut: string, taille: number): string {
  return new ms.Symbol(sidcParStatut[statut] ?? sidcParStatut.observation, { size: taille }).asSVG()
}

interface RenseignementMapProps {
  rapports: RapportRensDTO[]
  selectionId: string | null
  onSelect: (id: string) => void
  // Mode placement : le prochain clic sur la carte renvoie ses coordonnées.
  modePlacement: boolean
  positionProvisoire: { lon: number; lat: number } | null
  onPlacer: (lon: number, lat: number) => void
  onAnnulerPlacement: () => void
}

export function RenseignementMap({
  rapports,
  selectionId,
  onSelect,
  modePlacement,
  positionProvisoire,
  onPlacer,
  onAnnulerPlacement,
}: RenseignementMapProps) {
  const conteneurRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const marqueursRef = useRef<maplibregl.Marker[]>([])
  const provisoireRef = useRef<maplibregl.Marker | null>(null)
  const [carteChargee, setCarteChargee] = useState(false)
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect
  const modePlacementRef = useRef(modePlacement)
  modePlacementRef.current = modePlacement
  const onPlacerRef = useRef(onPlacer)
  onPlacerRef.current = onPlacer

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
    // Uniquement des marqueurs : inutile d'attendre le chargement complet du fond de carte.
    setCarteChargee(true)
    map.on('click', (e) => {
      if (modePlacementRef.current) onPlacerRef.current(e.lngLat.lng, e.lngLat.lat)
    })
    return () => {
      observateurTaille.disconnect()
      map.remove()
      mapRef.current = null
      setCarteChargee(false)
    }
  }, [])

  // Marqueurs redessinés à chaque changement (création, statut, sélection).
  useEffect(() => {
    const map = mapRef.current
    if (!map || !carteChargee) return
    marqueursRef.current.forEach((m) => m.remove())
    marqueursRef.current = rapports
      .filter((r) => r.lon !== null && r.lat !== null)
      .map((r) => {
        const el = document.createElement('button')
        el.title = `${r.reference} — ${r.titre}`
        el.dataset.rapportId = r.id
        el.className = `rounded-full p-0.5 ${r.id === selectionId ? 'ring-2 ring-[#17201b] ring-offset-2' : ''}`
        el.style.opacity = r.statut === 'stabilise' ? '0.55' : '1'
        el.innerHTML = symboleRapportSvg(r.statut, r.id === selectionId ? 28 : 22)
        el.addEventListener('click', (e) => {
          e.stopPropagation()
          if (!modePlacementRef.current) onSelectRef.current(r.id)
        })
        return new maplibregl.Marker({ element: el, anchor: 'center' }).setLngLat([r.lon!, r.lat!]).addTo(map)
      })
  }, [rapports, selectionId, carteChargee])

  useEffect(() => {
    const r = rapports.find((x) => x.id === selectionId)
    if (r?.lon != null && r.lat != null) mapRef.current?.flyTo({ center: [r.lon, r.lat], zoom: Math.max(mapRef.current.getZoom(), 6) })
  }, [selectionId, rapports])

  // Point provisoire du rapport en cours de rédaction.
  useEffect(() => {
    const map = mapRef.current
    provisoireRef.current?.remove()
    provisoireRef.current = null
    if (!map || !carteChargee || !positionProvisoire) return
    provisoireRef.current = new maplibregl.Marker({ color: '#b9332c' }).setLngLat([positionProvisoire.lon, positionProvisoire.lat]).addTo(map)
  }, [positionProvisoire, carteChargee])

  useEffect(() => {
    const canvas = mapRef.current?.getCanvas()
    if (canvas) canvas.style.cursor = modePlacement ? 'crosshair' : ''
  }, [modePlacement, carteChargee])

  return (
    <div className={`relative h-full min-h-[360px] overflow-hidden rounded-lg border border-[#d8ded9] ${modePlacement ? 'placement-actif' : ''}`}>
      <div ref={conteneurRef} className="h-full w-full" />
      <div className="pointer-events-none absolute left-3 top-3 grid gap-1.5 rounded-lg border border-[#d8ded9] bg-white/95 p-2.5 text-xs text-[#17201b] shadow-sm">
        {(['menace', 'observation', 'stabilise'] as const).map((statut) => (
          <div key={statut} className="flex items-center gap-2">
            <span dangerouslySetInnerHTML={{ __html: symboleRapportSvg(statut, 14) }} />
            {statut === 'menace' ? 'Menace' : statut === 'observation' ? 'Observation' : 'Stabilisé'}
          </div>
        ))}
      </div>
      {modePlacement && (
        <div className="absolute left-1/2 top-3 flex -translate-x-1/2 items-center gap-3 rounded-lg border border-[#b9332c] bg-white px-3 py-2 text-xs font-bold text-[#b9332c] shadow">
          Cliquez sur la carte pour localiser le renseignement
          <button onClick={onAnnulerPlacement} className="rounded border border-[#d8ded9] px-2 py-0.5 text-[#17201b]">
            Annuler
          </button>
        </div>
      )}
    </div>
  )
}
