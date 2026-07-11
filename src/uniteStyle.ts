import type { StatutUnite, TypeUnite } from './types'

// SIDC APP-6/MIL-STD-2525E : unité amie présente (SFxP) + function id. La dimension de bataille
// (3e caractère) varie selon le milieu : G = terre, F = forces spéciales, A = air, S = surface mer.
export const typeUniteSidc: Record<TypeUnite, string> = {
  pc: 'SFGPU---------------',
  infanterie: 'SFGPUCI-------------',
  artillerie: 'SFGPUCF-------------',
  genie: 'SFGPUCE-------------',
  logistique: 'SFGPUSS-------------',
  force_speciale: 'SFFPG---------------',
  aerien: 'SFAPMF--------------',
  marine: 'SFSPCH--------------',
}

export const typeUniteLabel: Record<TypeUnite, string> = {
  pc: 'PC / Cdt.',
  infanterie: 'Infanterie',
  artillerie: 'Artillerie',
  genie: 'Génie',
  logistique: 'Logistique',
  force_speciale: 'Force spéciale',
  aerien: 'Base aérienne',
  marine: 'Base navale',
}

// Échelons de la hiérarchie militaire conventionnelle (du plus petit au plus grand).
export const echelonLabel: Record<string, string> = {
  section: 'Section',
  compagnie: 'Compagnie',
  bataillon: 'Bataillon',
  groupement: 'Groupement',
  brigade: 'Brigade',
  base: 'Base',
}

// Couleur de remplissage APP-6 standard pour une unité amie (bleu).
export const couleurAmie = '#1f6fb2'

export const statutUniteStyle: Record<StatutUnite, { label: string; badge: string }> = {
  en_mission: { label: 'En mission', badge: 'bg-blue-50 text-blue-700' },
  en_progression: { label: 'En progression', badge: 'bg-amber-50 text-amber-700' },
  disponible: { label: 'Disponible', badge: 'bg-emerald-50 text-emerald-700' },
  communication_degradee: { label: 'Communication dégradée', badge: 'bg-red-50 text-red-700' },
}

export const niveauMenaceCouleur: Record<string, string> = {
  faible: '#ba7a0b',
  moyenne: '#ba7a0b',
  elevee: '#b9332c',
  critique: '#b9332c',
}
