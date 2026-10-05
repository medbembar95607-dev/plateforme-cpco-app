import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { BoxSelect, Crosshair } from 'lucide-react'
import { activerZoomSelection } from './zoomSelection'

const STYLE_URL = 'https://tiles.openfreemap.org/styles/positron'
const CENTRE_INITIAL: [number, number] = [-10.5, 18.0]
const ZOOM_INITIAL = 4.6

const couleurGravite: Record<string, string> = {
  faible: '#6b7280',
  moyenne: '#ba7a0b',
  elevee: '#c2410c',
  critique: '#b9332c',
}
const libelleGravite: Record<string, string> = { faible: 'Faible', moyenne: 'Moyenne', elevee: 'Élevée', critique: 'Critique' }
// Lettre affichée dans le marqueur, selon le type d'incident.
const lettreType: Record<string, string> = { securite: 'S', logistique: 'L', renseignement: 'R', medical: 'M', communication: 'C' }

export interface IncidentCarte {
  id: string
  typeIncident: string
  gravite: string
  statut: string
  localite: string
  lon: number
  lat: number
}

interface IncidentsMapProps {
  incidents: IncidentCarte[]
  selectionId: string | null
  onSelect: (id: string | null) => void
}

export function IncidentsMap({ incidents, selectionId, onSelect }: IncidentsMapProps) {
  const conteneurRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const marqueursRef = useRef<maplibregl.Marker[]>([])
  const annulerSelectionRef = useRef<(() => void) | null>(null)
  const [carteCreee, setCarteCreee] = useState(false)
  const [selectionActive, setSelectionActive] = useState(false)
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect
  const incidentsRef = useRef(incidents)
  incidentsRef.current = incidents

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
    // Clic sur le fond de carte : désélection (le panneau revient à la liste).
    map.on('click', () => onSelectRef.current(null))
    // Uniquement des marqueurs : inutile d'attendre le chargement complet du fond de carte.
    setCarteCreee(true)
    return () => {
      annulerSelectionRef.current?.()
      observateurTaille.disconnect()
      map.remove()
      mapRef.current = null
      setCarteCreee(false)
    }
  }, [])

  function recentrer(animation = true) {
    const map = mapRef.current
    const liste = incidentsRef.current
    if (!map) return
    if (liste.length === 0) {
      map.flyTo({ center: CENTRE_INITIAL, zoom: ZOOM_INITIAL })
      return
    }
    const bornes = new maplibregl.LngLatBounds()
    liste.forEach((i) => bornes.extend([i.lon, i.lat]))
    map.fitBounds(bornes, { padding: { top: 80, bottom: 95, left: 220, right: 80 }, maxZoom: 6.5, duration: animation ? 700 : 0 })
  }

  function basculerZoomSelection() {
    const map = mapRef.current
    if (!map || !conteneurRef.current) return
    if (selectionActive) {
      annulerSelectionRef.current?.()
      return
    }
    setSelectionActive(true)
    annulerSelectionRef.current = activerZoomSelection(map, conteneurRef.current, () => {
      setSelectionActive(false)
      annulerSelectionRef.current = null
    })
  }

  useEffect(() => {
    const map = mapRef.current
    if (!map || !carteCreee) return
    marqueursRef.current.forEach((m) => m.remove())
    marqueursRef.current = incidents.map((i) => {
      const critique = i.gravite === 'critique'
      const couleur = couleurGravite[i.gravite] ?? '#6b7280'
      const selection = i.id === selectionId
      const el = document.createElement('button')
      el.dataset.incidentId = i.id
      el.dataset.gravite = i.gravite
      el.title = `${i.localite} (${libelleGravite[i.gravite] ?? i.gravite})`
      // Incident traité : estompé. Critique : plus grand, halo pulsé et signe « ! ».
      const opacite = i.statut === 'traite' ? '0.5' : '1'
      const taille = critique ? 30 : 24
      el.innerHTML = `
        <span class="relative grid place-items-center">
          ${critique && i.statut !== 'traite' ? `<span class="absolute animate-ping rounded-full" style="width:${taille}px;height:${taille}px;background:${couleur};opacity:0.45"></span>` : ''}
          <span class="relative grid place-items-center rounded-full border-2 border-white font-extrabold text-white shadow-lg ${selection ? 'ring-2 ring-[#17201b] ring-offset-2' : ''}"
                style="width:${taille}px;height:${taille}px;background:${couleur};font-size:${critique ? 15 : 11}px">${critique ? '!' : lettreType[i.typeIncident] ?? '?'}</span>
        </span>
      `
      el.addEventListener('click', (e) => {
        e.stopPropagation()
        onSelectRef.current(i.id)
      })
      // Opacité passée à MapLibre : il impose la sienne au marqueur et écraserait un style inline.
      return new maplibregl.Marker({ element: el, anchor: 'center', opacity: opacite }).setLngLat([i.lon, i.lat]).addTo(map)
    })
  }, [incidents, selectionId, carteCreee])

  // Cadrage automatique à l'arrivée des incidents et à chaque changement de filtre.
  const signatureListe = incidents.map((i) => i.id).join(',')
  useEffect(() => {
    // Arrivée avec un élément déjà sélectionné (bouton « Voir » de la démonstration) : on laisse
    // l'effet de sélection centrer dessus au lieu de cadrer sur l'ensemble.
    if (carteCreee && !selectionId) recentrer(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signatureListe, carteCreee])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !carteCreee || !selectionId) return
    const i = incidents.find((x) => x.id === selectionId)
    if (i) map.flyTo({ center: [i.lon, i.lat], zoom: Math.max(map.getZoom(), 6.5), duration: 700 })
  }, [selectionId, incidents, carteCreee])

  return (
    <div className="relative h-full min-h-[420px] overflow-hidden rounded-lg border border-[#d8ded9] bg-white shadow-sm">
      <div ref={conteneurRef} className="h-full w-full" />

      <div className="pointer-events-none absolute left-3 top-3 grid gap-1.5 rounded-lg border border-[#d8ded9] bg-white/95 p-2.5 text-xs text-[#17201b] shadow-sm">
        <div className="font-bold text-[#65706a]">{incidents.length} incident(s) localisé(s)</div>
        {Object.entries(libelleGravite)
          .reverse()
          .map(([gravite, label]) => (
            <div key={gravite} className="flex items-center gap-2">
              <span
                className="grid h-4 w-4 place-items-center rounded-full text-[9px] font-extrabold text-white"
                style={{ background: couleurGravite[gravite] }}
              >
                {gravite === 'critique' ? '!' : ''}
              </span>
              {label}
            </div>
          ))}
        <div className="mt-1 border-t border-[#d8ded9] pt-1.5 text-[#65706a]">Lettre : type (S, L, R, M, C) · estompé : traité</div>
      </div>

      <div className="absolute right-14 top-3 flex gap-2">
        <button
          onClick={() => recentrer()}
          title="Cadrer sur tous les incidents affichés"
          className="flex items-center gap-1.5 rounded-lg border border-[#d8ded9] bg-white/95 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-[#17201b] shadow-sm"
        >
          <Crosshair size={13} /> Recentrer
        </button>
        <button
          onClick={basculerZoomSelection}
          title="Cliquer-glisser sur la carte pour zoomer sur une zone"
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold uppercase tracking-wide shadow-sm ${
            selectionActive ? 'border-sky-600 bg-sky-600 text-white' : 'border-[#d8ded9] bg-white/95 text-[#17201b]'
          }`}
        >
          <BoxSelect size={13} /> Zoom sélection
        </button>
      </div>
    </div>
  )
}
