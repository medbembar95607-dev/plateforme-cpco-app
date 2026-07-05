import { useEffect, useState } from 'react'
import { api, type IndicateursMaterielDTO, type MaterielDTO } from '../../api/client'

const armeeLabel: Record<string, string> = {
  terre: 'Armée de Terre',
  air: "Armée de l'Air",
  mer: 'Marine',
}

const categorieLabel: Record<string, string> = {
  vehicule: 'Véhicule',
  arme: 'Arme',
  munition: 'Munition',
  aeronef: 'Aéronef',
  navire: 'Navire',
  communication: 'Communication',
  optique: 'Optique',
  equipement: 'Équipement',
}

const etatStyle: Record<string, { label: string; badge: string }> = {
  operationnel: { label: 'Opérationnel', badge: 'bg-emerald-50 text-emerald-700' },
  maintenance: { label: 'En maintenance', badge: 'bg-amber-50 text-amber-700' },
  hors_service: { label: 'Hors service', badge: 'bg-red-50 text-red-700' },
}

type Rubrique = 'en_dotation' | 'en_reserve'

export function SituationMaterielScreen() {
  const [materiels, setMateriels] = useState<MaterielDTO[]>([])
  const [indicateurs, setIndicateurs] = useState<IndicateursMaterielDTO | null>(null)
  const [rubrique, setRubrique] = useState<Rubrique>('en_dotation')
  const [armeeFiltre, setArmeeFiltre] = useState<string>('toutes')

  useEffect(() => {
    api.materiels().then(setMateriels)
    api.materielIndicateurs().then(setIndicateurs)
  }, [])

  const lignes = materiels.filter((m) => m.statutDotation === rubrique && (armeeFiltre === 'toutes' || m.armee === armeeFiltre))

  return (
    <section className="grid min-h-0 grid-rows-[auto_auto_1fr] gap-3.5">
      <div className="grid grid-cols-5 gap-3 rounded-lg bg-amber-100 p-3">
        <div className="rounded-lg bg-white p-2.5 shadow-sm">
          <span className="block text-xs text-[#65706a]">Matériel en dotation</span>
          <strong className="text-xl text-[#17201b]">{indicateurs?.totalDotation ?? '—'}</strong>
        </div>
        <div className="rounded-lg bg-white p-2.5 shadow-sm">
          <span className="block text-xs text-[#65706a]">Matériel en réserve</span>
          <strong className="text-xl text-[#17201b]">{indicateurs?.totalReserve ?? '—'}</strong>
        </div>
        <div className="rounded-lg bg-white p-2.5 shadow-sm">
          <span className="block text-xs text-[#65706a]">Armée de Terre</span>
          <strong className="text-xl text-[#17201b]">{indicateurs?.parArmee.terre ?? '—'}</strong>
        </div>
        <div className="rounded-lg bg-white p-2.5 shadow-sm">
          <span className="block text-xs text-[#65706a]">Air / Marine</span>
          <strong className="text-xl text-[#17201b]">
            {indicateurs ? indicateurs.parArmee.air + indicateurs.parArmee.mer : '—'}
          </strong>
        </div>
        <div className="rounded-lg bg-red-50 p-2.5 shadow-sm">
          <span className="block text-xs text-red-700">Alertes seuil dépassé</span>
          <strong className="text-xl text-red-700">{indicateurs?.nombreAlertes ?? '—'}</strong>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1.5">
          <button
            onClick={() => setRubrique('en_dotation')}
            className={`h-9 rounded-lg px-3 text-sm ${rubrique === 'en_dotation' ? 'bg-[#17201b] text-white' : 'border border-[#d8ded9] bg-white text-[#17201b]'}`}
          >
            Matériel en Dotation
          </button>
          <button
            onClick={() => setRubrique('en_reserve')}
            className={`h-9 rounded-lg px-3 text-sm ${rubrique === 'en_reserve' ? 'bg-[#17201b] text-white' : 'border border-[#d8ded9] bg-white text-[#17201b]'}`}
          >
            Matériel à la Réserve
          </button>
        </div>
        <select value={armeeFiltre} onChange={(e) => setArmeeFiltre(e.target.value)} className="h-9 rounded-lg border border-[#d8ded9] bg-white px-2.5 text-sm">
          <option value="toutes">Toutes les armées</option>
          {Object.entries(armeeLabel).map(([valeur, label]) => (
            <option key={valeur} value={valeur}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-auto rounded-lg border border-[#d8ded9] bg-white shadow-sm">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-[#f8faf7] text-xs text-[#65706a]">
              <th className="border-b border-[#d8ded9] px-3 py-3 text-left">Formation d'affectation</th>
              <th className="border-b border-[#d8ded9] px-3 py-3 text-left">Catégorie</th>
              <th className="border-b border-[#d8ded9] px-3 py-3 text-left">Type</th>
              <th className="border-b border-[#d8ded9] px-3 py-3 text-left">Nom</th>
              <th className="border-b border-[#d8ded9] px-3 py-3 text-left">Fonction</th>
              <th className="border-b border-[#d8ded9] px-3 py-3 text-left">Caractéristiques</th>
              <th className="border-b border-[#d8ded9] px-3 py-3 text-left">État</th>
              <th className="border-b border-[#d8ded9] px-3 py-3 text-left">Quantité</th>
            </tr>
          </thead>
          <tbody>
            {lignes.map((m) => (
              <tr key={m.id} className={m.enAlerte ? 'bg-red-50/50' : undefined}>
                <td className="border-b border-[#d8ded9] px-3 py-3">{m.formationAffectation}</td>
                <td className="border-b border-[#d8ded9] px-3 py-3">{categorieLabel[m.categorie] ?? m.categorie}</td>
                <td className="border-b border-[#d8ded9] px-3 py-3">{m.typeMateriel}</td>
                <td className="border-b border-[#d8ded9] px-3 py-3">{m.nom}</td>
                <td className="border-b border-[#d8ded9] px-3 py-3">{m.fonction}</td>
                <td className="border-b border-[#d8ded9] px-3 py-3 text-xs text-[#65706a]">{m.caracteristiques}</td>
                <td className="border-b border-[#d8ded9] px-3 py-3">
                  <span className={`inline-flex min-h-[24px] items-center rounded-full px-2 text-xs font-bold ${etatStyle[m.etat]?.badge ?? 'bg-gray-100 text-gray-700'}`}>
                    {etatStyle[m.etat]?.label ?? m.etat}
                  </span>
                </td>
                <td className="border-b border-[#d8ded9] px-3 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[#17201b]">{m.quantite}</span>
                    {m.enAlerte && (
                      <span className="inline-flex min-h-[22px] items-center rounded-full bg-red-50 px-2 text-xs font-bold text-red-700">
                        Seuil {m.seuilAlerte}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {lignes.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-6 text-center text-sm text-[#65706a]">
                  Aucun matériel pour ce filtre.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
