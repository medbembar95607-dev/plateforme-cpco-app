import type { EvenementFlux } from '../types'

export function Feed({ evenements }: { evenements: EvenementFlux[] }) {
  return (
    <section className="grid min-h-0 grid-rows-[auto_1fr] rounded-lg border border-[#d8ded9] bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-[#d8ded9] px-3.5 py-3">
        <h2 className="m-0 text-base text-[#17201b]">Flux opérationnel</h2>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#d8ded9] px-2.5 py-1 text-xs text-[#65706a]">
          <i className="h-2 w-2 rounded-full bg-[#b9332c]" />
          Priorité
        </span>
      </div>
      <div className="grid gap-2 overflow-auto p-2.5">
        {evenements.map((evt) => (
          <div key={evt.heure + evt.titre} className="grid gap-1 rounded-lg border border-[#d8ded9] bg-white p-2.5">
            <strong className="text-[13px] text-[#17201b]">
              {evt.heure} - {evt.titre}
            </strong>
            <span className="text-xs text-[#65706a]">{evt.description}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
