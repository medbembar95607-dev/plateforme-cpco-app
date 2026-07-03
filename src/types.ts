export type TypeUnite = 'pc' | 'infanterie' | 'artillerie' | 'genie' | 'logistique'
export type EchelonUnite = 'groupement' | 'bataillon' | 'compagnie' | 'section'
export type StatutUnite = 'en_mission' | 'en_progression' | 'disponible' | 'communication_degradee'

export interface Unite {
  id: string
  nom: string
  typeUnite: TypeUnite
  echelon: EchelonUnite
  statut: StatutUnite
  effectif: number
  communication: 'stable' | 'degradee'
  dernierRapport: string
  lon: number
  lat: number
  carburantPct: number
  munitionsPct: number
}

export type NiveauMenace = 'faible' | 'moyenne' | 'elevee' | 'critique'

export interface Menace {
  id: string
  nom: string
  niveau: NiveauMenace
  statut: 'confirmee' | 'a_verifier' | 'neutralisee'
  classification: Classification
  lon: number
  lat: number
}

export interface PosteLogistique {
  id: string
  nom: string
  statut: 'disponible' | 'indisponible'
  lon: number
  lat: number
  carburantPct: number
  vivresPct: number
}

export interface Checkpoint {
  id: string
  nom: string
  statut: 'sous_controle' | 'franchi' | 'a_surveiller'
  lon: number
  lat: number
  dernierRapport: string
}

export type Classification = 'diffusion_libre' | 'confidentiel' | 'secret' | 'tres_secret'

export const classificationLabel: Record<Classification, string> = {
  diffusion_libre: 'Diffusion libre',
  confidentiel: 'Confidentiel',
  secret: 'Secret',
  tres_secret: 'Très Secret',
}

export interface RapportRenseignement {
  id: string
  reference: string
  type: 'HUMINT' | 'SIGINT' | 'OSINT' | 'IMINT'
  classification: Classification
  titre: string
  resume: string
  fiabilite: 'A' | 'B' | 'C'
  statut: 'menace' | 'observation' | 'stabilise'
}

export interface LigneLogistique {
  uniteId: string
  uniteNom: string
  carburantPct: number
  munitionsPct: number
  vivresPct: number
  maintenancePct: number
  alerte: 'normal' | 'attention' | 'critique'
}

export type StatutOperation = 'planifiee' | 'en_cours' | 'sous_tension' | 'terminee'

export interface Operation {
  id: string
  code: string
  nom: string
  description: string
  statut: StatutOperation
  priorite: 'faible' | 'moyenne' | 'elevee'
  progression: number
}

export type TypeOrdre = 'OPORD' | 'FRAGO' | 'WARNO'
export type StatutOrdre = 'brouillon' | 'signe' | 'diffuse' | 'annule'

export interface DestinataireOrdre {
  uniteId: string
  uniteNom: string
  statut: 'envoye' | 'recu' | 'accuse' | 'execute'
}

export interface Ordre {
  id: string
  numero: string
  type: TypeOrdre
  classification: Classification
  objet: string
  contenu: string
  statut: StatutOrdre
  emetteur: string
  operationId: string | null
  dateEmission: string
  destinataires: DestinataireOrdre[]
}

export type TypeIncident = 'securite' | 'logistique' | 'renseignement' | 'medical' | 'communication'
export type GraviteIncident = 'faible' | 'moyenne' | 'elevee' | 'critique'

export interface Incident {
  id: string
  type: TypeIncident
  gravite: GraviteIncident
  localite: string
  description: string
  statut: 'nouveau' | 'en_cours' | 'traite'
  date: string
  declarant: string
}

export type TypeAlerte = 'logistique' | 'menace' | 'communication' | 'operationnelle'
export type NiveauAlerte = 'info' | 'attention' | 'critique'

export interface Alerte {
  id: string
  type: TypeAlerte
  niveau: NiveauAlerte
  message: string
  statut: 'active' | 'acquittee' | 'resolue'
  horodatage: string
}

export interface UtilisateurAdmin {
  id: string
  nomComplet: string
  grade: string
  unite: string
  role: 'commandement' | 'officier_operations' | 'officier_renseignement' | 'officier_logistique' | 'administrateur'
  habilitation: Classification
  actif: boolean
}

export interface EvenementFlux {
  heure: string
  titre: string
  description: string
}

export type ElementSelectionne =
  | { kind: 'unite'; data: Unite }
  | { kind: 'menace'; data: Menace }
  | { kind: 'logistique'; data: PosteLogistique }
  | { kind: 'checkpoint'; data: Checkpoint }
