import { useEffect, useState } from 'react'
import { KpiRow } from '../KpiRow'
import { DeploymentMap } from '../map/DeploymentMap'
import { DetailPanel } from '../DetailPanel'
import { api, type GarnisonDTO } from '../../api/client'
import type { ElementSelectionne } from '../../types'

const couches = [
  { label: 'Terre', couleur: 'bg-[#1f6fb2]' },
  { label: 'Air', couleur: 'bg-[#1f6fb2]' },
  { label: 'Mer', couleur: 'bg-[#1f6fb2]' },
]

export function DeploiementScreen() {
  const [selection, setSelection] = useState<ElementSelectionne | null>(null)
  const [garnisons, setGarnisons] = useState<GarnisonDTO[] | null>(null)

  useEffect(() => {
    api.deploiement().then(setGarnisons)
  }, [])

  if (!garnisons) {
    return <p className="text-sm text-[#65706a]">Chargement du déploiement…</p>
  }

  const effectifTotal = garnisons.reduce((total, g) => total + g.effectif, 0)
  const parArmee = {
    terre: garnisons.filter((g) => g.armee === 'terre').length,
    air: garnisons.filter((g) => g.armee === 'air').length,
    mer: garnisons.filter((g) => g.armee === 'mer').length,
  }

  const kpis = [
    { label: 'Formations déployées', valeur: String(garnisons.length), note: 'territoire national' },
    { label: 'Effectifs déployés', valeur: effectifTotal.toLocaleString('fr-FR'), note: 'toutes armées' },
    { label: 'Armée de Terre', valeur: String(parArmee.terre), note: 'bataillons / forces spéciales' },
    { label: "Armée de l'Air", valeur: String(parArmee.air), note: 'bases aériennes' },
    { label: 'Marine', valeur: String(parArmee.mer), note: 'bases navales' },
  ]

  return (
    <section className="grid min-h-0 grid-rows-[auto_1fr] gap-4">
      <KpiRow kpis={kpis} />

      <div className="grid min-h-[560px] grid-cols-[minmax(440px,1fr)_360px] gap-4">
        <section className="grid min-h-0 grid-rows-[auto_1fr] overflow-hidden rounded-lg border border-[#d8ded9] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#d8ded9] px-3.5 py-3">
            <h2 className="m-0 text-base text-[#17201b]">Déploiement Armée</h2>
            <div className="flex flex-wrap justify-end gap-2">
              {couches.map((couche) => (
                <span
                  key={couche.label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#d8ded9] px-2.5 py-1 text-xs text-[#65706a]"
                >
                  <i className={`h-2 w-2 rounded-full ${couche.couleur}`} />
                  {couche.label}
                </span>
              ))}
            </div>
          </div>
          <DeploymentMap garnisons={garnisons} onSelect={setSelection} />
        </section>

        <DetailPanel selection={selection} />
      </div>
    </section>
  )
}
