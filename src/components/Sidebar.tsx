import { AlertTriangle, ClipboardList, Diamond, Eye, FileText, Home, Settings, Siren, Square } from 'lucide-react'
import { UserSwitcher } from './UserSwitcher'

export type Vue =
  | 'situation'
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
    <aside className="grid grid-rows-[auto_1fr_auto_auto] gap-4 bg-[#17201b] px-3.5 py-4 text-[#dce5df]">
      <div className="flex items-center gap-3 border-b border-white/10 px-2 pb-3.5">
        <div className="grid h-[42px] w-[42px] place-items-center rounded-lg bg-[#e2eee5] font-extrabold text-[#17201b]">C2</div>
        <div>
          <strong className="block text-[15px] text-white">Tableau de Bord COP</strong>
          <span className="block text-xs text-[#bdc9c0]">Centre opérationnel</span>
        </div>
      </div>

      <nav className="grid content-start gap-1.5" aria-label="Navigation principale">
        {entrees.map((entree) => (
          <button
            key={entree.vue}
            onClick={() => onChangeVue(entree.vue)}
            className={`flex min-h-[42px] items-center gap-2.5 rounded-lg px-2.5 text-left ${
              vueActive === entree.vue ? 'bg-white/10 text-white' : 'text-[#dce5df] hover:bg-white/10 hover:text-white'
            }`}
          >
            <span className="w-[23px] text-center">{entree.icone}</span>
            <span>{entree.label}</span>
          </button>
        ))}
      </nav>

      <div className="rounded-lg border border-white/10 bg-white/5 p-3">
        <span className="text-xs text-[#bdc9c0]">Niveau global</span>
        <strong className="mt-1.5 block text-[21px] text-white">Vigilance élevée</strong>
      </div>

      <UserSwitcher />
    </aside>
  )
}
