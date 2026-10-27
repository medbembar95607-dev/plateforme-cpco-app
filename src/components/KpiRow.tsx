export type ToniteKpi = 'neutre' | 'succes' | 'alerte' | 'eleve' | 'danger' | 'info'

interface Kpi {
  label: string
  valeur: string
  note: string
  tonalite?: ToniteKpi
  // Détail affiché sous la valeur : une ligne par domaine, avec jauge.
  detail?: Array<{ label: string; pct: number }>
}

// Mêmes seuils que le déficit de capacité des unités : rouge à 30 % ou moins, orange à 50 % ou moins.
function couleurNiveau(pct: number) {
  if (pct <= 30) return { barre: 'bg-red-600', texte: 'text-red-700' }
  if (pct <= 50) return { barre: 'bg-orange-500', texte: 'text-orange-700' }
  return { barre: 'bg-emerald-600', texte: 'text-[#17201b]' }
}

const tonaliteStyle: Record<ToniteKpi, { carte: string; label: string; valeur: string; note: string }> = {
  neutre: { carte: 'border-[#d8ded9] bg-white', label: 'text-[#65706a]', valeur: 'text-[#17201b]', note: 'text-[#65706a]' },
  succes: { carte: 'border-emerald-300 bg-emerald-50', label: 'text-emerald-700', valeur: 'text-emerald-600', note: 'text-emerald-700' },
  alerte: { carte: 'border-amber-300 bg-amber-50', label: 'text-amber-700', valeur: 'text-amber-800', note: 'text-amber-700' },
  eleve: { carte: 'border-orange-300 bg-orange-50', label: 'text-orange-700', valeur: 'text-orange-700', note: 'text-orange-700' },
  danger: { carte: 'border-red-300 bg-red-50', label: 'text-red-700', valeur: 'text-red-700', note: 'text-red-700' },
  info: { carte: 'border-blue-300 bg-blue-50', label: 'text-blue-700', valeur: 'text-blue-800', note: 'text-blue-700' },
}

// compact : cartes basses (Point de Situation), pour laisser la hauteur à la carte. Une carte avec
// détail y occupe deux colonnes, le détail à droite de la valeur, sans rehausser la rangée.
export function KpiRow({ kpis, compact = false }: { kpis: Kpi[]; compact?: boolean }) {
  const colonnes = kpis.reduce((n, k) => n + (compact && k.detail ? 2 : 1), 0)
  return (
    <div
      className={`grid items-stretch rounded-lg bg-amber-100 ${compact ? 'gap-2 p-2' : 'gap-3 p-3'}`}
      style={{ gridTemplateColumns: `repeat(${colonnes}, minmax(0, 1fr))` }}
    >
      {kpis.map((kpi) => {
        const style = tonaliteStyle[kpi.tonalite ?? 'neutre']
        const enLigne = compact && kpi.detail
        return (
          <div
            key={kpi.label}
            className={`rounded-lg border shadow-sm ${style.carte} ${compact ? 'px-3 py-2' : 'p-3.5'} ${
              enLigne ? 'col-span-2 grid grid-cols-[auto_1fr] items-center gap-4' : `grid ${compact ? 'gap-1' : 'gap-2'}`
            }`}
          >
            <div className={`grid ${compact ? 'gap-1' : 'gap-2'}`}>
              <span className={`text-xs ${style.label}`}>{kpi.label}</span>
              <strong className={`${compact ? 'text-[22px]' : 'text-[28px]'} leading-none ${style.valeur}`}>{kpi.valeur}</strong>
              <small className={`text-xs ${style.note}`}>{kpi.note}</small>
            </div>
            {kpi.detail && (
              <div
                className={`grid gap-x-3 gap-y-1.5 ${enLigne ? 'grid-cols-2 gap-y-1 border-l border-[#eef1ee] pl-4' : 'grid-cols-2 border-t border-[#eef1ee] pt-2'}`}
              >
                {kpi.detail.map((d) => {
                  const c = couleurNiveau(d.pct)
                  return (
                    <div key={d.label} className="grid gap-0.5 text-[11px] leading-none">
                      <div className="flex justify-between gap-1">
                        <span className="text-[#65706a]">{d.label}</span>
                        <span className={`font-bold ${c.texte}`}>{d.pct}%</span>
                      </div>
                      <span className="h-1 overflow-hidden rounded-full bg-[#eef1ee]">
                        <span className={`block h-full rounded-full ${c.barre}`} style={{ width: `${Math.min(100, d.pct)}%` }} />
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
