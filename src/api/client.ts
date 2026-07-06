// VITE_API_URL permet de pointer vers l'API déployée (Render) en production ; par défaut,
// l'API locale de dev. Voir .env.production et README (section déploiement).
const BASE_URL = `${import.meta.env.VITE_API_URL ?? 'http://localhost:8000'}/api`

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

export interface CourrierDTO {
  id: string
  numero: string
  typeDocument: string
  origine: string
  expediteur: string
  objet: string
  resume: string
  contenu: string
  classification: string
  priorite: string
  statut: string
  dateReception: string
  dateLimiteReponse: string | null
  annotation: string | null
  annotePar: string | null
  dateAnnotation: string | null
  orienteVers: string | null
  ordreGenereId: string | null
}

export interface MaterielDTO {
  id: string
  nom: string
  categorie: string
  typeMateriel: string
  armee: string
  formationAffectation: string
  fonction: string
  caracteristiques: string
  statutDotation: string
  etat: string
  quantite: number
  quantiteOperationnelle: number
  quantiteHorsService: number
  seuilAlerte: number
  dotationTed: number
  ecart: number
  classification: string
  enAlerte: boolean
}

export interface IndicateursMaterielDTO {
  totalDotation: number
  totalReserve: number
  nombreAlertes: number
  nombreHorsService: number
  parArmee: Record<string, number>
}

export interface LigneBudgetaireDTO {
  id: string
  libelle: string
  typeBudget: string
  formationBeneficiaire: string
  periode: string
  montantAlloue: number
  montantConsomme: number
  seuilAlertePct: number
  tauxConsommationPct: number
  statut: string
  classification: string
}

export interface IndicateursBudgetDTO {
  budgetGlobalAlloue: number
  budgetGlobalConsomme: number
  tauxConsommationGlobalPct: number
  parType: Record<string, { montantAlloue: number; montantConsomme: number; tauxConsommationPct: number }>
  nombreDepassements: number
  nombreAttentions: number
}

export interface MilitaireDTO {
  id: string
  matricule: string
  nomComplet: string
  grade: string
  categorie: string
  armee: string
  formationAffectation: string
  age: number
  anciennete: number
  anneesAvantRetraite: number
  procheRetraite: boolean
  classification: string
}

export interface IndicateursRHDTO {
  effectifTotal: number
  parCategorie: Record<string, number>
  parArmee: Record<string, number>
  procheRetraite: number
  propositionsEnCours: number
  besoinsOuverts: number
}

export interface PropositionRHDTO {
  id: string
  militaireId: string
  militaireNom: string
  militaireGrade: string
  typeProposition: string
  motif: string
  proposition: string
  statut: string
  dateCreation: string
  classification: string
}

export interface BesoinRecrutementDTO {
  id: string
  poste: string
  categorie: string
  armee: string
  formationAffectation: string
  nombrePostes: number
  priorite: string
  statut: string
  classification: string
}

export interface RendezVousDTO {
  id: string
  titre: string
  typeRdv: string
  dateDebut: string
  dateFin: string | null
  lieu: string
  participants: string
  statut: string
  classification: string
  notes: string | null
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
    request<
      Array<{ uniteId: string; uniteNom: string; carburantPct: number; munitionsPct: number; vivresPct: number; maintenancePct: number; armementPct: number; alerte: string }>
    >('/logistics'),
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
  courriers: () => request<CourrierDTO[]>('/courriers'),
  annoterCourrier: (id: string, annotation: string) =>
    request<CourrierDTO>(`/courriers/${id}/annoter`, { method: 'POST', body: JSON.stringify({ annotation }) }),
  orienterCourrier: (id: string, destination: string) =>
    request<CourrierDTO>(`/courriers/${id}/orienter`, { method: 'POST', body: JSON.stringify({ destination }) }),
  classerCourrier: (id: string) => request<CourrierDTO>(`/courriers/${id}/classer`, { method: 'POST' }),
  traiterCourrier: (id: string) => request<CourrierDTO>(`/courriers/${id}/traiter`, { method: 'POST' }),
  genererOrdreDepuisCourrier: (id: string) => request<CourrierDTO>(`/courriers/${id}/generer-ordre`, { method: 'POST' }),
  agenda: () => request<RendezVousDTO[]>('/agenda'),
  creerRendezVous: (payload: { titre: string; type_rdv: string; date_debut: string; date_fin?: string; lieu: string; participants: string; classification: string }) =>
    request<RendezVousDTO>('/agenda', { method: 'POST', body: JSON.stringify(payload) }),
  confirmerRendezVous: (id: string) => request<RendezVousDTO>(`/agenda/${id}/confirmer`, { method: 'POST' }),
  annulerRendezVous: (id: string) => request<RendezVousDTO>(`/agenda/${id}/annuler`, { method: 'POST' }),
  materiels: () => request<MaterielDTO[]>('/materiels'),
  materielIndicateurs: () => request<IndicateursMaterielDTO>('/materiels/indicateurs'),
  budget: () => request<LigneBudgetaireDTO[]>('/budget'),
  budgetIndicateurs: () => request<IndicateursBudgetDTO>('/budget/indicateurs'),
  personnel: () => request<MilitaireDTO[]>('/rh/personnel'),
  rhIndicateurs: () => request<IndicateursRHDTO>('/rh/indicateurs'),
  propositionsRH: () => request<PropositionRHDTO[]>('/rh/propositions'),
  creerPropositionRH: (payload: { militaire_id: string; type_proposition: string; motif: string; proposition: string; classification: string }) =>
    request<PropositionRHDTO>('/rh/propositions', { method: 'POST', body: JSON.stringify(payload) }),
  validerPropositionRH: (id: string) => request<PropositionRHDTO>(`/rh/propositions/${id}/valider`, { method: 'POST' }),
  rejeterPropositionRH: (id: string) => request<PropositionRHDTO>(`/rh/propositions/${id}/rejeter`, { method: 'POST' }),
  besoinsRecrutement: () => request<BesoinRecrutementDTO[]>('/rh/besoins-recrutement'),
}
