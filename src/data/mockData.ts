import type {
  Alerte,
  Checkpoint,
  Incident,
  LigneLogistique,
  Menace,
  Operation,
  Ordre,
  PosteLogistique,
  RapportRenseignement,
  Unite,
  UtilisateurAdmin,
} from '../types'
import type { Feature, LineString, Polygon } from 'geojson'

// Données fictives, secteur "Nouakchott Nord" — cohérent avec le prototype de référence
// (C:\Users\HP\Documents\OPS_2026\App_IA\index.html) et le cahier des charges de Bardas.

export const unites: Unite[] = [
  {
    id: 'u1',
    nom: 'Bataillon 1',
    typeUnite: 'infanterie',
    echelon: 'bataillon',
    statut: 'en_mission',
    effectif: 520,
    communication: 'stable',
    dernierRapport: '12:33',
    lon: -15.9785,
    lat: 18.205,
    carburantPct: 80,
    munitionsPct: 65,
  },
  {
    id: 'u2',
    nom: 'Compagnie Alpha',
    typeUnite: 'infanterie',
    echelon: 'compagnie',
    statut: 'en_progression',
    effectif: 140,
    communication: 'stable',
    dernierRapport: '12:24',
    lon: -16.045,
    lat: 18.165,
    carburantPct: 45,
    munitionsPct: 90,
  },
  {
    id: 'u3',
    nom: 'Poste Avancé Nord',
    typeUnite: 'pc',
    echelon: 'section',
    statut: 'disponible',
    effectif: 48,
    communication: 'stable',
    dernierRapport: '12:08',
    lon: -15.955,
    lat: 18.252,
    carburantPct: 70,
    munitionsPct: 82,
  },
  {
    id: 'u4',
    nom: 'Convoi Lima',
    typeUnite: 'logistique',
    echelon: 'section',
    statut: 'communication_degradee',
    effectif: 36,
    communication: 'degradee',
    dernierRapport: '11:51',
    lon: -16.015,
    lat: 18.128,
    carburantPct: 28,
    munitionsPct: 38,
  },
]

export const menaces: Menace[] = [
  {
    id: 'm1',
    nom: 'Groupe hostile détecté',
    niveau: 'critique',
    statut: 'confirmee',
    classification: 'confidentiel',
    lon: -15.915,
    lat: 18.238,
  },
]

export const postesLogistiques: PosteLogistique[] = [
  {
    id: 'l1',
    nom: 'Poste logistique Nord',
    statut: 'disponible',
    lon: -16.0,
    lat: 18.19,
    carburantPct: 72,
    vivresPct: 84,
  },
]

export const checkpoints: Checkpoint[] = [
  {
    id: 'c1',
    nom: 'Checkpoint Bravo',
    statut: 'sous_controle',
    lon: -15.985,
    lat: 18.172,
    dernierRapport: 'RAS',
  },
]

export const zoneMenaceA3: Feature<Polygon> = {
  type: 'Feature',
  properties: { nom: 'Zone menace A3' },
  geometry: {
    type: 'Polygon',
    coordinates: [
      [
        [-15.935, 18.222],
        [-15.895, 18.222],
        [-15.895, 18.252],
        [-15.935, 18.252],
        [-15.935, 18.222],
      ],
    ],
  },
}

export const zoneOpsSable: Feature<Polygon> = {
  type: 'Feature',
  properties: { nom: 'Zone OPS Sable' },
  geometry: {
    type: 'Polygon',
    coordinates: [
      [
        [-16.06, 18.1],
        [-16.02, 18.1],
        [-16.02, 18.13],
        [-16.06, 18.13],
        [-16.06, 18.1],
      ],
    ],
  },
}

export const axeProgression: Feature<LineString> = {
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'LineString',
    coordinates: [
      [-16.03, 18.14],
      [-15.9, 18.24],
    ],
  },
}

export const rapportsRenseignement: RapportRenseignement[] = [
  {
    id: 'r1',
    reference: 'HUMINT-2026-0045',
    type: 'HUMINT',
    classification: 'secret',
    titre: 'Mouvement suspect A3',
    resume: "Observation consolidée par patrouille et source OSINT. Risque élevé sur l'axe nord.",
    fiabilite: 'A',
    statut: 'menace',
  },
  {
    id: 'r2',
    reference: 'SIGINT-2026-0112',
    type: 'SIGINT',
    classification: 'confidentiel',
    titre: 'Activité radio irrégulière',
    resume: 'Signalement SIGINT à corréler avec les derniers mouvements terrain.',
    fiabilite: 'B',
    statut: 'observation',
  },
  {
    id: 'r3',
    reference: 'OSINT-2026-0033',
    type: 'OSINT',
    classification: 'diffusion_libre',
    titre: 'Zone logistique N2',
    resume: "Pas d'indice hostile récent autour du poste logistique principal.",
    fiabilite: 'C',
    statut: 'stabilise',
  },
]

export const lignesLogistique: LigneLogistique[] = [
  { uniteId: 'u1', uniteNom: 'Bataillon 1', carburantPct: 80, munitionsPct: 65, vivresPct: 78, maintenancePct: 71, alerte: 'normal' },
  { uniteId: 'u2', uniteNom: 'Compagnie Alpha', carburantPct: 45, munitionsPct: 90, vivresPct: 54, maintenancePct: 68, alerte: 'attention' },
  { uniteId: 'u4', uniteNom: 'Convoi Lima', carburantPct: 28, munitionsPct: 38, vivresPct: 62, maintenancePct: 41, alerte: 'critique' },
]

export const operations: Operation[] = [
  {
    id: 'op1',
    code: 'OPS-2026-014',
    nom: 'Opération Sable Nord',
    description: "Sécurisation de l'axe nord et maintien des checkpoints prioritaires.",
    statut: 'en_cours',
    priorite: 'elevee',
    progression: 64,
  },
  {
    id: 'op2',
    code: 'OPS-2026-015',
    nom: 'Mission Ravitaillement N2',
    description: 'Ravitaillement carburant et pièces critiques pour les unités avancées.',
    statut: 'planifiee',
    priorite: 'moyenne',
    progression: 22,
  },
  {
    id: 'op3',
    code: 'OPS-2026-016',
    nom: 'Surveillance Zone A3',
    description: 'Renforcement renseignement et suivi des mouvements suspects confirmés.',
    statut: 'sous_tension',
    priorite: 'elevee',
    progression: 48,
  },
]

export const ordres: Ordre[] = [
  {
    id: 'o1',
    numero: 'OPORD-2026-014',
    type: 'OPORD',
    classification: 'secret',
    objet: "Sécurisation de l'axe nord",
    contenu: "Sécuriser l'axe de progression nord et maintenir les checkpoints Bravo et Charlie sous contrôle jusqu'à nouvel ordre.",
    statut: 'diffuse',
    emetteur: 'Col. Ba, Commandement CPCO',
    operationId: 'op1',
    dateEmission: '2026-07-01 08:00',
    destinataires: [
      { uniteId: 'u1', uniteNom: 'Bataillon 1', statut: 'execute' },
      { uniteId: 'u2', uniteNom: 'Compagnie Alpha', statut: 'accuse' },
    ],
  },
  {
    id: 'o2',
    numero: 'FRAGO-2026-031',
    type: 'FRAGO',
    classification: 'confidentiel',
    objet: 'Ravitaillement prioritaire Convoi Lima',
    contenu: 'Organiser un ravitaillement en carburant et munitions pour le Convoi Lima dès rétablissement de la liaison.',
    statut: 'signe',
    emetteur: 'Cdt Sy, Officier opérations',
    operationId: 'op2',
    dateEmission: '2026-07-03 09:15',
    destinataires: [{ uniteId: 'u4', uniteNom: 'Convoi Lima', statut: 'envoye' }],
  },
  {
    id: 'o3',
    numero: 'WARNO-2026-009',
    type: 'WARNO',
    classification: 'secret',
    objet: 'Renforcement surveillance Zone A3',
    contenu: 'Préparer un renforcement du dispositif de surveillance sur la Zone A3 suite à confirmation de menace.',
    statut: 'brouillon',
    emetteur: 'Cne Diop, Officier renseignement',
    operationId: 'op3',
    dateEmission: '',
    destinataires: [],
  },
]

export const incidents: Incident[] = [
  {
    id: 'i1',
    type: 'renseignement',
    gravite: 'critique',
    localite: 'Zone A3',
    description: 'Groupe hostile détecté par patrouille, confirmé par renseignement SIGINT.',
    statut: 'en_cours',
    date: '2026-07-03 12:38',
    declarant: 'Compagnie Alpha',
  },
  {
    id: 'i2',
    type: 'communication',
    gravite: 'moyenne',
    localite: 'Axe Nord-Ouest',
    description: 'Perte de liaison radio prolongée avec le Convoi Lima.',
    statut: 'nouveau',
    date: '2026-07-03 11:51',
    declarant: 'PC CPCO',
  },
  {
    id: 'i3',
    type: 'logistique',
    gravite: 'faible',
    localite: 'Poste logistique Nord',
    description: 'Retard de livraison de pièces de maintenance.',
    statut: 'traite',
    date: '2026-07-02 16:20',
    declarant: 'Officier logistique',
  },
]

export const alertes: Alerte[] = [
  {
    id: 'a1',
    type: 'menace',
    niveau: 'critique',
    message: 'Menace confirmée en Zone A3 — mouvement suspect observé.',
    statut: 'active',
    horodatage: '12:38',
  },
  {
    id: 'a2',
    type: 'logistique',
    niveau: 'attention',
    message: 'Compagnie Alpha sous seuil carburant (45%).',
    statut: 'active',
    horodatage: '12:12',
  },
  {
    id: 'a3',
    type: 'communication',
    niveau: 'attention',
    message: 'Communication dégradée avec Convoi Lima.',
    statut: 'active',
    horodatage: '11:51',
  },
  {
    id: 'a4',
    type: 'logistique',
    niveau: 'info',
    message: 'Ravitaillement disponible au Poste logistique Nord pour deux unités.',
    statut: 'resolue',
    horodatage: '11:58',
  },
]

export const utilisateursAdmin: UtilisateurAdmin[] = [
  { id: 'us1', nomComplet: 'Col. Ba', grade: 'Colonel', unite: 'PC CPCO', role: 'commandement', habilitation: 'tres_secret', actif: true },
  { id: 'us2', nomComplet: 'Cdt Sy', grade: 'Commandant', unite: 'PC CPCO', role: 'officier_operations', habilitation: 'secret', actif: true },
  { id: 'us3', nomComplet: 'Cne Diop', grade: 'Capitaine', unite: 'PC CPCO', role: 'officier_renseignement', habilitation: 'secret', actif: true },
  { id: 'us4', nomComplet: 'Lt Kane', grade: 'Lieutenant', unite: 'PC CPCO', role: 'officier_logistique', habilitation: 'confidentiel', actif: true },
  { id: 'us5', nomComplet: 'Adj. Fall', grade: 'Adjudant', unite: 'PC CPCO', role: 'administrateur', habilitation: 'secret', actif: true },
]

export const evenementsFlux = [
  { heure: '12:38', titre: 'Menace confirmée A3', description: 'Renseignement : mouvement suspect observé.' },
  { heure: '12:24', titre: 'Cie Alpha en progression', description: 'Passage checkpoint Bravo validé.' },
  { heure: '12:12', titre: 'Alerte carburant', description: 'Compagnie Alpha sous seuil attention.' },
  { heure: '11:58', titre: 'Poste logistique Nord', description: 'Ravitaillement disponible pour deux unités.' },
]
