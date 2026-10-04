import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import type { DemandeRavitaillementDTO } from '../../api/client'
import { useRoleActif } from '../../useRoleActif'

type LigneRow = Awaited<ReturnType<typeof api.logistics>>[number]

const alerteStyle = {
  normal: { label: 'Normal', badge: 'bg-emerald-50 text-emerald-700' },
  attention: { label: 'Attention', badge: 'bg-amber-50 text-amber-700' },
  critique: { label: 'Critique', badge: 'bg-red-50 text-red-700' },
}

// Ressource API -> libellé et champ de la ligne /logistics.
const ressources = [
  { cle: 'armement', label: 'Armement', champ: 'armementPct' },
  { cle: 'munitions', label: 'Munitions', champ: 'munitionsPct' },
  { cle: 'carburant', label: 'Carburant', champ: 'carburantPct' },
  { cle: 'vivres', label: 'Vivres', champ: 'vivresPct' },
  { cle: 'maintenance', label: 'Maintenance', champ: 'maintenancePct' },
  { cle: 'sante', label: 'Santé', champ: 'santePct' },
  { cle: 'vehicule', label: 'Véhicules', champ: 'vehiculePct' },
] as const
type CleRessource = (typeof ressources)[number]['cle']
const labelRessource = Object.fromEntries(ressources.map((r) => [r.cle, r.label])) as Record<string, string>

const prioriteStyle: Record<string, { label: string; badge: string }> = {
  routine: { label: 'Routine', badge: 'border-[#d8ded9] text-[#65706a]' },
  urgent: { label: 'Urgent', badge: 'border-amber-500 text-amber-700' },
  vital: { label: 'Vital', badge: 'border-red-500 text-red-700' },
}
const statutDemandeStyle: Record<string, { label: string; badge: string }> = {
  demandee: { label: 'Demandée', badge: 'bg-blue-50 text-blue-700' },
  en_cours: { label: 'En cours', badge: 'bg-amber-50 text-amber-700' },
  livree: { label: 'Livrée', badge: 'bg-emerald-50 text-emerald-700' },
  refusee: { label: 'Refusée', badge: 'bg-[#f3f5f2] text-[#65706a]' },
}
const rangStatut: Record<string, number> = { demandee: 0, en_cours: 1, livree: 2, refusee: 3 }
const rangPriorite: Record<string, number> = { vital: 0, urgent: 1, routine: 2 }

const ROLES_TRAITEMENT = ['officier_logistique', 'commandement', 'administrateur']
const champClasse = 'w-full rounded-lg border border-[#d8ded9] bg-white px-2.5 py-2 text-sm outline-none focus:border-[#17201b]'
const libelleClasse = 'mb-1 block text-xs font-bold text-[#65706a]'
const th = 'border-b border-[#d8ded9] px-3.5 py-3 text-left'
const td = 'border-b border-[#d8ded9] px-3.5 py-3'

function couleurTexte(pct: number) {
  if (pct <= 30) return 'text-[#b9332c] font-bold'
  if (pct <= 50) return 'text-[#ba7a0b] font-bold'
  return 'text-[#17201b]'
}

function niveau(ligne: LigneRow | undefined, cle: CleRessource): number {
  const r = ressources.find((x) => x.cle === cle)!
  return ligne ? ligne[r.champ] : 0
}

export function LogistiqueScreen() {
  const role = useRoleActif()
  const peutTraiter = role !== null && ROLES_TRAITEMENT.includes(role)

  const [lignes, setLignes] = useState<LigneRow[]>([])
  const [demandes, setDemandes] = useState<DemandeRavitaillementDTO[]>([])
  const [filtre, setFiltre] = useState<CleRessource | ''>('')
  const [erreur, setErreur] = useState<string | null>(null)
  const [occupeId, setOccupeId] = useState<string | null>(null)

  const [formulaire, setFormulaire] = useState(false)
  const [uniteId, setUniteId] = useState('')
  const [ressource, setRessource] = useState<CleRessource>('carburant')
  const [points, setPoints] = useState('')
  const [priorite, setPriorite] = useState('routine')
  const [commentaire, setCommentaire] = useState('')
  const [enCours, setEnCours] = useState(false)

  async function recharger() {
    const [l, d] = await Promise.all([api.logistics(), api.demandesRavitaillement()])
    setLignes(l)
    setDemandes(d)
  }

  useEffect(() => {
    recharger()
  }, [])

  const colonnes = filtre ? ressources.filter((r) => r.cle === filtre) : ressources
  // Avec une ressource filtrée, les unités les plus en manque passent en tête.
  const lignesAffichees = filtre ? [...lignes].sort((a, b) => niveau(a, filtre) - niveau(b, filtre)) : lignes
  const ligneChoisie = lignes.find((l) => l.uniteId === uniteId)
  const niveauActuel = niveau(ligneChoisie, ressource)
  const demandesTriees = [...demandes].sort(
    (a, b) => rangStatut[a.statut] - rangStatut[b.statut] || rangPriorite[a.priorite] - rangPriorite[b.priorite] || b.dateDemande.localeCompare(a.dateDemande),
  )
  const nbOuvertes = demandes.filter((d) => d.statut === 'demandee' || d.statut === 'en_cours').length

  function ouvrirFormulaire(ligne?: LigneRow) {
    const cible = ligne ?? lignes[0]
    if (!cible) return
    // Ressource la plus basse de l'unité proposée par défaut, complément jusqu'à 100 %.
    const plusBasse = [...ressources].sort((a, b) => cible[a.champ] - cible[b.champ])[0].cle
    setUniteId(cible.uniteId)
    setRessource(filtre || plusBasse)
    setPoints(String(Math.max(1, Math.round(100 - niveau(cible, filtre || plusBasse)))))
    setPriorite('routine')
    setCommentaire('')
    setErreur(null)
    setFormulaire(true)
  }

  function changerUniteOuRessource(nouvelleUnite: string, nouvelleRessource: CleRessource) {
    setUniteId(nouvelleUnite)
    setRessource(nouvelleRessource)
    const ligne = lignes.find((l) => l.uniteId === nouvelleUnite)
    setPoints(String(Math.max(1, Math.round(100 - niveau(ligne, nouvelleRessource)))))
  }

  async function envoyerDemande() {
    setEnCours(true)
    setErreur(null)
    try {
      const demande = await api.creerDemandeRavitaillement({
        unit_id: uniteId,
        type_stock: ressource,
        points_pct: Number(points),
        priorite,
        commentaire,
      })
      setDemandes((prev) => [demande, ...prev])
      setFormulaire(false)
    } catch (err) {
      setErreur(err instanceof Error ? err.message : String(err))
    } finally {
      setEnCours(false)
    }
  }

  async function traiter(id: string, action: 'prendre-en-charge' | 'livrer' | 'refuser') {
    setOccupeId(id)
    setErreur(null)
    try {
      await api.traiterDemandeRavitaillement(id, action)
      // Une livraison relève le niveau de stock côté API : on relit tout.
      await recharger()
    } catch (err) {
      setErreur(err instanceof Error ? err.message : String(err))
    } finally {
      setOccupeId(null)
    }
  }

  return (
    <section className="grid min-h-0 grid-rows-[auto_1fr] gap-3.5">
      <div className="flex items-center justify-between gap-3">
        <select aria-label="Ressource" value={filtre} onChange={(e) => setFiltre(e.target.value as CleRessource | '')} className="h-[38px] rounded-lg border border-[#d8ded9] bg-white px-2.5">
          <option value="">Toutes les ressources</option>
          {ressources.map((r) => (
            <option key={r.cle} value={r.cle}>
              {r.label}
            </option>
          ))}
        </select>
        <button
          onClick={() => ouvrirFormulaire()}
          disabled={formulaire || role === null}
          className="h-10 rounded-lg border border-[#17201b] bg-[#17201b] px-3.5 text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Planifier ravitaillement
        </button>
      </div>

      <div className="grid min-h-0 content-start gap-3.5 overflow-auto">
        {erreur && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</div>}

        {formulaire && (
          <div className="grid gap-3 rounded-lg border-2 border-[#17201b] bg-white p-3.5 shadow-sm">
            <h3 className="m-0 text-[15px] text-[#17201b]">Demande de ravitaillement</h3>
            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className={libelleClasse}>Unité</label>
                <select value={uniteId} onChange={(e) => changerUniteOuRessource(e.target.value, ressource)} className={champClasse}>
                  {lignes.map((l) => (
                    <option key={l.uniteId} value={l.uniteId}>
                      {l.uniteNom}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={libelleClasse}>Ressource</label>
                <select value={ressource} onChange={(e) => changerUniteOuRessource(uniteId, e.target.value as CleRessource)} className={champClasse}>
                  {ressources.map((r) => (
                    <option key={r.cle} value={r.cle}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={libelleClasse}>Complément (points de %)</label>
                <input type="number" min={1} max={100} value={points} onChange={(e) => setPoints(e.target.value)} className={champClasse} />
              </div>
              <div>
                <label className={libelleClasse}>Priorité</label>
                <select value={priorite} onChange={(e) => setPriorite(e.target.value)} className={champClasse}>
                  {Object.entries(prioriteStyle).map(([valeur, p]) => (
                    <option key={valeur} value={valeur}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="m-0 text-xs text-[#65706a]">
              Niveau actuel : <span className={couleurTexte(niveauActuel)}>{niveauActuel}%</span>, après livraison :{' '}
              <span className="font-bold text-[#17201b]">{Math.min(100, niveauActuel + (Number(points) || 0))}%</span>
            </p>
            <div>
              <label className={libelleClasse}>Commentaire (facultatif)</label>
              <input value={commentaire} onChange={(e) => setCommentaire(e.target.value)} placeholder="Contexte, point de livraison, délai..." className={champClasse} />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setFormulaire(false)} className="rounded-lg border border-[#d8ded9] px-3 py-2 text-sm">
                Annuler
              </button>
              <button
                onClick={envoyerDemande}
                disabled={!uniteId || !(Number(points) > 0 && Number(points) <= 100) || enCours}
                className="rounded-lg border border-[#17201b] bg-[#17201b] px-3 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                {enCours ? 'Envoi…' : 'Envoyer la demande'}
              </button>
            </div>
          </div>
        )}

        <div className="overflow-auto rounded-lg border border-[#d8ded9] bg-white shadow-sm">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-[#f8faf7] text-xs text-[#65706a]">
                <th className={th}>Unité</th>
                {colonnes.map((r) => (
                  <th key={r.cle} className={th}>
                    {r.label}
                  </th>
                ))}
                <th className={th}>Alerte</th>
                <th className={th} />
              </tr>
            </thead>
            <tbody>
              {lignesAffichees.map((ligne) => (
                <tr key={ligne.uniteId}>
                  <td className={td}>{ligne.uniteNom}</td>
                  {colonnes.map((r) => (
                    <td key={r.cle} className={`${td} ${couleurTexte(ligne[r.champ])}`}>
                      {ligne[r.champ]}%
                    </td>
                  ))}
                  <td className={td}>
                    <span className={`inline-flex min-h-[26px] items-center rounded-full px-2.5 text-xs font-bold ${alerteStyle[ligne.alerte as keyof typeof alerteStyle].badge}`}>
                      {alerteStyle[ligne.alerte as keyof typeof alerteStyle].label}
                    </span>
                  </td>
                  <td className={`${td} text-right`}>
                    <button
                      onClick={() => ouvrirFormulaire(ligne)}
                      disabled={role === null}
                      className="rounded-md border border-[#d8ded9] px-2 py-1 text-xs text-[#17201b] hover:bg-[#f3f5f2] disabled:opacity-40"
                    >
                      Ravitailler
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-lg border border-[#d8ded9] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#d8ded9] px-3.5 py-3">
            <h3 className="m-0 text-[15px] text-[#17201b]">Demandes de ravitaillement · {nbOuvertes} ouverte(s)</h3>
            {!peutTraiter && <span className="text-xs text-[#65706a]">Traitement réservé à la logistique et au commandement</span>}
          </div>
          {demandesTriees.length === 0 && <p className="m-0 px-3.5 py-3 text-sm text-[#65706a]">Aucune demande.</p>}
          {demandesTriees.map((d) => {
            const ouverte = d.statut === 'demandee' || d.statut === 'en_cours'
            return (
              <div key={d.id} className={`flex flex-wrap items-center gap-3 border-b border-[#eef1ee] px-3.5 py-3 last:border-b-0 ${ouverte ? '' : 'opacity-60'}`}>
                <span className={`inline-flex min-h-[24px] items-center rounded border px-1.5 text-xs font-bold ${prioriteStyle[d.priorite].badge}`}>{prioriteStyle[d.priorite].label}</span>
                <span className={`inline-flex min-h-[26px] items-center rounded-full px-2.5 text-xs font-bold ${statutDemandeStyle[d.statut].badge}`}>{statutDemandeStyle[d.statut].label}</span>
                <div className="min-w-[220px] flex-1">
                  <div className="text-sm font-bold text-[#17201b]">
                    {d.uniteNom} · {labelRessource[d.typeStock] ?? d.typeStock} +{d.pointsPct} pts
                  </div>
                  <div className="text-xs text-[#65706a]">
                    {new Date(d.dateDemande).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                    {d.demandeur && ` · demandé par ${d.demandeur}`}
                    {d.traitePar && ` · traité par ${d.traitePar}`}
                    {d.commentaire && ` · ${d.commentaire}`}
                  </div>
                </div>
                {peutTraiter && ouverte && (
                  <div className="flex gap-1.5">
                    {d.statut === 'demandee' && (
                      <button disabled={occupeId === d.id} onClick={() => traiter(d.id, 'prendre-en-charge')} className="rounded-md border border-[#d8ded9] px-2 py-1 text-xs disabled:opacity-40">
                        Prendre en charge
                      </button>
                    )}
                    <button disabled={occupeId === d.id} onClick={() => traiter(d.id, 'livrer')} className="rounded-md border border-emerald-700 bg-emerald-700 px-2 py-1 text-xs text-white disabled:opacity-40">
                      Livrer
                    </button>
                    <button disabled={occupeId === d.id} onClick={() => traiter(d.id, 'refuser')} className="rounded-md border border-[#d8ded9] px-2 py-1 text-xs text-[#65706a] disabled:opacity-40">
                      Refuser
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
