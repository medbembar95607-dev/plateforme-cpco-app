import { AlertTriangle, ClipboardList, Diamond, Eye, FileText, Home, Settings, Siren, Square, Video } from 'lucide-react'
import { UserSwitcher } from './UserSwitcher'

export type Vue =
  | 'situation'
  | 'liveops'
  | 'unites'
  | 'renseignement'
  | 'logistique'
  | 'operations'
  | 'ordres'
  | 'incidents'
  | 'alertes'
  | 'administration'

const entrees: Array<{ vue: Vue; label: string; icone: React.ReactNode }> = [
  { vue: 'situation', label: 'Situation', icone: <Home size={17} /> },
  { vue: 'liveops', label: 'LIVE OPS', icone: <Video size={17} /> },
  { vue: 'unites', label: 'Unités', icone: <Diamond size={17} /> },
  { vue: 'renseignement', label: 'Renseignement', icone: <Eye size={17} /> },
  { vue: 'logistique', label: 'Logistique', icone: <Square size={17} /> },
  { vue: 'operations', label: 'Opérations', icone: <ClipboardList size={17} /> },
  { vue: 'ordres', label: 'Ordres', icone: <FileText size={17} /> },
  { vue: 'incidents', label: 'Incidents', icone: <Siren size={17} /> },
  { vue: 'alertes', label: 'Alertes', icone: <AlertTriangle size={17} /> },
  { vue: 'administration', label: 'Administration', icone: <Settings size={17} /> },
]

interface SidebarProps {
  vueActive: Vue
  onChangeVue: (vue: Vue) => void
}

export function Sidebar({ vueActive, onChangeVue }: SidebarProps) {
  return (
    <aside className="grid grid-rows-[auto_1fr_auto_auto] gap-4 bg-amber-400 px-3.5 py-4 text-[#3d2f05]">
      <div className="flex items-center gap-3 border-b border-black/10 px-2 pb-3.5">
        <div className="h-[42px] w-[42px] rounded-lg bg-[#e2eee5]" />
        <div>
          <strong className="block text-[15px] text-[#17201b]">Tableau de Bord COP</strong>
          <span className="block text-xs text-[#5c4a10]">Centre opérationnel</span>
        </div>
      </div>

      <nav className="grid content-start gap-1.5" aria-label="Navigation principale">
        {entrees.map((entree) => (
          <button
            key={entree.vue}
            onClick={() => onChangeVue(entree.vue)}
            className={`flex min-h-[42px] items-center gap-2.5 rounded-lg px-2.5 text-left ${
              vueActive === entree.vue ? 'bg-black/10 text-[#17201b]' : 'text-[#3d2f05] hover:bg-black/10 hover:text-[#17201b]'
            }`}
          >
            <span className="w-[23px] text-center">{entree.icone}</span>
            <span>{entree.label}</span>
          </button>
        ))}
      </nav>

      <div className="rounded-lg border border-black/10 bg-black/5 p-3">
        <span className="text-xs text-[#5c4a10]">Niveau global</span>
        <strong className="mt-1.5 block text-[21px] text-[#17201b]">Vigilance élevée</strong>
      </div>

      <UserSwitcher />
    </aside>
  )
}
