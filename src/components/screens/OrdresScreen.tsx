import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import { classificationLabel } from '../../types'
import type { Classification } from '../../types'

type OrdreRow = Awaited<ReturnType<typeof api.orders>>[number]

const statutStyle: Record<string, { label: string; badge: string }> = {
  brouillon: { label: 'Brouillon', badge: 'bg-gray-100 text-gray-700' },
  signe: { label: 'Signé', badge: 'bg-blue-50 text-blue-700' },
  diffuse: { label: 'Diffusé', badge: 'bg-emerald-50 text-emerald-700' },
  annule: { label: 'Annulé', badge: 'bg-red-50 text-red-700' },
}

const destinataireStyle: Record<string, string> = { envoye: 'Envoyé', recu: 'Reçu', accuse: 'Accusé', execute: 'Exécuté' }
const prochaineActionLabel: Record<string, string> = { brouillon: 'Valider', signe: 'Diffuser' }

export function OrdresScreen() {
  const [ordres, setOrdres] = useState<OrdreRow[]>([])
  const [selectionneId, setSelectionneId] = useState<string | null>(null)

  function charger() {
    api.orders().then((data) => {
      setOrdres(data)
      setSelectionneId((courant) => courant ?? data[0]?.id ?? null)
    })
  }

  useEffect(() => {
    charger()
  }, [])

  async function avancer(id: string) {
    await api.advanceOrder(id)
    charger()
  }

  const selectionne = ordres.find((o) => o.id === selectionneId) ?? null

  return (
    <section className="grid min-h-0 grid-rows-[auto_1fr] gap-3.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <select className="h-[38px] rounded-lg border border-[#d8ded9] bg-white px-2.5">
            <option>Tous les types</option>
            <option>OPORD</option>
            <option>FRAGO</option>
            <option>WARNO</option>
          </select>
          <select className="h-[38px] rounded-lg border border-[#d8ded9] bg-white px-2.5">
            <option>Tous les statuts</option>
            {Object.values(statutStyle).map((s) => (
              <option key={s.label}>{s.label}</option>
            ))}
          </select>
        </div>
        <button className="h-10 rounded-lg border border-[#17201b] bg-[#17201b] px-3.5 text-white">Nouvel ordre</button>
      </div>

      <div className="grid min-h-0 grid-cols-[1fr_360px] gap-3.5">
        <div className="grid gap-3 overflow-auto">
          {ordres.map((ordre) => (
            <button
              key={ordre.id}
              onClick={() => setSelectionneId(ordre.id)}
              className={`grid gap-2 rounded-lg border bg-white p-3.5 text-left shadow-sm ${
                selectionneId === ordre.id ? 'border-[#17201b]' : 'border-[#d8ded9]'
              }`}
            >
              <div className="flex items-center justify-between">
                <strong className="text-[#17201b]">{ordre.numero}</strong>
                <span className={`inline-flex min-h-[26px] items-center rounded-full px-2.5 text-xs font-bold ${statutStyle[ordre.statut].badge}`}>
                  {statutStyle[ordre.statut].label}
                </span>
              </div>
              <span className="text-sm text-[#17201b]">{ordre.objet}</span>
              <span className="text-xs text-[#65706a]">
                {classificationLabel[ordre.classification as Classification]} · {ordre.emetteur}
              </span>
            </button>
          ))}
        </div>

        <aside className="grid content-start gap-3.5 rounded-lg border border-[#d8ded9] bg-white p-3.5 shadow-sm">
          {selectionne ? (
            <>
              <div>
                <span className="inline-flex rounded-md bg-[#fff0cf] px-1.5 py-1 text-xs font-bold text-[#7c5108]">
                  {classificationLabel[selectionne.classification as Classification]}
                </span>
                <h3 className="mt-2 text-lg text-[#17201b]">{selectionne.numero}</h3>
                <p className="text-sm text-[#65706a]">{selectionne.objet}</p>
              </div>
              <p className="text-sm text-[#17201b]">{selectionne.contenu}</p>
              <div>
                <span className="mb-1.5 block text-xs text-[#65706a]">Unités destinataires</span>
                <div className="grid gap-1.5">
                  {selectionne.destinataires.length === 0 && <span className="text-xs text-[#65706a]">Aucune pour l'instant (brouillon).</span>}
                  {selectionne.destinataires.map((dest) => (
                    <div key={dest.uniteId} className="flex items-center justify-between rounded-lg bg-[#eef2ed] px-2.5 py-1.5 text-sm">
                      <span>{dest.uniteNom}</span>
                      <span className="text-xs text-[#65706a]">{destinataireStyle[dest.statut]}</span>
                    </div>
                  ))}
                </div>
              </div>
              {prochaineActionLabel[selectionne.statut] && (
                <button
                  onClick={() => avancer(selectionne.id)}
                  className="h-10 rounded-lg border border-[#17201b] bg-[#17201b] px-3.5 text-white"
                >
                  {prochaineActionLabel[selectionne.statut]}
                </button>
              )}
            </>
          ) : (
            <p className="text-sm text-[#65706a]">Sélectionnez un ordre pour afficher son détail.</p>
          )}
        </aside>
      </div>
    </section>
  )
}
