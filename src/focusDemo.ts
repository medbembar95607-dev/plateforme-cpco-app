// Élément à sélectionner à l'arrivée sur un écran, posé par l'écran de démonstration
// (« Voir dans l'écran… »). Lu sans être effacé, avec une durée de validité courte : la double
// initialisation du mode strict de React en développement ne doit pas le perdre.
export type EcranFocus =
  | 'incidents'
  | 'alertes'
  | 'renseignement'
  | 'logistique'
  | 'courrier'
  | 'suivi_execution'
  | 'calendrier'
  | 'materiel'
  | 'budget'
  | 'rh'

let focus: { ecran: EcranFocus; id: string; pose: number } | null = null
const VALIDITE_MS = 10_000

export function definirFocus(ecran: EcranFocus, id: string) {
  focus = { ecran, id, pose: Date.now() }
}

export function lireFocus(ecran: EcranFocus): string | null {
  if (!focus || focus.ecran !== ecran || Date.now() - focus.pose > VALIDITE_MS) return null
  return focus.id
}

// Mise en évidence d'un élément créé en démonstration dans une liste ou un tableau.
export const classeFocus = 'outline outline-2 outline-amber-400 bg-amber-50'

// À passer en `ref` de l'élément mis en évidence : le fait défiler jusqu'au centre de son conteneur
// défilant le plus proche, sans faire défiler toute la page (le panneau de détail voisin reste visible).
export function defilerVers(el: HTMLElement | null) {
  if (!el) return
  let parent = el.parentElement
  while (parent && !(/(auto|scroll)/.test(getComputedStyle(parent).overflowY) && parent.scrollHeight > parent.clientHeight)) {
    parent = parent.parentElement
  }
  if (!parent) return
  const ecart = el.getBoundingClientRect().top - parent.getBoundingClientRect().top
  parent.scrollTo({ top: parent.scrollTop + ecart - parent.clientHeight / 2 + el.clientHeight / 2, behavior: 'smooth' })
}
