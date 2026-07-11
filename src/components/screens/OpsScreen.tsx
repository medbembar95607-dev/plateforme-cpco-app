import { useState } from 'react'
import {
  AlertTriangle,
  ClipboardList,
  Diamond,
  Eye,
  FileText,
  Flag,
  Home,
  Settings,
  Siren,
  Square,
  Video,
} from 'lucide-react'
import { SituationScreen } from './SituationScreen'
import { DeploiementScreen } from './DeploiementScreen'
import { LiveOpsScreen } from './LiveOpsScreen'
import { UnitesScreen } from './UnitesScreen'
import { RenseignementScreen } from './RenseignementScreen'
import { LogistiqueScreen } from './LogistiqueScreen'
import { OperationsScreen } from './OperationsScreen'
import { OrdresScreen } from './OrdresScreen'
import { IncidentsScreen } from './IncidentsScreen'
import { AlertesScreen } from './AlertesScreen'
import { AdministrationScreen } from './AdministrationScreen'
import type { EvenementFlux } from '../../types'

type OngletOps =
  | 'situation'
  | 'deploiement'
  | 'liveops'
  | 'unites'
  | 'renseignement'
  | 'logistique'
  | 'operations'
  | 'ordres'
  | 'incidents'
  | 'alertes'
  | 'administration'

const onglets: Array<{ id: OngletOps; label: string; icone: React.ReactNode }> = [
  { id: 'deploiement', label: 'Déploiement Armée', icone: <Flag size={16} /> },
  { id: 'situation', label: 'Point de Situation', icone: <Home size={16} /> },
  { id: 'liveops', label: 'LIVE OPS', icone: <Video size={16} /> },
  { id: 'unites', label: 'Unités Engagées', icone: <Diamond size={16} /> },
  { id: 'renseignement', label: 'Renseignement', icone: <Eye size={16} /> },
  { id: 'logistique', label: 'Logistique', icone: <Square size={16} /> },
  { id: 'operations', label: 'Opérations', icone: <ClipboardList size={16} /> },
  { id: 'ordres', label: 'Ordres', icone: <FileText size={16} /> },
  { id: 'incidents', label: 'Incidents', icone: <Siren size={16} /> },
  { id: 'alertes', label: 'Alertes', icone: <AlertTriangle size={16} /> },
  { id: 'administration', label: 'Administration', icone: <Settings size={16} /> },
]

interface OpsScreenProps {
  evenements: EvenementFlux[]
}

export function OpsScreen({ evenements }: OpsScreenProps) {
  const [onglet, setOnglet] = useState<OngletOps>('situation')

  return (
    <div className="grid h-full min-h-0 grid-rows-[auto_1fr] gap-3">
      <nav className="flex flex-wrap gap-1.5 border-b border-[#d8ded9] pb-2" aria-label="Sous-navigation OPS">
        {onglets.map((o) => (
          <button
            key={o.id}
            onClick={() => setOnglet(o.id)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm ${
              onglet === o.id ? 'bg-[#17201b] text-white' : 'bg-white text-[#17201b] hover:bg-black/5'
            }`}
          >
            {o.icone}
            {o.label}
          </button>
        ))}
      </nav>

      <div className="min-h-0 overflow-auto">
        {onglet === 'situation' && <SituationScreen evenements={evenements} />}
        {onglet === 'deploiement' && <DeploiementScreen />}
        {onglet === 'liveops' && <LiveOpsScreen />}
        {onglet === 'unites' && <UnitesScreen />}
        {onglet === 'renseignement' && <RenseignementScreen />}
        {onglet === 'logistique' && <LogistiqueScreen />}
        {onglet === 'operations' && <OperationsScreen />}
        {onglet === 'ordres' && <OrdresScreen />}
        {onglet === 'incidents' && <IncidentsScreen />}
        {onglet === 'alertes' && <AlertesScreen />}
        {onglet === 'administration' && <AdministrationScreen />}
      </div>
    </div>
  )
}
