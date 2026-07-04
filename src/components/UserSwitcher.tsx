import { useEffect, useState } from 'react'
import { api, session } from '../api/client'

type UserRow = Awaited<ReturnType<typeof api.adminUsers>>[number]

const roleLabel: Record<string, string> = {
  commandement: 'Commandement',
  officier_operations: 'Officier opérations',
  officier_renseignement: 'Officier renseignement',
  officier_logistique: 'Officier logistique',
  administrateur: 'Administrateur',
}

/** Pas de vraie authentification (voir README) : ce sélecteur simule "qui est connecté" pour
 * que les actions d'écriture puissent être attribuées dans le journal d'audit. */
export function UserSwitcher() {
  const [utilisateurs, setUtilisateurs] = useState<UserRow[]>([])
  const [selectionId, setSelectionId] = useState<string>('')

  useEffect(() => {
    api.adminUsers().then((data) => {
      setUtilisateurs(data)
      if (data[0]) {
        session.userId = data[0].id
        setSelectionId(data[0].id)
      }
    })
  }, [])

  function changer(id: string) {
    session.userId = id
    setSelectionId(id)
  }

  return (
    <div className="rounded-lg border border-black/10 bg-black/5 p-3">
      <label className="mb-1.5 block text-xs text-[#5c4a10]" htmlFor="user-switcher">
        Connecté en tant que
      </label>
      <select
        id="user-switcher"
        value={selectionId}
        onChange={(e) => changer(e.target.value)}
        className="w-full rounded-md border border-black/10 bg-[#17201b] px-2 py-1.5 text-sm text-white"
      >
        {utilisateurs.map((u) => (
          <option key={u.id} value={u.id}>
            {u.nom_complet} — {roleLabel[u.role] ?? u.role}
          </option>
        ))}
      </select>
    </div>
  )
}
