import { useEffect, useMemo, useState } from 'react'
import { api } from '../../api/client'
import type { SituationDTO } from '../../api/client'
import { UnitesMap, type UniteCarte } from '../map/UnitesMap'
import { statutUniteStyle, typeUniteLabel } from '../../uniteStyle'
import type { StatutUnite, TypeUnite } from '../../types'

type UniteRow = Awaited<ReturnType<typeof api.units>>[number]
type LogistiqueRow = Awaited<ReturnType<typeof api.logistics>>[number]

function couleurTexte(pct: number) {
  if (pct <= 30) return 'text-[#b9332c] font-bold'
  if (pct <= 50) return 'text-[#ba7a0b] font-bold'
  return 'text-[#17201b]'
}

export function UnitesScreen() {
  const [unites, setUnites] = useState<UniteRow[]>([])
  const [logistique, setLogistique] = useState<Map<string, LogistiqueRow>>(new Map())
  const [positions, setPositions] = useState<SituationDTO['unites']>([])
  const [filtreType, setFiltreType] = useState('')
  const [filtreStatut, setFiltreStatut] = useState('')
  const [selectionId, setSelectionId] = useState<string | null>(null)

  useEffect(() => {
    api.units().then(setUnites)
    api.logistics().then((lignes) => setLogistique(new Map(lignes.map((l) => [l.uniteId, l]))))
    // Positions : déjà servies par l'écran Situation.
    api.situation().then((s) => setPositions(s.unites))
  }, [])

  const unitesFiltrees = unites.filter((u) => (!filtreType || u.typeUnite === filtreType) && (!filtreStatut || u.statut === filtreStatut))

  // Mémorisé : la carte recadre quand la liste filtrée change, pas à chaque rendu.
  const unitesCarte: UniteCarte[] = useMemo(() => {
    const positionParId = new Map(positions.map((p) => [p.id, p]))
    return unites
      .filter((u) => (!filtreType || u.typeUnite === filtreType) && (!filtreStatut || u.statut === filtreStatut))
      .flatMap((u) => {
        const p = positionParId.get(u.id)
        if (!p || p.lon === null || p.lat === null) return []
        return [{ id: u.id, nom: u.nom, typeUnite: u.typeUnite, statut: u.statut, effectif: u.effectif, communication: u.communication, lon: p.lon, lat: p.lat }]
      })
  }, [unites, positions, filtreType, filtreStatut])

  function changerFiltre(maj: () => void) {
    maj()
    setSelectionId(null)
  }

  return (
    <section className="grid min-h-0 grid-rows-[auto_1fr] gap-3.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <select
            aria-label="Type"
            value={filtreType}
            onChange={(e) => changerFiltre(() => setFiltreType(e.target.value))}
            className="h-[38px] rounded-lg border border-[#d8ded9] bg-white px-2.5"
          >
            <option value="">Tous les types</option>
            {Object.entries(typeUniteLabel).map(([valeur, label]) => (
              <option key={valeur} value={valeur}>
                {label}
              </option>
            ))}
          </select>
          <select
            aria-label="Statut"
            value={filtreStatut}
            onChange={(e) => changerFiltre(() => setFiltreStatut(e.target.value))}
            className="h-[38px] rounded-lg border border-[#d8ded9] bg-white px-2.5"
          >
            <option value="">Tous les statuts</option>
            {Object.entries(statutUniteStyle).map(([valeur, s]) => (
              <option key={valeur} value={valeur}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <button className="h-10 rounded-lg border border-[#17201b] bg-[#17201b] px-3.5 text-white">Ajouter une unité</button>
      </div>

      <div className="grid min-h-0 content-start gap-3.5 overflow-auto">
        <div className="overflow-auto rounded-lg border border-[#d8ded9] bg-white shadow-sm">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-[#f8faf7] text-xs text-[#65706a]">
                <th className="border-b border-[#d8ded9] px-3.5 py-3 text-left">Unité</th>
                <th className="border-b border-[#d8ded9] px-3.5 py-3 text-left">Type</th>
                <th className="border-b border-[#d8ded9] px-3.5 py-3 text-left">Statut</th>
                <th className="border-b border-[#d8ded9] px-3.5 py-3 text-left">Effectif</th>
                <th className="border-b border-[#d8ded9] px-3.5 py-3 text-left">Communication</th>
                <th className="border-b border-[#d8ded9] px-3.5 py-3 text-left">Dernier rapport</th>
                <th className="border-b border-[#d8ded9] px-3.5 py-3 text-left">Armement</th>
                <th className="border-b border-[#d8ded9] px-3.5 py-3 text-left">Munitions</th>
                <th className="border-b border-[#d8ded9] px-3.5 py-3 text-left">Carburant</th>
                <th className="border-b border-[#d8ded9] px-3.5 py-3 text-left">Vivres</th>
                <th className="border-b border-[#d8ded9] px-3.5 py-3 text-left">Santé</th>
                <th className="border-b border-[#d8ded9] px-3.5 py-3 text-left">Véhicules</th>
              </tr>
            </thead>
            <tbody>
              {unitesFiltrees.map((unite) => {
                const log = logistique.get(unite.id)
                return (
                <tr
                  key={unite.id}
                  onClick={() => setSelectionId(unite.id)}
                  title="Localiser sur la carte"
                  className={`cursor-pointer hover:bg-[#f8faf7] ${unite.id === selectionId ? 'bg-[#f3f5f2]' : ''}`}
                >
                  <td className="border-b border-[#d8ded9] px-3.5 py-3">{unite.nom}</td>
                  <td className="border-b border-[#d8ded9] px-3.5 py-3">{typeUniteLabel[unite.typeUnite as TypeUnite]}</td>
                  <td className="border-b border-[#d8ded9] px-3.5 py-3">
                    <span
                      className={`inline-flex min-h-[26px] items-center rounded-full px-2.5 text-xs font-bold ${statutUniteStyle[unite.statut as StatutUnite]?.badge ?? 'bg-gray-100 text-gray-700'}`}
                    >
                      {statutUniteStyle[unite.statut as StatutUnite]?.label ?? unite.statut}
                    </span>
                  </td>
                  <td className="border-b border-[#d8ded9] px-3.5 py-3">{unite.effectif}</td>
                  <td className="border-b border-[#d8ded9] px-3.5 py-3">{unite.communication === 'stable' ? 'Stable' : 'Dégradée'}</td>
                  <td className="border-b border-[#d8ded9] px-3.5 py-3">{unite.dernierRapport ?? '—'}</td>
                  <td className={`border-b border-[#d8ded9] px-3.5 py-3 ${log ? couleurTexte(log.armementPct) : ''}`}>{log ? `${log.armementPct}%` : '—'}</td>
                  <td className={`border-b border-[#d8ded9] px-3.5 py-3 ${log ? couleurTexte(log.munitionsPct) : ''}`}>{log ? `${log.munitionsPct}%` : '—'}</td>
                  <td className={`border-b border-[#d8ded9] px-3.5 py-3 ${log ? couleurTexte(log.carburantPct) : ''}`}>{log ? `${log.carburantPct}%` : '—'}</td>
                  <td className={`border-b border-[#d8ded9] px-3.5 py-3 ${log ? couleurTexte(log.vivresPct) : ''}`}>{log ? `${log.vivresPct}%` : '—'}</td>
                  <td className={`border-b border-[#d8ded9] px-3.5 py-3 ${log ? couleurTexte(log.santePct) : ''}`}>{log ? `${log.santePct}%` : '—'}</td>
                  <td className={`border-b border-[#d8ded9] px-3.5 py-3 ${log ? couleurTexte(log.vehiculePct) : ''}`}>{log ? `${log.vehiculePct}%` : '—'}</td>
                </tr>
                )
              })}
            </tbody>
          </table>
          {unitesFiltrees.length === 0 && <p className="m-0 px-3.5 py-3 text-sm text-[#65706a]">Aucune unité ne correspond aux filtres.</p>}
        </div>

        <div className="h-[520px]">
          <UnitesMap unites={unitesCarte} selectionId={selectionId} onSelect={setSelectionId} />
        </div>
      </div>
    </section>
  )
}
