import { useEffect, useState } from 'react'
import { abonnerSession, session } from './api/client'

/** Rôle de l'utilisateur choisi dans le sélecteur de démonstration, mis à jour quand il change.
 * Sert à masquer les actions non autorisées ; l'API reste l'arbitre (403). */
export function useRoleActif(): string | null {
  const [role, setRole] = useState(session.role)
  useEffect(() => abonnerSession(() => setRole(session.role)), [])
  return role
}
