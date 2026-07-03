interface Kpi {
  label: string
  valeur: string
  note: string
}

export function KpiRow({ kpis }: { kpis: Kpi[] }) {
  return (
    <div className="grid grid-cols-5 gap-3">
      {kpis.map((kpi) => (
        <div key={kpi.label} className="grid gap-2 rounded-lg border border-[#d8ded9] bg-white p-3.5 shadow-sm">
          <span className="text-xs text-[#65706a]">{kpi.label}</span>
          <strong className="text-[28px] leading-none text-[#17201b]">{kpi.valeur}</strong>
          <small className="text-xs text-[#65706a]">{kpi.note}</small>
        </div>
      ))}
    </div>
  )
}
