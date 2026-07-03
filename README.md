# Plateforme CPCO — Situation opérationnelle commune

Application de Commandement et de Contrôle (C2/C4ISR) pour le Centre de Planification et de Conduite des Opérations. React + TypeScript + Tailwind + MapLibre GL, branchée sur l'API réelle de [`../plateforme-cpco-api/`](../plateforme-cpco-api/) (FastAPI + SQLite en dev).

Le cadrage complet (besoins, décisions d'architecture, modèle de données, maquettes, exigences de sécurité) vit dans [`../plateforme-cpco/`](../plateforme-cpco/), pas ici. Ce README couvre uniquement le code. Projet distinct du MVP [`../c2-militaire-app/`](../c2-militaire-app/) — voir `../plateforme-cpco/README.md` pour la justification.

## Stack

- React 19 + TypeScript, Vite
- Tailwind CSS v4
- MapLibre GL JS (fond de carte [OpenFreeMap](https://openfreemap.org), style `positron`)
- `milsymbol` pour la symbologie militaire APP-6/MIL-STD-2525E
- Toutes les données viennent de l'API (`src/api/client.ts`, `http://localhost:8000/api`) — plus aucune donnée mockée en dur dans le frontend

## Démarrer en local

Démarrer d'abord l'API (voir `../plateforme-cpco-api/README.md`), puis :

```bash
npm install
npm run dev
```

## Écrans

9 écrans, accessibles depuis la barre latérale : Situation (carte COP + tableau de bord), Unités, Renseignement, Logistique, Opérations, Ordres, Incidents, Alertes, Administration. Détail de chaque écran dans `../plateforme-cpco/04-cartographie/maquettes-ecrans.md`.

Les 5 premiers reproduisent fidèlement le prototype de référence (`C:\Users\HP\Documents\OPS_2026\App_IA\index.html`, HTML/CSS/JS statique). Les 4 derniers (Ordres, Incidents, Alertes, Administration) sont une première implémentation d'après nos propres maquettes, ce prototype ne les couvrant pas.

Actions qui écrivent réellement en base via l'API : "Nouvel incident" (bandeau supérieur), "Valider"/"Diffuser" sur un ordre (écran Ordres), "Acquitter" une alerte (écran Alertes).

## Structure

```
src/
  api/client.ts        appels fetch typés vers l'API FastAPI
  components/
    screens/            un composant par écran (SituationScreen, UnitesScreen, ...)
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
