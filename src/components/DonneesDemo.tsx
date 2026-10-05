import { useEffect, useState } from 'react'
import { ArrowRight, Pencil, Trash2 } from 'lucide-react'
import { api } from '../api/client'
import type { ElementDonneesDTO, ReferencesSaisieDTO, RessourceDonneesDTO } from '../api/client'
import { definirFocus, type EcranFocus } from '../focusDemo'
import { ChampFormulaire, champManquant } from './ChampFormulaire'

// Éditeur des données déjà présentes dans la plateforme (GET/PATCH/DELETE /demo/donnees) :
// corriger un incident, déplacer une unité, ajuster un niveau de stock, supprimer une alerte…

interface DonneesDemoProps {
  references: ReferencesSaisieDTO
  onVoir: (ecran: string) => void
}

export function DonneesDemo({ references, onVoir }: DonneesDemoProps) {
  const [ressources, setRessources] = useState<RessourceDonneesDTO[]>([])
  const [choisie, setChoisie] = useState<string>('')
  const [elements, setElements] = useState<ElementDonneesDTO[]>([])
  const [enEdition, setEnEdition] = useState<string | null>(null)
  const [valeurs, setValeurs] = useState<Record<string, unknown>>({})
  const [aSupprimer, setASupprimer] = useState<string | null>(null)
  const [message, setMessage] = useState<{ ok: boolean; texte: string } | null>(null)
  const [enCours, setEnCours] = useState(false)

  useEffect(() => {
    api.demoRessources().then((r) => {
      setRessources(r)
      setChoisie((c) => c || r[0]?.cle || '')
    })
  }, [])

  useEffect(() => {
    if (!choisie) return
    setEnEdition(null)
    setASupprimer(null)
    api.demoElements(choisie).then(setElements)
  }, [choisie])

  const ressource = ressources.find((r) => r.cle === choisie)

  function editer(e: ElementDonneesDTO) {
    setEnEdition(e.id)
    setASupprimer(null)
    setValeurs({ ...e.valeurs })
    setMessage(null)
  }

  async function enregistrer(e: ElementDonneesDTO) {
    if (!ressource) return
    const absents = ressource.champs.filter((c) => champManquant(c, valeurs[c.cle])).map((c) => c.libelle)
    if (absents.length) {
      setMessage({ ok: false, texte: `À compléter : ${absents.join(', ')}` })
      return
    }
    // N'envoyer que les champs réellement modifiés.
    const modifies = Object.fromEntries(
      ressource.champs.filter((c) => JSON.stringify(valeurs[c.cle]) !== JSON.stringify(e.valeurs[c.cle])).map((c) => [c.cle, valeurs[c.cle]]),
    )
    if (!Object.keys(modifies).length) {
      setEnEdition(null)
      return
    }
    setEnCours(true)
    try {
      const maj = await api.demoModifier(choisie, e.id, modifies)
      setElements((prev) => prev.map((x) => (x.id === e.id ? maj : x)))
      setEnEdition(null)
      setMessage({ ok: true, texte: `« ${maj.titre} » mis à jour.` })
    } catch (err) {
      setMessage({
        ok: false,
        texte: err instanceof Error ? err.message : String(err),
      })
    } finally {
      setEnCours(false)
    }
  }

  async function supprimer(e: ElementDonneesDTO) {
    setEnCours(true)
    try {
      await api.demoSupprimer(choisie, e.id)
      setElements((prev) => prev.filter((x) => x.id !== e.id))
      setASupprimer(null)
      setMessage({ ok: true, texte: `« ${e.titre} » supprimé.` })
    } catch (err) {
      setMessage({
        ok: false,
        texte: err instanceof Error ? err.message : String(err),
      })
    } finally {
      setEnCours(false)
    }
  }

  function voir(e: ElementDonneesDTO) {
    if (!ressource) return
    definirFocus(ressource.ecran as EcranFocus, e.id)
    onVoir(ressource.ecran)
  }

  return (
    <div className="grid grid-cols-[230px_minmax(0,1fr)] items-start gap-3.5">
      <nav className="sticky top-0 grid gap-1 rounded-lg border border-[#d8ded9] bg-white p-2 shadow-sm">
        <div className="px-1.5 pb-1 text-xs font-bold text-[#65706a]">Catégorie</div>
        {ressources.map((r) => (
          <button
            key={r.cle}
            onClick={() => {
              setChoisie(r.cle)
              setMessage(null)
            }}
            className={`rounded-md px-2.5 py-1.5 text-left text-sm ${r.cle === choisie ? 'bg-[#17201b] text-white' : 'text-[#17201b] hover:bg-[#f3f5f2]'}`}
          >
            {r.libelle}
          </button>
        ))}
      </nav>

      <div className="grid gap-2.5 rounded-lg border border-[#d8ded9] bg-white p-3.5 shadow-sm">
        <h3 className="m-0 text-[15px] text-[#17201b]">
          {ressource?.libelle ?? 'Données'} · {elements.length}
        </h3>
        {ressource && !ressource.suppression && <p className="m-0 text-xs text-[#65706a]">Ces éléments se modifient mais ne se suppriment pas.</p>}
        {message && (
          <div
            className={`rounded-lg border px-3 py-2 text-sm ${message.ok ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-700'}`}
          >
            {message.texte}
          </div>
        )}
        {elements.length === 0 && <p className="m-0 text-sm text-[#65706a]">Aucun élément.</p>}
        {elements.map((e) => (
          <div key={e.id} className={`rounded-lg border p-2.5 ${enEdition === e.id ? 'border-[#17201b] bg-[#fbfcfa]' : 'border-[#e2e7e3]'}`}>
            <div className="flex items-center gap-2">
              <span className="min-w-0 flex-1 truncate text-sm font-bold text-[#17201b]">{e.titre}</span>
              <button
                onClick={() => voir(e)}
                className="flex items-center gap-1 rounded-md border border-[#d8ded9] px-2 py-1 text-xs text-[#17201b] hover:bg-[#f3f5f2]"
              >
                Voir <ArrowRight size={12} />
              </button>
              {enEdition !== e.id && (
                <button
                  onClick={() => editer(e)}
                  className="flex items-center gap-1 rounded-md border border-[#17201b] px-2 py-1 text-xs font-bold text-[#17201b] hover:bg-[#17201b] hover:text-white"
                >
                  <Pencil size={12} /> Modifier
                </button>
              )}
              {ressource?.suppression && enEdition !== e.id && (
                <button
                  onClick={() => setASupprimer(aSupprimer === e.id ? null : e.id)}
                  title="Supprimer"
                  className="flex items-center rounded-md border border-red-200 px-1.5 py-1 text-red-700 hover:bg-red-50"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
            {aSupprimer === e.id && (
              <div className="mt-2 flex items-center gap-2 rounded-md bg-red-50 px-2.5 py-1.5 text-xs text-red-800">
                <span className="flex-1">Supprimer définitivement cet élément ?</span>
                <button onClick={() => setASupprimer(null)} className="rounded-md border border-red-200 bg-white px-2 py-1">
                  Annuler
                </button>
                <button
                  onClick={() => supprimer(e)}
                  disabled={enCours}
                  className="rounded-md border border-red-700 bg-red-700 px-2 py-1 font-bold text-white"
                >
                  Confirmer la suppression
                </button>
              </div>
            )}
            {enEdition === e.id && ressource && (
              <div className="mt-2.5 grid gap-2.5">
                <div className="grid grid-cols-2 gap-2">
                  {ressource.champs.map((c) => (
                    <ChampFormulaire
                      key={c.cle}
                      champ={c}
                      valeur={valeurs[c.cle]}
                      references={references}
                      onChange={(v) => setValeurs((prev) => ({ ...prev, [c.cle]: v }))}
                    />
                  ))}
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setEnEdition(null)} className="rounded-md border border-[#d8ded9] px-3 py-1.5 text-xs text-[#17201b]">
                    Annuler
                  </button>
                  <button
                    onClick={() => enregistrer(e)}
                    disabled={enCours}
                    className="rounded-md border border-[#17201b] bg-[#17201b] px-3 py-1.5 text-xs font-bold text-white disabled:opacity-40"
                  >
                    {enCours ? 'Enregistrement…' : 'Enregistrer'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
