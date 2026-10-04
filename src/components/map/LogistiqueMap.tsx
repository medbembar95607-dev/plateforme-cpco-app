import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import ms from 'milsymbol'
import type { DemandeRavitaillementDTO, SituationDTO } from '../../api/client'
import type { TypeUnite } from '../../types'
import { couleurAmie, typeUniteSidc } from '../../uniteStyle'

const STYLE_URL = 'https://tiles.openfreemap.org/styles/positron'
const CENTRE_INITIAL: [number, number] = [-10.5, 18.0]
const ZOOM_INITIAL = 4.6

// Couleur du halo : pire situation de l'unité (alerte calculée par l'API, ou demande ouverte).
const etatStyle = {
  critique: { label: 'Critique', couleur: '#b9332c' },
  attention: { label: 'Attention', couleur: '#ba7a0b' },
  demande: { label: 'Demande en cours', couleur: '#2563eb' },
} as const
type Etat = keyof typeof etatStyle

export interface NiveauxUnite {
  uniteId: string
  uniteNom: string
  alerte: string
  ressourcesBasses: { label: string; pct: number }[]
}

interface LogistiqueMapProps {
  unites: SituationDTO['unites']
  niveaux: NiveauxUnite[]
  demandes: DemandeRavitaillementDTO[]
  selectionId: string | null
  onSelect: (uniteId: string) => void
  onRavitailler: (uniteId: string) => void
}

function etatUnite(niveau: NiveauxUnite | undefined, demandesOuvertes: number): Etat | null {
  if (niveau?.alerte === 'critique') return 'critique'
  if (niveau?.alerte === 'attention') return 'attention'
  if (demandesOuvertes > 0) return 'demande'
  return null
}

function echapper(texte: string): string {
  const el = document.createElement('span')
  el.textContent = texte
  return el.innerHTML
}

export function LogistiqueMap({ unites, niveaux, demandes, selectionId, onSelect, onRavitailler }: LogistiqueMapProps) {
  const conteneurRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const marqueursRef = useRef<maplibregl.Marker[]>([])
  const popupRef = useRef<maplibregl.Popup | null>(null)
  const [carteChargee, setCarteChargee] = useState(false)
  const cadrageFaitRef = useRef(false)
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect
  const onRavitaillerRef = useRef(onRavitailler)
  onRavitaillerRef.current = onRavitailler

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
    map.on('load', () => setCarteChargee(true))
    return () => {
      observateurTaille.disconnect()
      map.remove()
      mapRef.current = null
      setCarteChargee(false)
    }
  }, [])

  const niveauParUnite = new Map(niveaux.map((n) => [n.uniteId, n]))
  const ouvertes = demandes.filter((d) => d.statut === 'demandee' || d.statut === 'en_cours')
  // Unités affichées : en alerte ou avec une demande ouverte ; les unités logistiques
  // apparaissent aussi, comme points d'appui d'où partent les ravitaillements.
  const affichees = unites
    .filter((u) => u.lon !== null && u.lat !== null)
    .map((u) => {
      const demandesUnite = ouvertes.filter((d) => d.uniteId === u.id)
      return { unite: u, etat: etatUnite(niveauParUnite.get(u.id), demandesUnite.length), demandesUnite }
    })
    .filter((x) => x.etat !== null || x.unite.typeUnite === 'logistique')

  useEffect(() => {
    const map = mapRef.current
    if (!map || !carteChargee) return
    marqueursRef.current.forEach((m) => m.remove())
    marqueursRef.current = affichees.map(({ unite, etat }) => {
      const el = document.createElement('button')
      el.dataset.uniteId = unite.id
      el.title = unite.nom
      el.className = 'flex flex-col items-center'
      const halo = etat ? etatStyle[etat].couleur : '#65706a'
      const symbole = new ms.Symbol(typeUniteSidc[unite.typeUnite as TypeUnite] ?? typeUniteSidc.pc, { size: 20, fillColor: couleurAmie }).asSVG()
      el.innerHTML = `
        <span class="grid place-items-center rounded-full bg-white p-1 shadow-md ${etat === 'critique' ? 'animate-pulse' : ''} ${unite.id === selectionId ? 'ring-2 ring-[#17201b]' : ''}"
              style="border: 3px solid ${halo}; ${etat ? '' : 'opacity:0.75; border-style:dashed'}">${symbole}</span>
        <span class="mt-0.5 whitespace-nowrap rounded bg-white/90 px-1 text-[10px] font-bold text-[#17201b] shadow-sm">${echapper(unite.nom)}</span>
      `
      el.addEventListener('click', (e) => {
        e.stopPropagation()
        onSelectRef.current(unite.id)
      })
      return new maplibregl.Marker({ element: el, anchor: 'center' }).setLngLat([unite.lon!, unite.lat!]).addTo(map)
    })

    // Premier affichage : cadrer sur les unités montrées plutôt que sur une vue fixe,
    // pour qu'aucune unité en difficulté ne reste hors champ.
    if (!cadrageFaitRef.current && affichees.length > 0) {
      cadrageFaitRef.current = true
      const bornes = new maplibregl.LngLatBounds()
      affichees.forEach(({ unite }) => bornes.extend([unite.lon!, unite.lat!]))
      map.fitBounds(bornes, { padding: { top: 70, bottom: 110, left: 250, right: 80 }, maxZoom: 6.5, duration: 0 })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unites, niveaux, demandes, selectionId, carteChargee])

  // Popup de l'unité sélectionnée : ressources basses, demandes ouvertes, accès direct au formulaire.
  useEffect(() => {
    const map = mapRef.current
    popupRef.current?.remove()
    popupRef.current = null
    if (!map || !carteChargee || !selectionId) return
    const cible = affichees.find((x) => x.unite.id === selectionId)
    if (!cible) return
    const { unite, etat, demandesUnite } = cible
    const niveau = niveauParUnite.get(unite.id)
    const contenu = document.createElement('div')
    contenu.className = 'grid gap-1.5 text-xs text-[#17201b]'
    contenu.innerHTML = `
      <div class="text-sm font-bold">${echapper(unite.nom)}</div>
      ${etat ? `<div class="font-bold" style="color:${etatStyle[etat].couleur}">${etatStyle[etat].label}</div>` : '<div class="text-[#65706a]">Point d\'appui logistique</div>'}
      ${
        niveau?.ressourcesBasses.length
          ? `<div>${niveau.ressourcesBasses.map((r) => `${r.label} <b>${r.pct}%</b>`).join(' · ')}</div>`
          : ''
      }
      ${demandesUnite.length ? `<div class="text-[#2563eb]">${demandesUnite.length} demande(s) ouverte(s)</div>` : ''}
      <button data-ravitailler class="mt-1 rounded-md border border-[#17201b] bg-[#17201b] px-2 py-1 text-white">Ravitailler</button>
    `
    contenu.querySelector('[data-ravitailler]')!.addEventListener('click', () => onRavitaillerRef.current(unite.id))
    popupRef.current = new maplibregl.Popup({ offset: 22, closeButton: false, maxWidth: '260px' })
      .setLngLat([unite.lon!, unite.lat!])
      .setDOMContent(contenu)
      .addTo(map)
    map.flyTo({ center: [unite.lon!, unite.lat!], zoom: Math.max(map.getZoom(), 5.5) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectionId, unites, niveaux, demandes, carteChargee])

  return (
    <div className="relative h-full min-h-[380px] overflow-hidden rounded-lg border border-[#d8ded9] bg-white shadow-sm">
      <div ref={conteneurRef} className="h-full w-full" />
      <div className="pointer-events-none absolute left-3 top-3 grid gap-1.5 rounded-lg border border-[#d8ded9] bg-white/95 p-2.5 text-xs text-[#17201b] shadow-sm">
        <div className="font-bold text-[#65706a]">Besoins logistiques · {affichees.filter((x) => x.etat).length} unité(s)</div>
        {(Object.keys(etatStyle) as Etat[]).map((etat) => (
          <div key={etat} className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full bg-white" style={{ border: `3px solid ${etatStyle[etat].couleur}` }} />
            {etatStyle[etat].label}
          </div>
        ))}
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full border-2 border-dashed border-[#65706a] bg-white" />
          Point d'appui logistique
        </div>
      </div>
    </div>
  )
}
