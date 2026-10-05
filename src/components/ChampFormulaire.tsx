import type { ChampSaisieDTO, ReferencesSaisieDTO } from '../api/client'

// Champ de formulaire générique, décrit par l'API (GET /demo/schema et /demo/donnees) : sert à la
// correction et à l'ajout d'impacts dans la démonstration, et à l'éditeur de données existantes.

export interface ValeurPosition {
  lon: number | null
  lat: number | null
  localite?: string | null
}

const champClasse = 'w-full rounded-lg border border-[#d8ded9] bg-white px-2.5 py-1.5 text-sm outline-none focus:border-[#17201b]'

// « 2026-10-07T18:57:00 » -> « 2026-10-07T18:57 » (format attendu par <input type="datetime-local">).
function versSaisieDate(v: unknown): string {
  return typeof v === 'string' ? v.slice(0, 16) : ''
}

interface ChampFormulaireProps {
  champ: ChampSaisieDTO
  valeur: unknown
  references: ReferencesSaisieDTO
  onChange: (valeur: unknown) => void
}

export function ChampFormulaire({ champ, valeur, references, onChange }: ChampFormulaireProps) {
  const libelle = (
    <label className="mb-1 block text-xs font-bold text-[#65706a]">
      {champ.libelle}
      {!champ.obligatoire && <span className="font-normal"> (facultatif)</span>}
    </label>
  )

  switch (champ.type) {
    case 'texte_long':
      return (
        <div className="col-span-2">
          {libelle}
          <textarea value={String(valeur ?? '')} onChange={(e) => onChange(e.target.value)} rows={3} className={`${champClasse} resize-none`} />
        </div>
      )
    case 'nombre':
      return (
        <div>
          {libelle}
          <input
            type="number"
            min={0}
            value={valeur === null || valeur === undefined ? '' : String(valeur)}
            onChange={(e) => onChange(e.target.value)}
            className={champClasse}
          />
        </div>
      )
    case 'choix':
      return (
        <div>
          {libelle}
          <select value={String(valeur ?? '')} onChange={(e) => onChange(e.target.value)} className={champClasse}>
            {!champ.obligatoire && <option value="">—</option>}
            {champ.options.map((o) => (
              <option key={o.valeur} value={o.valeur}>
                {o.libelle}
              </option>
            ))}
          </select>
        </div>
      )
    case 'dateheure':
      return (
        <div>
          {libelle}
          <input type="datetime-local" value={versSaisieDate(valeur)} onChange={(e) => onChange(e.target.value)} className={champClasse} />
        </div>
      )
    case 'unite':
      return (
        <div>
          {libelle}
          <select value={String(valeur ?? '')} onChange={(e) => onChange(e.target.value)} className={champClasse}>
            <option value="">— Choisir une unité —</option>
            {references.unites.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nom}
              </option>
            ))}
          </select>
        </div>
      )
    case 'unites': {
      const choisies = new Set(((valeur as Array<{ id: string }>) ?? []).map((u) => u.id))
      return (
        <div className="col-span-2">
          {libelle}
          <div className="flex flex-wrap gap-1.5">
            {references.unites.map((u) => (
              <label
                key={u.id}
                className={`flex cursor-pointer items-center gap-1.5 rounded-md border px-2 py-1 text-xs ${choisies.has(u.id) ? 'border-[#17201b] bg-[#f3f5f2]' : 'border-[#d8ded9]'}`}
              >
                <input
                  type="checkbox"
                  checked={choisies.has(u.id)}
                  onChange={() =>
                    onChange(
                      choisies.has(u.id)
                        ? references.unites.filter((x) => choisies.has(x.id) && x.id !== u.id)
                        : references.unites.filter((x) => choisies.has(x.id) || x.id === u.id),
                    )
                  }
                />
                {u.nom}
              </label>
            ))}
          </div>
        </div>
      )
    }
    case 'ligne_budget':
    case 'materiel': {
      const liste = champ.type === 'ligne_budget' ? references.lignes.map((l) => ({ id: l.id, nom: l.libelle })) : references.materiels
      return (
        <div className="col-span-2">
          {libelle}
          <select value={String(valeur ?? '')} onChange={(e) => onChange(e.target.value)} className={champClasse}>
            <option value="">— Choisir —</option>
            {liste.map((x) => (
              <option key={x.id} value={x.id}>
                {x.nom}
              </option>
            ))}
          </select>
        </div>
      )
    }
    case 'position': {
      const pos = (valeur as ValeurPosition) ?? { lon: null, lat: null }
      const lieuCourant = references.lieux.find((l) => l.lon === pos.lon && l.lat === pos.lat)
      return (
        <div className="col-span-2">
          {libelle}
          <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)] gap-2">
            <select
              value={lieuCourant?.cle ?? ''}
              onChange={(e) => {
                const l = references.lieux.find((x) => x.cle === e.target.value)
                onChange(l ? { lon: l.lon, lat: l.lat, localite: l.libelle } : { lon: null, lat: null, localite: null })
              }}
              className={champClasse}
            >
              <option value="">{pos.lon !== null ? 'Coordonnées saisies' : '— Lieu connu —'}</option>
              {references.lieux.map((l) => (
                <option key={l.cle} value={l.cle}>
                  {l.libelle}
                </option>
              ))}
            </select>
            <input
              type="number"
              step="0.01"
              placeholder="Latitude (N)"
              value={pos.lat ?? ''}
              onChange={(e) =>
                onChange({
                  ...pos,
                  lat: e.target.value === '' ? null : Number(e.target.value),
                })
              }
              className={champClasse}
            />
            <input
              type="number"
              step="0.01"
              placeholder="Longitude (O = négatif)"
              value={pos.lon ?? ''}
              onChange={(e) =>
                onChange({
                  ...pos,
                  lon: e.target.value === '' ? null : Number(e.target.value),
                })
              }
              className={champClasse}
            />
          </div>
        </div>
      )
    }
    default:
      return (
        <div>
          {libelle}
          <input value={String(valeur ?? '')} onChange={(e) => onChange(e.target.value)} className={champClasse} />
        </div>
      )
  }
}

// Champ obligatoire non rempli ? (contrôle avant envoi, l'API vérifie aussi)
export function champManquant(champ: ChampSaisieDTO, valeur: unknown): boolean {
  if (!champ.obligatoire) return false
  if (champ.type === 'position') return (valeur as ValeurPosition)?.lon == null
  if (champ.type === 'unites') return !((valeur as unknown[]) ?? []).length
  return valeur === null || valeur === undefined || String(valeur).trim() === ''
}
