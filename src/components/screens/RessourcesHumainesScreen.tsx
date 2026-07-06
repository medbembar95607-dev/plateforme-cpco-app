import { useEffect, useState } from 'react'
import { api, type BesoinRecrutementDTO, type IndicateursRHDTO, type MilitaireDTO, type PropositionRHDTO } from '../../api/client'

const categorieLabel: Record<string, string> = {
  officier: 'Officiers',
  sous_officier: 'Sous-officiers',
  homme_du_rang: 'Hommes du rang',
}

const armeeLabel: Record<string, string> = {
  terre: 'Armée de Terre',
  air: "Armée de l'Air",
  mer: 'Marine',
}

const typePropositionLabel: Record<string, string> = {
  affectation: 'Affectation',
  avancement: 'Avancement',
}

const statutPropositionStyle: Record<string, { label: string; badge: string }> = {
  en_cours: { label: 'En cours', badge: 'bg-amber-50 text-amber-700' },
  validee: { label: 'Validée', badge: 'bg-emerald-50 text-emerald-700' },
  rejetee: { label: 'Rejetée', badge: 'bg-gray-100 text-gray-500' },
}

const prioriteBesoinStyle: Record<string, { label: string; badge: string }> = {
  normale: { label: 'Normale', badge: 'bg-gray-100 text-gray-700' },
  elevee: { label: 'Élevée', badge: 'bg-amber-50 text-amber-700' },
  critique: { label: 'Critique', badge: 'bg-red-50 text-red-700' },
}

const statutBesoinStyle: Record<string, { label: string; badge: string }> = {
  ouvert: { label: 'Ouvert', badge: 'bg-red-50 text-red-700' },
  pourvu: { label: 'Pourvu', badge: 'bg-emerald-50 text-emerald-700' },
}

type Onglet = 'annuaire' | 'propositions' | 'retraite' | 'recrutement'

const onglets: Array<{ id: Onglet; label: string }> = [
  { id: 'annuaire', label: 'Annuaire' },
  { id: 'propositions', label: 'Propositions' },
  { id: 'retraite', label: 'Départs à la retraite' },
  { id: 'recrutement', label: 'Besoins en recrutement' },
]

export function RessourcesHumainesScreen() {
  const [personnel, setPersonnel] = useState<MilitaireDTO[]>([])
  const [indicateurs, setIndicateurs] = useState<IndicateursRHDTO | null>(null)
  const [propositions, setPropositions] = useState<PropositionRHDTO[]>([])
  const [besoins, setBesoins] = useState<BesoinRecrutementDTO[]>([])
  const [onglet, setOnglet] = useState<Onglet>('annuaire')
  const [categorieFiltre, setCategorieFiltre] = useState<string>('officier')
  const [typePropositionFiltre, setTypePropositionFiltre] = useState<string>('affectation')

  function charger() {
    api.personnel().then(setPersonnel)
    api.rhIndicateurs().then(setIndicateurs)
    api.propositionsRH().then(setPropositions)
    api.besoinsRecrutement().then(setBesoins)
  }

  useEffect(() => {
    charger()
  }, [])

  async function valider(id: string) {
    await api.validerPropositionRH(id)
    charger()
  }

  async function rejeter(id: string) {
    await api.rejeterPropositionRH(id)
    charger()
  }

  const personnelFiltre = personnel.filter((m) => m.categorie === categorieFiltre)
  const propositionsFiltrees = propositions.filter((p) => p.typeProposition === typePropositionFiltre)
  const departsARetraite = [...personnel].sort((a, b) => a.anneesAvantRetraite - b.anneesAvantRetraite)

  return (
    <section className="grid min-h-0 grid-rows-[auto_auto_1fr] gap-3.5">
      <div className="grid grid-cols-6 gap-3 rounded-lg bg-amber-100 p-3">
        <div className="rounded-lg bg-white p-2.5 shadow-sm">
          <span className="block text-xs text-[#65706a]">Effectif total</span>
          <strong className="text-xl text-[#17201b]">{indicateurs?.effectifTotal ?? '—'}</strong>
        </div>
        <div className="rounded-lg bg-white p-2.5 shadow-sm">
          <span className="block text-xs text-[#65706a]">Officiers</span>
          <strong className="text-xl text-[#17201b]">{indicateurs?.parCategorie.officier ?? '—'}</strong>
        </div>
        <div className="rounded-lg bg-white p-2.5 shadow-sm">
          <span className="block text-xs text-[#65706a]">Sous-officiers</span>
          <strong className="text-xl text-[#17201b]">{indicateurs?.parCategorie.sous_officier ?? '—'}</strong>
        </div>
        <div className="rounded-lg bg-white p-2.5 shadow-sm">
          <span className="block text-xs text-[#65706a]">Hommes du rang</span>
          <strong className="text-xl text-[#17201b]">{indicateurs?.parCategorie.homme_du_rang ?? '—'}</strong>
        </div>
        <div className="rounded-lg bg-amber-50 p-2.5 shadow-sm">
          <span className="block text-xs text-amber-700">Proches de la retraite</span>
          <strong className="text-xl text-amber-700">{indicateurs?.procheRetraite ?? '—'}</strong>
        </div>
        <div className="rounded-lg bg-red-50 p-2.5 shadow-sm">
          <span className="block text-xs text-red-700">Propositions / Besoins ouverts</span>
          <strong className="text-xl text-red-700">
            {indicateurs?.propositionsEnCours ?? '—'} / {indicateurs?.besoinsOuverts ?? '—'}
          </strong>
        </div>
      </div>

      <nav className="flex flex-wrap gap-1.5 border-b border-[#d8ded9] pb-2" aria-label="Sous-navigation RH">
        {onglets.map((o) => (
          <button
            key={o.id}
            onClick={() => setOnglet(o.id)}
            className={`rounded-lg px-3 py-2 text-sm ${onglet === o.id ? 'bg-[#17201b] text-white' : 'bg-white text-[#17201b] hover:bg-black/5'}`}
          >
            {o.label}
          </button>
        ))}
      </nav>

      <div className="min-h-0 overflow-auto">
        {onglet === 'annuaire' && (
          <div className="grid min-h-0 grid-rows-[auto_1fr] gap-3">
            <div className="flex gap-1.5">
              {Object.entries(categorieLabel).map(([valeur, label]) => (
                <button
                  key={valeur}
                  onClick={() => setCategorieFiltre(valeur)}
                  className={`h-9 rounded-lg px-3 text-sm ${categorieFiltre === valeur ? 'bg-blue-600 text-white' : 'border border-[#d8ded9] bg-white text-[#17201b]'}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="overflow-auto rounded-lg border border-[#d8ded9] bg-white shadow-sm">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-[#f8faf7] text-xs text-[#65706a]">
                    <th className="border-b border-[#d8ded9] px-3 py-3 text-left">Matricule</th>
                    <th className="border-b border-[#d8ded9] px-3 py-3 text-left">Nom</th>
                    <th className="border-b border-[#d8ded9] px-3 py-3 text-left">Grade</th>
                    <th className="border-b border-[#d8ded9] px-3 py-3 text-left">Armée</th>
                    <th className="border-b border-[#d8ded9] px-3 py-3 text-left">Formation d'affectation</th>
                    <th className="border-b border-[#d8ded9] px-3 py-3 text-left">Âge</th>
                    <th className="border-b border-[#d8ded9] px-3 py-3 text-left">Ancienneté</th>
                  </tr>
                </thead>
                <tbody>
                  {personnelFiltre.map((m) => (
                    <tr key={m.id}>
                      <td className="border-b border-[#d8ded9] px-3 py-3 text-[#65706a]">{m.matricule}</td>
                      <td className="border-b border-[#d8ded9] px-3 py-3 font-bold text-[#17201b]">{m.nomComplet}</td>
                      <td className="border-b border-[#d8ded9] px-3 py-3">{m.grade}</td>
                      <td className="border-b border-[#d8ded9] px-3 py-3">{armeeLabel[m.armee] ?? m.armee}</td>
                      <td className="border-b border-[#d8ded9] px-3 py-3">{m.formationAffectation}</td>
                      <td className="border-b border-[#d8ded9] px-3 py-3">{m.age} ans</td>
                      <td className="border-b border-[#d8ded9] px-3 py-3">{m.anciennete} ans</td>
                    </tr>
                  ))}
                  {personnelFiltre.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-3 py-6 text-center text-sm text-[#65706a]">
                        Aucun militaire pour ce filtre.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {onglet === 'propositions' && (
          <div className="grid min-h-0 grid-rows-[auto_1fr] gap-3">
            <div className="flex gap-1.5">
              {Object.entries(typePropositionLabel).map(([valeur, label]) => (
                <button
                  key={valeur}
                  onClick={() => setTypePropositionFiltre(valeur)}
                  className={`h-9 rounded-lg px-3 text-sm ${typePropositionFiltre === valeur ? 'bg-blue-600 text-white' : 'border border-[#d8ded9] bg-white text-[#17201b]'}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="overflow-auto rounded-lg border border-[#d8ded9] bg-white shadow-sm">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-[#f8faf7] text-xs text-[#65706a]">
                    <th className="border-b border-[#d8ded9] px-3 py-3 text-left">Militaire</th>
                    <th className="border-b border-[#d8ded9] px-3 py-3 text-left">Proposition</th>
                    <th className="border-b border-[#d8ded9] px-3 py-3 text-left">Argumentation</th>
                    <th className="border-b border-[#d8ded9] px-3 py-3 text-left">Décision</th>
                  </tr>
                </thead>
                <tbody>
                  {propositionsFiltrees.map((p) => (
                    <tr key={p.id}>
                      <td className="border-b border-[#d8ded9] px-3 py-3 font-bold text-[#17201b]">{p.militaireNom}</td>
                      <td className="border-b border-[#d8ded9] px-3 py-3">{p.proposition}</td>
                      <td className="border-b border-[#d8ded9] px-3 py-3 text-xs text-[#65706a]">{p.motif}</td>
                      <td className="border-b border-[#d8ded9] px-3 py-3">
                        <div className="grid gap-1.5">
                          <span
                            className={`inline-flex w-fit min-h-[24px] items-center rounded-full px-2 text-xs font-bold ${
                              statutPropositionStyle[p.statut]?.badge ?? 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {statutPropositionStyle[p.statut]?.label ?? p.statut}
                          </span>
                          {p.statut === 'en_cours' && (
                            <div className="flex gap-1.5">
                              <button onClick={() => valider(p.id)} className="h-7 rounded-lg border border-emerald-700 bg-emerald-600 px-2.5 text-xs text-white">
                                Valider
                              </button>
                              <button onClick={() => rejeter(p.id)} className="h-7 rounded-lg border border-gray-500 bg-gray-400 px-2.5 text-xs text-white">
                                Rejeter
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {propositionsFiltrees.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-3 py-6 text-center text-sm text-[#65706a]">
                        Aucune proposition pour ce filtre.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {onglet === 'retraite' && (
          <div className="overflow-auto rounded-lg border border-[#d8ded9] bg-white shadow-sm">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-[#f8faf7] text-xs text-[#65706a]">
                  <th className="border-b border-[#d8ded9] px-3 py-3 text-left">Nom</th>
                  <th className="border-b border-[#d8ded9] px-3 py-3 text-left">Grade</th>
                  <th className="border-b border-[#d8ded9] px-3 py-3 text-left">Catégorie</th>
                  <th className="border-b border-[#d8ded9] px-3 py-3 text-left">Armée</th>
                  <th className="border-b border-[#d8ded9] px-3 py-3 text-left">Âge</th>
                  <th className="border-b border-[#d8ded9] px-3 py-3 text-left">Années avant retraite</th>
                </tr>
              </thead>
              <tbody>
                {departsARetraite.map((m) => (
                  <tr key={m.id} className={m.procheRetraite ? 'bg-amber-50/50' : undefined}>
                    <td className="border-b border-[#d8ded9] px-3 py-3 font-bold text-[#17201b]">{m.nomComplet}</td>
                    <td className="border-b border-[#d8ded9] px-3 py-3">{m.grade}</td>
                    <td className="border-b border-[#d8ded9] px-3 py-3">{categorieLabel[m.categorie] ?? m.categorie}</td>
                    <td className="border-b border-[#d8ded9] px-3 py-3">{armeeLabel[m.armee] ?? m.armee}</td>
                    <td className="border-b border-[#d8ded9] px-3 py-3">{m.age} ans</td>
                    <td className="border-b border-[#d8ded9] px-3 py-3">
                      <span className={`font-bold ${m.procheRetraite ? 'text-amber-700' : 'text-[#17201b]'}`}>{m.anneesAvantRetraite} ans</span>
                      {m.procheRetraite && (
                        <span className="ml-2 inline-flex min-h-[22px] items-center rounded-full bg-amber-50 px-2 text-xs font-bold text-amber-700">
                          Proche
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {onglet === 'recrutement' && (
          <div className="overflow-auto rounded-lg border border-[#d8ded9] bg-white shadow-sm">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-[#f8faf7] text-xs text-[#65706a]">
                  <th className="border-b border-[#d8ded9] px-3 py-3 text-left">Poste</th>
                  <th className="border-b border-[#d8ded9] px-3 py-3 text-left">Catégorie</th>
                  <th className="border-b border-[#d8ded9] px-3 py-3 text-left">Armée</th>
                  <th className="border-b border-[#d8ded9] px-3 py-3 text-left">Formation</th>
                  <th className="border-b border-[#d8ded9] px-3 py-3 text-left">Postes</th>
                  <th className="border-b border-[#d8ded9] px-3 py-3 text-left">Priorité</th>
                  <th className="border-b border-[#d8ded9] px-3 py-3 text-left">Statut</th>
                </tr>
              </thead>
              <tbody>
                {besoins.map((b) => (
                  <tr key={b.id}>
                    <td className="border-b border-[#d8ded9] px-3 py-3 font-bold text-[#17201b]">{b.poste}</td>
                    <td className="border-b border-[#d8ded9] px-3 py-3">{categorieLabel[b.categorie] ?? b.categorie}</td>
                    <td className="border-b border-[#d8ded9] px-3 py-3">{armeeLabel[b.armee] ?? b.armee}</td>
                    <td className="border-b border-[#d8ded9] px-3 py-3">{b.formationAffectation}</td>
                    <td className="border-b border-[#d8ded9] px-3 py-3">{b.nombrePostes}</td>
                    <td className="border-b border-[#d8ded9] px-3 py-3">
                      <span className={`inline-flex min-h-[24px] items-center rounded-full px-2 text-xs font-bold ${prioriteBesoinStyle[b.priorite]?.badge ?? 'bg-gray-100 text-gray-700'}`}>
                        {prioriteBesoinStyle[b.priorite]?.label ?? b.priorite}
                      </span>
                    </td>
                    <td className="border-b border-[#d8ded9] px-3 py-3">
                      <span className={`inline-flex min-h-[24px] items-center rounded-full px-2 text-xs font-bold ${statutBesoinStyle[b.statut]?.badge ?? 'bg-gray-100 text-gray-700'}`}>
                        {statutBesoinStyle[b.statut]?.label ?? b.statut}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
