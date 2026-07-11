export type ToniteKpi = 'neutre' | 'succes' | 'alerte' | 'danger' | 'info'

interface Kpi {
  label: string
  valeur: string
  note: string
  tonalite?: ToniteKpi
}

const tonaliteStyle: Record<ToniteKpi, { carte: string; label: string; valeur: string; note: string }> = {
  neutre: { carte: 'border-[#d8ded9] bg-white', label: 'text-[#65706a]', valeur: 'text-[#17201b]', note: 'text-[#65706a]' },
  succes: { carte: 'border-emerald-300 bg-emerald-50', label: 'text-emerald-700', valeur: 'text-emerald-600', note: 'text-emerald-700' },
  alerte: { carte: 'border-amber-300 bg-amber-50', label: 'text-amber-700', valeur: 'text-amber-800', note: 'text-amber-700' },
  danger: { carte: 'border-red-300 bg-red-50', label: 'text-red-700', valeur: 'text-red-800', note: 'text-red-700' },
  info: { carte: 'border-blue-300 bg-blue-50', label: 'text-blue-700', valeur: 'text-blue-800', note: 'text-blue-700' },
}

export function KpiRow({ kpis }: { kpis: Kpi[] }) {
  return (
    <div className="grid grid-cols-5 gap-3 rounded-lg bg-amber-100 p-3">
      {kpis.map((kpi) => {
        const style = tonaliteStyle[kpi.tonalite ?? 'neutre']
        return (
          <div key={kpi.label} className={`grid gap-2 rounded-lg border p-3.5 shadow-sm ${style.carte}`}>
            <span className={`text-xs ${style.label}`}>{kpi.label}</span>
            <strong className={`text-[28px] leading-none ${style.valeur}`}>{kpi.valeur}</strong>
            <small className={`text-xs ${style.note}`}>{kpi.note}</small>
          </div>
        )
      })}
    </div>
  )
}
