import { useState } from 'react'
import { Sidebar, type Vue } from './components/Sidebar'
import { TopBar } from './components/TopBar'
import { SituationScreen } from './components/screens/SituationScreen'
import { UnitesScreen } from './components/screens/UnitesScreen'
import { RenseignementScreen } from './components/screens/RenseignementScreen'
import { LogistiqueScreen } from './components/screens/LogistiqueScreen'
import { OperationsScreen } from './components/screens/OperationsScreen'
import { OrdresScreen } from './components/screens/OrdresScreen'
import { IncidentsScreen } from './components/screens/IncidentsScreen'
import { AlertesScreen } from './components/screens/AlertesScreen'
import { AdministrationScreen } from './components/screens/AdministrationScreen'
import { evenementsFlux as evenementsInitiaux } from './data/mockData'
import type { EvenementFlux } from './types'

const titres: Record<Vue, [string, string]> = {
  situation: ['Carte opérationnelle commune', 'Dernière mise à jour : 03 juillet 2026, 12:40 UTC'],
  unites: ['Gestion des unités', 'Positions, statuts, effectifs et communications'],
  renseignement: ['Module renseignement', 'Observations, menaces, fiabilité et classification'],
  logistique: ['Suivi logistique', 'Carburant, munitions, vivres, maintenance et alertes'],
  operations: ['Gestion des opérations', 'Missions, tâches et progression'],
  ordres: ["Ordres d'opération", 'Créer, valider, signer et diffuser'],
  incidents: ['Gestion des incidents', 'Suivi des incidents signalés et de leur traitement'],
  alertes: ["Centre d'alertes", 'Flux temps réel des alertes actives'],
  administration: ['Administration', 'Utilisateurs, rôles, permissions et journal des actions'],
}

function App() {
  const [vue, setVue] = useState<Vue>('situation')
  const [evenements, setEvenements] = useState<EvenementFlux[]>(evenementsInitiaux)

  function nouvelIncident() {
    const maintenant = new Date()
    const heure = `${String(maintenant.getHours()).padStart(2, '0')}:${String(maintenant.getMinutes()).padStart(2, '0')}`
    setEvenements((prev) => [
      { heure, titre: 'Nouvel incident préparé', description: "Formulaire de création à compléter depuis l'écran Incidents." },
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
