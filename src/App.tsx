import { useState } from 'react'
import { Sidebar, type Vue } from './components/Sidebar'
import { TopBar } from './components/TopBar'
import { SituationScreen } from './components/screens/SituationScreen'
import { LiveOpsScreen } from './components/screens/LiveOpsScreen'
import { UnitesScreen } from './components/screens/UnitesScreen'
import { RenseignementScreen } from './components/screens/RenseignementScreen'
import { LogistiqueScreen } from './components/screens/LogistiqueScreen'
import { OperationsScreen } from './components/screens/OperationsScreen'
import { OrdresScreen } from './components/screens/OrdresScreen'
import { IncidentsScreen } from './components/screens/IncidentsScreen'
import { AlertesScreen } from './components/screens/AlertesScreen'
import { AdministrationScreen } from './components/screens/AdministrationScreen'
import { api } from './api/client'
import type { EvenementFlux } from './types'

const titres: Record<Vue, [string, string]> = {
  situation: ['Point de Situation Opérationnel', 'Dernière mise à jour : 03 juillet 2026, 12:40 UTC'],
  liveops: ['LIVE OPS', 'Suivi temps réel des unités engagées et appui drone'],
  unites: ['Gestion des unités', 'Positions, statuts, effectifs et communications'],
  renseignement: ['Module renseignement', 'Observations, menaces, fiabilité et classification'],
  logistique: ['Suivi logistique', 'Carburant, munitions, vivres, maintenance et alertes'],
  operations: ['Gestion des opérations', 'Missions, tâches et progression'],
  ordres: ["Ordres d'opération", 'Créer, valider, signer et diffuser'],
  incidents: ['Gestion des incidents', 'Suivi des incidents signalés et de leur traitement'],
  alertes: ["Centre d'alertes", 'Flux temps réel des alertes actives'],
  administration: ['Administration', 'Utilisateurs, rôles, permissions et journal des actions'],
}

const evenementsInitiaux: EvenementFlux[] = [
  { heure: '12:38', titre: 'Menace confirmée A3', description: 'Renseignement : mouvement suspect observé.' },
  { heure: '12:24', titre: 'Cie Alpha en progression', description: 'Passage checkpoint Bravo validé.' },
  { heure: '12:12', titre: 'Alerte carburant', description: 'Compagnie Alpha sous seuil attention.' },
  { heure: '11:58', titre: 'Poste logistique Nord', description: 'Ravitaillement disponible pour deux unités.' },
]

function App() {
  const [vue, setVue] = useState<Vue>('situation')
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
          {vue === 'situation' && <SituationScreen evenements={evenements} />}
          {vue === 'liveops' && <LiveOpsScreen />}
          {vue === 'unites' && <UnitesScreen />}
          {vue === 'renseignement' && <RenseignementScreen />}
          {vue === 'logistique' && <LogistiqueScreen />}
          {vue === 'operations' && <OperationsScreen />}
          {vue === 'ordres' && <OrdresScreen />}
          {vue === 'incidents' && <IncidentsScreen />}
          {vue === 'alertes' && <AlertesScreen />}
          {vue === 'administration' && <AdministrationScreen />}
        </div>
      </main>
    </div>
  )
}

export default App
