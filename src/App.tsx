import { useState } from 'react'
import { Sidebar, type Vue } from './components/Sidebar'
import { TopBar } from './components/TopBar'
import { OpsScreen } from './components/screens/OpsScreen'
import { CourrierScreen } from './components/screens/CourrierScreen'
import { CalendrierScreen } from './components/screens/CalendrierScreen'
import { SituationMaterielScreen } from './components/screens/SituationMaterielScreen'
import { VoletFinancierScreen } from './components/screens/VoletFinancierScreen'
import { RessourcesHumainesScreen } from './components/screens/RessourcesHumainesScreen'
import { VeilleStrategiqueScreen } from './components/screens/VeilleStrategiqueScreen'
import { api } from './api/client'
import type { EvenementFlux } from './types'

const titres: Record<Vue, [string, string]> = {
  ops: ['Situation Opérationnelle', 'Situation, unités, renseignement, logistique, opérations, ordres, incidents, alertes et administration'],
  courrier: ['Courrier du Chef', 'Triage, annotation et orientation de la correspondance entrante'],
  calendrier: ['Agenda du Chef', 'Gestion des rendez-vous et engagements du chef'],
  materiel: ['Situation Matériel', 'Matériel en dotation et à la réserve, toutes armées (Terre, Air, Mer)'],
  budget: ['Volet Financier', 'Budget global, fonctionnement et investissement, indicateurs et alertes de seuil'],
  rh: ['Ressources Humaines', 'Effectifs par catégorie, propositions, départs à la retraite et besoins en recrutement'],
  veille: ['Veille Stratégique', "Indicateurs géopolitiques et sécuritaires régionaux, priorisés par probabilité de crise"],
}

const evenementsInitiaux: EvenementFlux[] = [
  { heure: '12:38', titre: 'Menace confirmée A3', description: 'Renseignement : mouvement suspect observé.' },
  { heure: '12:24', titre: 'Cie Alpha en progression', description: 'Passage checkpoint Bravo validé.' },
  { heure: '12:12', titre: 'Alerte carburant', description: 'Compagnie Alpha sous seuil attention.' },
  { heure: '11:58', titre: 'Poste logistique Nord', description: 'Ravitaillement disponible pour deux unités.' },
]

function App() {
  const [vue, setVue] = useState<Vue>('ops')
  const [evenements, setEvenements] = useState<EvenementFlux[]>(evenementsInitiaux)

  async function nouvelIncident() {
    const maintenant = new Date()
    const heure = `${String(maintenant.getHours()).padStart(2, '0')}:${String(maintenant.getMinutes()).padStart(2, '0')}`
    await api.createIncident({
      type_incident: 'securite',
      niveau_gravite: 'moyenne',
      localite: 'À préciser',
      description: "Incident créé depuis le bandeau supérieur, à compléter.",
      declarant: 'PC COP',
    })
    setEvenements((prev) => [
      { heure, titre: 'Nouvel incident créé', description: "Voir l'écran Incidents pour compléter les détails." },
      ...prev,
    ])
  }

  const [titre, sousTitre] = titres[vue]

  return (
    <div className="grid h-full grid-cols-[260px_minmax(0,1fr)] bg-[#f4f6f2] text-[#17201b]">
      <Sidebar vueActive={vue} onChangeVue={setVue} />

      <main className="grid min-h-0 grid-rows-[auto_1fr]">
        <TopBar titre={titre} sousTitre={sousTitre} onNouvelIncident={nouvelIncident} />

        <div className="min-h-0 overflow-auto p-4">
          {vue === 'ops' && <OpsScreen evenements={evenements} />}
          {vue === 'courrier' && <CourrierScreen />}
          {vue === 'calendrier' && <CalendrierScreen />}
          {vue === 'materiel' && <SituationMaterielScreen />}
          {vue === 'budget' && <VoletFinancierScreen />}
          {vue === 'rh' && <RessourcesHumainesScreen />}
          {vue === 'veille' && <VeilleStrategiqueScreen />}
        </div>
      </main>
    </div>
  )
}

export default App
