import type { ElementSelectionne } from '../types'
import { statutUniteStyle } from '../uniteStyle'

function construireDetail(selection: ElementSelectionne) {
  switch (selection.kind) {
    case 'unite': {
      const u = selection.data
      const logistique =
        u.carburantPct != null && u.munitionsPct != null
          ? `Armement ${u.armementPct ?? 0}%, Munitions ${u.munitionsPct}%, Carburant ${u.carburantPct}%`
          : 'Non suivi'
      return {
        classification: 'Confidentiel Défense',
        titre: u.nom,
        sousTitre: `Unité amie - ${statutUniteStyle[u.statut as keyof typeof statutUniteStyle]?.label ?? u.statut}.`,
        kv: [
          { label: 'Type', valeur: 'Unité amie' },
          { label: 'Statut', valeur: statutUniteStyle[u.statut as keyof typeof statutUniteStyle]?.label ?? u.statut },
          { label: 'Position', valeur: `${u.effectif} pers. déployés` },
          { label: 'Logistique', valeur: logistique },
        ],
      }
    }
    case 'menace': {
      const m = selection.data
      return {
        classification: 'Confidentiel Défense',
        titre: m.nom,
        sousTitre: 'Menace - Confirmée.',
        kv: [
          { label: 'Type', valeur: 'Menace' },
          { label: 'Statut', valeur: 'Confirmée' },
          { label: 'Position', valeur: 'Zone A3' },
          { label: 'Logistique', valeur: 'Priorité critique' },
        ],
      }
    }
    case 'checkpoint': {
      const c = selection.data
      return {
        classification: 'Confidentiel Défense',
        titre: c.nom,
        sousTitre: 'Checkpoint - Sous contrôle.',
        kv: [
          { label: 'Type', valeur: 'Checkpoint' },
          { label: 'Statut', valeur: 'Sous contrôle' },
          { label: 'Position', valeur: 'Route de progression' },
          { label: 'Logistique', valeur: `Dernier rapport : ${c.dernierRapport ?? 'RAS'}` },
        ],
      }
    }
  }
}

export function DetailPanel({ selection }: { selection: ElementSelectionne | null }) {
  if (!selection) {
    return (
      <section className="rounded-lg border border-[#d8ded9] bg-white p-3.5 shadow-sm">
        <p className="text-sm text-[#65706a]">Sélectionnez un élément sur la carte pour afficher son détail.</p>
      </section>
    )
  }

  const detail = construireDetail(selection)

  return (
    <section className="rounded-lg border border-[#d8ded9] bg-white p-3.5 shadow-sm" aria-live="polite">
      <span className="inline-flex rounded-md bg-[#fff0cf] px-1.5 py-1 text-xs font-bold text-[#7c5108]">{detail.classification}</span>
      <h3 className="mb-1.5 mt-2 text-lg text-[#17201b]">{detail.titre}</h3>
      <p className="m-0 text-sm text-[#65706a]">{detail.sousTitre}</p>
      <div className="mt-3.5 grid grid-cols-2 gap-2.5">
        {detail.kv.map((item) => (
          <div key={item.label} className="rounded-lg bg-[#eef2ed] p-2.5">
            <span className="mb-1 block text-xs text-[#65706a]">{item.label}</span>
            <strong className="text-[#17201b]">{item.valeur}</strong>
          </div>
        ))}
      </div>
    </section>
  )
}
