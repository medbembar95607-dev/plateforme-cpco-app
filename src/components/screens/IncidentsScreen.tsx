import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, MapPin, X } from 'lucide-react'
import { api } from '../../api/client'
import { IncidentsMap, type IncidentCarte } from '../map/IncidentsMap'

type IncidentRow = Awaited<ReturnType<typeof api.incidents>>[number]

const graviteStyle: Record<string, string> = {
  faible: 'bg-gray-100 text-gray-700',
  moyenne: 'bg-amber-50 text-amber-700',
  elevee: 'bg-orange-50 text-orange-700',
  critique: 'bg-red-50 text-red-700',
}

const graviteLabel: Record<string, string> = { faible: 'Faible', moyenne: 'Moyenne', elevee: 'Élevée', critique: 'Critique' }
const statutLabel: Record<string, string> = { nouveau: 'Nouveau', en_cours: 'En cours', traite: 'Traité' }
const typeLabel: Record<string, string> = {
  securite: 'Sécurité',
  logistique: 'Logistique',
  renseignement: 'Renseignement',
  medical: 'Médical',
  communication: 'Communication',
}
const rangGravite: Record<string, number> = { critique: 0, elevee: 1, moyenne: 2, faible: 3 }

function formatDate(iso: string) {
  return iso.replace('T', ' ').slice(0, 16)
}

export function IncidentsScreen() {
  const [incidents, setIncidents] = useState<IncidentRow[]>([])
  const [filtreType, setFiltreType] = useState('')
  const [filtreGravite, setFiltreGravite] = useState('')
  const [filtreStatut, setFiltreStatut] = useState('')
  const [selectionId, setSelectionId] = useState<string | null>(null)

  useEffect(() => {
    api.incidents().then(setIncidents)
  }, [])

  const filtrer = (i: IncidentRow) =>
    (!filtreType || i.type_incident === filtreType) && (!filtreGravite || i.niveau_gravite === filtreGravite) && (!filtreStatut || i.statut === filtreStatut)
  const incidentsFiltres = incidents.filter(filtrer)

  // Mémorisé : la carte recadre quand la liste filtrée change, pas à chaque rendu.
  const incidentsCarte: IncidentCarte[] = useMemo(
    () =>
      incidents
        .filter(
          (i) =>
            (!filtreType || i.type_incident === filtreType) &&
            (!filtreGravite || i.niveau_gravite === filtreGravite) &&
            (!filtreStatut || i.statut === filtreStatut),
        )
        .flatMap((i) =>
          i.lon === null || i.lat === null
            ? []
            : [{ id: i.id, typeIncident: i.type_incident, gravite: i.niveau_gravite, statut: i.statut, localite: i.localite, lon: i.lon, lat: i.lat }],
        ),
    [incidents, filtreType, filtreGravite, filtreStatut],
  )

  // Panneau par défaut : incidents non traités, les plus graves d'abord.
  const aTraiter = incidentsFiltres
    .filter((i) => i.statut !== 'traite')
    .sort((a, b) => (rangGravite[a.niveau_gravite] ?? 9) - (rangGravite[b.niveau_gravite] ?? 9) || b.date_incident.localeCompare(a.date_incident))
  const nbCritiques = aTraiter.filter((i) => i.niveau_gravite === 'critique').length
  const incidentSelectionne = incidents.find((i) => i.id === selectionId) ?? null

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
          <select aria-label="Gravité" value={filtreGravite} onChange={(e) => changerFiltre(() => setFiltreGravite(e.target.value))} className={selectClasse}>
            <option value="">Toutes les gravités</option>
            {Object.entries(graviteLabel).map(([valeur, label]) => (
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
        {/* Carte au centre, détail de l'incident dans le panneau latéral. */}
        <div className="grid h-[calc(100vh-250px)] min-h-[480px] grid-cols-[minmax(0,1fr)_340px] gap-3.5">
          <IncidentsMap incidents={incidentsCarte} selectionId={selectionId} onSelect={setSelectionId} />

          <aside className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-[#d8ded9] bg-white shadow-sm">
            {incidentSelectionne ? (
              <DetailIncident incident={incidentSelectionne} onFermer={() => setSelectionId(null)} />
            ) : (
              <>
                <div className="border-b border-[#d8ded9] px-3.5 py-3">
                  <h3 className="m-0 text-[15px] text-[#17201b]">Incidents à traiter · {aTraiter.length}</h3>
                  <p className="m-0 mt-1 text-xs text-[#65706a]">
                    {nbCritiques > 0 ? `${nbCritiques} critique(s). ` : ''}Cliquez un incident sur la carte ou dans cette liste pour afficher son détail.
                  </p>
                </div>
                <div className="min-h-0 flex-1 overflow-auto">
                  {aTraiter.length === 0 && <p className="m-0 px-3.5 py-3 text-sm text-[#65706a]">Aucun incident à traiter.</p>}
                  {aTraiter.map((i) => {
                    const critique = i.niveau_gravite === 'critique'
                    return (
                      <button
                        key={i.id}
                        onClick={() => setSelectionId(i.id)}
                        className={`block w-full border-b border-[#eef1ee] px-3.5 py-3 text-left hover:bg-[#f8faf7] ${critique ? 'border-l-4 border-l-[#b9332c]' : ''}`}
                      >
                        <div className="flex items-center gap-2">
                          {critique && <AlertTriangle size={15} className="text-[#b9332c]" />}
                          <span className="text-sm font-bold text-[#17201b]">{i.localite}</span>
                          <span className={`ml-auto inline-flex min-h-[22px] items-center rounded-full px-2 text-[11px] font-bold ${graviteStyle[i.niveau_gravite]}`}>
                            {graviteLabel[i.niveau_gravite]}
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-[#65706a]">
                          {typeLabel[i.type_incident]} · {statutLabel[i.statut]} · {formatDate(i.date_incident)}
                          {i.lon === null && ' · non localisé'}
                        </div>
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
                <th className="border-b border-[#d8ded9] px-3.5 py-3 text-left">Date</th>
                <th className="border-b border-[#d8ded9] px-3.5 py-3 text-left">Type</th>
                <th className="border-b border-[#d8ded9] px-3.5 py-3 text-left">Localité</th>
                <th className="border-b border-[#d8ded9] px-3.5 py-3 text-left">Gravité</th>
                <th className="border-b border-[#d8ded9] px-3.5 py-3 text-left">Statut</th>
                <th className="border-b border-[#d8ded9] px-3.5 py-3 text-left">Déclarant</th>
              </tr>
            </thead>
            <tbody>
              {incidentsFiltres.map((incident) => (
                <tr
                  key={incident.id}
                  onClick={() => setSelectionId(incident.id)}
                  title="Afficher sur la carte et voir le détail"
                  className={`cursor-pointer hover:bg-[#f8faf7] ${incident.id === selectionId ? 'bg-[#f3f5f2]' : ''}`}
                >
                  <td className="border-b border-[#d8ded9] px-3.5 py-3">{formatDate(incident.date_incident)}</td>
                  <td className="border-b border-[#d8ded9] px-3.5 py-3">{typeLabel[incident.type_incident]}</td>
                  <td className="border-b border-[#d8ded9] px-3.5 py-3">
                    <span className="flex items-center gap-1.5">
                      {incident.niveau_gravite === 'critique' && <AlertTriangle size={14} className="text-[#b9332c]" />}
                      {incident.localite}
                    </span>
                  </td>
                  <td className="border-b border-[#d8ded9] px-3.5 py-3">
                    <span className={`inline-flex min-h-[26px] items-center rounded-full px-2.5 text-xs font-bold ${graviteStyle[incident.niveau_gravite]}`}>
                      {graviteLabel[incident.niveau_gravite]}
                    </span>
                  </td>
                  <td className="border-b border-[#d8ded9] px-3.5 py-3">{statutLabel[incident.statut]}</td>
                  <td className="border-b border-[#d8ded9] px-3.5 py-3">{incident.declarant}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {incidentsFiltres.length === 0 && <p className="m-0 px-3.5 py-3 text-sm text-[#65706a]">Aucun incident ne correspond aux filtres.</p>}
        </div>
      </div>
    </section>
  )
}

function DetailIncident({ incident, onFermer }: { incident: IncidentRow; onFermer: () => void }) {
  const critique = incident.niveau_gravite === 'critique'
  const infos: [string, string][] = [
    ['Type', typeLabel[incident.type_incident] ?? incident.type_incident],
    ['Statut', statutLabel[incident.statut] ?? incident.statut],
    ['Date', formatDate(incident.date_incident)],
    ['Déclarant', incident.declarant],
    ['Position', incident.lat !== null && incident.lon !== null ? `${incident.lat.toFixed(3)}° N, ${Math.abs(incident.lon).toFixed(3)}° O` : 'Non localisé'],
  ]
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-start justify-between gap-2 border-b border-[#d8ded9] px-3.5 py-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-wide text-[#65706a]">Détail de l'incident</div>
          <h3 className="m-0 mt-0.5 flex items-center gap-1.5 text-[17px] text-[#17201b]">
            <MapPin size={16} className="text-[#65706a]" />
            {incident.localite}
          </h3>
          <span className={`mt-1.5 inline-flex min-h-[24px] items-center rounded-full px-2.5 text-xs font-bold ${graviteStyle[incident.niveau_gravite]}`}>
            Gravité : {graviteLabel[incident.niveau_gravite]}
          </span>
        </div>
        <button onClick={onFermer} title="Fermer" className="text-[#65706a] hover:text-[#17201b]">
          <X size={18} />
        </button>
      </div>
      <div className="min-h-0 flex-1 space-y-4 overflow-auto px-3.5 py-3">
        {critique && incident.statut !== 'traite' && (
          <div className="flex items-center gap-1.5 rounded-lg border border-[#f3d2cf] bg-[#fdf3f2] p-3 text-xs font-bold text-[#8a2a24]">
            <AlertTriangle size={14} /> Incident critique en cours de traitement
          </div>
        )}
        <div>
          <div className="mb-1 text-xs font-bold uppercase tracking-wide text-[#65706a]">Description</div>
          <p className="m-0 rounded-lg bg-[#f8faf7] p-3 text-sm leading-relaxed text-[#17201b]">{incident.description}</p>
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
