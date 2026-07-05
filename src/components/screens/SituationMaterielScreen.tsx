import { useEffect, useState } from 'react'
import { api, type IndicateursMaterielDTO, type MaterielDTO } from '../../api/client'

const armeeLabel: Record<string, string> = {
  terre: 'Armée de Terre',
  air: "Armée de l'Air",
  mer: 'Marine',
}

// Regroupement des catégories précises en grandes familles de matériel + Autre (radio, optique, équipements divers).
const groupeDeCategorie: Record<string, string> = {
  navire: 'bateau',
  aeronef: 'avion',
  vehicule: 'vehicule',
  arme: 'armement',
  munition: 'munition',
  communication: 'autre',
  optique: 'autre',
  equipement: 'autre',
}

const groupeLabel: Record<string, string> = {
  bateau: 'Bateau',
  avion: 'Avion',
  vehicule: 'Véhicule',
  armement: 'Armement',
  munition: 'Munition',
  autre: 'Autre',
}

const groupes = ['bateau', 'avion', 'vehicule', 'armement', 'munition', 'autre']

// Catégories non pertinentes selon l'armée : Terre n'a ni bateau ni avion, l'Air n'a pas de bateau, la Marine pas d'avion.
const categoriesExclues: Record<string, string[]> = {
  terre: ['bateau', 'avion'],
  air: ['bateau'],
  mer: ['avion'],
}

function groupesPourArmee(armee: string) {
  const exclues = categoriesExclues[armee] ?? []
  return groupes.filter((g) => !exclues.includes(g))
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
  const [armeeFiltre, setArmeeFiltre] = useState<string>(Object.keys(armeeLabel)[0])
  const [groupeFiltre, setGroupeFiltre] = useState<string>(groupesPourArmee(Object.keys(armeeLabel)[0])[0])

  useEffect(() => {
    api.materiels().then(setMateriels)
    api.materielIndicateurs().then(setIndicateurs)
  }, [])

  const groupesDisponibles = groupesPourArmee(armeeFiltre)

  function choisirArmee(armee: string) {
    setArmeeFiltre(armee)
    const disponibles = groupesPourArmee(armee)
    if (!disponibles.includes(groupeFiltre)) setGroupeFiltre(disponibles[0])
  }

  const lignes = materiels.filter((m) => m.statutDotation === rubrique && m.armee === armeeFiltre && groupeDeCategorie[m.categorie] === groupeFiltre)

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

      <div className="grid gap-2.5">
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

        <div className="flex flex-wrap gap-1.5">
          {Object.entries(armeeLabel).map(([valeur, label]) => (
            <button
              key={valeur}
              onClick={() => choisirArmee(valeur)}
              className={`h-8 rounded-lg px-2.5 text-xs font-bold ${armeeFiltre === valeur ? 'bg-[#17201b] text-white' : 'border border-[#d8ded9] bg-white text-[#17201b]'}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {groupesDisponibles.map((g) => (
            <button
              key={g}
              onClick={() => setGroupeFiltre(g)}
              className={`h-8 rounded-lg px-2.5 text-xs ${groupeFiltre === g ? 'bg-blue-600 text-white' : 'border border-[#d8ded9] bg-white text-[#17201b]'}`}
            >
              {groupeLabel[g]}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-auto rounded-lg border border-[#d8ded9] bg-white shadow-sm">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-[#f8faf7] text-xs text-[#65706a]">
              <th className="border-b border-[#d8ded9] px-3 py-3 text-left">Formation d'affectation</th>
              <th className="border-b border-[#d8ded9] px-3 py-3 text-left">Type</th>
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
                <td className="border-b border-[#d8ded9] px-3 py-3">{m.typeMateriel}</td>
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
                <td colSpan={6} className="px-3 py-6 text-center text-sm text-[#65706a]">
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
