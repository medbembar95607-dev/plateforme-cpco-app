import { useEffect, useState } from 'react'
import { api, type IndicateursBudgetDTO, type LigneBudgetaireDTO } from '../../api/client'

const typeBudgetLabel: Record<string, string> = {
  fonctionnement: 'Fonctionnement',
  investissement: 'Investissement',
}

const statutStyle: Record<string, { label: string; badge: string }> = {
  normal: { label: 'Normal', badge: 'bg-emerald-50 text-emerald-700' },
  attention: { label: 'Approche du seuil', badge: 'bg-amber-50 text-amber-700' },
  depassement: { label: 'Dépassement', badge: 'bg-red-50 text-red-700' },
}

function formaterMontant(montant: number) {
  return `${(montant / 1_000_000).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} M MRU`
}

function couleurBarre(pct: number) {
  if (pct > 100) return 'bg-red-600'
  if (pct >= 80) return 'bg-amber-500'
  return 'bg-emerald-600'
}

function Barre({ pct }: { pct: number }) {
  return (
    <div className="h-[9px] w-[120px] overflow-hidden rounded-full bg-[#e5e9e5]">
      <div className={`h-full ${couleurBarre(pct)}`} style={{ width: `${Math.min(pct, 100)}%` }} />
    </div>
  )
}

type TypeBudget = 'fonctionnement' | 'investissement'

export function VoletFinancierScreen() {
  const [lignes, setLignes] = useState<LigneBudgetaireDTO[]>([])
  const [indicateurs, setIndicateurs] = useState<IndicateursBudgetDTO | null>(null)
  const [typeFiltre, setTypeFiltre] = useState<TypeBudget>('fonctionnement')

  useEffect(() => {
    api.budget().then(setLignes)
    api.budgetIndicateurs().then(setIndicateurs)
  }, [])

  const lignesFiltrees = lignes.filter((l) => l.typeBudget === typeFiltre)

  return (
    <section className="grid min-h-0 grid-rows-[auto_auto_1fr] gap-3.5">
      <div className="grid grid-cols-6 gap-3 rounded-lg bg-amber-100 p-3">
        <div className="rounded-lg bg-white p-2.5 shadow-sm">
          <span className="block text-xs text-[#65706a]">Budget global alloué</span>
          <strong className="text-xl text-[#17201b]">{indicateurs ? formaterMontant(indicateurs.budgetGlobalAlloue) : '—'}</strong>
        </div>
        <div className="rounded-lg bg-white p-2.5 shadow-sm">
          <span className="block text-xs text-[#65706a]">Budget global consommé</span>
          <strong className="text-xl text-[#17201b]">{indicateurs ? formaterMontant(indicateurs.budgetGlobalConsomme) : '—'}</strong>
        </div>
        <div className="rounded-lg bg-white p-2.5 shadow-sm">
          <span className="block text-xs text-[#65706a]">Taux de consommation</span>
          <strong className="text-xl text-[#17201b]">{indicateurs?.tauxConsommationGlobalPct ?? '—'}%</strong>
        </div>
        <div className="rounded-lg bg-white p-2.5 shadow-sm">
          <span className="block text-xs text-[#65706a]">Fonctionnement</span>
          <strong className="text-xl text-[#17201b]">{indicateurs ? formaterMontant(indicateurs.parType.fonctionnement.montantConsomme) : '—'}</strong>
          <span className="block text-xs text-[#65706a]">/ {indicateurs ? formaterMontant(indicateurs.parType.fonctionnement.montantAlloue) : '—'}</span>
        </div>
        <div className="rounded-lg bg-white p-2.5 shadow-sm">
          <span className="block text-xs text-[#65706a]">Investissement</span>
          <strong className="text-xl text-[#17201b]">{indicateurs ? formaterMontant(indicateurs.parType.investissement.montantConsomme) : '—'}</strong>
          <span className="block text-xs text-[#65706a]">/ {indicateurs ? formaterMontant(indicateurs.parType.investissement.montantAlloue) : '—'}</span>
        </div>
        <div className="rounded-lg bg-red-50 p-2.5 shadow-sm">
          <span className="block text-xs text-red-700">Dépassements / Alertes</span>
          <strong className="text-xl text-red-700">
            {indicateurs?.nombreDepassements ?? '—'} / {indicateurs?.nombreAttentions ?? '—'}
          </strong>
        </div>
      </div>

      <div className="flex gap-1.5">
        {(['fonctionnement', 'investissement'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTypeFiltre(t)}
            className={`flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm ${
              typeFiltre === t ? 'bg-[#17201b] text-white' : 'border border-[#d8ded9] bg-white text-[#17201b]'
            }`}
          >
            {typeBudgetLabel[t]}
            {lignes.some((l) => l.typeBudget === t && l.statut !== 'normal') && <span className="h-2 w-2 rounded-full bg-red-600" />}
          </button>
        ))}
      </div>

      <div className="overflow-auto rounded-lg border border-[#d8ded9] bg-white shadow-sm">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-[#f8faf7] text-xs text-[#65706a]">
              <th className="border-b border-[#d8ded9] px-3 py-3 text-left">Libellé</th>
              <th className="border-b border-[#d8ded9] px-3 py-3 text-left">Formation bénéficiaire</th>
              <th className="border-b border-[#d8ded9] px-3 py-3 text-left">Alloué</th>
              <th className="border-b border-[#d8ded9] px-3 py-3 text-left">Consommé</th>
              <th className="border-b border-[#d8ded9] px-3 py-3 text-left">Taux</th>
              <th className="border-b border-[#d8ded9] px-3 py-3 text-left">État</th>
            </tr>
          </thead>
          <tbody>
            {lignesFiltrees.map((l) => (
              <tr key={l.id} className={l.statut !== 'normal' ? 'bg-red-50/40' : undefined}>
                <td className="border-b border-[#d8ded9] px-3 py-3">{l.libelle}</td>
                <td className="border-b border-[#d8ded9] px-3 py-3">{l.formationBeneficiaire}</td>
                <td className="border-b border-[#d8ded9] px-3 py-3 text-[#65706a]">{formaterMontant(l.montantAlloue)}</td>
                <td className="border-b border-[#d8ded9] px-3 py-3 font-bold text-[#17201b]">{formaterMontant(l.montantConsomme)}</td>
                <td className="border-b border-[#d8ded9] px-3 py-3">
                  <div className="flex items-center gap-2">
                    <Barre pct={l.tauxConsommationPct} />
                    <span className="text-xs text-[#65706a]">{l.tauxConsommationPct}%</span>
                  </div>
                </td>
                <td className="border-b border-[#d8ded9] px-3 py-3">
                  <span className={`inline-flex min-h-[24px] items-center rounded-full px-2 text-xs font-bold ${statutStyle[l.statut]?.badge ?? 'bg-gray-100 text-gray-700'}`}>
                    {statutStyle[l.statut]?.label ?? l.statut}
                  </span>
                </td>
              </tr>
            ))}
            {lignesFiltrees.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-sm text-[#65706a]">
                  Aucune ligne budgétaire pour ce filtre.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
