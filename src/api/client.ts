const BASE_URL = 'http://localhost:8000/api'

// Pas de vraie authentification pour l'instant (voir README) : l'utilisateur actif est choisi
// dans un sélecteur de démonstration (Sidebar) et transmis via cet en-tête, pour que le journal
// d'audit puisse quand même attribuer les actions à quelqu'un.
export const session = { userId: null as string | null }

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(init?.headers as Record<string, string>) }
  if (session.userId) headers['X-User-Id'] = session.userId

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers })
  if (!res.ok) {
    throw new Error(`${init?.method ?? 'GET'} ${path} a échoué (${res.status})`)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export interface SituationDTO {
  unites: Array<{
    id: string
    nom: string
    typeUnite: string
    echelon: string
    statut: string
    effectif: number
    communication: string
    lon: number | null
    lat: number | null
  }>
  menaces: Array<{ id: string; nom: string; niveau: string; statut: string; classification: string; lon: number; lat: number }>
  checkpoints: Array<{ id: string; nom: string; statut: string; dernierRapport: string | null; lon: number; lat: number }>
  zones: Array<{ id: string; nom: string; typeZone: string; coordinates: [number, number][] }>
  axes: Array<{ id: string; nom: string; coordinates: [number, number][] }>
  kpis: {
    operationsActives: number
    unitesEngagees: number
    effectifsEngages: number
    menacesDetectees: number
    menacesConfirmees: number
    niveauLogistiquePct: number
  }
}

export const api = {
  situation: () => request<SituationDTO>('/situation'),
  units: () =>
    request<Array<{ id: string; nom: string; typeUnite: string; echelon: string; statut: string; effectif: number; communication: string; dernierRapport: string | null }>>('/units'),
  intelligenceReports: () =>
    request<Array<{ id: string; reference: string; type_renseignement: string; classification: string; titre: string; resume: string; fiabilite_source: string; statut: string }>>(
      '/intelligence-reports',
    ),
  logistics: () =>
    request<Array<{ uniteId: string; uniteNom: string; carburantPct: number; munitionsPct: number; vivresPct: number; maintenancePct: number; alerte: string }>>('/logistics'),
  logisticsThresholds: () => request<Record<string, number>>('/logistics/thresholds'),
  operations: () =>
    request<Array<{ id: string; code_operation: string; nom_operation: string; objectif: string; statut: string; priorite: string; progression: number }>>('/operations'),
  orders: () =>
    request<
      Array<{
        id: string
        numero: string
        type: string
        classification: string
        objet: string
        contenu: string
        statut: string
        emetteur: string
        destinataires: Array<{ uniteId: string; uniteNom: string; statut: string }>
      }>
    >('/orders'),
  advanceOrder: (id: string) => request(`/orders/${id}/advance`, { method: 'POST' }),
  incidents: () =>
    request<Array<{ id: string; type_incident: string; niveau_gravite: string; localite: string; description: string; statut: string; declarant: string; date_incident: string }>>(
      '/incidents',
    ),
  createIncident: (payload: { type_incident: string; niveau_gravite: string; localite: string; description: string; declarant: string }) =>
    request('/incidents', { method: 'POST', body: JSON.stringify(payload) }),
  alerts: () => request<Array<{ id: string; type_alerte: string; niveau: string; message: string; statut: string; date_creation: string }>>('/alerts'),
  acknowledgeAlert: (id: string) => request(`/alerts/${id}/acknowledge`, { method: 'POST' }),
  adminUsers: () => request<Array<{ id: string; nom_complet: string; grade: string; role: string; clearance_level: string; actif: boolean }>>('/admin/users'),
  adminRoles: () => request<Record<string, string[]>>('/admin/roles'),
  adminAuditLog: () =>
    request<Array<{ horodatage: string; utilisateur: string; action: string; tableCible: string; enregistrementId: string }>>('/admin/audit-log'),
}
