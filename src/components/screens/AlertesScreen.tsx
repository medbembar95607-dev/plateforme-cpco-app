import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, MapPin, X } from 'lucide-react'
import { api } from '../../api/client'
import { lireFocus } from '../../focusDemo'
import { AlertesMap, type AlerteCarte } from '../map/AlertesMap'

type AlerteRow = Awaited<ReturnType<typeof api.alerts>>[number]

const niveauStyle: Record<string, { label: string; badge: string; bordure: string }> = {
  info: { label: 'Info', badge: 'bg-blue-50 text-blue-700', bordure: 'border-l-[#1f6fb2]' },
  attention: { label: 'Attention', badge: 'bg-amber-50 text-amber-700', bordure: 'border-l-[#ba7a0b]' },
  critique: { label: 'Critique', badge: 'bg-red-50 text-red-700', bordure: 'border-l-[#b9332c]' },
}

const typeLabel: Record<string, string> = { logistique: 'Logistique', menace: 'Menace', communication: 'Communication', operationnelle: 'Opérationnelle' }
const statutLabel: Record<string, string> = { active: 'Active', acquittee: 'Acquittée', resolue: 'Résolue' }
const ordreNiveau: Record<string, number> = { critique: 0, attention: 1, info: 2 }

function heure(iso: string) {
  return iso.slice(11, 16)
}

export function AlertesScreen() {
  const [alertes, setAlertes] = useState<AlerteRow[]>([])
  const [filtreType, setFiltreType] = useState('')
  const [filtreStatut, setFiltreStatut] = useState('')
  // Élément créé depuis l'écran de démonstration : sélectionné à l'arrivée.
  const [selectionId, setSelectionId] = useState<string | null>(() => lireFocus('alertes'))
  const [erreur, setErreur] = useState<string | null>(null)

  useEffect(() => {
    api.alerts().then(setAlertes)
  }, [])

  async function acquitter(id: string) {
    setErreur(null)
    try {
      await api.acknowledgeAlert(id)
      setAlertes((prev) => prev.map((a) => (a.id === id ? { ...a, statut: 'acquittee' } : a)))
    } catch (err) {
      setErreur(err instanceof Error ? err.message : String(err))
    }
  }

  const alertesFiltrees = alertes.filter((a) => (!filtreType || a.type_alerte === filtreType) && (!filtreStatut || a.statut === filtreStatut))
  const triees = [...alertesFiltrees].sort((a, b) => ordreNiveau[a.niveau] - ordreNiveau[b.niveau] || b.date_creation.localeCompare(a.date_creation))
  const actives = triees.filter((a) => a.statut === 'active')
  const nbCritiques = actives.filter((a) => a.niveau === 'critique').length
  const alerteSelectionnee = alertes.find((a) => a.id === selectionId) ?? null

  // Mémorisé sur les seuls champs affichés : la carte recadre quand la liste filtrée change,
  // pas à chaque rendu (un acquittement ne déplace pas la vue).
  const alertesCarte: AlerteCarte[] = useMemo(
    () =>
      alertes
        .filter((a) => (!filtreType || a.type_alerte === filtreType) && (!filtreStatut || a.statut === filtreStatut))
        .flatMap((a) =>
          a.lon === null || a.lat === null
            ? []
            : [{ id: a.id, typeAlerte: a.type_alerte, niveau: a.niveau, statut: a.statut, message: a.message, lon: a.lon, lat: a.lat }],
        ),
    [alertes, filtreType, filtreStatut],
  )

  function changerFiltre(maj: () => void) {
    maj()
    setSelectionId(null)
  }

  const selectClasse = 'h-[38px] rounded-lg border border-[#d8ded9] bg-white px-2.5'

  return (
    <section className="grid min-h-0 grid-rows-[auto_1fr] gap-3.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <select aria-label="Type" value={filtreType} onChange={(e) => changerFiltre(() => setFiltreType(e.target.value))} className={selectClasse}>
            <option value="">Tous les types</option>
            {Object.entries(typeLabel).map(([valeur, label]) => (
              <option key={valeur} value={valeur}>
                {label}
              </option>
            ))}
          </select>
          <select aria-label="Statut" value={filtreStatut} onChange={(e) => changerFiltre(() => setFiltreStatut(e.target.value))} className={selectClasse}>
            <option value="">Tous les statuts</option>
            {Object.entries(statutLabel).map(([valeur, label]) => (
              <option key={valeur} value={valeur}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid min-h-0 content-start gap-3.5 overflow-auto">
        {erreur && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</div>}

        {/* Carte au centre, détail de l'alerte dans le panneau latéral. */}
        <div className="grid h-[calc(100vh-250px)] min-h-[480px] grid-cols-[minmax(0,1fr)_340px] gap-3.5">
          <AlertesMap alertes={alertesCarte} selectionId={selectionId} onSelect={setSelectionId} />

          <aside className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-[#d8ded9] bg-white shadow-sm">
            {alerteSelectionnee ? (
              <DetailAlerte alerte={alerteSelectionnee} onFermer={() => setSelectionId(null)} onAcquitter={acquitter} />
            ) : (
              <>
                <div className="border-b border-[#d8ded9] px-3.5 py-3">
                  <h3 className="m-0 text-[15px] text-[#17201b]">Alertes actives · {actives.length}</h3>
                  <p className="m-0 mt-1 text-xs text-[#65706a]">
                    {nbCritiques > 0 ? `${nbCritiques} critique(s). ` : ''}Cliquez une alerte sur la carte ou dans cette liste pour afficher son détail.
                  </p>
                </div>
                <div className="min-h-0 flex-1 overflow-auto">
                  {actives.length === 0 && <p className="m-0 px-3.5 py-3 text-sm text-[#65706a]">Aucune alerte active.</p>}
                  {actives.map((a) => (
                    <div
                      key={a.id}
                      onClick={() => setSelectionId(a.id)}
                      className={`cursor-pointer border-b border-l-4 border-b-[#eef1ee] px-3.5 py-3 hover:bg-[#f8faf7] ${niveauStyle[a.niveau].bordure}`}
                    >
                      <div className="flex items-center gap-2">
                        {a.niveau === 'critique' && <AlertTriangle size={15} className="text-[#b9332c]" />}
                        <span className={`inline-flex min-h-[22px] items-center rounded-full px-2 text-[11px] font-bold ${niveauStyle[a.niveau].badge}`}>
                          {niveauStyle[a.niveau].label}
                        </span>
                        <span className="text-xs text-[#65706a]">
                          {typeLabel[a.type_alerte]} · {heure(a.date_creation)}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-[#17201b]">{a.message}</div>
                      <div className="mt-1.5 flex items-center justify-between">
                        <span className="text-xs text-[#65706a]">{a.lon === null ? 'Non localisée' : ''}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            acquitter(a.id)
                          }}
                          className="rounded-md border border-[#d8ded9] bg-white px-2 py-1 text-xs text-[#17201b] hover:bg-[#f3f5f2]"
                        >
                          Acquitter
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </aside>
        </div>

        <div className="grid gap-2.5">
          {triees.length === 0 && <p className="m-0 text-sm text-[#65706a]">Aucune alerte ne correspond aux filtres.</p>}
          {triees.map((alerte) => (
            <div
              key={alerte.id}
              onClick={() => setSelectionId(alerte.id)}
              title="Afficher sur la carte et voir le détail"
              className={`flex cursor-pointer items-center justify-between gap-3.5 rounded-lg border border-l-4 border-[#d8ded9] bg-white p-3.5 shadow-sm hover:bg-[#f8faf7] ${niveauStyle[alerte.niveau].bordure} ${
                alerte.id === selectionId ? 'ring-1 ring-[#17201b]' : ''
              }`}
            >
              <div className="grid gap-1">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex min-h-[24px] items-center rounded-full px-2 text-xs font-bold ${niveauStyle[alerte.niveau].badge}`}>
                    {niveauStyle[alerte.niveau].label}
                  </span>
                  <span className="text-xs text-[#65706a]">{typeLabel[alerte.type_alerte]}</span>
                  <span className="text-xs text-[#65706a]">{heure(alerte.date_creation)}</span>
                </div>
                <p className="m-0 text-sm text-[#17201b]">{alerte.message}</p>
                <span className="text-xs text-[#65706a]">Statut : {statutLabel[alerte.statut]}</span>
              </div>
              {alerte.statut === 'active' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    acquitter(alerte.id)
                  }}
                  className="h-9 shrink-0 rounded-lg border border-[#d8ded9] bg-white px-3 text-sm text-[#17201b]"
                >
                  Acquitter
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function DetailAlerte({ alerte, onFermer, onAcquitter }: { alerte: AlerteRow; onFermer: () => void; onAcquitter: (id: string) => void }) {
  const critique = alerte.niveau === 'critique'
  const infos: [string, string][] = [
    ['Type', typeLabel[alerte.type_alerte] ?? alerte.type_alerte],
    ['Statut', statutLabel[alerte.statut] ?? alerte.statut],
    ['Émise le', alerte.date_creation.replace('T', ' ').slice(0, 16)],
    ['Position', alerte.lat !== null && alerte.lon !== null ? `${alerte.lat.toFixed(3)}° N, ${Math.abs(alerte.lon).toFixed(3)}° O` : 'Non localisée'],
  ]
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-start justify-between gap-2 border-b border-[#d8ded9] px-3.5 py-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-wide text-[#65706a]">Détail de l'alerte</div>
          <h3 className="m-0 mt-0.5 flex items-center gap-1.5 text-[17px] text-[#17201b]">
            <MapPin size={16} className="text-[#65706a]" />
            {typeLabel[alerte.type_alerte] ?? alerte.type_alerte}
          </h3>
          <span className={`mt-1.5 inline-flex min-h-[24px] items-center rounded-full px-2.5 text-xs font-bold ${niveauStyle[alerte.niveau].badge}`}>
            Niveau : {niveauStyle[alerte.niveau].label}
          </span>
        </div>
        <button onClick={onFermer} title="Fermer" className="text-[#65706a] hover:text-[#17201b]">
          <X size={18} />
        </button>
      </div>
      <div className="min-h-0 flex-1 space-y-4 overflow-auto px-3.5 py-3">
        {critique && alerte.statut === 'active' && (
          <div className="flex items-center gap-1.5 rounded-lg border border-[#f3d2cf] bg-[#fdf3f2] p-3 text-xs font-bold text-[#8a2a24]">
            <AlertTriangle size={14} /> Alerte critique non acquittée
          </div>
        )}
        <div>
          <div className="mb-1 text-xs font-bold uppercase tracking-wide text-[#65706a]">Message</div>
          <p className="m-0 rounded-lg bg-[#f8faf7] p-3 text-sm leading-relaxed text-[#17201b]">{alerte.message}</p>
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
      {alerte.statut === 'active' && (
        <div className="border-t border-[#d8ded9] px-3.5 py-3">
          <button
            onClick={() => onAcquitter(alerte.id)}
            className="w-full rounded-lg border border-[#17201b] bg-[#17201b] px-3 py-2 text-sm text-white"
          >
            Acquitter l'alerte
          </button>
        </div>
      )}
    </div>
  )
}
