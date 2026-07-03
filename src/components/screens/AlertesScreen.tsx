import { useState } from 'react'
import { alertes as alertesInitiales } from '../../data/mockData'
import type { Alerte, NiveauAlerte } from '../../types'

const niveauStyle: Record<NiveauAlerte, { label: string; badge: string; bordure: string }> = {
  info: { label: 'Info', badge: 'bg-blue-50 text-blue-700', bordure: 'border-l-[#1f6fb2]' },
  attention: { label: 'Attention', badge: 'bg-amber-50 text-amber-700', bordure: 'border-l-[#ba7a0b]' },
  critique: { label: 'Critique', badge: 'bg-red-50 text-red-700', bordure: 'border-l-[#b9332c]' },
}

const typeLabel = {
  logistique: 'Logistique',
  menace: 'Menace',
  communication: 'Communication',
  operationnelle: 'Opérationnelle',
}

const statutLabel = {
  active: 'Active',
  acquittee: 'Acquittée',
  resolue: 'Résolue',
}

const ordreNiveau: Record<NiveauAlerte, number> = { critique: 0, attention: 1, info: 2 }

export function AlertesScreen() {
  const [alertes, setAlertes] = useState<Alerte[]>(alertesInitiales)

  function acquitter(id: string) {
    setAlertes((prev) => prev.map((a) => (a.id === id ? { ...a, statut: 'acquittee' } : a)))
  }

  const triees = [...alertes].sort((a, b) => ordreNiveau[a.niveau] - ordreNiveau[b.niveau])

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
            <option>Tous les statuts</option>
            {Object.values(statutLabel).map((label) => (
              <option key={label}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-2.5 overflow-auto">
        {triees.map((alerte) => (
          <div
            key={alerte.id}
            className={`flex items-center justify-between gap-3.5 rounded-lg border border-l-4 border-[#d8ded9] bg-white p-3.5 shadow-sm ${niveauStyle[alerte.niveau].bordure}`}
          >
            <div className="grid gap-1">
              <div className="flex items-center gap-2">
                <span className={`inline-flex min-h-[24px] items-center rounded-full px-2 text-xs font-bold ${niveauStyle[alerte.niveau].badge}`}>
                  {niveauStyle[alerte.niveau].label}
                </span>
                <span className="text-xs text-[#65706a]">{typeLabel[alerte.type]}</span>
                <span className="text-xs text-[#65706a]">{alerte.horodatage}</span>
              </div>
              <p className="m-0 text-sm text-[#17201b]">{alerte.message}</p>
              <span className="text-xs text-[#65706a]">Statut : {statutLabel[alerte.statut]}</span>
            </div>
            {alerte.statut === 'active' && (
              <button
                onClick={() => acquitter(alerte.id)}
                className="h-9 shrink-0 rounded-lg border border-[#d8ded9] bg-white px-3 text-sm text-[#17201b]"
              >
                Acquitter
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
