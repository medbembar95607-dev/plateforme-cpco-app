import { useEffect, useState } from 'react'
import { api, type CourrierDTO } from '../../api/client'

const origineLabel: Record<string, string> = {
  subordonne: 'Subordonné',
  ministere_defense: 'Ministère de la Défense',
  institution_externe: 'Institution externe',
}
const origineStyle: Record<string, string> = {
  subordonne: 'bg-blue-50 text-blue-700',
  ministere_defense: 'bg-red-50 text-red-700',
  institution_externe: 'bg-purple-50 text-purple-700',
}

const typeLabel: Record<string, string> = {
  note: 'Note',
  message: 'Message',
  fiche: 'Fiche',
  rapport: 'Rapport',
  compte_rendu: 'Compte rendu',
  lettre: 'Lettre',
}

const prioriteLabel: Record<string, { label: string; badge: string }> = {
  normal: { label: 'Normal', badge: 'bg-gray-100 text-gray-700' },
  urgent: { label: 'Urgent', badge: 'bg-amber-50 text-amber-700' },
  tres_urgent: { label: 'Très urgent', badge: 'bg-red-50 text-red-700' },
}

const statutLabel: Record<string, { label: string; badge: string }> = {
  nouveau: { label: 'Nouveau', badge: 'bg-gray-100 text-gray-700' },
  annote: { label: 'Annoté', badge: 'bg-blue-50 text-blue-700' },
  oriente: { label: 'Orienté', badge: 'bg-purple-50 text-purple-700' },
  classe_sans_suite: { label: 'Classé sans suite', badge: 'bg-gray-100 text-gray-500' },
  traite: { label: 'Traité', badge: 'bg-emerald-50 text-emerald-700' },
}

const destinations = [
  'Officier opérations (OPS)',
  'Officier renseignement (RENS)',
  'Officier logistique (LOG)',
  'Administration',
  'Chef Division',
  'Directeur',
  'Ministère de la Défense',
  'CMGAA',
  'Externe',
]

const decisions = ["Accord", "M'en parler", 'Rejet', 'Pour information', 'À compléter']

function estEnRetard(c: CourrierDTO): boolean {
  if (!c.dateLimiteReponse) return false
  if (c.statut === 'traite' || c.statut === 'classe_sans_suite') return false
  return new Date(c.dateLimiteReponse).getTime() < Date.now()
}

export function CourrierScreen() {
  const [courriers, setCourriers] = useState<CourrierDTO[]>([])
  const [selectionneId, setSelectionneId] = useState<string | null>(null)
  const [brouillonAnnotation, setBrouillonAnnotation] = useState('')
  const [decision, setDecision] = useState('')
  const [destination, setDestination] = useState(destinations[0])

  function charger() {
    api.courriers().then((data) => {
      setCourriers(data)
      setSelectionneId((courant) => courant ?? data[0]?.id ?? null)
    })
  }

  useEffect(() => {
    charger()
  }, [])

  const selectionne = courriers.find((c) => c.id === selectionneId) ?? null

  useEffect(() => {
    setBrouillonAnnotation(selectionne?.annotation ?? '')
    setDecision('')
  }, [selectionne?.id, selectionne?.annotation])

  const aTraiter = courriers.filter((c) => c.statut !== 'traite' && c.statut !== 'classe_sans_suite').length

  function choisirDecision(valeur: string) {
    setDecision(valeur)
    setBrouillonAnnotation((prev) => {
      const sansDecision = prev.replace(/^\[[^\]]+\]\s*/, '')
      return valeur ? `[${valeur}] ${sansDecision}` : sansDecision
    })
  }

  async function enregistrerAnnotation() {
    if (!selectionne) return
    await api.annoterCourrier(selectionne.id, brouillonAnnotation)
    charger()
  }

  async function orienter() {
    if (!selectionne) return
    await api.orienterCourrier(selectionne.id, destination)
    charger()
  }

  async function classerSansSuite() {
    if (!selectionne) return
    await api.classerCourrier(selectionne.id)
    charger()
  }

  async function marquerTraite() {
    if (!selectionne) return
    await api.traiterCourrier(selectionne.id)
    charger()
  }

  async function genererOrdre() {
    if (!selectionne) return
    await api.genererOrdreDepuisCourrier(selectionne.id)
    charger()
  }

  return (
    <section className="grid min-h-0 grid-rows-[auto_1fr] gap-3.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <select className="h-[38px] rounded-lg border border-[#d8ded9] bg-white px-2.5">
            <option>Toutes origines</option>
            {Object.values(origineLabel).map((label) => (
              <option key={label}>{label}</option>
            ))}
          </select>
          <select className="h-[38px] rounded-lg border border-[#d8ded9] bg-white px-2.5">
            <option>Toutes priorités</option>
            {Object.values(prioriteLabel).map((s) => (
              <option key={s.label}>{s.label}</option>
            ))}
          </select>
          <span className="inline-flex min-h-[26px] items-center rounded-full bg-red-50 px-2.5 text-xs font-bold text-red-700">
            {aTraiter} à traiter
          </span>
        </div>
      </div>

      <div className="grid min-h-0 grid-cols-[1fr_400px] gap-3.5">
        <div className="grid gap-3 overflow-auto">
          {courriers.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectionneId(c.id)}
              className={`grid gap-2 rounded-lg border bg-white p-3.5 text-left shadow-sm ${
                selectionneId === c.id ? 'border-[#17201b]' : estEnRetard(c) ? 'border-red-300' : 'border-[#d8ded9]'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <strong className="text-[#17201b]">{c.numero}</strong>
                  <span className={`inline-flex min-h-[24px] items-center rounded-full px-2 text-xs font-bold ${origineStyle[c.origine]}`}>
                    {origineLabel[c.origine]}
                  </span>
                  {estEnRetard(c) && <span className="text-xs font-bold text-red-600">En retard</span>}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`inline-flex min-h-[24px] items-center rounded-full px-2 text-xs font-bold ${prioriteLabel[c.priorite].badge}`}>
                    {prioriteLabel[c.priorite].label}
                  </span>
                  <span className={`inline-flex min-h-[24px] items-center rounded-full px-2 text-xs font-bold ${statutLabel[c.statut].badge}`}>
                    {statutLabel[c.statut].label}
                  </span>
                </div>
              </div>
              <span className="text-sm text-[#17201b]">{c.objet}</span>
              <span className="text-xs text-[#65706a]">{c.resume}</span>
              <span className="text-xs text-[#65706a]">
                {typeLabel[c.typeDocument]} · {c.expediteur}
              </span>
            </button>
          ))}
        </div>

        <aside className="grid content-start gap-3.5 overflow-auto rounded-lg border border-[#d8ded9] bg-white p-3.5 shadow-sm">
          {selectionne ? (
            <>
              <div>
                <span className="inline-flex rounded-md bg-[#fff0cf] px-1.5 py-1 text-xs font-bold text-[#7c5108]">
                  {selectionne.classification}
                </span>
                <h3 className="mt-2 text-lg text-[#17201b]">{selectionne.objet}</h3>
                <p className="text-sm text-[#65706a]">
                  {selectionne.expediteur} · {new Date(selectionne.dateReception).toLocaleString('fr-FR')}
                </p>
              </div>
              <p className="rounded-lg bg-[#eef2ed] p-2.5 text-sm text-[#17201b]">{selectionne.resume}</p>
              <p className="text-sm text-[#17201b]">{selectionne.contenu}</p>

              <div className="grid gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wide text-[#65706a]" htmlFor="annotation">
                  Annotation du chef
                </label>
                <div className="rounded-lg border border-[#d8ded9]">
                  <select
                    id="decision"
                    value={decision}
                    onChange={(e) => choisirDecision(e.target.value)}
                    className="h-9 w-full border-b border-[#d8ded9] bg-transparent px-2 text-sm"
                  >
                    <option value="">Décision…</option>
                    {decisions.map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                  <textarea
                    id="annotation"
                    rows={3}
                    value={brouillonAnnotation}
                    onChange={(e) => setBrouillonAnnotation(e.target.value)}
                    placeholder="Instruction, décision, orientation…"
                    className="w-full border-0 p-2 text-sm outline-none"
                  />
                </div>
                {selectionne.annotePar && (
                  <span className="text-xs text-[#65706a]">
                    Dernière annotation par {selectionne.annotePar}
                    {selectionne.dateAnnotation ? ` — ${new Date(selectionne.dateAnnotation).toLocaleString('fr-FR')}` : ''}
                  </span>
                )}
                <button onClick={enregistrerAnnotation} className="h-9 rounded-lg border border-sky-400 bg-sky-400 px-3 text-sm text-[#17201b]">
                  Enregistrer l'annotation
                </button>
              </div>

              <div className="grid gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wide text-[#65706a]" htmlFor="orientation">
                  Orienter vers
                </label>
                <div className="flex gap-2">
                  <select
                    id="orientation"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="h-9 flex-1 rounded-lg border border-[#d8ded9] px-2 text-sm"
                  >
                    {destinations.map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                  <button onClick={orienter} className="h-9 shrink-0 rounded-lg border border-blue-700 bg-blue-600 px-3 text-sm text-white">
                    Orienter
                  </button>
                </div>
                {selectionne.orienteVers && <span className="text-xs text-[#65706a]">Actuellement orienté vers : {selectionne.orienteVers}</span>}
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={genererOrdre}
                  disabled={!!selectionne.ordreGenereId}
                  className="h-9 rounded-lg border border-violet-700 bg-violet-600 px-3 text-sm text-white disabled:opacity-50"
                >
                  {selectionne.ordreGenereId ? 'Ordre déjà généré' : 'Générer un ordre'}
                </button>
                <button onClick={marquerTraite} className="h-9 rounded-lg border border-emerald-700 bg-emerald-600 px-3 text-sm text-white">
                  Marquer traité
                </button>
                <button onClick={classerSansSuite} className="h-9 rounded-lg border border-gray-500 bg-gray-400 px-3 text-sm text-white">
                  Classer sans suite
                </button>
              </div>
            </>
          ) : (
            <p className="text-sm text-[#65706a]">Sélectionnez un courrier pour l'ouvrir.</p>
          )}
        </aside>
      </div>
    </section>
  )
}
