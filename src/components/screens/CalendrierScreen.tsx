import { useEffect, useState } from 'react'
import { api } from '../../api/client'

const typeRdvLabel: Record<string, string> = {
  reunion: 'Réunion',
  audience: 'Audience',
  deplacement: 'Déplacement',
  ceremonie: 'Cérémonie',
  briefing: 'Briefing',
  autre: 'Autre',
}

const statutStyle: Record<string, { label: string; badge: string }> = {
  a_confirmer: { label: 'À confirmer', badge: 'bg-amber-50 text-amber-700' },
  confirme: { label: 'Confirmé', badge: 'bg-emerald-50 text-emerald-700' },
  annule: { label: 'Annulé', badge: 'bg-gray-100 text-gray-500' },
}

const classifications = ['diffusion_libre', 'confidentiel', 'secret', 'tres_secret']

function formaterDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' })
}

function formaterHeure(iso: string) {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

export function CalendrierScreen() {
  const [rendezVous, setRendezVous] = useState<Awaited<ReturnType<typeof api.agenda>>>([])
  const [titre, setTitre] = useState('')
  const [typeRdv, setTypeRdv] = useState('reunion')
  const [date, setDate] = useState('')
  const [heureDebut, setHeureDebut] = useState('')
  const [heureFin, setHeureFin] = useState('')
  const [lieu, setLieu] = useState('')
  const [participants, setParticipants] = useState('')
  const [classification, setClassification] = useState('confidentiel')

  function charger() {
    api.agenda().then(setRendezVous)
  }

  useEffect(() => {
    charger()
  }, [])

  async function ajouter() {
    if (!titre || !date || !heureDebut) return
    await api.creerRendezVous({
      titre,
      type_rdv: typeRdv,
      date_debut: `${date}T${heureDebut}:00`,
      date_fin: heureFin ? `${date}T${heureFin}:00` : undefined,
      lieu,
      participants,
      classification,
    })
    setTitre('')
    setDate('')
    setHeureDebut('')
    setHeureFin('')
    setLieu('')
    setParticipants('')
    charger()
  }

  async function confirmer(id: string) {
    await api.confirmerRendezVous(id)
    charger()
  }

  async function annuler(id: string) {
    await api.annulerRendezVous(id)
    charger()
  }

  const aVenir = rendezVous.filter((r) => r.statut !== 'annule')
  const annules = rendezVous.filter((r) => r.statut === 'annule')

  return (
    <div className="grid min-h-0 grid-cols-[1fr_340px] gap-3.5">
      <div className="grid content-start gap-3 overflow-auto">
        {aVenir.map((r) => (
          <div key={r.id} className="grid gap-2 rounded-lg border border-[#d8ded9] bg-white p-3.5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <strong className="text-[#17201b]">{r.titre}</strong>
                <span className="inline-flex min-h-[24px] items-center rounded-full bg-blue-50 px-2 text-xs font-bold text-blue-700">
                  {typeRdvLabel[r.typeRdv] ?? r.typeRdv}
                </span>
              </div>
              <span className={`inline-flex min-h-[24px] items-center rounded-full px-2 text-xs font-bold ${statutStyle[r.statut]?.badge ?? 'bg-gray-100 text-gray-700'}`}>
                {statutStyle[r.statut]?.label ?? r.statut}
              </span>
            </div>
            <span className="text-sm capitalize text-[#65706a]">
              {formaterDate(r.dateDebut)} · {formaterHeure(r.dateDebut)}
              {r.dateFin ? ` – ${formaterHeure(r.dateFin)}` : ''}
            </span>
            {r.lieu && <span className="text-xs text-[#65706a]">Lieu : {r.lieu}</span>}
            {r.participants && <span className="text-xs text-[#65706a]">Participants : {r.participants}</span>}
            {r.notes && <span className="text-xs text-[#65706a]">{r.notes}</span>}
            {r.statut !== 'confirme' && (
              <div className="flex gap-2">
                <button onClick={() => confirmer(r.id)} className="h-8 rounded-lg border border-emerald-700 bg-emerald-600 px-3 text-xs text-white">
                  Confirmer
                </button>
                <button onClick={() => annuler(r.id)} className="h-8 rounded-lg border border-gray-500 bg-gray-400 px-3 text-xs text-white">
                  Annuler
                </button>
              </div>
            )}
          </div>
        ))}
        {aVenir.length === 0 && <p className="text-sm text-[#65706a]">Aucun rendez-vous à venir.</p>}

        {annules.length > 0 && (
          <div className="grid gap-2 opacity-60">
            <span className="text-xs font-bold uppercase tracking-wide text-[#65706a]">Annulés</span>
            {annules.map((r) => (
              <div key={r.id} className="rounded-lg border border-[#d8ded9] bg-white p-3 text-sm text-[#65706a] line-through">
                {r.titre} — {formaterDate(r.dateDebut)}
              </div>
            ))}
          </div>
        )}
      </div>

      <aside className="grid content-start gap-2.5 overflow-auto rounded-lg border border-[#d8ded9] bg-white p-3.5 shadow-sm">
        <h3 className="m-0 text-base text-[#17201b]">Nouveau rendez-vous</h3>
        <input
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          placeholder="Titre"
          className="h-9 rounded-lg border border-[#d8ded9] px-2 text-sm"
        />
        <select value={typeRdv} onChange={(e) => setTypeRdv(e.target.value)} className="h-9 rounded-lg border border-[#d8ded9] px-2 text-sm">
          {Object.entries(typeRdvLabel).map(([valeur, label]) => (
            <option key={valeur} value={valeur}>
              {label}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-9 flex-1 rounded-lg border border-[#d8ded9] px-2 text-sm" />
        </div>
        <div className="flex gap-2">
          <input
            type="time"
            value={heureDebut}
            onChange={(e) => setHeureDebut(e.target.value)}
            className="h-9 flex-1 rounded-lg border border-[#d8ded9] px-2 text-sm"
          />
          <input type="time" value={heureFin} onChange={(e) => setHeureFin(e.target.value)} className="h-9 flex-1 rounded-lg border border-[#d8ded9] px-2 text-sm" />
        </div>
        <input
          value={lieu}
          onChange={(e) => setLieu(e.target.value)}
          placeholder="Lieu"
          className="h-9 rounded-lg border border-[#d8ded9] px-2 text-sm"
        />
        <input
          value={participants}
          onChange={(e) => setParticipants(e.target.value)}
          placeholder="Participants"
          className="h-9 rounded-lg border border-[#d8ded9] px-2 text-sm"
        />
        <select value={classification} onChange={(e) => setClassification(e.target.value)} className="h-9 rounded-lg border border-[#d8ded9] px-2 text-sm">
          {classifications.map((c) => (
            <option key={c} value={c}>
              {c.replace('_', ' ')}
            </option>
          ))}
        </select>
        <button onClick={ajouter} className="h-9 rounded-lg border border-sky-400 bg-sky-400 px-3 text-sm text-[#17201b]">
          Ajouter au calendrier
        </button>
      </aside>
    </div>
  )
}
