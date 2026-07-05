# Plateforme CPCO — Situation opérationnelle commune

Application de Commandement et de Contrôle (C2/C4ISR) pour le Centre de Planification et de Conduite des Opérations. React + TypeScript + Tailwind + MapLibre GL, branchée sur l'API réelle de [`../plateforme-cpco-api/`](../plateforme-cpco-api/) (FastAPI + SQLite en dev).

Le cadrage complet (besoins, décisions d'architecture, modèle de données, maquettes, exigences de sécurité) vit dans [`../plateforme-cpco/`](../plateforme-cpco/), pas ici. Ce README couvre uniquement le code. Projet distinct du MVP [`../c2-militaire-app/`](../c2-militaire-app/) — voir `../plateforme-cpco/README.md` pour la justification.

## Démo en ligne

**https://imaginative-croissant-f46ef5.netlify.app**

Dépôt : https://github.com/medbembar95607-dev/plateforme-cpco-app — hébergé sur Netlify (déploiement continu depuis la branche `main`). Backend : https://plateforme-cpco-api.onrender.com (voir `../plateforme-cpco-api/README.md`).

Variable d'environnement de build (Netlify → Project configuration → Environment variables) : `VITE_API_URL=https://plateforme-cpco-api.onrender.com`. Elle est lue au moment du build (Vite), pas à l'exécution — toute modification impose un redéploiement (Deploys → Trigger deploy).

## Stack

- React 19 + TypeScript, Vite
- Tailwind CSS v4
- MapLibre GL JS (fond de carte [OpenFreeMap](https://openfreemap.org), style `positron`)
- `milsymbol` pour la symbologie militaire APP-6/MIL-STD-2525E
- Toutes les données viennent de l'API (`src/api/client.ts`), URL configurable via `VITE_API_URL` (défaut : `http://localhost:8000` en dev) — plus aucune donnée mockée en dur dans le frontend

## Démarrer en local

Démarrer d'abord l'API (voir `../plateforme-cpco-api/README.md`), puis :

```bash
npm install
npm run dev
```

## Écrans

La barre latérale comporte 3 entrées : **Les Opérations**, **Parapheur Numérique** et **Calendrier du Chef**. Les Opérations (`OpsScreen.tsx`) regroupe les 10 écrans opérationnels sous forme de sous-onglets internes : Point de Situation (carte COP + tableau de bord), LIVE OPS, Unités, Renseignement, Logistique, Opérations, Ordres, Incidents, Alertes, Administration. Détail de chaque écran dans `../plateforme-cpco/04-cartographie/maquettes-ecrans.md`.

Les 5 sous-écrans Situation/Unités/Renseignement/Logistique/Opérations reproduisent fidèlement le prototype de référence (`C:\Users\HP\Documents\OPS_2026\App_IA\index.html`, HTML/CSS/JS statique). Ordres/Incidents/Alertes/Administration/LIVE OPS/Courrier du Chef sont une implémentation d'après nos propres maquettes, ce prototype ne les couvrant pas.

**LIVE OPS** (ajouté le 2026-07-03) : deux panneaux empilés — carte des unités engagées (statut en mission/en progression) en haut, et en bas un suivi "live" d'une unité + drone d'appui. Le mouvement de l'unité et du drone, ainsi que le flux vidéo (`DroneVideoFeed.tsx`), sont **entièrement simulés côté frontend** — aucun drone ni caméra réelle n'est connecté, et ces données ne viennent pas de l'API (pas de table `drones` dans le modèle de données).

**Parapheur Numérique** (ajouté le 2026-07-03) : outil de triage de la correspondance qui remonte au chef d'état-major (subordonnés, Ministère de la Défense, institutions externes) — résumé court par courrier, annotation avec liste de décision (Accord, M'en parler, Rejet...), orientation vers une cellule (OPS/RENS/LOG, Chef Division, Directeur, Ministère, CMGAA...), et génération directe d'un ordre à partir d'un courrier. Modélisé sur le principe du "parapheur" administratif.

**Calendrier du Chef** (ajouté le 2026-07-05) : gestion des rendez-vous et engagements du chef (réunions, audiences, déplacements, cérémonies, briefings) — création, confirmation ou annulation, avec lieu, participants et classification. Table `rendez_vous` dédiée côté API.

Actions qui écrivent réellement en base via l'API : "Nouvel incident" (bandeau supérieur), "Valider"/"Diffuser" sur un ordre (écran Ordres), "Acquitter" une alerte (écran Alertes), annoter/orienter/classer/générer un ordre (écran Parapheur Numérique), créer/confirmer/annuler un rendez-vous (écran Calendrier du Chef).

## Structure

```
src/
  api/client.ts        appels fetch typés vers l'API FastAPI
  components/
    screens/            un composant par écran (OpsScreen regroupe SituationScreen, UnitesScreen, ... en sous-onglets ; CourrierScreen séparé)
    map/                 OperationalMap.tsx (wrapper MapLibre + symbologie militaire)
    Sidebar.tsx, TopBar.tsx, KpiRow.tsx, DetailPanel.tsx, Feed.tsx   éléments partagés
  types.ts               types partagés (les DTO détaillés viennent de api/client.ts)
  uniteStyle.ts           SIDC et libellés par type/statut d'unité
```

## Limitations connues

- Pas d'authentification côté frontend (l'API ne vérifie ni rôle ni habilitation pour l'instant, voir `../plateforme-cpco-api/README.md`)
- Pas de mode hors-ligne (axe encore en hypothèse de travail, voir `../plateforme-cpco/02-architecture/decisions.md`)
- Écrans Ordres/Incidents/Alertes/Administration non validés par capture d'un prototype existant, contrairement aux 5 premiers
- Le "Flux opérationnel" de l'écran Situation reste un journal local à la session (pas encore persisté côté API)
- LIVE OPS : drone et flux vidéo entièrement simulés, aucune intégration matérielle réelle (voir section Écrans)
