import { useState } from 'react'
import { MessageCircle, Video } from 'lucide-react'
import { ChatScreen } from './ChatScreen'
import { ReunionScreen } from './ReunionScreen'

type OngletCommunication = 'chat' | 'reunion'

const onglets: Array<{ id: OngletCommunication; label: string; icone: React.ReactNode }> = [
  { id: 'chat', label: 'Chat', icone: <MessageCircle size={16} /> },
  { id: 'reunion', label: 'Réunion', icone: <Video size={16} /> },
]

export function CommunicationScreen() {
  const [onglet, setOnglet] = useState<OngletCommunication>('chat')

  return (
    <div className="grid h-full min-h-0 grid-rows-[auto_1fr] gap-3">
      <nav className="flex flex-wrap gap-1.5 border-b border-[#d8ded9] pb-2" aria-label="Sous-navigation Communication">
        {onglets.map((o) => (
          <button
            key={o.id}
            onClick={() => setOnglet(o.id)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm ${
              onglet === o.id ? 'bg-[#17201b] text-white' : 'bg-white text-[#17201b] hover:bg-black/5'
            }`}
          >
            {o.icone}
            {o.label}
          </button>
        ))}
      </nav>

      <div className="min-h-0 overflow-auto">
        {onglet === 'chat' && <ChatScreen />}
        {onglet === 'reunion' && <ReunionScreen />}
      </div>
    </div>
  )
}
