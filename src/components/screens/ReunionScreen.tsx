import { useEffect, useState } from 'react'
import { Users, Video, VideoOff } from 'lucide-react'
import { api, type ReunionDTO } from '../../api/client'

const statutStyle: Record<string, { label: string; badge: string }> = {
  convoquee: { label: 'Convoquée', badge: 'bg-amber-50 text-amber-700' },
  en_cours: { label: 'En cours', badge: 'bg-emerald-50 text-emerald-700' },
  terminee: { label: 'Terminée', badge: 'bg-gray-100 text-gray-500' },
  annulee: { label: 'Annulée', badge: 'bg-red-50 text-red-700' },
}

const participantStatutLabel: Record<string, string> = { convoque: 'En attente…', rejoint: 'En ligne', absent: 'Absent' }

function formaterDateHeure(iso: string) {
  return new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function TuileParticipant({
  participant,
  onBasculer,
}: {
  participant: ReunionDTO['participants'][number]
  onBasculer: () => void
}) {
  const enLigne = participant.statut === 'rejoint'
  const absent = participant.statut === 'absent'

  return (
    <div
      className={`relative grid gap-1.5 overflow-hidden rounded-lg border p-3 text-center ${
        enLigne ? 'border-emerald-400 bg-[#0d1210] text-white' : absent ? 'border-[#d8ded9] bg-[#eef2ed] text-[#65706a] opacity-60' : 'border-[#d8ded9] bg-[#f4f6f2] text-[#17201b]'
      }`}
    >
      {enLigne && (
        <div
          className="absolute inset-0 opacity-30"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(120,150,130,0.15) 0px, transparent 2px, transparent 4px)' }}
        />
      )}
      <span className="relative z-10 mx-auto">
        {enLigne ? <Video size={24} /> : absent ? <VideoOff size={24} /> : <Users size={24} />}
      </span>
      <strong className="relative z-10 text-sm">{participant.uniteNom}</strong>
      <span className="relative z-10 text-xs opacity-80">{participantStatutLabel[participant.statut] ?? participant.statut}</span>
      <button onClick={onBasculer} className="relative z-10 mt-1 rounded-md bg-black/15 px-2 py-1 text-[11px]">
        Simuler statut suivant
      </button>
    </div>
  )
}

export function ReunionScreen() {
  const [unites, setUnites] = useState<Awaited<ReturnType<typeof api.units>>>([])
  const [reunions, setReunions] = useState<ReunionDTO[]>([])
  const [selectionneId, setSelectionneId] = useState<string | null>(null)
  const [titre, setTitre] = useState('')
  const [participantIds, setParticipantIds] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [erreur, setErreur] = useState<string | null>(null)

  function charger() {
    api.reunions().then(setReunions)
  }

  useEffect(() => {
    api.units().then(setUnites)
    charger()
  }, [])

  function basculerParticipantForm(id: string) {
    setParticipantIds((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]))
  }

  async function convoquer() {
    if (!titre.trim() || participantIds.length === 0) {
      setErreur('Titre et au moins un participant requis.')
      return
    }
    setErreur(null)
    await api.convoquerReunion({ titre: titre.trim(), participant_unit_ids: participantIds, notes: notes.trim() || undefined })
    setTitre('')
    setParticipantIds([])
    setNotes('')
    charger()
  }

  async function demarrer(id: string) {
    await api.demarrerReunion(id)
    charger()
  }

  async function terminer(id: string) {
    await api.terminerReunion(id)
    charger()
  }

  async function annuler(id: string) {
    await api.annulerReunion(id)
    charger()
  }

  async function basculer(reunionId: string, participantId: string) {
    await api.basculerParticipant(reunionId, participantId)
    charger()
  }

  return (
    <div className="grid min-h-0 grid-cols-[1fr_340px] gap-3.5">
      <div className="grid content-start gap-3 overflow-auto">
        {reunions.map((r) => (
          <div key={r.id} className="grid gap-3 rounded-lg border border-[#d8ded9] bg-white p-3.5 shadow-sm">
            <button onClick={() => setSelectionneId((cur) => (cur === r.id ? null : r.id))} className="grid gap-1.5 text-left">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <strong className="text-[#17201b]">{r.titre}</strong>
                <span className={`inline-flex min-h-[24px] items-center rounded-full px-2 text-xs font-bold ${statutStyle[r.statut]?.badge ?? 'bg-gray-100 text-gray-700'}`}>
                  {statutStyle[r.statut]?.label ?? r.statut}
                </span>
              </div>
              <span className="text-xs text-[#65706a]">
                Convoquée le {formaterDateHeure(r.dateConvocation)} par {r.organisateurNom} · {r.participants.length} participant(s)
              </span>
              {r.notes && <span className="text-xs text-[#65706a]">{r.notes}</span>}
            </button>

            {selectionneId === r.id && (
              <div className="grid gap-3 border-t border-[#d8ded9] pt-3">
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                  {r.participants.map((p) => (
                    <TuileParticipant key={p.id} participant={p} onBasculer={() => basculer(r.id, p.id)} />
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {r.statut === 'convoquee' && (
                    <button onClick={() => demarrer(r.id)} className="h-9 rounded-lg border border-emerald-700 bg-emerald-600 px-3 text-sm text-white">
                      Démarrer la réunion
                    </button>
                  )}
                  {r.statut === 'en_cours' && (
                    <button onClick={() => terminer(r.id)} className="h-9 rounded-lg border border-gray-600 bg-gray-500 px-3 text-sm text-white">
                      Terminer la réunion
                    </button>
                  )}
                  {(r.statut === 'convoquee' || r.statut === 'en_cours') && (
                    <button onClick={() => annuler(r.id)} className="h-9 rounded-lg border border-red-700 bg-red-600 px-3 text-sm text-white">
                      Annuler
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        {reunions.length === 0 && <p className="text-sm text-[#65706a]">Aucune réunion convoquée.</p>}
      </div>

      <aside className="grid content-start gap-2.5 overflow-auto rounded-lg border border-[#d8ded9] bg-white p-3.5 shadow-sm">
        <h3 className="m-0 text-base text-[#17201b]">Convoquer une réunion</h3>
        <input value={titre} onChange={(e) => setTitre(e.target.value)} placeholder="Titre" className="h-9 rounded-lg border border-[#d8ded9] px-2 text-sm" />
        <span className="text-xs text-[#65706a]">Participants</span>
        <div className="grid max-h-48 gap-1 overflow-auto rounded-lg border border-[#d8ded9] p-2">
          {unites.map((u) => (
            <label key={u.id} className="flex items-center gap-2 text-sm text-[#17201b]">
              <input type="checkbox" checked={participantIds.includes(u.id)} onChange={() => basculerParticipantForm(u.id)} />
              {u.nom}
            </label>
          ))}
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes (ordre du jour)…"
          rows={3}
          className="rounded-lg border border-[#d8ded9] p-2 text-sm"
        />
        {erreur && <span className="text-xs font-bold text-red-600">{erreur}</span>}
        <button onClick={convoquer} className="h-9 rounded-lg border border-sky-400 bg-sky-400 px-3 text-sm text-[#17201b]">
          Convoquer
        </button>
      </aside>
    </div>
  )
}
