import { useEffect, useState } from 'react'

/** Simulation visuelle d'un flux vidéo drone — aucune caméra réelle n'est connectée (voir README).
 * À remplacer par un vrai flux (RTSP/WebRTC) le jour où un drone réel sera intégré. */
export function DroneVideoFeed({ nomUnite }: { nomUnite: string }) {
  const [heure, setHeure] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setHeure(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0d1210]">
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(120,150,130,0.15) 0px, transparent 2px, transparent 4px)',
        }}
      />
      <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#4a6b58]/60" />
      <div className="absolute left-1/2 top-1/2 h-px w-full -translate-x-1/2 -translate-y-1/2 bg-[#4a6b58]/40" />
      <div className="absolute left-1/2 top-1/2 h-full w-px -translate-x-1/2 -translate-y-1/2 bg-[#4a6b58]/40" />

      <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded bg-black/50 px-2 py-1">
        <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
        <span className="text-xs font-bold uppercase tracking-wide text-red-400">Live</span>
      </div>
      <div className="absolute right-3 top-3 rounded bg-black/50 px-2 py-1 text-xs text-[#c8d6ce]">
        Drone 01 — {nomUnite}
      </div>
      <div className="absolute bottom-3 right-3 rounded bg-black/50 px-2 py-1 font-mono text-xs text-[#c8d6ce]">
        {heure.toLocaleTimeString('fr-FR')}
      </div>
      <div className="absolute bottom-3 left-3 rounded bg-black/50 px-2 py-1 text-[11px] text-[#8a9a92]">
        Simulation — aucun flux réel connecté
      </div>
    </div>
  )
}
