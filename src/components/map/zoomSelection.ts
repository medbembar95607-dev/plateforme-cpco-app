import type maplibregl from 'maplibre-gl'

// Zoom par sélection rectangulaire : contrairement au box-zoom natif de MapLibre (caché derrière
// Shift+glisser, peu découvrable), ce mode s'active/désactive via un bouton visible et fonctionne
// au clic-glisser simple.
export function activerZoomSelection(map: maplibregl.Map, container: HTMLElement, onTerminer: () => void): () => void {
  const canvas = map.getCanvasContainer()
  canvas.style.cursor = 'crosshair'
  map.dragPan.disable()

  const overlay = document.createElement('div')
  overlay.style.position = 'absolute'
  overlay.style.border = '2px dashed #1f6fb2'
  overlay.style.background = 'rgba(31,111,178,0.15)'
  overlay.style.pointerEvents = 'none'
  overlay.style.zIndex = '10'
  overlay.style.display = 'none'
  container.appendChild(overlay)

  let depart: { x: number; y: number } | null = null

  function rectConteneur() {
    return container.getBoundingClientRect()
  }

  function positionner(x: number, y: number, w: number, h: number) {
    overlay.style.left = `${x}px`
    overlay.style.top = `${y}px`
    overlay.style.width = `${w}px`
    overlay.style.height = `${h}px`
  }

  function onMouseDown(e: MouseEvent) {
    const r = rectConteneur()
    depart = { x: e.clientX - r.left, y: e.clientY - r.top }
    positionner(depart.x, depart.y, 0, 0)
    overlay.style.display = 'block'
  }

  function onMouseMove(e: MouseEvent) {
    if (!depart) return
    const r = rectConteneur()
    const x = e.clientX - r.left
    const y = e.clientY - r.top
    positionner(Math.min(depart.x, x), Math.min(depart.y, y), Math.abs(x - depart.x), Math.abs(y - depart.y))
  }

  function onMouseUp(e: MouseEvent) {
    if (!depart) return
    const r = rectConteneur()
    const fin = { x: e.clientX - r.left, y: e.clientY - r.top }
    const distance = Math.hypot(fin.x - depart.x, fin.y - depart.y)
    if (distance > 10) {
      const p1 = map.unproject([depart.x, depart.y])
      const p2 = map.unproject([fin.x, fin.y])
      map.fitBounds(
        [
          [Math.min(p1.lng, p2.lng), Math.min(p1.lat, p2.lat)],
          [Math.max(p1.lng, p2.lng), Math.max(p1.lat, p2.lat)],
        ],
        { padding: 30, duration: 600 },
      )
    }
    depart = null
    terminer()
  }

  function terminer() {
    canvas.style.cursor = ''
    map.dragPan.enable()
    overlay.remove()
    container.removeEventListener('mousedown', onMouseDown)
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
    onTerminer()
  }

  container.addEventListener('mousedown', onMouseDown)
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)

  return terminer
}
