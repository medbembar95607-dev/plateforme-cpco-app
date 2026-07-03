import { useEffect, useState } from 'react'
import { api } from '../../api/client'

type OperationRow = Awaited<ReturnType<typeof api.operations>>[number]

const statutStyle: Record<string, { label: string; badge: string }> = {
  planifiee: { label: 'Planifiée', badge: 'bg-amber-50 text-amber-700' },
  en_cours: { label: 'En cours', badge: 'bg-blue-50 text-blue-700' },
  sous_tension: { label: 'Sous tension', badge: 'bg-red-50 text-red-700' },
  terminee: { label: 'Terminée', badge: 'bg-emerald-50 text-emerald-700' },
}

export function OperationsScreen() {
  const [operations, setOperations] = useState<OperationRow[]>([])

  useEffect(() => {
    api.operations().then(setOperations)
  }, [])

  return (
    <section className="grid min-h-0 grid-rows-[auto_1fr] gap-3.5">
      <div className="flex items-center justify-between gap-3">
        <select className="h-[38px] rounded-lg border border-[#d8ded9] bg-white px-2.5">
          <option>Tous les statuts</option>
          {Object.values(statutStyle).map((s) => (
            <option key={s.label}>{s.label}</option>
          ))}
        </select>
        <button className="h-10 rounded-lg border border-[#17201b] bg-[#17201b] px-3.5 text-white">Créer une opération</button>
      </div>

      <div className="grid grid-cols-3 gap-3.5 overflow-auto">
        {operations.map((operation) => (
          <article key={operation.id} className="grid gap-3 rounded-lg border border-[#d8ded9] bg-white p-3.5 shadow-sm">
            <span className={`inline-flex w-fit min-h-[26px] items-center rounded-full px-2.5 text-xs font-bold ${statutStyle[operation.statut].badge}`}>
              {statutStyle[operation.statut].label}
            </span>
            <h3 className="m-0 text-[17px] text-[#17201b]">{operation.nom_operation}</h3>
            <p className="m-0 text-[13px] leading-relaxed text-[#65706a]">{operation.objectif}</p>
            <div className="h-2 overflow-hidden rounded-full bg-[#e5e9e5]">
              <div className="h-full bg-[#1f6fb2]" style={{ width: `${operation.progression}%` }} />
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
