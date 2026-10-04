import { useEffect, useMemo, useState } from 'react'
import { MapPin } from 'lucide-react'
import { api } from '../../api/client'
import type { OperationCarteDTO } from '../../api/client'
import { OperationsMap, type OperationAffichee } from '../map/OperationsMap'

type OperationRow = Awaited<ReturnType<typeof api.operations>>[number]

const statutStyle: Record<string, { label: string; badge: string; couleur: string }> = {
  planifiee: { label: 'Planifiée', badge: 'bg-amber-50 text-amber-700', couleur: '#ba7a0b' },
  en_cours: { label: 'En cours', badge: 'bg-blue-50 text-blue-700', couleur: '#1f6fb2' },
  sous_tension: { label: 'Sous tension', badge: 'bg-red-50 text-red-700', couleur: '#b9332c' },
  terminee: { label: 'Terminée', badge: 'bg-emerald-50 text-emerald-700', couleur: '#2f855a' },
}

export function OperationsScreen() {
  const [operations, setOperations] = useState<OperationRow[]>([])
  const [cartes, setCartes] = useState<OperationCarteDTO[]>([])
  const [filtreStatut, setFiltreStatut] = useState('')
  const [selectionId, setSelectionId] = useState<string | null>(null)

  useEffect(() => {
    api.operations().then(setOperations)
    api.operationsCarte().then(setCartes)
  }, [])

  const operationsFiltrees = operations.filter((o) => !filtreStatut || o.statut === filtreStatut)

  // Mémorisé : la carte recadre quand cette liste change, pas à chaque rendu.
  const operationsCarte: OperationAffichee[] = useMemo(() => {
    const carteParOperation = new Map(cartes.map((c) => [c.operationId, c]))
    return operations
      .filter((o) => !filtreStatut || o.statut === filtreStatut)
      .map((o) => ({
        id: o.id,
        nom: o.nom_operation,
        code: o.code_operation,
        couleur: statutStyle[o.statut]?.couleur ?? '#65706a',
        carte: carteParOperation.get(o.id),
      }))
  }, [operations, cartes, filtreStatut])

  const carteParOperation = new Map(cartes.map((c) => [c.operationId, c]))

  return (
    <section className="grid min-h-0 grid-rows-[auto_1fr] gap-3.5">
      <div className="flex items-center justify-between gap-3">
        <select
          aria-label="Statut"
          value={filtreStatut}
          onChange={(e) => {
            setFiltreStatut(e.target.value)
            setSelectionId(null)
          }}
          className="h-[38px] rounded-lg border border-[#d8ded9] bg-white px-2.5"
        >
          <option value="">Tous les statuts</option>
          {Object.entries(statutStyle).map(([valeur, s]) => (
            <option key={valeur} value={valeur}>
              {s.label}
            </option>
          ))}
        </select>
        <button className="h-10 rounded-lg border border-[#17201b] bg-[#17201b] px-3.5 text-white">Créer une opération</button>
      </div>

      <div className="grid min-h-0 grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] items-start gap-3.5">
        <div className="grid content-start gap-3.5">
          {operationsFiltrees.length === 0 && <p className="text-sm text-[#65706a]">Aucune opération pour ce statut.</p>}
          {operationsFiltrees.map((operation) => {
            const style = statutStyle[operation.statut] ?? statutStyle.planifiee
            const carte = carteParOperation.get(operation.id)
            const selection = operation.id === selectionId
            return (
              <article
                key={operation.id}
                onClick={() => setSelectionId(selection ? null : operation.id)}
                title={selection ? 'Revenir à la vue d\'ensemble' : 'Localiser sur la carte'}
                className={`grid cursor-pointer gap-3 rounded-lg border bg-white p-3.5 shadow-sm ${selection ? 'border-[#17201b] ring-1 ring-[#17201b]' : 'border-[#d8ded9]'}`}
              >
                <div className="flex items-center gap-2">
                  <span className={`inline-flex w-fit min-h-[26px] items-center rounded-full px-2.5 text-xs font-bold ${style.badge}`}>{style.label}</span>
                  <span className="text-xs text-[#65706a]">{operation.code_operation}</span>
                  <span className="ml-auto flex items-center gap-1 text-xs text-[#65706a]">
                    <MapPin size={13} style={{ color: style.couleur }} />
                    {carte && carte.lon !== null ? 'Localisée' : 'Non localisée'}
                  </span>
                </div>
                <h3 className="m-0 text-[17px] text-[#17201b]">{operation.nom_operation}</h3>
                <p className="m-0 text-[13px] leading-relaxed text-[#65706a]">{operation.objectif}</p>
                {carte && (carte.zones.length > 0 || carte.axes.length > 0 || carte.checkpoints.length > 0 || carte.unites.length > 0) && (
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-[#65706a]">
                    {carte.zones.length > 0 && <span>Zone : {carte.zones.map((z) => z.nom).join(', ')}</span>}
                    {carte.axes.length > 0 && <span>Axe : {carte.axes.map((a) => a.nom).join(', ')}</span>}
                    {carte.checkpoints.length > 0 && <span>Checkpoints : {carte.checkpoints.map((c) => c.nom).join(', ')}</span>}
                    {carte.unites.length > 0 && <span>Unités engagées : {carte.unites.map((u) => u.nom).join(', ')}</span>}
                  </div>
                )}
                <div className="h-2 overflow-hidden rounded-full bg-[#e5e9e5]">
                  <div className="h-full bg-[#1f6fb2]" style={{ width: `${operation.progression}%` }} />
                </div>
              </article>
            )
          })}
        </div>

        {/* Hauteur calée sur l'écran et collée en haut au défilement. */}
        <div className="sticky top-0 h-[calc(100vh-260px)] min-h-[420px]">
          <OperationsMap operations={operationsCarte} selectionId={selectionId} onSelect={setSelectionId} />
          <div className="pointer-events-none absolute left-3 top-3 grid gap-1.5 rounded-lg border border-[#d8ded9] bg-white/95 p-2.5 text-xs text-[#17201b] shadow-sm">
            {Object.values(statutStyle).map((s) => (
              <div key={s.label} className="flex items-center gap-2">
                <span className="inline-block h-3 w-3 rounded-full" style={{ background: s.couleur }} />
                {s.label}
              </div>
            ))}
            <div className="mt-1 border-t border-[#d8ded9] pt-1.5 text-[#65706a]">Zone · axe en tirets · CP checkpoint</div>
          </div>
        </div>
      </div>
    </section>
  )
}
