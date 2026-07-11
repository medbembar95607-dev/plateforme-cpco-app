import { Boxes, Calendar, ListChecks, Mail, Radar, ShieldHalf, Users, Wallet } from 'lucide-react'
import { UserSwitcher } from './UserSwitcher'

export type Vue = 'ops' | 'courrier' | 'calendrier' | 'materiel' | 'budget' | 'rh' | 'veille' | 'suivi_execution'

const entrees: Array<{ vue: Vue; label: string; icone: React.ReactNode }> = [
  { vue: 'ops', label: 'Les Opérations', icone: <ShieldHalf size={17} /> },
  { vue: 'veille', label: 'Veille Stratégique', icone: <Radar size={17} /> },
  { vue: 'suivi_execution', label: 'Suivi Exécution Ordres', icone: <ListChecks size={17} /> },
  { vue: 'courrier', label: 'Parapheur Numérique', icone: <Mail size={17} /> },
  { vue: 'calendrier', label: 'Agenda du Chef', icone: <Calendar size={17} /> },
  { vue: 'materiel', label: 'Situation Matériel', icone: <Boxes size={17} /> },
  { vue: 'budget', label: 'Volet Financier', icone: <Wallet size={17} /> },
  { vue: 'rh', label: 'Ressources Humaines', icone: <Users size={17} /> },
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
          <strong className="block text-[15px] text-[#17201b]">Tableau de Bord Commandement</strong>
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
