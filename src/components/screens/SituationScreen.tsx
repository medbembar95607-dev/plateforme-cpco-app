import { useState } from 'react'
import { KpiRow } from '../KpiRow'
import { OperationalMap } from '../map/OperationalMap'
import { DetailPanel } from '../DetailPanel'
import { Feed } from '../Feed'
import type { ElementSelectionne, EvenementFlux } from '../../types'

const kpis = [
  { label: 'Opérations actives', valeur: '4', note: '2 en phase critique' },
  { label: 'Unités engagées', valeur: '17', note: '1 communication dégradée' },
  { label: 'Effectifs engagés', valeur: '1 240', note: 'Zone nord-ouest' },
  { label: 'Menaces détectées', valeur: '6', note: '3 confirmées' },
  { label: 'Niveau logistique', valeur: '68%', note: 'Carburant sous tension' },
]

const couches = [
  { label: 'Unités', couleur: 'bg-[#1f6fb2]' },
  { label: 'Logistique', couleur: 'bg-[#21835d]' },
  { label: 'Missions', couleur: 'bg-[#ba7a0b]' },
  { label: 'Menaces', couleur: 'bg-[#b9332c]' },
]

interface SituationScreenProps {
  evenements: EvenementFlux[]
}

export function SituationScreen({ evenements }: SituationScreenProps) {
  const [selection, setSelection] = useState<ElementSelectionne | null>(null)

  return (
    <section className="grid min-h-0 grid-rows-[auto_1fr] gap-4">
      <KpiRow kpis={kpis} />

      <div className="grid min-h-0 grid-cols-[minmax(440px,1fr)_360px] gap-4">
        <section className="grid min-h-0 grid-rows-[auto_1fr] overflow-hidden rounded-lg border border-[#d8ded9] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#d8ded9] px-3.5 py-3">
            <h2 className="m-0 text-base text-[#17201b]">Vue COP - secteur Nouakchott Nord</h2>
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
          <OperationalMap selection={selection} onSelect={setSelection} />
        </section>

        <div className="grid min-h-0 grid-rows-[auto_1fr] gap-4">
          <DetailPanel selection={selection} />
          <Feed evenements={evenements} />
        </div>
      </div>
    </section>
  )
}
