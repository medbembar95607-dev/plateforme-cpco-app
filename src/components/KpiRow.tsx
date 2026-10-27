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

export function KpiRow({ kpis }: { kpis: Kpi[] }) {
  return (
    <div className="grid grid-cols-5 items-start gap-3 rounded-lg bg-amber-100 p-3">
      {kpis.map((kpi) => {
        const style = tonaliteStyle[kpi.tonalite ?? 'neutre']
        return (
          <div key={kpi.label} className={`grid gap-2 rounded-lg border p-3.5 shadow-sm ${style.carte}`}>
            <span className={`text-xs ${style.label}`}>{kpi.label}</span>
            <strong className={`text-[28px] leading-none ${style.valeur}`}>{kpi.valeur}</strong>
            <small className={`text-xs ${style.note}`}>{kpi.note}</small>
            {kpi.detail && (
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 border-t border-[#eef1ee] pt-2">
                {kpi.detail.map((d) => {
                  const c = couleurNiveau(d.pct)
                  return (
                    <div key={d.label} className="grid gap-0.5 text-[11px] leading-none">
                      <div className="flex justify-between">
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
