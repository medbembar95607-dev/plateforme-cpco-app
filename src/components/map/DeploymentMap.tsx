import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import ms from 'milsymbol'
import { Crosshair } from 'lucide-react'
import type { GarnisonDTO } from '../../api/client'
import type { ElementSelectionne, TypeUnite } from '../../types'
import { couleurAmie, typeUniteSidc } from '../../uniteStyle'

const STYLE_URL = 'https://tiles.openfreemap.org/styles/positron'
const CENTRE_INITIAL: [number, number] = [-11.5, 19.0]
const ZOOM_INITIAL = 4.6

function symboleUniteSvg(typeUnite: TypeUnite, taille: number) {
  return new ms.Symbol(typeUniteSidc[typeUnite], { size: taille, fillColor: couleurAmie }).asSVG()
}

interface DeploymentMapProps {
  garnisons: GarnisonDTO[]
  onSelect: (element: ElementSelectionne) => void
}

export function DeploymentMap({ garnisons, onSelect }: DeploymentMapProps) {
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
      garnisons.forEach((garnison) => {
        const el = document.createElement('button')
        el.className = 'flex flex-col items-center'
        el.innerHTML = `
          <span class="drop-shadow-md">${symboleUniteSvg(garnison.typeUnite as TypeUnite, 24)}</span>
          <span class="mt-1 whitespace-nowrap rounded border border-[#d8ded9] bg-white/95 px-1.5 py-0.5 text-[11px] text-[#17201b] shadow-sm">${garnison.localite}</span>
        `
        el.addEventListener('click', (e) => {
          e.stopPropagation()
          onSelectRef.current({ kind: 'garnison', data: garnison })
        })
        new maplibregl.Marker({ element: el, anchor: 'bottom' }).setLngLat([garnison.lon, garnison.lat]).addTo(map)
      })
    })

    return () => {
      observateurTaille.disconnect()
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [garnisons])

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
