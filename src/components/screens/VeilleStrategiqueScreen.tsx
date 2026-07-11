import { useEffect, useState } from 'react'
import { Minus, TrendingDown, TrendingUp } from 'lucide-react'
import { KpiRow, type ToniteKpi } from '../KpiRow'
import { api, type IndicateursVeilleDTO, type SignalStrategiqueDTO } from '../../api/client'

const categorieLabel: Record<string, string> = {
  securite_regionale: 'Sécurité régionale',
  diplomatique: 'Diplomatique',
  influence_etrangere: 'Influence étrangère',
  economique: 'Économique',
  climat_ressources: 'Climat & Ressources',
  cyber: 'Cyber',
}

const horizonLabel: Record<string, string> = {
  court_terme: 'Court terme (< 1 mois)',
  moyen_terme: 'Moyen terme (1-6 mois)',
  long_terme: 'Long terme (6 mois +)',
}

const niveauStyle: Record<string, { label: string; badge: string; barre: string }> = {
  faible: { label: 'Faible', badge: 'bg-emerald-50 text-emerald-700', barre: 'bg-emerald-500' },
  modere: { label: 'Modéré', badge: 'bg-amber-50 text-amber-700', barre: 'bg-amber-500' },
  eleve: { label: 'Élevé', badge: 'bg-orange-50 text-orange-700', barre: 'bg-orange-500' },
  critique: { label: 'Critique', badge: 'bg-red-50 text-red-700', barre: 'bg-red-600' },
}

const tendanceStyle: Record<string, { label: string; icone: React.ReactNode; couleur: string }> = {
  hausse: { label: 'En hausse', icone: <TrendingUp size={13} />, couleur: 'text-red-700' },
  stable: { label: 'Stable', icone: <Minus size={13} />, couleur: 'text-[#65706a]' },
  baisse: { label: 'En baisse', icone: <TrendingDown size={13} />, couleur: 'text-emerald-700' },
}

export function VeilleStrategiqueScreen() {
  const [signaux, setSignaux] = useState<SignalStrategiqueDTO[]>([])
  const [indicateurs, setIndicateurs] = useState<IndicateursVeilleDTO | null>(null)
  const [categorieFiltre, setCategorieFiltre] = useState<string>('toutes')

  useEffect(() => {
    api.veille().then(setSignaux)
    api.veilleIndicateurs().then(setIndicateurs)
  }, [])

  const signauxFiltres = categorieFiltre === 'toutes' ? signaux : signaux.filter((s) => s.categorie === categorieFiltre)
  const prioritaires = [...signaux].sort((a, b) => b.probabiliteCrisePct - a.probabiliteCrisePct).slice(0, 3)

  // Dégradé fort -> faible : rouge (critique) > orange (élevé) > amber (modéré) > vert (faible).
  function tonalitePct(pct: number): ToniteKpi {
    if (pct >= 75) return 'danger'
    if (pct >= 50) return 'eleve'
    if (pct >= 25) return 'alerte'
    return 'succes'
  }
  function tonaliteCompte(n: number, seuilEleve: number, seuilDanger: number): ToniteKpi {
    if (n >= seuilDanger) return 'danger'
    if (n >= seuilEleve) return 'eleve'
    if (n > 0) return 'alerte'
    return 'succes'
  }

  const kpis: Array<{ label: string; valeur: string; note: string; tonalite: ToniteKpi }> = [
    {
      label: 'Indice de risque régional',
      valeur: `${indicateurs?.indiceRisqueRegionalPct ?? '—'}%`,
      note: 'pondéré par niveau de risque',
      tonalite: tonalitePct(indicateurs?.indiceRisqueRegionalPct ?? 0),
    },
    {
      label: 'Signaux critiques',
      valeur: String(indicateurs?.signauxCritiques ?? '—'),
      note: 'nécessitant une attention immédiate',
      tonalite: tonaliteCompte(indicateurs?.signauxCritiques ?? 0, 1, 3),
    },
    {
      label: 'Signaux en hausse',
      valeur: String(indicateurs?.signauxEnHausse ?? '—'),
      note: 'tendance défavorable',
      tonalite: tonaliteCompte(indicateurs?.signauxEnHausse ?? 0, 4, 7),
    },
    { label: 'Zones sous surveillance', valeur: String(indicateurs?.zonesSurveillees ?? '—'), note: 'toutes catégories', tonalite: 'info' },
    {
      label: 'Probabilité de crise max.',
      valeur: `${indicateurs?.probabiliteMaxPct ?? '—'}%`,
      note: 'signal le plus critique',
      tonalite: tonalitePct(indicateurs?.probabiliteMaxPct ?? 0),
    },
  ]

  return (
    <section className="grid min-h-0 grid-rows-[auto_auto_auto_1fr] gap-3.5">
      <KpiRow kpis={kpis} />

      <div className="grid gap-2 rounded-lg border border-red-200 bg-red-50 p-3.5">
        <span className="text-xs font-bold uppercase tracking-wide text-red-700">Priorité de surveillance — signaux à plus forte probabilité de crise</span>
        <div className="grid grid-cols-3 gap-3">
          {prioritaires.map((s) => (
            <div key={s.id} className="grid gap-1 rounded-lg bg-white p-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className={`inline-flex min-h-[22px] items-center rounded-full px-2 text-xs font-bold ${niveauStyle[s.niveauRisque]?.badge}`}>
                  {niveauStyle[s.niveauRisque]?.label}
                </span>
                <strong className="text-lg text-red-700">{s.probabiliteCrisePct}%</strong>
              </div>
              <strong className="text-sm text-[#17201b]">{s.titre}</strong>
              <span className="text-xs text-[#65706a]">{s.zone}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setCategorieFiltre('toutes')}
          className={`h-9 rounded-lg px-3 text-sm ${categorieFiltre === 'toutes' ? 'bg-blue-600 text-white' : 'border border-[#d8ded9] bg-white text-[#17201b]'}`}
        >
          Toutes catégories
        </button>
        {Object.entries(categorieLabel).map(([valeur, label]) => (
          <button
            key={valeur}
            onClick={() => setCategorieFiltre(valeur)}
            className={`h-9 rounded-lg px-3 text-sm ${categorieFiltre === valeur ? 'bg-blue-600 text-white' : 'border border-[#d8ded9] bg-white text-[#17201b]'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid min-h-0 auto-rows-min gap-3 overflow-auto">
        {signauxFiltres.map((s) => (
          <div key={s.id} className="grid gap-2 rounded-lg border border-[#d8ded9] bg-white p-3.5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex min-h-[24px] items-center rounded-full bg-blue-50 px-2 text-xs font-bold text-blue-700">
                  {categorieLabel[s.categorie] ?? s.categorie}
                </span>
                <span className={`inline-flex min-h-[24px] items-center rounded-full px-2 text-xs font-bold ${niveauStyle[s.niveauRisque]?.badge}`}>
                  {niveauStyle[s.niveauRisque]?.label}
                </span>
                <span className={`inline-flex items-center gap-1 text-xs font-bold ${tendanceStyle[s.tendance]?.couleur}`}>
                  {tendanceStyle[s.tendance]?.icone} {tendanceStyle[s.tendance]?.label}
                </span>
              </div>
              <span className="inline-flex min-h-[22px] items-center rounded-md bg-[#fff0cf] px-1.5 py-1 text-xs font-bold text-[#7c5108]">
                {s.classification === 'secret' ? 'Secret Défense' : s.classification === 'diffusion_libre' ? 'Diffusion libre' : 'Confidentiel Défense'}
              </span>
            </div>

            <strong className="text-base text-[#17201b]">{s.titre}</strong>
            <span className="text-xs text-[#65706a]">{s.zone} · {horizonLabel[s.horizon] ?? s.horizon}</span>
            <p className="m-0 text-sm text-[#374151]">{s.analyse}</p>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#eef2ed] pt-2">
              <span className="text-xs text-[#65706a]">Source : {s.source}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#65706a]">Probabilité de crise estimée</span>
                <div className="h-2 w-28 overflow-hidden rounded-full bg-[#eef2ed]">
                  <div className={`h-full ${niveauStyle[s.niveauRisque]?.barre}`} style={{ width: `${s.probabiliteCrisePct}%` }} />
                </div>
                <strong className="text-sm text-[#17201b]">{s.probabiliteCrisePct}%</strong>
              </div>
            </div>
          </div>
        ))}
        {signauxFiltres.length === 0 && <p className="text-sm text-[#65706a]">Aucun signal pour ce filtre.</p>}
      </div>
    </section>
  )
}
