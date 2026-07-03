import { unites } from '../../data/mockData'
import { statutUniteStyle, typeUniteLabel } from '../../uniteStyle'

export function UnitesScreen() {
  return (
    <section className="grid min-h-0 grid-rows-[auto_1fr] gap-3.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <select className="h-[38px] rounded-lg border border-[#d8ded9] bg-white px-2.5">
            <option>Tous les types</option>
            {Object.values(typeUniteLabel).map((label) => (
              <option key={label}>{label}</option>
            ))}
          </select>
          <select className="h-[38px] rounded-lg border border-[#d8ded9] bg-white px-2.5">
            <option>Tous les statuts</option>
            {Object.values(statutUniteStyle).map((s) => (
              <option key={s.label}>{s.label}</option>
            ))}
          </select>
        </div>
        <button className="h-10 rounded-lg border border-[#17201b] bg-[#17201b] px-3.5 text-white">Ajouter une unité</button>
      </div>

      <div className="overflow-auto rounded-lg border border-[#d8ded9] bg-white shadow-sm">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-[#f8faf7] text-xs text-[#65706a]">
              <th className="border-b border-[#d8ded9] px-3.5 py-3 text-left">Unité</th>
              <th className="border-b border-[#d8ded9] px-3.5 py-3 text-left">Type</th>
              <th className="border-b border-[#d8ded9] px-3.5 py-3 text-left">Statut</th>
              <th className="border-b border-[#d8ded9] px-3.5 py-3 text-left">Effectif</th>
              <th className="border-b border-[#d8ded9] px-3.5 py-3 text-left">Communication</th>
              <th className="border-b border-[#d8ded9] px-3.5 py-3 text-left">Dernier rapport</th>
            </tr>
          </thead>
          <tbody>
            {unites.map((unite) => (
              <tr key={unite.id}>
                <td className="border-b border-[#d8ded9] px-3.5 py-3">{unite.nom}</td>
                <td className="border-b border-[#d8ded9] px-3.5 py-3">{typeUniteLabel[unite.typeUnite]}</td>
                <td className="border-b border-[#d8ded9] px-3.5 py-3">
                  <span className={`inline-flex min-h-[26px] items-center rounded-full px-2.5 text-xs font-bold ${statutUniteStyle[unite.statut].badge}`}>
                    {statutUniteStyle[unite.statut].label}
                  </span>
                </td>
                <td className="border-b border-[#d8ded9] px-3.5 py-3">{unite.effectif}</td>
                <td className="border-b border-[#d8ded9] px-3.5 py-3">{unite.communication === 'stable' ? 'Stable' : 'Dégradée'}</td>
                <td className="border-b border-[#d8ded9] px-3.5 py-3">{unite.dernierRapport}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
