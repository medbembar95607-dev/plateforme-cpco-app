import { useState } from 'react'
import type { ChampSaisieDTO, ImpactDemoDTO, SchemaSaisieDTO } from '../api/client'
import { ChampFormulaire, champManquant, type ValeurPosition } from './ChampFormulaire'

// Formulaire d'une mise à jour de la démonstration : correction d'un impact proposé par l'analyse,
// ou ajout manuel d'un impact. Les champs viennent de GET /demo/schema.

// Le matériel a deux variantes (nouvelle ligne / décompte d'un stock), distinguées par payload.mode.
function varianteDe(impact: ImpactDemoDTO): string {
  return impact.type === 'materiel' ? `materiel_${impact.payload.mode}` : impact.type
}

function versValeurs(champs: ChampSaisieDTO[], impact: ImpactDemoDTO | null): Record<string, unknown> {
  const p = impact?.payload ?? {}
  const valeurs: Record<string, unknown> = {}
  for (const c of champs) {
    if (c.type === 'position') {
      valeurs[c.cle] = {
        lon: (p.lon as number) ?? null,
        lat: (p.lat as number) ?? null,
        localite: (p.localite as string) ?? impact?.localite ?? null,
      }
    } else if (c.type === 'choix' && (p[c.cle] === undefined || p[c.cle] === null) && c.obligatoire) {
      valeurs[c.cle] = c.options[0]?.valeur ?? ''
    } else {
      valeurs[c.cle] = p[c.cle] ?? (c.type === 'unites' ? [] : '')
    }
  }
  return valeurs
}

function versPayload(variante: string, schema: SchemaSaisieDTO, valeurs: Record<string, unknown>, base: Record<string, unknown>) {
  const spec = schema.impacts[variante]
  const payload: Record<string, unknown> = { ...base }
  if (spec.mode) payload.mode = spec.mode
  for (const c of spec.champs) {
    const v = valeurs[c.cle]
    if (c.type === 'position') {
      const pos = v as ValeurPosition
      payload.lon = pos.lon
      payload.lat = pos.lat
      if (variante === 'incident') payload.localite = pos.localite || (pos.lon !== null ? `${pos.lat}° N, ${Math.abs(pos.lon)}° O` : null)
    } else {
      payload[c.cle] = v === '' ? null : v
    }
  }
  return payload
}

// Titre lisible d'un impact saisi à la main : libellé du type + premier texte ou référence choisie.
function titreManuel(variante: string, schema: SchemaSaisieDTO, valeurs: Record<string, unknown>): string {
  const spec = schema.impacts[variante]
  const refs = schema.references
  for (const c of spec.champs) {
    const v = valeurs[c.cle]
    if (!v) continue
    if (c.type === 'texte' || c.type === 'texte_long') return `${spec.libelle} : ${String(v).slice(0, 70)}`
    if (c.type === 'unite') return `${spec.libelle} : ${refs.unites.find((u) => u.id === v)?.nom ?? ''}`
    if (c.type === 'ligne_budget') return `${spec.libelle} : ${refs.lignes.find((l) => l.id === v)?.libelle ?? ''}`
    if (c.type === 'materiel') return `${spec.libelle} : ${refs.materiels.find((m) => m.id === v)?.nom ?? ''}`
  }
  return spec.libelle
}

interface FormulaireImpactProps {
  schema: SchemaSaisieDTO
  // Impact à corriger ; absent pour un ajout manuel (choix du type dans le formulaire).
  impact?: ImpactDemoDTO
  onValider: (impact: ImpactDemoDTO) => void
  onAnnuler: () => void
}

export function FormulaireImpact({ schema, impact, onValider, onAnnuler }: FormulaireImpactProps) {
  const [variante, setVariante] = useState(impact ? varianteDe(impact) : 'incident')
  const [valeurs, setValeurs] = useState(() => versValeurs(schema.impacts[variante].champs, impact ?? null))
  const [manquants, setManquants] = useState<string[]>([])
  const spec = schema.impacts[variante]

  function changerVariante(v: string) {
    setVariante(v)
    setValeurs(versValeurs(schema.impacts[v].champs, null))
    setManquants([])
  }

  function valider() {
    const absents = spec.champs.filter((c) => champManquant(c, valeurs[c.cle])).map((c) => c.libelle)
    setManquants(absents)
    if (absents.length) return
    const payload = versPayload(variante, schema, valeurs, impact?.payload ?? {})
    const localite = (payload.localite as string) ?? (valeurs.position as ValeurPosition | undefined)?.localite ?? impact?.localite ?? null
    onValider(
      impact
        ? {
            ...impact,
            payload,
            localite,
            resume: impact.resume.endsWith('(corrigé)') ? impact.resume : `${impact.resume} (corrigé)`,
          }
        : {
            cle: `manuel-${Date.now()}`,
            type: spec.type ?? variante,
            ecran: spec.ecran,
            titre: titreManuel(variante, schema, valeurs),
            resume: 'Saisie manuelle',
            localite,
            payload,
          },
    )
  }

  return (
    <div className="grid gap-2.5 rounded-lg border border-[#17201b] bg-[#fbfcfa] p-3">
      {!impact && (
        <div>
          <label className="mb-1 block text-xs font-bold text-[#65706a]">Type de mise à jour</label>
          <select
            value={variante}
            onChange={(e) => changerVariante(e.target.value)}
            className="w-full rounded-lg border border-[#d8ded9] bg-white px-2.5 py-1.5 text-sm outline-none focus:border-[#17201b]"
          >
            {Object.entries(schema.impacts).map(([cle, s]) => (
              <option key={cle} value={cle}>
                {s.libelle}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        {spec.champs.map((c) => (
          <ChampFormulaire
            key={c.cle}
            champ={c}
            valeur={valeurs[c.cle]}
            references={schema.references}
            onChange={(v) => setValeurs((prev) => ({ ...prev, [c.cle]: v }))}
          />
        ))}
      </div>
      {manquants.length > 0 && <div className="text-xs font-bold text-red-700">À compléter : {manquants.join(', ')}</div>}
      <div className="flex justify-end gap-2">
        <button onClick={onAnnuler} className="rounded-md border border-[#d8ded9] px-3 py-1.5 text-xs text-[#17201b]">
          Annuler
        </button>
        <button onClick={valider} className="rounded-md border border-[#17201b] bg-[#17201b] px-3 py-1.5 text-xs font-bold text-white">
          {impact ? 'Enregistrer la correction' : 'Ajouter à la liste'}
        </button>
      </div>
    </div>
  )
}
