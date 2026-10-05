import { useEffect, useState } from 'react'
import { ArrowRight, CheckCircle2, Database, FileText, Info, MapPin, Pencil, Plus, Wand2 } from 'lucide-react'
import { api } from '../../api/client'
import type { AnalyseDemoDTO, DocumentDemoDTO, ImpactDemoDTO, NoteDemoDTO, ResultatDemoDTO, SchemaSaisieDTO } from '../../api/client'
import { classificationLabel } from '../../types'
import { definirFocus } from '../../focusDemo'
import { FormulaireImpact } from '../FormulaireImpact'
import { DonneesDemo } from '../DonneesDemo'

const typesDocument: Record<string, string> = {
  note_information: "Note d'information",
  message: 'Message',
  note_service: 'Note de service',
}

const ecranStyle: Record<ImpactDemoDTO['ecran'], { label: string; badge: string }> = {
  incidents: { label: 'Incidents', badge: 'bg-red-50 text-red-700' },
  alertes: { label: 'Alertes', badge: 'bg-amber-50 text-amber-700' },
  renseignement: { label: 'Renseignement', badge: 'bg-violet-50 text-violet-700' },
  logistique: { label: 'Logistique', badge: 'bg-sky-50 text-sky-700' },
  courrier: { label: 'Parapheur Numérique', badge: 'bg-stone-100 text-stone-700' },
  suivi_execution: { label: 'Suivi Exécution Ordres', badge: 'bg-indigo-50 text-indigo-700' },
  calendrier: { label: 'Agenda du Chef', badge: 'bg-teal-50 text-teal-700' },
  materiel: { label: 'Situation Matériel', badge: 'bg-orange-50 text-orange-700' },
  budget: { label: 'Situation Financière', badge: 'bg-emerald-50 text-emerald-700' },
  rh: { label: 'Ressources Humaines', badge: 'bg-pink-50 text-pink-700' },
}

// Documents d'exemple pour enchaîner une démonstration sans avoir à tout taper.
const exemples: Array<{ label: string; doc: DocumentDemoDTO }> = [
  {
    label: 'Tirs près de Fassala',
    doc: {
      type_document: 'note_information',
      emetteur: 'Compagnie Alpha',
      classification: 'secret',
      objet: 'Tirs contre une patrouille près de Fassala',
      texte:
        "Une patrouille de la Compagnie Alpha a essuyé des tirs d'hommes armés à 12 km de Fassala. Deux blessés légers, évacuation demandée. Un pick-up détruit. Besoin urgent de munitions.",
    },
  },
  {
    label: 'Convoi à court de carburant',
    doc: {
      type_document: 'message',
      emetteur: 'Convoi',
      classification: 'confidentiel',
      objet: 'Convoi immobilisé, pénurie de carburant',
      texte:
        'Le Convoi est à court de carburant et de pièces, deux véhicules immobilisés. Coût estimé de la remise en état : 4 millions MRU. Perte de liaison radio intermittente depuis ce matin.',
    },
  },
  {
    label: 'Note de service : stage et réunion',
    doc: {
      type_document: 'note_service',
      emetteur: 'CEMGA',
      classification: 'confidentiel',
      objet: 'Stage de recyclage au tir et réunion de coordination',
      texte:
        'À compter de ce jour, toutes les unités doivent désigner 12 stagiaires pour un stage de recyclage au tir et rendre compte sous 48 h. Réunion de coordination jeudi à 10 h au PC COP.',
    },
  },
]

const documentVide: DocumentDemoDTO = { type_document: 'note_information', emetteur: '', classification: 'confidentiel', objet: '', texte: '' }

const champ = 'w-full rounded-lg border border-[#d8ded9] bg-white px-2.5 py-2 text-sm outline-none focus:border-[#17201b]'
const libelle = 'mb-1 block text-xs font-bold text-[#65706a]'

interface DemoScreenProps {
  onVoir: (ecran: ImpactDemoDTO['ecran'] | 'unites') => void
  onNouveauxEvenements: (evenements: Array<{ titre: string; description: string }>) => void
}

export function DemoScreen({ onVoir, onNouveauxEvenements }: DemoScreenProps) {
  const [doc, setDoc] = useState<DocumentDemoDTO>(documentVide)
  const [onglet, setOnglet] = useState<'document' | 'donnees'>('document')
  const [schema, setSchema] = useState<SchemaSaisieDTO | null>(null)
  const [analyse, setAnalyse] = useState<AnalyseDemoDTO | null>(null)
  // Impacts proposés par l'analyse, corrigés ou complétés à la main avant application.
  const [impacts, setImpacts] = useState<ImpactDemoDTO[]>([])
  const [enEdition, setEnEdition] = useState<string | null>(null)
  const [ajout, setAjout] = useState(false)
  const [retenus, setRetenus] = useState<Set<string>>(new Set())
  const [resultats, setResultats] = useState<ResultatDemoDTO[] | null>(null)
  const [historique, setHistorique] = useState<NoteDemoDTO[]>([])
  const [enCours, setEnCours] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)

  useEffect(() => {
    api.demoHistorique().then(setHistorique)
    api.demoSchema().then(setSchema)
  }, [])

  function modifier(champModifie: Partial<DocumentDemoDTO>) {
    setDoc((d) => ({ ...d, ...champModifie }))
    // Toute modification du document invalide l'analyse précédente.
    setAnalyse(null)
    setResultats(null)
  }

  async function analyser() {
    setEnCours(true)
    setErreur(null)
    setResultats(null)
    try {
      const a = await api.demoAnalyser(doc)
      setAnalyse(a)
      setImpacts(a.impacts)
      setEnEdition(null)
      setAjout(false)
      setRetenus(new Set(a.impacts.map((i) => i.cle)))
    } catch (err) {
      setErreur(err instanceof Error ? err.message : String(err))
    } finally {
      setEnCours(false)
    }
  }

  async function appliquer() {
    if (!analyse) return
    setEnCours(true)
    setErreur(null)
    try {
      const r = await api.demoAppliquer(doc, impacts.filter((i) => retenus.has(i.cle)))
      setResultats(r.resultats)
      onNouveauxEvenements([
        { titre: `${typesDocument[doc.type_document]} reçue`, description: `${doc.objet} (${doc.emetteur})` },
        ...r.resultats.map((x) => ({ titre: x.titre, description: `Mis à jour : écran ${ecranStyle[x.ecran].label}` })),
      ])
      setHistorique(await api.demoHistorique())
    } catch (err) {
      setErreur(err instanceof Error ? err.message : String(err))
    } finally {
      setEnCours(false)
    }
  }

  function voir(resultat: ResultatDemoDTO) {
    definirFocus(resultat.ecran, resultat.focusId)
    onVoir(resultat.ecran)
  }

  function basculer(cle: string) {
    setRetenus((prev) => {
      const s = new Set(prev)
      if (s.has(cle)) s.delete(cle)
      else s.add(cle)
      return s
    })
  }

  function corriger(impact: ImpactDemoDTO) {
    setImpacts((prev) => prev.map((i) => (i.cle === impact.cle ? impact : i)))
    setEnEdition(null)
  }

  function ajouter(impact: ImpactDemoDTO) {
    setImpacts((prev) => [...prev, impact])
    setRetenus((prev) => new Set(prev).add(impact.cle))
    setAjout(false)
  }

  const valide = doc.emetteur.trim() && doc.objet.trim() && doc.texte.trim()

  return (
    <section className="grid gap-3.5">
      <div className="flex items-start gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-900">
        <Info size={15} className="mt-0.5 shrink-0" />
        <span>
          <strong>Écran de démonstration.</strong> Saisissez un document : la plateforme le lit (lieux, unités, thèmes), propose les mises à jour des
          écrans concernés, puis les applique après votre validation. L'analyse repose sur des mots-clés, sans intelligence artificielle : vérifiez
          toujours les impacts proposés.
        </span>
      </div>

      <div className="flex gap-1">
        {[
          { id: 'document' as const, label: 'Analyse de document', icone: <FileText size={15} /> },
          { id: 'donnees' as const, label: 'Données existantes', icone: <Database size={15} /> },
        ].map((o) => (
          <button
            key={o.id}
            onClick={() => setOnglet(o.id)}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
              onglet === o.id ? 'border-[#17201b] bg-[#17201b] text-white' : 'border-[#d8ded9] bg-white text-[#17201b] hover:bg-[#f3f5f2]'
            }`}
          >
            {o.icone} {o.label}
          </button>
        ))}
      </div>

      {onglet === 'donnees' && schema && <DonneesDemo references={schema.references} onVoir={(e) => onVoir(e as ImpactDemoDTO['ecran'])} />}

      {onglet === 'document' && (
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-start gap-3.5">
        {/* 1. Saisie */}
        <div className="grid gap-3 rounded-lg border border-[#d8ded9] bg-white p-3.5 shadow-sm">
          <h3 className="m-0 flex items-center gap-2 text-[15px] text-[#17201b]">
            <FileText size={16} /> 1. Saisie du document
          </h3>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-[#65706a]">Exemples :</span>
            {exemples.map((e) => (
              <button
                key={e.label}
                onClick={() => {
                  setDoc(e.doc)
                  setAnalyse(null)
                  setResultats(null)
                }}
                className="rounded-md border border-[#d8ded9] px-2 py-1 text-xs text-[#17201b] hover:bg-[#f3f5f2]"
              >
                {e.label}
              </button>
            ))}
          </div>
          <div>
            <label className={libelle}>Type de document</label>
            <div className="flex gap-1">
              {Object.entries(typesDocument).map(([valeur, label]) => (
                <button
                  key={valeur}
                  onClick={() => modifier({ type_document: valeur })}
                  className={`flex-1 rounded-lg border px-2 py-2 text-sm ${
                    doc.type_document === valeur ? 'border-[#17201b] bg-[#17201b] text-white' : 'border-[#d8ded9] bg-white text-[#17201b]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={libelle}>Émetteur</label>
              <input
                list="emetteurs-demo"
                value={doc.emetteur}
                onChange={(e) => modifier({ emetteur: e.target.value })}
                placeholder="Unité ou service"
                className={champ}
              />
              <datalist id="emetteurs-demo">
                {['CEMGA', 'PC COP', 'Bataillon 1', 'Compagnie Alpha', 'Convoi', 'Poste Avancé Nord', 'Poste logistique Nord', 'Cellule renseignement'].map((e) => (
                  <option key={e} value={e} />
                ))}
              </datalist>
            </div>
            <div>
              <label className={libelle}>Classification</label>
              <select value={doc.classification} onChange={(e) => modifier({ classification: e.target.value })} className={champ}>
                {Object.entries(classificationLabel).map(([valeur, label]) => (
                  <option key={valeur} value={valeur}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className={libelle}>Objet</label>
            <input value={doc.objet} onChange={(e) => modifier({ objet: e.target.value })} placeholder="Ex. Tirs contre une patrouille près de Fassala" className={champ} />
          </div>
          <div>
            <label className={libelle}>Texte</label>
            <textarea
              value={doc.texte}
              onChange={(e) => modifier({ texte: e.target.value })}
              rows={6}
              placeholder="Faits, lieu, unités concernées, besoins…"
              className={`${champ} resize-none`}
            />
          </div>
          <button
            onClick={analyser}
            disabled={!valide || enCours}
            className="flex items-center justify-center gap-2 rounded-lg border border-[#17201b] bg-[#17201b] px-3 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Wand2 size={15} /> {enCours && !analyse ? 'Analyse…' : 'Analyser le document'}
          </button>
        </div>

        {/* 2. Impacts proposés, puis 3. Changements appliqués */}
        <div className="grid gap-3.5">
          {erreur && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</div>}

          {!analyse && !resultats && (
            <div className="rounded-lg border border-dashed border-[#c9d1cb] bg-white p-6 text-center text-sm text-[#65706a]">
              Saisissez un document ou choisissez un exemple, puis lancez l'analyse : les mises à jour proposées s'afficheront ici.
            </div>
          )}

          {analyse && !resultats && (
            <div className="grid gap-3 rounded-lg border border-[#d8ded9] bg-white p-3.5 shadow-sm">
              <h3 className="m-0 text-[15px] text-[#17201b]">2. Mises à jour proposées · {impacts.length}</h3>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#65706a]">
                <span className="flex items-center gap-1">
                  <MapPin size={13} /> Lieu : <strong className="text-[#17201b]">{analyse.localite}</strong>
                </span>
                <span>
                  Unités citées : <strong className="text-[#17201b]">{analyse.unitesCitees.length ? analyse.unitesCitees.join(', ') : 'aucune'}</strong>
                </span>
                {analyse.urgent && <span className="font-bold text-red-700">Caractère urgent détecté</span>}
              </div>
              <div className="grid gap-2">
                {impacts.length === 0 && (
                  <p className="m-0 text-sm text-[#65706a]">Aucune mise à jour détectée. Vous pouvez en ajouter une manuellement.</p>
                )}
                {impacts.map((i) =>
                  enEdition === i.cle && schema ? (
                    <div key={i.cle} className="grid gap-1.5">
                      <div className="text-xs font-bold text-[#17201b]">Correction : {i.titre}</div>
                      <FormulaireImpact schema={schema} impact={i} onValider={corriger} onAnnuler={() => setEnEdition(null)} />
                    </div>
                  ) : (
                    <div
                      key={i.cle}
                      className={`flex items-start gap-2.5 rounded-lg border p-2.5 ${retenus.has(i.cle) ? 'border-[#17201b] bg-[#f8faf7]' : 'border-[#e2e7e3] opacity-60'}`}
                    >
                      <input type="checkbox" checked={retenus.has(i.cle)} onChange={() => basculer(i.cle)} className="mt-1 cursor-pointer" aria-label={`Retenir ${i.titre}`} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className={`inline-flex min-h-[22px] items-center rounded-full px-2 text-[11px] font-bold ${ecranStyle[i.ecran].badge}`}>
                            Écran {ecranStyle[i.ecran].label}
                          </span>
                          <span className="text-sm font-bold text-[#17201b]">{i.titre}</span>
                        </div>
                        <div className="mt-0.5 text-xs text-[#65706a]">{i.resume}</div>
                      </div>
                      {schema && (
                        <button
                          onClick={() => {
                            setEnEdition(i.cle)
                            setAjout(false)
                          }}
                          className="flex shrink-0 items-center gap-1 rounded-md border border-[#d8ded9] px-2 py-1 text-xs text-[#17201b] hover:bg-[#f3f5f2]"
                        >
                          <Pencil size={12} /> Modifier
                        </button>
                      )}
                    </div>
                  ),
                )}
              </div>
              {schema &&
                (ajout ? (
                  <div className="grid gap-1.5">
                    <div className="text-xs font-bold text-[#17201b]">Nouvelle mise à jour (saisie manuelle)</div>
                    <FormulaireImpact schema={schema} onValider={ajouter} onAnnuler={() => setAjout(false)} />
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setAjout(true)
                      setEnEdition(null)
                    }}
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-[#9aa59e] px-3 py-2 text-sm text-[#17201b] hover:bg-[#f3f5f2]"
                  >
                    <Plus size={15} /> Ajouter une mise à jour
                  </button>
                ))}
              <button
                onClick={appliquer}
                disabled={retenus.size === 0 || enCours || enEdition !== null || ajout}
                className="rounded-lg border border-[#17201b] bg-[#17201b] px-3 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                {enCours ? 'Application…' : `Appliquer aux écrans (${retenus.size})`}
              </button>
            </div>
          )}

          {resultats && (
            <div className="grid gap-3 rounded-lg border border-emerald-300 bg-white p-3.5 shadow-sm">
              <h3 className="m-0 flex items-center gap-2 text-[15px] text-emerald-800">
                <CheckCircle2 size={17} /> 3. Écrans mis à jour · {resultats.length} changement(s)
              </h3>
              <p className="m-0 text-xs text-[#65706a]">
                Le flux du Point de Situation a aussi reçu ces événements. Ouvrez un écran pour voir l'élément créé, déjà sélectionné.
              </p>
              <div className="grid gap-2">
                {resultats.map((r) => (
                  <div key={r.cle} className="flex items-center gap-2.5 rounded-lg border border-[#e2e7e3] p-2.5">
                    <span className={`inline-flex min-h-[22px] shrink-0 items-center rounded-full px-2 text-[11px] font-bold ${ecranStyle[r.ecran].badge}`}>
                      {ecranStyle[r.ecran].label}
                    </span>
                    <span className="min-w-0 flex-1 text-sm text-[#17201b]">{r.titre}</span>
                    <button
                      onClick={() => voir(r)}
                      className="flex shrink-0 items-center gap-1 rounded-md border border-[#17201b] px-2 py-1 text-xs font-bold text-[#17201b] hover:bg-[#17201b] hover:text-white"
                    >
                      Voir <ArrowRight size={13} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  setDoc(documentVide)
                  setAnalyse(null)
                  setResultats(null)
                }}
                className="rounded-lg border border-[#d8ded9] px-3 py-2 text-sm text-[#17201b]"
              >
                Saisir un nouveau document
              </button>
            </div>
          )}

          <div className="rounded-lg border border-[#d8ded9] bg-white shadow-sm">
            <div className="border-b border-[#d8ded9] px-3.5 py-3">
              <h3 className="m-0 text-[15px] text-[#17201b]">Historique des saisies</h3>
            </div>
            {historique.length === 0 && <p className="m-0 px-3.5 py-3 text-sm text-[#65706a]">Aucun document saisi pour l'instant.</p>}
            {historique.map((n) => (
              <div key={n.id} className="grid gap-1.5 border-b border-[#eef1ee] px-3.5 py-2.5 last:border-b-0">
                <div className="flex items-center gap-2 text-xs text-[#65706a]">
                  <strong className="text-[#17201b]">{typesDocument[n.typeDocument] ?? n.typeDocument}</strong>· {n.emetteur} ·{' '}
                  {new Date(n.dateSaisie).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                </div>
                <div className="text-sm text-[#17201b]">{n.objet}</div>
                <div className="flex flex-wrap gap-1.5">
                  {n.impacts.map((r) => (
                    <button
                      key={r.cle}
                      onClick={() => voir(r)}
                      title={r.titre}
                      className={`inline-flex min-h-[22px] items-center gap-1 rounded-full px-2 text-[11px] font-bold ${ecranStyle[r.ecran]?.badge ?? ''}`}
                    >
                      {ecranStyle[r.ecran]?.label} <ArrowRight size={11} />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      )}
    </section>
  )
}
