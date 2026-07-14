import { useEffect, useRef, useState } from 'react'
import { Mic, Paperclip, Radio, Square } from 'lucide-react'
import { api, mediaUrl, type MessageDTO } from '../../api/client'

function formaterHoraire(iso: string) {
  return new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

export function ChatScreen() {
  const [unites, setUnites] = useState<Awaited<ReturnType<typeof api.units>>>([])
  const [messages, setMessages] = useState<MessageDTO[]>([])
  const [destinataireIds, setDestinataireIds] = useState<string[]>([])
  const [diffusion, setDiffusion] = useState(false)
  const [texte, setTexte] = useState('')
  const [enregistrement, setEnregistrement] = useState(false)
  const [envoiEnCours, setEnvoiEnCours] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const fragmentsRef = useRef<Blob[]>([])
  const debutEnregistrementRef = useRef(0)

  function charger() {
    api.messages().then(setMessages)
  }

  useEffect(() => {
    api.units().then(setUnites)
    charger()
  }, [])

  function basculerDestinataire(id: string) {
    setDestinataireIds((prev) => (prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]))
  }

  function verifierDestinataires(): boolean {
    if (!diffusion && destinataireIds.length === 0) {
      setErreur('Sélectionnez au moins un destinataire ou activez la diffusion.')
      return false
    }
    setErreur(null)
    return true
  }

  async function envoyerTexte() {
    if (!texte.trim() || !verifierDestinataires()) return
    setEnvoiEnCours(true)
    try {
      await api.envoyerMessageTexte({ contenu: texte.trim(), destinataire_unit_ids: destinataireIds, diffusion })
      setTexte('')
      charger()
    } finally {
      setEnvoiEnCours(false)
    }
  }

  async function envoyerFichier(fichier: File) {
    if (!verifierDestinataires()) return
    setEnvoiEnCours(true)
    try {
      const form = new FormData()
      form.append('type_message', 'document')
      form.append('fichier', fichier, fichier.name)
      form.append('destinataire_unit_ids', destinataireIds.join(','))
      form.append('diffusion', String(diffusion))
      await api.envoyerMessageMedia(form)
      charger()
    } finally {
      setEnvoiEnCours(false)
    }
  }

  function surChoixFichier(e: React.ChangeEvent<HTMLInputElement>) {
    const fichier = e.target.files?.[0]
    e.target.value = ''
    if (fichier) void envoyerFichier(fichier)
  }

  async function demarrerEnregistrement() {
    if (!verifierDestinataires()) return
    try {
      const flux = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(flux)
      fragmentsRef.current = []
      recorder.ondataavailable = (e) => fragmentsRef.current.push(e.data)
      recorder.onstop = async () => {
        flux.getTracks().forEach((t) => t.stop())
        const blob = new Blob(fragmentsRef.current, { type: 'audio/webm' })
        const dureeSecondes = Math.round((Date.now() - debutEnregistrementRef.current) / 1000)
        setEnvoiEnCours(true)
        try {
          const form = new FormData()
          form.append('type_message', 'vocal')
          form.append('fichier', blob, `vocal-${Date.now()}.webm`)
          form.append('destinataire_unit_ids', destinataireIds.join(','))
          form.append('diffusion', String(diffusion))
          form.append('duree_secondes', String(dureeSecondes))
          await api.envoyerMessageMedia(form)
          charger()
        } finally {
          setEnvoiEnCours(false)
        }
      }
      debutEnregistrementRef.current = Date.now()
      recorder.start()
      mediaRecorderRef.current = recorder
      setEnregistrement(true)
    } catch {
      setErreur("Impossible d'accéder au micro (autorisation refusée ou périphérique indisponible).")
    }
  }

  function arreterEnregistrement() {
    mediaRecorderRef.current?.stop()
    setEnregistrement(false)
  }

  return (
    <div className="grid h-full min-h-0 grid-cols-[260px_1fr] gap-3.5">
      <aside className="grid content-start gap-2 overflow-auto rounded-lg border border-[#d8ded9] bg-white p-3.5 shadow-sm">
        <h3 className="m-0 text-base text-[#17201b]">Destinataires</h3>
        <label className="flex items-center gap-2 rounded-lg bg-[#eef2ed] px-2.5 py-2 text-sm text-[#17201b]">
          <input type="checkbox" checked={diffusion} onChange={(e) => setDiffusion(e.target.checked)} />
          <Radio size={15} /> Diffusion à toutes les unités
        </label>
        <div className={`grid gap-1 ${diffusion ? 'pointer-events-none opacity-40' : ''}`}>
          {unites.map((u) => (
            <label key={u.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-[#17201b] hover:bg-black/5">
              <input type="checkbox" checked={destinataireIds.includes(u.id)} onChange={() => basculerDestinataire(u.id)} />
              {u.nom}
            </label>
          ))}
        </div>
      </aside>

      <section className="grid min-h-0 grid-rows-[1fr_auto] gap-2">
        <div className="grid content-start gap-2.5 overflow-auto rounded-lg border border-[#d8ded9] bg-white p-3.5 shadow-sm">
          {messages.length === 0 && <p className="text-sm text-[#65706a]">Aucun message échangé pour l'instant.</p>}
          {messages.map((m) => (
            <div key={m.id} className="grid gap-1 rounded-lg bg-[#f4f6f2] p-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <strong className="text-sm text-[#17201b]">{m.expediteurNom}</strong>
                <span className="text-xs text-[#65706a]">{formaterHoraire(m.dateEnvoi)}</span>
              </div>
              <span className="text-xs text-[#65706a]">
                {m.diffusion ? 'Diffusion — toutes les unités' : `À : ${m.destinataires.map((d) => d.uniteNom).join(', ')}`}
              </span>
              {m.typeMessage === 'texte' && <p className="m-0 text-sm text-[#17201b]">{m.contenu}</p>}
              {m.typeMessage === 'vocal' && m.fichierUrl && (
                <div className="flex items-center gap-2">
                  <audio controls src={mediaUrl(m.fichierUrl)} className="h-9 max-w-full" />
                  {m.dureeSecondes != null && <span className="text-xs text-[#65706a]">{m.dureeSecondes}s</span>}
                </div>
              )}
              {m.typeMessage === 'document' && m.fichierUrl && (
                <a
                  href={mediaUrl(m.fichierUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-[#d8ded9] bg-white px-2.5 py-1.5 text-xs text-[#17201b]"
                >
                  <Paperclip size={13} /> {m.fichierNom ?? 'Document joint'}
                </a>
              )}
            </div>
          ))}
        </div>

        {erreur && <p className="m-0 text-xs font-bold text-red-600">{erreur}</p>}

        <div className="flex items-center gap-2 rounded-lg border border-[#d8ded9] bg-white p-2.5 shadow-sm">
          <input
            value={texte}
            onChange={(e) => setTexte(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && envoyerTexte()}
            placeholder="Écrire un message…"
            className="h-10 flex-1 rounded-lg border border-[#d8ded9] px-3 text-sm"
          />
          <button
            onClick={envoyerTexte}
            disabled={envoiEnCours || !texte.trim()}
            className="h-10 rounded-lg border border-[#17201b] bg-[#17201b] px-3.5 text-sm text-white disabled:opacity-50"
          >
            Envoyer
          </button>
          <button
            onClick={enregistrement ? arreterEnregistrement : demarrerEnregistrement}
            disabled={envoiEnCours}
            className={`flex h-10 items-center gap-1.5 rounded-lg border px-3 text-sm disabled:opacity-50 ${
              enregistrement ? 'border-red-700 bg-red-600 text-white' : 'border-[#d8ded9] bg-white text-[#17201b]'
            }`}
          >
            {enregistrement ? <Square size={15} /> : <Mic size={15} />}
            {enregistrement ? 'Arrêter' : 'Vocal'}
          </button>
          <label className="flex h-10 cursor-pointer items-center gap-1.5 rounded-lg border border-[#d8ded9] bg-white px-3 text-sm text-[#17201b]">
            <Paperclip size={15} />
            Joindre
            <input type="file" onChange={surChoixFichier} disabled={envoiEnCours} className="hidden" />
          </label>
        </div>
      </section>
    </div>
  )
}
