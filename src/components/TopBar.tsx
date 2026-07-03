interface TopBarProps {
  titre: string
  sousTitre: string
  onNouvelIncident: () => void
}

export function TopBar({ titre, sousTitre, onNouvelIncident }: TopBarProps) {
  return (
    <header className="flex min-h-[72px] items-center justify-between gap-4 border-b border-[#d8ded9] bg-white/90 px-5 py-3.5">
      <div>
        <h1 className="m-0 text-[22px] leading-tight text-[#17201b]">{titre}</h1>
        <div className="mt-1 text-[13px] text-[#65706a]">{sousTitre}</div>
      </div>
      <div className="flex items-center gap-2.5">
        <input
          type="search"
          placeholder="Rechercher unité, incident, zone"
          className="h-10 min-w-[210px] rounded-lg border border-[#d8ded9] bg-white px-3 outline-none"
        />
        <button className="h-10 rounded-lg border border-[#d8ded9] bg-white px-3.5 text-[#17201b]">Filtrer</button>
        <button
          onClick={onNouvelIncident}
          className="h-10 rounded-lg border border-[#17201b] bg-[#17201b] px-3.5 text-white"
        >
          Nouvel incident
        </button>
      </div>
    </header>
  )
}
