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

  const rubriqueEnDeficit = (r: Rubrique) => materiels.some((m) => m.statutDotation === r && m.ecart < 0)
  const armeeEnDeficit = (armee: string) => materiels.some((m) => m.statutDotation === rubrique && m.armee === armee && m.ecart < 0)
  const groupeEnDeficit = (g: string) =>
    materiels.some((m) => m.statutDotation === rubrique && m.armee === armeeFiltre && groupeDeCategorie[m.categorie] === g && m.ecart < 0)

  function PointDeficit() {
    return <span className="h-2 w-2 rounded-full bg-red-600" />
  }

  return (
    <section className="grid min-h-0 grid-rows-[auto_auto_1fr] gap-3.5">
      <div className="grid grid-cols-6 gap-3 rounded-lg bg-amber-100 p-3">
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
          <span className="block text-xs text-[#65706a]">Armée de l'Air</span>
          <strong className="text-xl text-[#17201b]">{indicateurs?.parArmee.air ?? '—'}</strong>
        </div>
        <div className="rounded-lg bg-white p-2.5 shadow-sm">
          <span className="block text-xs text-[#65706a]">Marine</span>
          <strong className="text-xl text-[#17201b]">{indicateurs?.parArmee.mer ?? '—'}</strong>
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
            className={`flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm ${rubrique === 'en_dotation' ? 'bg-[#17201b] text-white' : 'border border-[#d8ded9] bg-white text-[#17201b]'}`}
          >
            Matériel en Dotation
            {rubriqueEnDeficit('en_dotation') && <PointDeficit />}
          </button>
          <button
            onClick={() => setRubrique('en_reserve')}
            className={`flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm ${rubrique === 'en_reserve' ? 'bg-[#17201b] text-white' : 'border border-[#d8ded9] bg-white text-[#17201b]'}`}
          >
            Matériel à la Réserve
            {rubriqueEnDeficit('en_reserve') && <PointDeficit />}
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {Object.entries(armeeLabel).map(([valeur, label]) => (
            <button
              key={valeur}
              onClick={() => choisirArmee(valeur)}
              className={`flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-bold ${armeeFiltre === valeur ? 'bg-[#17201b] text-white' : 'border border-[#d8ded9] bg-white text-[#17201b]'}`}
            >
              {label}
              {armeeEnDeficit(valeur) && <PointDeficit />}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {groupesDisponibles.map((g) => (
            <button
              key={g}
              onClick={() => setGroupeFiltre(g)}
              className={`flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs ${groupeFiltre === g ? 'bg-blue-600 text-white' : 'border border-[#d8ded9] bg-white text-[#17201b]'}`}
            >
              {groupeLabel[g]}
              {groupeEnDeficit(g) && <PointDeficit />}
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
              <th className="border-b border-[#d8ded9] px-3 py-3 text-left">Caractéristiques</th>
              <th className="border-b border-[#d8ded9] px-3 py-3 text-left">TED</th>
              <th className="border-b border-[#d8ded9] px-3 py-3 text-left">Quantité</th>
              <th className="border-b border-[#d8ded9] px-3 py-3 text-left">Hors service</th>
              <th className="border-b border-[#d8ded9] px-3 py-3 text-left">Opérationnel</th>
              <th className="border-b border-[#d8ded9] px-3 py-3 text-left">Écart</th>
            </tr>
          </thead>
          <tbody>
            {lignes.map((m) => (
              <tr key={m.id} className={m.enAlerte ? 'bg-red-50/50' : undefined}>
                <td className="border-b border-[#d8ded9] px-3 py-3">{m.formationAffectation}</td>
                <td className="border-b border-[#d8ded9] px-3 py-3">{m.typeMateriel}</td>
                <td className="border-b border-[#d8ded9] px-3 py-3 text-xs text-[#65706a]">{m.caracteristiques}</td>
                <td className="border-b border-[#d8ded9] px-3 py-3 text-[#65706a]">{m.dotationTed}</td>
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
                <td className="border-b border-[#d8ded9] px-3 py-3">
                  {m.quantiteHorsService > 0 ? (
                    <span className="font-bold text-amber-700">{m.quantiteHorsService}</span>
                  ) : (
                    <span className="text-[#65706a]">0</span>
                  )}
                </td>
                <td className="border-b border-[#d8ded9] px-3 py-3 font-bold text-emerald-700">{m.quantiteOperationnelle}</td>
                <td className="border-b border-[#d8ded9] px-3 py-3">
                  <span className={`font-bold ${m.ecart < 0 ? 'text-red-700' : m.ecart > 0 ? 'text-emerald-700' : 'text-[#65706a]'}`}>
                    {m.ecart > 0 ? `+${m.ecart}` : m.ecart}
                  </span>
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
