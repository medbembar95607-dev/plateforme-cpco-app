import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import ms from 'milsymbol'
import { BoxSelect, Crosshair } from 'lucide-react'
import type { StatutUnite, TypeUnite } from '../../types'
import { couleurAmie, statutUniteStyle, typeUniteSidc } from '../../uniteStyle'
import { activerZoomSelection } from './zoomSelection'

const STYLE_URL = 'https://tiles.openfreemap.org/styles/positron'
const CENTRE_INITIAL: [number, number] = [-10.5, 18.0]
const ZOOM_INITIAL = 4.6

// Couleur du liseré sous le symbole, alignée sur les badges de statut du tableau.
const couleurStatut: Record<StatutUnite, string> = {
  en_mission: '#1d4ed8',
  en_progression: '#b45309',
  disponible: '#047857',
  communication_degradee: '#b91c1c',
}

export interface UniteCarte {
  id: string
  nom: string
  typeUnite: string
  statut: string
  effectif: number
  communication: string
  lon: number
  lat: number
}

export type NiveauDeficit = 'bas' | 'critique'

interface UnitesMapProps {
  unites: UniteCarte[]
  // Unités en déficit de capacité (au moins une ressource sous le seuil) : signe sur le symbole.
  deficits: Record<string, NiveauDeficit>
  selectionId: string | null
  onSelect: (id: string | null) => void
}

const couleurDeficit: Record<NiveauDeficit, string> = { bas: '#ba7a0b', critique: '#b9332c' }

function echapper(texte: string): string {
  const el = document.createElement('span')
  el.textContent = texte
  return el.innerHTML
}

export function UnitesMap({ unites, deficits, selectionId, onSelect }: UnitesMapProps) {
  const conteneurRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const marqueursRef = useRef<maplibregl.Marker[]>([])
  const annulerSelectionRef = useRef<(() => void) | null>(null)
  const [carteCreee, setCarteCreee] = useState(false)
  const [selectionActive, setSelectionActive] = useState(false)
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect
  const unitesRef = useRef(unites)
  unitesRef.current = unites

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
    // Clic sur le fond de carte : désélection (ferme le panneau de potentiel).
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

  // Recentrer = cadrer sur l'ensemble des unités affichées (et non sur une vue figée),
  // pour que le bouton reste utile quels que soient les filtres actifs.
  function recentrer(animation = true) {
    const map = mapRef.current
    const liste = unitesRef.current
    if (!map) return
    if (liste.length === 0) {
      map.flyTo({ center: CENTRE_INITIAL, zoom: ZOOM_INITIAL })
      return
    }
    const bornes = new maplibregl.LngLatBounds()
    liste.forEach((u) => bornes.extend([u.lon, u.lat]))
    map.fitBounds(bornes, { padding: { top: 70, bottom: 95, left: 230, right: 80 }, maxZoom: 7, duration: animation ? 700 : 0 })
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
    marqueursRef.current = unites.map((u) => {
      const el = document.createElement('button')
      el.dataset.uniteId = u.id
      el.title = u.nom
      el.className = 'flex flex-col items-center'
      const sidc = typeUniteSidc[u.typeUnite as TypeUnite] ?? typeUniteSidc.pc
      const couleur = couleurStatut[u.statut as StatutUnite] ?? '#65706a'
      const deficit = deficits[u.id]
      el.innerHTML = `
        <span class="relative rounded bg-white p-0.5 shadow-md ${u.id === selectionId ? 'ring-2 ring-[#17201b] ring-offset-1' : ''}" style="border-bottom: 3px solid ${couleur}">
          ${new ms.Symbol(sidc, { size: 20, fillColor: couleurAmie }).asSVG()}
          ${
            deficit
              ? `<span data-deficit="${deficit}" title="Déficit de capacité" class="absolute grid place-items-center rounded-full border-2 border-white font-extrabold leading-none text-white shadow-md ${deficit === 'critique' ? 'animate-pulse' : ''}" style="background:${couleurDeficit[deficit]}; width:22px; height:22px; top:-13px; right:-14px; font-size:14px">!</span>`
              : ''
          }
        </span>
        <span class="mt-0.5 whitespace-nowrap rounded bg-white/90 px-1 text-[10px] font-bold text-[#17201b] shadow-sm">${echapper(u.nom)}</span>
      `
      el.addEventListener('click', (e) => {
        e.stopPropagation()
        onSelectRef.current(u.id)
      })
      return new maplibregl.Marker({ element: el, anchor: 'center' }).setLngLat([u.lon, u.lat]).addTo(map)
    })
  }, [unites, deficits, selectionId, carteCreee])

  // Cadrage automatique à l'arrivée des unités et à chaque changement de filtre.
  const signatureListe = unites.map((u) => u.id).join(',')
  useEffect(() => {
    if (carteCreee) recentrer(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signatureListe, carteCreee])

  // Unité sélectionnée (carte, tableau ou panneau) : centrer dessus. Son potentiel
  // s'affiche dans le panneau latéral de l'écran, pas dans un popup.
  useEffect(() => {
    const map = mapRef.current
    if (!map || !carteCreee || !selectionId) return
    const u = unites.find((x) => x.id === selectionId)
    if (u) map.flyTo({ center: [u.lon, u.lat], zoom: Math.max(map.getZoom(), 6.5), duration: 700 })
  }, [selectionId, unites, carteCreee])

  return (
    <div className="relative h-full min-h-[420px] overflow-hidden rounded-lg border border-[#d8ded9] bg-white shadow-sm">
      <div ref={conteneurRef} className="h-full w-full" />

      <div className="pointer-events-none absolute left-3 top-3 grid gap-1.5 rounded-lg border border-[#d8ded9] bg-white/95 p-2.5 text-xs text-[#17201b] shadow-sm">
        <div className="font-bold text-[#65706a]">{unites.length} unité(s) affichée(s)</div>
        {(Object.keys(statutUniteStyle) as StatutUnite[]).map((statut) => (
          <div key={statut} className="flex items-center gap-2">
            <span className="inline-block h-1 w-4 rounded" style={{ background: couleurStatut[statut] }} />
            {statutUniteStyle[statut].label}
          </div>
        ))}
        <div className="mt-1 flex items-center gap-2 border-t border-[#d8ded9] pt-1.5">
          <span className="grid h-4 w-4 place-items-center rounded-full bg-[#b9332c] text-[10px] font-extrabold text-white">!</span>
          Déficit de capacité ({Object.keys(deficits).filter((id) => unites.some((u) => u.id === id)).length})
        </div>
      </div>

      <div className="absolute right-14 top-3 flex gap-2">
        <button
          onClick={() => recentrer()}
          title="Cadrer sur toutes les unités affichées"
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
