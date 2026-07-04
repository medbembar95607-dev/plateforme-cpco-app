import { useEffect, useState } from 'react'
import { OperationalMap } from '../map/OperationalMap'
import { LiveDroneMap } from '../map/LiveDroneMap'
import { DroneVideoFeed } from '../DroneVideoFeed'
import { api, type SituationDTO } from '../../api/client'
import type { ElementSelectionne, UniteSituation } from '../../types'

const STATUTS_ENGAGES = ['en_mission', 'en_progression']

export function LiveOpsScreen() {
  const [situation, setSituation] = useState<SituationDTO | null>(null)
  const [, setSelection] = useState<ElementSelectionne | null>(null)

  useEffect(() => {
    api.situation().then(setSituation)
  }, [])

  if (!situation) {
    return <p className="text-sm text-[#65706a]">Chargement…</p>
  }

  const unitesEngagees = situation.unites.filter((u) => STATUTS_ENGAGES.includes(u.statut))
  const situationEngagees: SituationDTO = { ...situation, unites: unitesEngagees, menaces: [], checkpoints: [], zones: [], axes: [] }

  const uniteSuivie: UniteSituation | undefined = unitesEngagees.find((u) => u.statut === 'en_progression') ?? unitesEngagees[0]

  return (
    <section className="grid h-full min-h-0 grid-rows-2 gap-4">
      <section className="grid min-h-0 grid-rows-[auto_1fr] overflow-hidden rounded-lg border border-[#d8ded9] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#d8ded9] px-3.5 py-3">
          <h2 className="m-0 text-base text-[#17201b]">Unités engagées</h2>
          <span className="text-xs text-[#65706a]">{unitesEngagees.length} unité(s) en mission ou en progression</span>
        </div>
        <OperationalMap situation={situationEngagees} onSelect={setSelection} />
      </section>

      <div className="grid min-h-0 grid-cols-2 gap-4">
        <section className="grid min-h-0 grid-rows-[auto_1fr] overflow-hidden rounded-lg border border-[#d8ded9] bg-white shadow-sm">
          <div className="border-b border-[#d8ded9] px-3.5 py-3">
            <h2 className="m-0 text-base text-[#17201b]">Suivi live — {uniteSuivie?.nom ?? 'aucune unité'}</h2>
            <span className="text-xs text-[#65706a]">Position unité + drone d'appui (simulation)</span>
          </div>
          {uniteSuivie ? <LiveDroneMap unite={uniteSuivie} /> : <p className="p-3.5 text-sm text-[#65706a]">Aucune unité engagée à suivre.</p>}
        </section>

        <section className="grid min-h-0 grid-rows-[auto_1fr] overflow-hidden rounded-lg border border-[#d8ded9] bg-white shadow-sm">
          <div className="border-b border-[#d8ded9] px-3.5 py-3">
            <h2 className="m-0 text-base text-[#17201b]">Flux vidéo drone</h2>
            <span className="text-xs text-[#65706a]">Simulation — non connecté à un drone réel</span>
          </div>
          <DroneVideoFeed nomUnite={uniteSuivie?.nom ?? 'N/A'} />
        </section>
      </div>
    </section>
  )
}
