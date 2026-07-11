import type { GarnisonDTO, SituationDTO } from './api/client'

export type TypeUnite = 'pc' | 'infanterie' | 'artillerie' | 'genie' | 'logistique' | 'force_speciale' | 'aerien' | 'marine'
export type StatutUnite = 'en_mission' | 'en_progression' | 'disponible' | 'communication_degradee'

export type Classification = 'diffusion_libre' | 'confidentiel' | 'secret' | 'tres_secret'

export const classificationLabel: Record<Classification, string> = {
  diffusion_libre: 'Diffusion libre',
  confidentiel: 'Confidentiel',
  secret: 'Secret',
  tres_secret: 'Très Secret',
}

export interface EvenementFlux {
  heure: string
  titre: string
  description: string
}

export type UniteSituation = SituationDTO['unites'][number] & {
  carburantPct?: number
  munitionsPct?: number
  armementPct?: number
  vivresPct?: number
}
export type MenaceSituation = SituationDTO['menaces'][number]
export type CheckpointSituation = SituationDTO['checkpoints'][number]

export type ElementSelectionne =
  | { kind: 'unite'; data: UniteSituation }
  | { kind: 'menace'; data: MenaceSituation }
  | { kind: 'checkpoint'; data: CheckpointSituation }
  | { kind: 'garnison'; data: GarnisonDTO }
