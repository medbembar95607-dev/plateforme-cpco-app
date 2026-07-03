import { useEffect, useState } from 'react'
import { api } from '../../api/client'

type IncidentRow = Awaited<ReturnType<typeof api.incidents>>[number]

const graviteStyle: Record<string, string> = {
  faible: 'bg-gray-100 text-gray-700',
  moyenne: 'bg-amber-50 text-amber-700',
  elevee: 'bg-orange-50 text-orange-700',
  critique: 'bg-red-50 text-red-700',
}

const graviteLabel: Record<string, string> = { faible: 'Faible', moyenne: 'Moyenne', elevee: 'Élevée', critique: 'Critique' }
const statutLabel: Record<string, string> = { nouveau: 'Nouveau', en_cours: 'En cours', traite: 'Traité' }
const typeLabel: Record<string, string> = {
  securite: 'Sécurité',
  logistique: 'Logistique',
  renseignement: 'Renseignement',
  medical: 'Médical',
  communication: 'Communication',
}

export function IncidentsScreen() {
  const [incidents, setIncidents] = useState<IncidentRow[]>([])

  useEffect(() => {
    api.incidents().then(setIncidents)
  }, [])

  return (
    <section className="grid min-h-0 grid-rows-[auto_1fr] gap-3.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <select className="h-[38px] rounded-lg border border-[#d8ded9] bg-white px-2.5">
            <option>Tous les types</option>
            {Object.values(typeLabel).map((label) => (
              <option key={label}>{label}</option>
            ))}
          </select>
          <select className="h-[38px] rounded-lg border border-[#d8ded9] bg-white px-2.5">
            <option>Toutes les gravités</option>
            {Object.values(graviteLabel).map((label) => (
              <option key={label}>{label}</option>
            ))}
          </select>
          <select className="h-[38px] rounded-lg border border-[#d8ded9] bg-white px-2.5">
            <option>Tous les statuts</option>
            {Object.values(statutLabel).map((label) => (
              <option key={label}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-auto rounded-lg border border-[#d8ded9] bg-white shadow-sm">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-[#f8faf7] text-xs text-[#65706a]">
              <th className="border-b border-[#d8ded9] px-3.5 py-3 text-left">Date</th>
              <th className="border-b border-[#d8ded9] px-3.5 py-3 text-left">Type</th>
              <th className="border-b border-[#d8ded9] px-3.5 py-3 text-left">Localité</th>
              <th className="border-b border-[#d8ded9] px-3.5 py-3 text-left">Gravité</th>
              <th className="border-b border-[#d8ded9] px-3.5 py-3 text-left">Statut</th>
              <th className="border-b border-[#d8ded9] px-3.5 py-3 text-left">Déclarant</th>
            </tr>
          </thead>
          <tbody>
            {incidents.map((incident) => (
              <tr key={incident.id}>
                <td className="border-b border-[#d8ded9] px-3.5 py-3">{incident.date_incident.replace('T', ' ').slice(0, 16)}</td>
                <td className="border-b border-[#d8ded9] px-3.5 py-3">{typeLabel[incident.type_incident]}</td>
                <td className="border-b border-[#d8ded9] px-3.5 py-3">{incident.localite}</td>
                <td className="border-b border-[#d8ded9] px-3.5 py-3">
                  <span className={`inline-flex min-h-[26px] items-center rounded-full px-2.5 text-xs font-bold ${graviteStyle[incident.niveau_gravite]}`}>
                    {graviteLabel[incident.niveau_gravite]}
                  </span>
                </td>
                <td className="border-b border-[#d8ded9] px-3.5 py-3">{statutLabel[incident.statut]}</td>
                <td className="border-b border-[#d8ded9] px-3.5 py-3">{incident.declarant}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
