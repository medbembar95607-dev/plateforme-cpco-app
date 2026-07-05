import { useEffect, useState } from 'react'
import { api } from '../../api/client'

type LigneRow = Awaited<ReturnType<typeof api.logistics>>[number]

const alerteStyle = {
  normal: { label: 'Normal', badge: 'bg-emerald-50 text-emerald-700' },
  attention: { label: 'Attention', badge: 'bg-amber-50 text-amber-700' },
  critique: { label: 'Critique', badge: 'bg-red-50 text-red-700' },
}

function couleurBarre(pct: number) {
  if (pct <= 30) return 'bg-[#b9332c]'
  if (pct <= 50) return 'bg-[#ba7a0b]'
  return 'bg-[#21835d]'
}

function Barre({ pct }: { pct: number }) {
  return (
    <div className="h-[9px] w-[150px] overflow-hidden rounded-full bg-[#e5e9e5]">
      <div className={`h-full ${couleurBarre(pct)}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

export function LogistiqueScreen() {
  const [lignes, setLignes] = useState<LigneRow[]>([])

  useEffect(() => {
    api.logistics().then(setLignes)
  }, [])

  return (
    <section className="grid min-h-0 grid-rows-[auto_1fr] gap-3.5">
      <div className="flex items-center justify-between gap-3">
        <select className="h-[38px] rounded-lg border border-[#d8ded9] bg-white px-2.5">
          <option>Toutes les ressources</option>
          <option>Carburant</option>
          <option>Munitions</option>
          <option>Vivres</option>
          <option>Maintenance</option>
          <option>Armement</option>
        </select>
        <button className="h-10 rounded-lg border border-[#17201b] bg-[#17201b] px-3.5 text-white">Planifier ravitaillement</button>
      </div>

      <div className="overflow-auto rounded-lg border border-[#d8ded9] bg-white shadow-sm">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-[#f8faf7] text-xs text-[#65706a]">
              <th className="border-b border-[#d8ded9] px-3.5 py-3 text-left">Unité</th>
              <th className="border-b border-[#d8ded9] px-3.5 py-3 text-left">Carburant</th>
              <th className="border-b border-[#d8ded9] px-3.5 py-3 text-left">Munitions</th>
              <th className="border-b border-[#d8ded9] px-3.5 py-3 text-left">Vivres</th>
              <th className="border-b border-[#d8ded9] px-3.5 py-3 text-left">Maintenance</th>
              <th className="border-b border-[#d8ded9] px-3.5 py-3 text-left">Alerte</th>
            </tr>
          </thead>
          <tbody>
            {lignes.map((ligne) => (
              <tr key={ligne.uniteId}>
                <td className="border-b border-[#d8ded9] px-3.5 py-3">{ligne.uniteNom}</td>
                <td className="border-b border-[#d8ded9] px-3.5 py-3">
                  <Barre pct={ligne.carburantPct} />
                </td>
                <td className="border-b border-[#d8ded9] px-3.5 py-3">
                  <Barre pct={ligne.munitionsPct} />
                </td>
                <td className="border-b border-[#d8ded9] px-3.5 py-3">{ligne.vivresPct}%</td>
                <td className="border-b border-[#d8ded9] px-3.5 py-3">{ligne.maintenancePct}%</td>
                <td className="border-b border-[#d8ded9] px-3.5 py-3">
                  <span
                    className={`inline-flex min-h-[26px] items-center rounded-full px-2.5 text-xs font-bold ${alerteStyle[ligne.alerte as keyof typeof alerteStyle].badge}`}
                  >
                    {alerteStyle[ligne.alerte as keyof typeof alerteStyle].label}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
