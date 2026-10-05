import { useEffect, useState } from 'react'
import { MapPin } from 'lucide-react'
import { api } from '../../api/client'
import { lireFocus } from '../../focusDemo'
import type { RapportRensDTO } from '../../api/client'
import { classificationLabel } from '../../types'
import type { Classification } from '../../types'
import { useRoleActif } from '../../useRoleActif'
import { RenseignementMap } from '../map/RenseignementMap'

const statutStyle: Record<string, { label: string; badge: string; action: string }> = {
  menace: { label: 'Menace', badge: 'bg-red-50 text-red-700', action: 'Confirmer menace' },
  observation: { label: 'Observation', badge: 'bg-amber-50 text-amber-700', action: 'Repasser en observation' },
  stabilise: { label: 'Stabilisé', badge: 'bg-emerald-50 text-emerald-700', action: 'Stabiliser' },
}

// Cotation OTAN (code amirauté).
const fiabiliteLabel: Record<string, string> = {
  A: 'Totalement fiable',
  B: 'Habituellement fiable',
  C: 'Assez fiable',
  D: 'Pas toujours fiable',
  E: 'Peu fiable',
  F: 'Fiabilité inconnue',
}
const credibiliteLabel: Record<number, string> = {
  1: 'Confirmée',
  2: 'Probablement vraie',
  3: 'Possiblement vraie',
  4: 'Douteuse',
  5: 'Improbable',
  6: 'Non évaluable',
}

function cotationClasse(r: Pick<RapportRensDTO, 'fiabilite_source' | 'credibilite_info'>): string {
  const score = 'ABCDEF'.indexOf(r.fiabilite_source) + r.credibilite_info
  if (score <= 3) return 'border-emerald-600 text-emerald-700'
  if (score <= 5) return 'border-amber-600 text-amber-700'
  return 'border-[#65706a] text-[#65706a]'
}

const ROLES_RENSEIGNEMENT = ['officier_renseignement', 'commandement', 'administrateur']
const selectClasse = 'h-[38px] rounded-lg border border-[#d8ded9] bg-white px-2.5'
const champClasse = 'w-full rounded-lg border border-[#d8ded9] bg-white px-2.5 py-2 text-sm outline-none focus:border-[#17201b]'
const libelleClasse = 'mb-1 block text-xs font-bold text-[#65706a]'

const brouillonVide = {
  type_renseignement: 'HUMINT',
  classification: 'confidentiel',
  titre: '',
  resume: '',
  fiabilite_source: 'B',
  credibilite_info: 2,
  statut: 'observation',
}

export function RenseignementScreen() {
  const role = useRoleActif()
  const peutRediger = role !== null && ROLES_RENSEIGNEMENT.includes(role)

  const [rapports, setRapports] = useState<RapportRensDTO[]>([])
  const [filtreClassification, setFiltreClassification] = useState('')
  const [filtreFiabilite, setFiltreFiabilite] = useState('')
  const [filtreStatut, setFiltreStatut] = useState('')
  // Élément créé depuis l'écran de démonstration : sélectionné à l'arrivée.
  const [selectionId, setSelectionId] = useState<string | null>(() => lireFocus('renseignement'))
  const [erreur, setErreur] = useState<string | null>(null)

  const [redaction, setRedaction] = useState(false)
  const [brouillon, setBrouillon] = useState(brouillonVide)
  const [position, setPosition] = useState<{ lon: number; lat: number } | null>(null)
  const [modePlacement, setModePlacement] = useState(false)
  const [enCours, setEnCours] = useState(false)

  useEffect(() => {
    api.intelligenceReports().then(setRapports)
  }, [])

  const rapportsFiltres = rapports.filter(
    (r) =>
      (!filtreClassification || r.classification === filtreClassification) &&
      (!filtreFiabilite || r.fiabilite_source === filtreFiabilite) &&
      (!filtreStatut || r.statut === filtreStatut),
  )

  function ouvrirRedaction() {
    setBrouillon(brouillonVide)
    setPosition(null)
    setErreur(null)
    setRedaction(true)
  }

  function fermerRedaction() {
    setRedaction(false)
    setModePlacement(false)
    setPosition(null)
  }

  async function enregistrer() {
    setEnCours(true)
    setErreur(null)
    try {
      const rapport = await api.creerRapport({ ...brouillon, lon: position?.lon ?? null, lat: position?.lat ?? null })
      setRapports((prev) => [rapport, ...prev])
      fermerRedaction()
      setSelectionId(rapport.id)
    } catch (err) {
      setErreur(err instanceof Error ? err.message : String(err))
    } finally {
      setEnCours(false)
    }
  }

  async function changerStatut(id: string, statut: string) {
    setErreur(null)
    try {
      const rapport = await api.changerStatutRapport(id, statut)
      setRapports((prev) => prev.map((r) => (r.id === id ? rapport : r)))
    } catch (err) {
      setErreur(err instanceof Error ? err.message : String(err))
    }
  }

  return (
    <section className="grid min-h-0 grid-rows-[auto_1fr] gap-3.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <select aria-label="Classification" value={filtreClassification} onChange={(e) => setFiltreClassification(e.target.value)} className={selectClasse}>
            <option value="">Classification : toutes</option>
            {Object.entries(classificationLabel).map(([valeur, label]) => (
              <option key={valeur} value={valeur}>
                {label}
              </option>
            ))}
          </select>
          <select aria-label="Fiabilité source" value={filtreFiabilite} onChange={(e) => setFiltreFiabilite(e.target.value)} className={selectClasse}>
            <option value="">Fiabilité source : toutes</option>
            {Object.entries(fiabiliteLabel).map(([lettre, label]) => (
              <option key={lettre} value={lettre}>
                {lettre} - {label}
              </option>
            ))}
          </select>
          <select aria-label="Statut" value={filtreStatut} onChange={(e) => setFiltreStatut(e.target.value)} className={selectClasse}>
            <option value="">Statut : tous</option>
            {Object.entries(statutStyle).map(([valeur, s]) => (
              <option key={valeur} value={valeur}>
                {s.label}
              </option>
            ))}
          </select>
          <span className="text-xs text-[#65706a]">
            {rapportsFiltres.length} rapport(s) · {rapports.filter((r) => r.statut === 'menace').length} menace(s)
          </span>
        </div>
        <button
          onClick={ouvrirRedaction}
          disabled={!peutRediger || redaction}
          title={peutRediger ? '' : 'Réservé à la cellule renseignement et au commandement'}
          className="h-10 rounded-lg border border-[#17201b] bg-[#17201b] px-3.5 text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Nouveau rapport
        </button>
      </div>

      <div className="grid min-h-0 grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] items-start gap-3.5">
        <div className="grid content-start gap-3">
          {erreur && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</div>}

          {redaction && (
            <div className="grid gap-3 rounded-lg border-2 border-[#17201b] bg-white p-3.5 shadow-sm">
              <h3 className="m-0 text-[15px] text-[#17201b]">Nouveau rapport de renseignement</h3>
              <div>
                <label className={libelleClasse}>Titre</label>
                <input value={brouillon.titre} onChange={(e) => setBrouillon({ ...brouillon, titre: e.target.value })} placeholder="Ex. Regroupement suspect au nord de Bassikounou" className={champClasse} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className={libelleClasse}>Source</label>
                  <select value={brouillon.type_renseignement} onChange={(e) => setBrouillon({ ...brouillon, type_renseignement: e.target.value })} className={champClasse}>
                    {['HUMINT', 'SIGINT', 'OSINT', 'IMINT'].map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={libelleClasse}>Classification</label>
                  <select value={brouillon.classification} onChange={(e) => setBrouillon({ ...brouillon, classification: e.target.value })} className={champClasse}>
                    {Object.entries(classificationLabel).map(([valeur, label]) => (
                      <option key={valeur} value={valeur}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={libelleClasse}>Évaluation</label>
                  <select value={brouillon.statut} onChange={(e) => setBrouillon({ ...brouillon, statut: e.target.value })} className={champClasse}>
                    {Object.entries(statutStyle).map(([valeur, s]) => (
                      <option key={valeur} value={valeur}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={libelleClasse}>Fiabilité de la source</label>
                  <select value={brouillon.fiabilite_source} onChange={(e) => setBrouillon({ ...brouillon, fiabilite_source: e.target.value })} className={champClasse}>
                    {Object.entries(fiabiliteLabel).map(([lettre, label]) => (
                      <option key={lettre} value={lettre}>
                        {lettre} - {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={libelleClasse}>Crédibilité de l'information</label>
                  <select value={brouillon.credibilite_info} onChange={(e) => setBrouillon({ ...brouillon, credibilite_info: Number(e.target.value) })} className={champClasse}>
                    {Object.entries(credibiliteLabel).map(([chiffre, label]) => (
                      <option key={chiffre} value={chiffre}>
                        {chiffre} - {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className={libelleClasse}>Résumé</label>
                <textarea value={brouillon.resume} onChange={(e) => setBrouillon({ ...brouillon, resume: e.target.value })} rows={3} placeholder="Effectifs, attitude, direction, corrélations..." className={`${champClasse} resize-none`} />
              </div>
              <div className="flex items-center gap-2">
                <span className={`flex-1 text-sm ${position ? 'text-[#17201b]' : 'text-[#65706a]'}`}>
                  {position ? `Position : ${position.lat.toFixed(3)}° N, ${Math.abs(position.lon).toFixed(3)}° O` : 'Non localisé (facultatif)'}
                </span>
                <button onClick={() => setModePlacement(true)} className="flex items-center gap-1.5 rounded-lg border border-[#d8ded9] px-3 py-1.5 text-sm">
                  <MapPin size={14} /> {position ? 'Déplacer' : 'Localiser sur la carte'}
                </button>
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={fermerRedaction} className="rounded-lg border border-[#d8ded9] px-3 py-2 text-sm">
                  Annuler
                </button>
                <button
                  onClick={enregistrer}
                  disabled={!brouillon.titre.trim() || enCours}
                  className="rounded-lg border border-[#17201b] bg-[#17201b] px-3 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {enCours ? 'Enregistrement…' : 'Enregistrer le rapport'}
                </button>
              </div>
            </div>
          )}

          {rapportsFiltres.length === 0 && !redaction && <p className="text-sm text-[#65706a]">Aucun rapport ne correspond aux filtres.</p>}

          {rapportsFiltres.map((rapport) => {
            const style = statutStyle[rapport.statut] ?? statutStyle.observation
            return (
              <article
                key={rapport.id}
                onClick={() => setSelectionId(rapport.id)}
                className={`grid cursor-pointer gap-2 rounded-lg border bg-white p-3.5 shadow-sm ${
                  rapport.id === selectionId ? 'border-[#17201b] ring-1 ring-[#17201b]' : 'border-[#d8ded9]'
                }`}
              >
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className={`inline-flex min-h-[26px] items-center rounded-full px-2.5 text-xs font-bold ${style.badge}`}>{style.label}</span>
                  <span
                    title={`${fiabiliteLabel[rapport.fiabilite_source]} / ${credibiliteLabel[rapport.credibilite_info]}`}
                    className={`inline-flex min-h-[24px] items-center rounded border px-1.5 text-xs font-bold ${cotationClasse(rapport)}`}
                  >
                    {rapport.fiabilite_source}
                    {rapport.credibilite_info}
                  </span>
                  <span className="text-xs text-[#65706a]">{rapport.reference}</span>
                  <span className="ml-auto text-xs text-[#65706a]">{new Date(rapport.date_rapport).toLocaleDateString('fr-FR')}</span>
                </div>
                <h3 className="m-0 text-[16px] text-[#17201b]">{rapport.titre}</h3>
                {rapport.resume && <p className="m-0 text-[13px] leading-relaxed text-[#65706a]">{rapport.resume}</p>}
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#65706a]">
                  <span>Classification : {classificationLabel[rapport.classification as Classification]}</span>
                  {rapport.lon === null && <span>· non localisé</span>}
                </div>
                {peutRediger && (
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(statutStyle)
                      .filter(([valeur]) => valeur !== rapport.statut)
                      .map(([valeur, s]) => (
                        <button
                          key={valeur}
                          onClick={(e) => {
                            e.stopPropagation()
                            changerStatut(rapport.id, valeur)
                          }}
                          className="rounded-md border border-[#d8ded9] px-2 py-1 text-xs text-[#17201b] hover:bg-[#f3f5f2]"
                        >
                          {s.action}
                        </button>
                      ))}
                  </div>
                )}
              </article>
            )
          })}
        </div>

        {/* Hauteur calée sur l'écran et collée en haut au défilement : la carte reste visible
            (notamment pour localiser un rapport) quelle que soit la longueur de la liste. */}
        <div className="sticky top-0 h-[calc(100vh-260px)] min-h-[420px]">
          <RenseignementMap
            rapports={rapportsFiltres}
            selectionId={selectionId}
            onSelect={setSelectionId}
            modePlacement={modePlacement}
            positionProvisoire={redaction ? position : null}
            onPlacer={(lon, lat) => {
              setPosition({ lon, lat })
              setModePlacement(false)
            }}
            onAnnulerPlacement={() => setModePlacement(false)}
          />
        </div>
      </div>
    </section>
  )
}
