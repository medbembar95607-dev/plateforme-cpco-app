import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import ms from 'milsymbol'
import type { TypeUnite, UniteSituation } from '../../types'
import { couleurAmie, typeUniteSidc } from '../../uniteStyle'

const STYLE_URL = 'https://tiles.openfreemap.org/styles/positron'

const DRONE_SVG = `
  <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
    <line x1="6" y1="6" x2="24" y2="24" stroke="#17201b" stroke-width="2" />
    <line x1="24" y1="6" x2="6" y2="24" stroke="#17201b" stroke-width="2" />
    <circle cx="6" cy="6" r="4" fill="#ba7a0b" stroke="#17201b" stroke-width="1.5" />
    <circle cx="24" cy="6" r="4" fill="#ba7a0b" stroke="#17201b" stroke-width="1.5" />
    <circle cx="6" cy="24" r="4" fill="#ba7a0b" stroke="#17201b" stroke-width="1.5" />
    <circle cx="24" cy="24" r="4" fill="#ba7a0b" stroke="#17201b" stroke-width="1.5" />
    <circle cx="15" cy="15" r="4" fill="#17201b" />
  </svg>
`

function symboleUniteSvg(typeUnite: TypeUnite) {
  return new ms.Symbol(typeUniteSidc[typeUnite], { size: 28, fillColor: couleurAmie }).asSVG()
}

interface LiveDroneMapProps {
  unite: UniteSituation
}

/** Simule un suivi GPS "live" (léger tremblement de position) et un drone en orbite autour de
 * l'unité suivie — aucune donnée réelle de drone n'existe encore côté backend (voir README). */
export function LiveDroneMap({ unite }: LiveDroneMapProps) {
  const conteneurRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const uniteMarkerRef = useRef<maplibregl.Marker | null>(null)
  const droneMarkerRef = useRef<maplibregl.Marker | null>(null)

  useEffect(() => {
    if (!conteneurRef.current || unite.lon == null || unite.lat == null) return
    const centre: [number, number] = [unite.lon, unite.lat]

    const map = new maplibregl.Map({
      container: conteneurRef.current,
      style: STYLE_URL,
      center: centre,
      zoom: 10,
    })
    mapRef.current = map
    map.dragRotate.disable()
    map.touchZoomRotate.disableRotation()

    const observateurTaille = new ResizeObserver(() => map.resize())
    observateurTaille.observe(conteneurRef.current)

    map.on('load', () => {
      const elUnite = document.createElement('div')
      elUnite.innerHTML = symboleUniteSvg(unite.typeUnite as TypeUnite)
      uniteMarkerRef.current = new maplibregl.Marker({ element: elUnite, anchor: 'center' }).setLngLat(centre).addTo(map)

      const elDrone = document.createElement('div')
      elDrone.className = 'animate-pulse drop-shadow-md'
      elDrone.innerHTML = DRONE_SVG
      droneMarkerRef.current = new maplibregl.Marker({ element: elDrone, anchor: 'center' }).setLngLat(centre).addTo(map)
    })

    let angle = 0
    const rayon = 0.02
    const intervalle = setInterval(() => {
      const jitterLon = unite.lon! + (Math.random() - 0.5) * 0.0008
      const jitterLat = unite.lat! + (Math.random() - 0.5) * 0.0008
      uniteMarkerRef.current?.setLngLat([jitterLon, jitterLat])

      angle += 0.35
      const droneLon = unite.lon! + rayon * Math.cos(angle)
      const droneLat = unite.lat! + rayon * Math.sin(angle)
      droneMarkerRef.current?.setLngLat([droneLon, droneLat])
    }, 1200)

    return () => {
      clearInterval(intervalle)
      observateurTaille.disconnect()
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unite.id])

  return <div ref={conteneurRef} className="h-full w-full" />
}
