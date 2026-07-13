import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import { statutUniteStyle, typeUniteLabel } from '../../uniteStyle'
import type { StatutUnite, TypeUnite } from '../../types'

type UniteRow = Awaited<ReturnType<typeof api.units>>[number]
type LogistiqueRow = Awaited<ReturnType<typeof api.logistics>>[number]

function couleurTexte(pct: number) {
  if (pct <= 30) return 'text-[#b9332c] font-bold'
  if (pct <= 50) return 'text-[#ba7a0b] font-bold'
  return 'text-[#17201b]'
}

export function UnitesScreen() {
  const [unites, setUnites] = useState<UniteRow[]>([])
  const [logistique, setLogistique] = useState<Map<string, LogistiqueRow>>(new Map())

  useEffect(() => {
    api.units().then(setUnites)
    api.logistics().then((lignes) => setLogistique(new Map(lignes.map((l) => [l.uniteId, l]))))
  }, [])

  return (
    <section className="grid min-h-0 grid-rows-[auto_1fr] gap-3.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <select className="h-[38px] rounded-lg border border-[#d8ded9] bg-white px-2.5">
            <option>Tous les types</option>
            {Object.values(typeUniteLabel).map((label) => (
              <option key={label}>{label}</option>
            ))}
          </select>
          <select className="h-[38px] rounded-lg border border-[#d8ded9] bg-white px-2.5">
            <option>Tous les statuts</option>
            {Object.values(statutUniteStyle).map((s) => (
              <option key={s.label}>{s.label}</option>
            ))}
          </select>
        </div>
        <button className="h-10 rounded-lg border border-[#17201b] bg-[#17201b] px-3.5 text-white">Ajouter une unité</button>
      </div>

      <div className="overflow-auto rounded-lg border border-[#d8ded9] bg-white shadow-sm">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-[#f8faf7] text-xs text-[#65706a]">
              <th className="border-b border-[#d8ded9] px-3.5 py-3 text-left">Unité</th>
              <th className="border-b border-[#d8ded9] px-3.5 py-3 text-left">Type</th>
              <th className="border-b border-[#d8ded9] px-3.5 py-3 text-left">Statut</th>
              <th className="border-b border-[#d8ded9] px-3.5 py-3 text-left">Effectif</th>
              <th className="border-b border-[#d8ded9] px-3.5 py-3 text-left">Communication</th>
              <th className="border-b border-[#d8ded9] px-3.5 py-3 text-left">Dernier rapport</th>
              <th className="border-b border-[#d8ded9] px-3.5 py-3 text-left">Armement</th>
              <th className="border-b border-[#d8ded9] px-3.5 py-3 text-left">Munitions</th>
              <th className="border-b border-[#d8ded9] px-3.5 py-3 text-left">Carburant</th>
              <th className="border-b border-[#d8ded9] px-3.5 py-3 text-left">Vivres</th>
              <th className="border-b border-[#d8ded9] px-3.5 py-3 text-left">Santé</th>
              <th className="border-b border-[#d8ded9] px-3.5 py-3 text-left">Véhicules</th>
            </tr>
          </thead>
          <tbody>
            {unites.map((unite) => {
              const log = logistique.get(unite.id)
              return (
              <tr key={unite.id}>
                <td className="border-b border-[#d8ded9] px-3.5 py-3">{unite.nom}</td>
                <td className="border-b border-[#d8ded9] px-3.5 py-3">{typeUniteLabel[unite.typeUnite as TypeUnite]}</td>
                <td className="border-b border-[#d8ded9] px-3.5 py-3">
                  <span
                    className={`inline-flex min-h-[26px] items-center rounded-full px-2.5 text-xs font-bold ${statutUniteStyle[unite.statut as StatutUnite]?.badge ?? 'bg-gray-100 text-gray-700'}`}
                  >
                    {statutUniteStyle[unite.statut as StatutUnite]?.label ?? unite.statut}
                  </span>
                </td>
                <td className="border-b border-[#d8ded9] px-3.5 py-3">{unite.effectif}</td>
                <td className="border-b border-[#d8ded9] px-3.5 py-3">{unite.communication === 'stable' ? 'Stable' : 'Dégradée'}</td>
                <td className="border-b border-[#d8ded9] px-3.5 py-3">{unite.dernierRapport ?? '—'}</td>
                <td className={`border-b border-[#d8ded9] px-3.5 py-3 ${log ? couleurTexte(log.armementPct) : ''}`}>{log ? `${log.armementPct}%` : '—'}</td>
                <td className={`border-b border-[#d8ded9] px-3.5 py-3 ${log ? couleurTexte(log.munitionsPct) : ''}`}>{log ? `${log.munitionsPct}%` : '—'}</td>
                <td className={`border-b border-[#d8ded9] px-3.5 py-3 ${log ? couleurTexte(log.carburantPct) : ''}`}>{log ? `${log.carburantPct}%` : '—'}</td>
                <td className={`border-b border-[#d8ded9] px-3.5 py-3 ${log ? couleurTexte(log.vivresPct) : ''}`}>{log ? `${log.vivresPct}%` : '—'}</td>
                <td className={`border-b border-[#d8ded9] px-3.5 py-3 ${log ? couleurTexte(log.santePct) : ''}`}>{log ? `${log.santePct}%` : '—'}</td>
                <td className={`border-b border-[#d8ded9] px-3.5 py-3 ${log ? couleurTexte(log.vehiculePct) : ''}`}>{log ? `${log.vehiculePct}%` : '—'}</td>
              </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
