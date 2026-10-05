// Élément à sélectionner à l'arrivée sur un écran, posé par l'écran de démonstration
// (« Voir dans l'écran… »). Lu sans être effacé, avec une durée de validité courte : la double
// initialisation du mode strict de React en développement ne doit pas le perdre.
type EcranFocus = 'incidents' | 'alertes' | 'renseignement' | 'logistique'

let focus: { ecran: EcranFocus; id: string; pose: number } | null = null
const VALIDITE_MS = 10_000

export function definirFocus(ecran: EcranFocus, id: string) {
  focus = { ecran, id, pose: Date.now() }
}

export function lireFocus(ecran: EcranFocus): string | null {
  if (!focus || focus.ecran !== ecran || Date.now() - focus.pose > VALIDITE_MS) return null
  return focus.id
}
