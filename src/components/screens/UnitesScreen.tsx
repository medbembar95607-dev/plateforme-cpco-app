import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { api } from '../../api/client'
import type { SituationDTO } from '../../api/client'
import { UnitesMap, type NiveauDeficit, type UniteCarte } from '../map/UnitesMap'
import { echelonLabel, statutUniteStyle, typeUniteLabel } from '../../uniteStyle'
import type { StatutUnite, TypeUnite } from '../../types'

type UniteRow = Awaited<ReturnType<typeof api.units>>[number]
type LogistiqueRow = Awaited<ReturnType<typeof api.logistics>>[number]

// Capacités qui composent le potentiel d'une unité (niveaux logistiques en %).
const capacites = [
  { label: 'Armement', champ: 'armementPct' },
  { label: 'Munitions', champ: 'munitionsPct' },
  { label: 'Carburant', champ: 'carburantPct' },
  { label: 'Vivres', champ: 'vivresPct' },
  { label: 'Maintenance', champ: 'maintenancePct' },
  { label: 'Santé', champ: 'santePct' },
  { label: 'Véhicules', champ: 'vehiculePct' },
] as const

// Mêmes seuils que les couleurs du tableau : 50 % et moins = déficit, 30 % et moins = critique.
const SEUIL_DEFICIT = 50
const SEUIL_CRITIQUE = 30

function couleurTexte(pct: number) {
  if (pct <= SEUIL_CRITIQUE) return 'text-[#b9332c] font-bold'
  if (pct <= SEUIL_DEFICIT) return 'text-[#ba7a0b] font-bold'
  return 'text-[#17201b]'
}

function couleurBarre(pct: number) {
  if (pct <= SEUIL_CRITIQUE) return 'bg-[#b9332c]'
  if (pct <= SEUIL_DEFICIT) return 'bg-[#ba7a0b]'
  return 'bg-[#2f855a]'
}

function capacitesEnDeficit(log: LogistiqueRow | undefined) {
  if (!log) return []
  return capacites
    .map((c) => ({ label: c.label, pct: log[c.champ] }))
    .filter((c) => c.pct <= SEUIL_DEFICIT)
    .sort((a, b) => a.pct - b.pct)
}

function niveauDeficit(log: LogistiqueRow | undefined): NiveauDeficit | null {
  const deficits = capacitesEnDeficit(log)
  if (deficits.length === 0) return null
  return deficits[0].pct <= SEUIL_CRITIQUE ? 'critique' : 'bas'
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
  const positionParId = new Map(positions.map((p) => [p.id, p]))

  // Mémorisé : la carte recadre quand la liste filtrée change, pas à chaque rendu.
  const unitesCarte: UniteCarte[] = useMemo(() => {
    const parId = new Map(positions.map((p) => [p.id, p]))
    return unites
      .filter((u) => (!filtreType || u.typeUnite === filtreType) && (!filtreStatut || u.statut === filtreStatut))
      .flatMap((u) => {
        const p = parId.get(u.id)
        if (!p || p.lon === null || p.lat === null) return []
        return [{ id: u.id, nom: u.nom, typeUnite: u.typeUnite, statut: u.statut, effectif: u.effectif, communication: u.communication, lon: p.lon, lat: p.lat }]
      })
  }, [unites, positions, filtreType, filtreStatut])

  const deficits: Record<string, NiveauDeficit> = useMemo(() => {
    const out: Record<string, NiveauDeficit> = {}
    logistique.forEach((log, id) => {
      const niveau = niveauDeficit(log)
      if (niveau) out[id] = niveau
    })
    return out
  }, [logistique])

  const unitesEnDeficit = unitesFiltrees
    .filter((u) => deficits[u.id])
    .sort((a, b) => (capacitesEnDeficit(logistique.get(a.id))[0]?.pct ?? 100) - (capacitesEnDeficit(logistique.get(b.id))[0]?.pct ?? 100))

  const uniteSelectionnee = unites.find((u) => u.id === selectionId) ?? null

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
        {/* Carte au centre, potentiel de l'unité dans le panneau latéral. */}
        <div className="grid h-[calc(100vh-250px)] min-h-[480px] grid-cols-[minmax(0,1fr)_340px] gap-3.5">
          <UnitesMap unites={unitesCarte} deficits={deficits} selectionId={selectionId} onSelect={setSelectionId} />

          <aside className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-[#d8ded9] bg-white shadow-sm">
            {uniteSelectionnee ? (
              <PotentielUnite
                unite={uniteSelectionnee}
                log={logistique.get(uniteSelectionnee.id)}
                position={positionParId.get(uniteSelectionnee.id)}
                onFermer={() => setSelectionId(null)}
              />
            ) : (
              <>
                <div className="border-b border-[#d8ded9] px-3.5 py-3">
                  <h3 className="m-0 text-[15px] text-[#17201b]">Unités en déficit de capacité · {unitesEnDeficit.length}</h3>
                  <p className="m-0 mt-1 text-xs text-[#65706a]">Cliquez une unité sur la carte ou dans cette liste pour afficher son potentiel.</p>
                </div>
                <div className="min-h-0 flex-1 overflow-auto">
                  {unitesEnDeficit.length === 0 && <p className="m-0 px-3.5 py-3 text-sm text-[#65706a]">Aucune unité en déficit.</p>}
                  {unitesEnDeficit.map((u) => {
                    const manques = capacitesEnDeficit(logistique.get(u.id))
                    const critique = deficits[u.id] === 'critique'
                    return (
                      <button
                        key={u.id}
                        onClick={() => setSelectionId(u.id)}
                        className="block w-full border-b border-[#eef1ee] px-3.5 py-3 text-left hover:bg-[#f8faf7]"
                      >
                        <div className="flex items-center gap-2">
                          <AlertTriangle size={15} className={critique ? 'text-[#b9332c]' : 'text-[#ba7a0b]'} />
                          <span className="text-sm font-bold text-[#17201b]">{u.nom}</span>
                          <span className={`ml-auto text-xs font-bold ${critique ? 'text-[#b9332c]' : 'text-[#ba7a0b]'}`}>{critique ? 'Critique' : 'Déficit'}</span>
                        </div>
                        <div className="mt-1 text-xs text-[#65706a]">{manques.map((m) => `${m.label} ${m.pct}%`).join(' · ')}</div>
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </aside>
        </div>

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
                {capacites.map((c) => (
                  <th key={c.champ} className="border-b border-[#d8ded9] px-3.5 py-3 text-left">
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {unitesFiltrees.map((unite) => {
                const log = logistique.get(unite.id)
                return (
                  <tr
                    key={unite.id}
                    onClick={() => setSelectionId(unite.id)}
                    title="Afficher sur la carte et voir le potentiel"
                    className={`cursor-pointer hover:bg-[#f8faf7] ${unite.id === selectionId ? 'bg-[#f3f5f2]' : ''}`}
                  >
                    <td className="border-b border-[#d8ded9] px-3.5 py-3">
                      <span className="flex items-center gap-1.5">
                        {deficits[unite.id] && (
                          <AlertTriangle size={14} className={deficits[unite.id] === 'critique' ? 'text-[#b9332c]' : 'text-[#ba7a0b]'} />
                        )}
                        {unite.nom}
                      </span>
                    </td>
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
                    {capacites.map((c) => (
                      <td key={c.champ} className={`border-b border-[#d8ded9] px-3.5 py-3 ${log ? couleurTexte(log[c.champ]) : ''}`}>
                        {log ? `${log[c.champ]}%` : '—'}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
          {unitesFiltrees.length === 0 && <p className="m-0 px-3.5 py-3 text-sm text-[#65706a]">Aucune unité ne correspond aux filtres.</p>}
        </div>
      </div>
    </section>
  )
}

interface PotentielUniteProps {
  unite: UniteRow
  log: LogistiqueRow | undefined
  position: SituationDTO['unites'][number] | undefined
  onFermer: () => void
}

function PotentielUnite({ unite, log, position, onFermer }: PotentielUniteProps) {
  const statut = statutUniteStyle[unite.statut as StatutUnite]
  const manques = capacitesEnDeficit(log)
  // Potentiel global : moyenne des capacités, indicateur synthétique pour le commandement.
  const potentielGlobal = log ? Math.round(capacites.reduce((somme, c) => somme + log[c.champ], 0) / capacites.length) : null

  const infos: [string, string][] = [
    ['Type', `${typeUniteLabel[unite.typeUnite as TypeUnite] ?? unite.typeUnite} · ${echelonLabel[unite.echelon] ?? unite.echelon}`],
    ['Effectif', `${unite.effectif} personnels`],
    ['Liaison', unite.communication === 'stable' ? 'Stable' : 'Dégradée'],
    ['Dernier rapport', unite.dernierRapport ?? '—'],
    ['Position', position?.lat != null && position.lon != null ? `${position.lat.toFixed(3)}° N, ${Math.abs(position.lon).toFixed(3)}° O` : '—'],
  ]

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-start justify-between gap-2 border-b border-[#d8ded9] px-3.5 py-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-wide text-[#65706a]">Potentiel de l'unité</div>
          <h3 className="m-0 mt-0.5 text-[17px] text-[#17201b]">{unite.nom}</h3>
          {statut && <span className={`mt-1.5 inline-flex min-h-[24px] items-center rounded-full px-2.5 text-xs font-bold ${statut.badge}`}>{statut.label}</span>}
        </div>
        <button onClick={onFermer} title="Fermer" className="text-[#65706a] hover:text-[#17201b]">
          <X size={18} />
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-auto px-3.5 py-3">
        {potentielGlobal !== null && (
          <div className="rounded-lg bg-[#f8faf7] p-3">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-bold text-[#65706a]">Potentiel global</span>
              <span className={`text-2xl font-bold ${couleurTexte(potentielGlobal)}`}>{potentielGlobal}%</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#e5e9e5]">
              <div className={`h-full ${couleurBarre(potentielGlobal)}`} style={{ width: `${potentielGlobal}%` }} />
            </div>
            <div className="mt-1 text-[11px] text-[#65706a]">Moyenne des 7 capacités</div>
          </div>
        )}

        {manques.length > 0 && (
          <div className="rounded-lg border border-[#f3d2cf] bg-[#fdf3f2] p-3 text-xs text-[#8a2a24]">
            <div className="mb-1 flex items-center gap-1.5 font-bold">
              <AlertTriangle size={14} /> Déficit de capacité
            </div>
            {manques.map((m) => `${m.label} ${m.pct}%`).join(' · ')}
          </div>
        )}

        <div>
          <div className="mb-2 text-xs font-bold uppercase tracking-wide text-[#65706a]">Capacités</div>
          {log ? (
            <div className="space-y-2">
              {capacites.map((c) => {
                const pct = log[c.champ]
                return (
                  <div key={c.champ}>
                    <div className="mb-0.5 flex justify-between text-xs">
                      <span className="text-[#17201b]">{c.label}</span>
                      <span className={couleurTexte(pct)}>{pct}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-[#e5e9e5]">
                      <div className={`h-full ${couleurBarre(pct)}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="m-0 text-xs text-[#65706a]">Aucun suivi logistique pour cette unité.</p>
          )}
        </div>

        <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-xs">
          {infos.map(([cle, valeur]) => (
            <div key={cle} className="contents">
              <dt className="font-bold text-[#65706a]">{cle}</dt>
              <dd className="m-0 text-[#17201b]">{valeur}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}
