import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import { classificationLabel } from '../../types'
import type { Classification } from '../../types'

type RapportRow = Awaited<ReturnType<typeof api.intelligenceReports>>[number]

const statutStyle = {
  menace: { label: 'Menace', badge: 'bg-red-50 text-red-700' },
  observation: { label: 'Observation', badge: 'bg-amber-50 text-amber-700' },
  stabilise: { label: 'Stabilisé', badge: 'bg-emerald-50 text-emerald-700' },
}

export function RenseignementScreen() {
  const [rapports, setRapports] = useState<RapportRow[]>([])

  useEffect(() => {
    api.intelligenceReports().then(setRapports)
  }, [])

  return (
    <section className="grid min-h-0 grid-rows-[auto_1fr] gap-3.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <select className="h-[38px] rounded-lg border border-[#d8ded9] bg-white px-2.5">
            <option>Classification</option>
            {Object.values(classificationLabel).map((label) => (
              <option key={label}>{label}</option>
            ))}
          </select>
          <select className="h-[38px] rounded-lg border border-[#d8ded9] bg-white px-2.5">
            <option>Fiabilité source</option>
            <option>A - Confirmée</option>
            <option>B - Probable</option>
            <option>C - À vérifier</option>
          </select>
        </div>
        <button className="h-10 rounded-lg border border-[#17201b] bg-[#17201b] px-3.5 text-white">Nouveau rapport</button>
      </div>

      <div className="grid grid-cols-3 gap-3.5 overflow-auto">
        {rapports.map((rapport) => (
          <article key={rapport.id} className="grid gap-3 rounded-lg border border-[#d8ded9] bg-white p-3.5 shadow-sm">
            <span
              className={`inline-flex w-fit min-h-[26px] items-center rounded-full px-2.5 text-xs font-bold ${statutStyle[rapport.statut as keyof typeof statutStyle].badge}`}
            >
              {statutStyle[rapport.statut as keyof typeof statutStyle].label}
            </span>
            <h3 className="m-0 text-[17px] text-[#17201b]">{rapport.titre}</h3>
            <p className="m-0 text-[13px] leading-relaxed text-[#65706a]">{rapport.resume}</p>
            <span className="text-xs text-[#65706a]">Classification : {classificationLabel[rapport.classification as Classification]}</span>
          </article>
        ))}
      </div>
    </section>
  )
}
