import { useEffect, useState } from 'react'
import { KpiRow, type ToniteKpi } from '../KpiRow'
import { api, type SuiviExecutionDTO } from '../../api/client'
import { classificationLabel } from '../../types'
import type { Classification } from '../../types'

const typeOrdreLabel: Record<string, string> = {
  OPORD: 'OPORD',
  FRAGO: 'FRAGO',
  WARNO: 'WARNO',
  INSTRUCTION: 'Instruction',
}

const statutStyle: Record<string, { label: string; badge: string }> = {
  en_attente: { label: 'En attente', badge: 'bg-gray-100 text-gray-700' },
  en_cours: { label: 'En cours', badge: 'bg-blue-50 text-blue-700' },
  execute: { label: 'Exécuté', badge: 'bg-emerald-50 text-emerald-700' },
}

function formaterDate(iso: string) {
  return new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

type Filtre = 'toutes' | 'en_retard' | 'en_attente' | 'en_cours' | 'execute'

export function SuiviExecutionScreen() {
  const [suivi, setSuivi] = useState<SuiviExecutionDTO[]>([])
  const [indicateurs, setIndicateurs] = useState<{
    tauxExecutionPct: number
    enRetard: number
    enCours: number
    enAttente: number
    executesATemps: number
    total: number
  } | null>(null)
  const [filtre, setFiltre] = useState<Filtre>('toutes')
  const [selectionneId, setSelectionneId] = useState<string | null>(null)
  const [compteRenduBrouillon, setCompteRenduBrouillon] = useState('')

  function charger() {
    api.suiviExecution().then((data) => {
      setSuivi(data)
      setSelectionneId((courant) => courant ?? data[0]?.id ?? null)
    })
    api.suiviExecutionIndicateurs().then(setIndicateurs)
  }

  useEffect(() => {
    charger()
  }, [])

  const selectionne = suivi.find((s) => s.id === selectionneId) ?? null

  useEffect(() => {
    setCompteRenduBrouillon('')
  }, [selectionneId])

  async function demarrer(id: string) {
    await api.demarrerExecution(id)
    charger()
  }

  async function executer(id: string) {
    if (!compteRenduBrouillon.trim()) return
    await api.executerSuivi(id, compteRenduBrouillon.trim())
    setCompteRenduBrouillon('')
    charger()
  }

  const suiviFiltre = suivi.filter((s) => {
    if (filtre === 'toutes') return true
    if (filtre === 'en_retard') return s.enRetard
    return s.statut === filtre
  })

  const tauxPct = indicateurs?.tauxExecutionPct ?? 0
  const tonaliteTaux: ToniteKpi = tauxPct >= 70 ? 'succes' : tauxPct >= 40 ? 'alerte' : 'danger'
  const enRetardCount = indicateurs?.enRetard ?? 0

  const kpis: Array<{ label: string; valeur: string; note: string; tonalite: ToniteKpi }> = [
    { label: "Taux d'exécution", valeur: `${indicateurs?.tauxExecutionPct ?? '—'}%`, note: `${indicateurs?.total ?? 0} ordres/instructions suivis`, tonalite: tonaliteTaux },
    { label: 'En retard', valeur: String(indicateurs?.enRetard ?? '—'), note: 'délai dépassé', tonalite: enRetardCount > 0 ? 'danger' : 'succes' },
    { label: 'En cours', valeur: String(indicateurs?.enCours ?? '—'), note: 'exécution démarrée', tonalite: 'info' },
    { label: 'En attente', valeur: String(indicateurs?.enAttente ?? '—'), note: 'pas encore démarré', tonalite: 'neutre' },
    { label: 'Exécutés à temps', valeur: String(indicateurs?.executesATemps ?? '—'), note: 'dans les délais', tonalite: 'succes' },
  ]

  return (
    <section className="grid min-h-0 grid-rows-[auto_auto_1fr] gap-3.5">
      <KpiRow kpis={kpis} />

      <div className="flex flex-wrap gap-1.5">
        {(
          [
            ['toutes', 'Toutes'],
            ['en_retard', 'En retard'],
            ['en_attente', 'En attente'],
            ['en_cours', 'En cours'],
            ['execute', 'Exécutées'],
          ] as [Filtre, string][]
        ).map(([valeur, label]) => (
          <button
            key={valeur}
            onClick={() => setFiltre(valeur)}
            className={`h-9 rounded-lg px-3 text-sm ${filtre === valeur ? 'bg-blue-600 text-white' : 'border border-[#d8ded9] bg-white text-[#17201b]'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid min-h-0 grid-cols-[1fr_400px] gap-3.5">
        <div className="grid gap-2.5 overflow-auto">
          {suiviFiltre.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectionneId(s.id)}
              className={`grid gap-1.5 rounded-lg border bg-white p-3 text-left shadow-sm ${
                selectionneId === s.id ? 'border-[#17201b]' : s.enRetard ? 'border-red-300' : 'border-[#d8ded9]'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <strong className="text-[#17201b]">{s.reference}</strong>
                  <span className="inline-flex min-h-[22px] items-center rounded-full bg-blue-50 px-2 text-xs font-bold text-blue-700">
                    {typeOrdreLabel[s.typeOrdre] ?? s.typeOrdre}
                  </span>
                </div>
                <span className={`inline-flex min-h-[24px] items-center rounded-full px-2 text-xs font-bold ${statutStyle[s.statut]?.badge}`}>
                  {statutStyle[s.statut]?.label}
                </span>
              </div>
              <span className="text-sm text-[#17201b]">{s.objet}</span>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-[#65706a]">{s.uniteNom}</span>
                <span className={`text-xs font-bold ${s.enRetard ? 'text-red-700' : 'text-[#65706a]'}`}>
                  {s.enRetard ? 'Délai dépassé — ' : 'Échéance : '}
                  {formaterDate(s.dateLimite)}
                </span>
              </div>
            </button>
          ))}
          {suiviFiltre.length === 0 && <p className="text-sm text-[#65706a]">Aucun ordre/instruction pour ce filtre.</p>}
        </div>

        <aside className="grid content-start gap-3 overflow-auto rounded-lg border border-[#d8ded9] bg-white p-3.5 shadow-sm">
          {selectionne ? (
            <>
              <div>
                <span className="inline-flex rounded-md bg-[#fff0cf] px-1.5 py-1 text-xs font-bold text-[#7c5108]">
                  {classificationLabel[selectionne.classification as Classification]}
                </span>
                <h3 className="mt-2 text-lg text-[#17201b]">{selectionne.reference}</h3>
                <p className="text-sm text-[#65706a]">{selectionne.objet}</p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-lg bg-[#eef2ed] p-2.5">
                  <span className="mb-1 block text-xs text-[#65706a]">Unité destinataire</span>
                  <strong className="text-[#17201b]">{selectionne.uniteNom}</strong>
                </div>
                <div className="rounded-lg bg-[#eef2ed] p-2.5">
                  <span className="mb-1 block text-xs text-[#65706a]">Statut</span>
                  <strong className="text-[#17201b]">{statutStyle[selectionne.statut]?.label}</strong>
                </div>
                <div className="rounded-lg bg-[#eef2ed] p-2.5">
                  <span className="mb-1 block text-xs text-[#65706a]">Émis le</span>
                  <strong className="text-[#17201b]">{formaterDate(selectionne.dateEmission)}</strong>
                </div>
                <div className={`rounded-lg p-2.5 ${selectionne.enRetard ? 'bg-red-50' : 'bg-[#eef2ed]'}`}>
                  <span className={`mb-1 block text-xs ${selectionne.enRetard ? 'text-red-700' : 'text-[#65706a]'}`}>Délai</span>
                  <strong className={selectionne.enRetard ? 'text-red-700' : 'text-[#17201b]'}>{formaterDate(selectionne.dateLimite)}</strong>
                </div>
              </div>

              <div>
                <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-[#65706a]">Instruction</span>
                <p className="m-0 text-sm text-[#17201b]">{selectionne.instruction}</p>
                <span className="mt-1 block text-xs text-[#65706a]">Émetteur : {selectionne.emetteur}</span>
              </div>

              {selectionne.statut === 'execute' && (
                <div className="rounded-lg bg-emerald-50 p-2.5">
                  <span className="mb-1 block text-xs font-bold text-emerald-700">
                    Compte rendu — exécuté le {selectionne.dateExecution ? formaterDate(selectionne.dateExecution) : '—'}
                  </span>
                  <p className="m-0 text-sm text-[#17201b]">{selectionne.compteRendu}</p>
                </div>
              )}

              {selectionne.statut === 'en_attente' && (
                <button onClick={() => demarrer(selectionne.id)} className="h-10 rounded-lg border border-[#17201b] bg-[#17201b] px-3.5 text-white">
                  Démarrer l'exécution
                </button>
              )}

              {selectionne.statut === 'en_cours' && (
                <div className="grid gap-2">
                  <label className="text-xs font-bold uppercase tracking-wide text-[#65706a]" htmlFor="compte-rendu">
                    Compte rendu d'exécution
                  </label>
                  <textarea
                    id="compte-rendu"
                    value={compteRenduBrouillon}
                    onChange={(e) => setCompteRenduBrouillon(e.target.value)}
                    placeholder="Décrire ce qui a été fait, les difficultés rencontrées, le résultat obtenu..."
                    className="min-h-[100px] rounded-lg border border-[#d8ded9] p-2.5 text-sm"
                  />
                  <button
                    onClick={() => executer(selectionne.id)}
                    disabled={!compteRenduBrouillon.trim()}
                    className="h-10 rounded-lg border border-emerald-700 bg-emerald-600 px-3.5 text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Marquer exécuté
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-[#65706a]">Sélectionnez un ordre ou une instruction pour afficher son détail.</p>
          )}
        </aside>
      </div>
    </section>
  )
}
