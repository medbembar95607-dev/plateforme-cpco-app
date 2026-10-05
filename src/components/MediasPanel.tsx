import { useEffect, useState } from 'react'
import { Eye, Info, Newspaper, Radio, Repeat2, TrendingUp, Tv, Globe, Rss } from 'lucide-react'
import { api, type MediasDTO } from '../api/client'

const domaineStyle: Record<string, { label: string; badge: string }> = {
  securitaire: { label: 'Sécuritaire', badge: 'bg-red-50 text-red-700' },
  economique: { label: 'Économique', badge: 'bg-amber-50 text-amber-700' },
  diplomatique: { label: 'Diplomatique', badge: 'bg-violet-50 text-violet-700' },
  social: { label: 'Social', badge: 'bg-sky-50 text-sky-700' },
}

const niveauStyle: Record<string, { label: string; badge: string }> = {
  faible: { label: 'Faible', badge: 'bg-emerald-50 text-emerald-700' },
  modere: { label: 'Modéré', badge: 'bg-amber-50 text-amber-700' },
  eleve: { label: 'Élevé', badge: 'bg-orange-50 text-orange-700' },
  critique: { label: 'Critique', badge: 'bg-red-600 text-white' },
}

const tonaliteStyle: Record<string, { label: string; badge: string }> = {
  officielle: { label: 'Officielle', badge: 'bg-[#e8eef6] text-[#1e3a5f]' },
  neutre: { label: 'Neutre', badge: 'bg-[#eef1ee] text-[#65706a]' },
  critique: { label: 'Critique', badge: 'bg-rose-50 text-rose-700' },
}

// Presse publique en bleu marine, presse libre en sarcelle : les deux couleurs servent aussi aux barres comparatives.
const secteurStyle: Record<string, { label: string; couleur: string; badge: string }> = {
  publique: { label: 'Presse publique', couleur: '#1e3a5f', badge: 'bg-[#1e3a5f] text-white' },
  libre: { label: 'Presse libre', couleur: '#0f766e', badge: 'bg-[#0f766e] text-white' },
}

const supportStyle: Record<string, { label: string; icone: React.ReactNode }> = {
  television: { label: 'Télévision', icone: <Tv size={13} /> },
  radio: { label: 'Radio', icone: <Radio size={13} /> },
  presse_ecrite: { label: 'Presse écrite', icone: <Newspaper size={13} /> },
  site_web: { label: 'Site web', icone: <Globe size={13} /> },
  agence: { label: 'Agence', icone: <Rss size={13} /> },
}

function compact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toLocaleString('fr-FR', { maximumFractionDigits: 2 })} M`
  if (n >= 1_000) return `${(n / 1_000).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} k`
  return n.toLocaleString('fr-FR')
}

function ilYA(iso: string): string {
  const heures = Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 3_600_000))
  return heures < 24 ? `il y a ${heures} h` : `il y a ${Math.round(heures / 24)} j`
}

function Badge({ classe, children }: { classe: string; children: React.ReactNode }) {
  return <span className={`inline-flex min-h-[22px] items-center rounded-full px-2 text-[11px] font-bold ${classe}`}>{children}</span>
}

export function MediasPanel() {
  const [donnees, setDonnees] = useState<MediasDTO | null>(null)
  const [secteur, setSecteur] = useState('')
  const [domaine, setDomaine] = useState('')

  useEffect(() => {
    api.veilleMedias().then(setDonnees)
  }, [])

  if (!donnees) return <p className="text-sm text-[#65706a]">Chargement de la veille des médias…</p>

  const ind = donnees.indicateurs
  const sujets = donnees.sujets.filter((s) => !domaine || s.domaineRisque === domaine)
  const articles = donnees.articles.filter((a) => (!secteur || a.secteur === secteur) && (!domaine || a.domaineRisque === domaine))
  const maxArticles = Math.max(1, ...donnees.sujets.map((s) => Math.max(s.articlesPressePublique, s.articlesPresseLibre)))

  const kpis = [
    {
      label: 'Articles et sujets (24 h)',
      valeur: String(ind.articles24h),
      note: `${ind.articlesPressePublique} presse publique · ${ind.articlesPresseLibre} presse libre`,
      classe: 'border-sky-200 bg-sky-50 text-sky-800',
    },
    { label: 'Sujets à traitement divergent', valeur: String(ind.sujetsDivergents), note: 'officiel d’un côté, critique de l’autre', classe: 'border-violet-200 bg-violet-50 text-violet-800' },
    { label: 'Contenus à risque élevé', valeur: String(ind.contenusRisqueEleve), note: 'parmi les plus lus ou vus', classe: 'border-orange-200 bg-orange-50 text-orange-800' },
    { label: 'Audience cumulée', valeur: compact(ind.audienceCumulee), note: 'lectures et vues des contenus suivis', classe: 'border-[#d8ded9] bg-white text-[#17201b]' },
  ]

  const bouton = (actif: boolean) => `h-8 rounded-lg px-3 text-sm ${actif ? 'bg-[#17201b] text-white' : 'border border-[#d8ded9] bg-white text-[#17201b]'}`

  return (
    <div className="grid min-h-0 auto-rows-min gap-3.5 overflow-auto">
      {donnees.donneesSimulees && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          <Info size={15} className="mt-0.5 shrink-0" />
          <span>
            <strong>Données simulées pour la démonstration.</strong> Aucune collecte réelle n'est branchée : sujets, articles et audiences sont fictifs, et les
            organes de presse sont décrits par leur type, sans désigner de média réel.
          </span>
        </div>
      )}

      <div className="grid grid-cols-4 gap-3">
        {kpis.map((k) => (
          <div key={k.label} className={`rounded-lg border p-3 ${k.classe}`}>
            <div className="text-xs">{k.label}</div>
            <div className="text-2xl font-bold">{k.valeur}</div>
            <div className="text-xs opacity-80">{k.note}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-xs font-bold uppercase tracking-wide text-[#65706a]">Presse</span>
        {[['', 'Toutes'], ['publique', 'Publique'], ['libre', 'Libre']].map(([valeur, label]) => (
          <button key={valeur} onClick={() => setSecteur(valeur)} className={bouton(secteur === valeur)}>
            {label}
          </button>
        ))}
        <span className="ml-4 mr-1 text-xs font-bold uppercase tracking-wide text-[#65706a]">Risque</span>
        {[['', 'Tous'], ...Object.entries(domaineStyle).map(([v, s]) => [v, s.label])].map(([valeur, label]) => (
          <button key={valeur} onClick={() => setDomaine(valeur)} className={bouton(domaine === valeur)}>
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] items-start gap-3.5">
        <div className="rounded-lg border border-[#d8ded9] bg-white shadow-sm">
          <div className="border-b border-[#d8ded9] px-3.5 py-3">
            <h3 className="m-0 text-[15px] text-[#17201b]">Sujets à la une</h3>
            <p className="m-0 mt-0.5 flex flex-wrap items-center gap-3 text-xs text-[#65706a]">
              Couverture comparée sur 24 h
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-3 rounded-sm" style={{ background: secteurStyle.publique.couleur }} /> publique
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-3 rounded-sm" style={{ background: secteurStyle.libre.couleur }} /> libre
              </span>
            </p>
          </div>
          {sujets.length === 0 && <p className="m-0 px-3.5 py-3 text-sm text-[#65706a]">Aucun sujet pour ce domaine.</p>}
          {sujets.map((s) => (
            <div key={s.id} className="grid gap-2 border-b border-[#eef1ee] px-3.5 py-3 last:border-b-0">
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm font-bold text-[#17201b]">{s.libelle}</span>
                <span className="flex shrink-0 items-center gap-0.5 text-xs font-bold text-red-700">
                  <TrendingUp size={12} />+{s.evolutionPct} %
                </span>
              </div>
              {(['publique', 'libre'] as const).map((sec) => {
                const nb = sec === 'publique' ? s.articlesPressePublique : s.articlesPresseLibre
                const ton = sec === 'publique' ? s.tonalitePublique : s.tonaliteLibre
                return (
                  <div key={sec} className={`grid grid-cols-[64px_1fr_auto] items-center gap-2 text-xs ${secteur && secteur !== sec ? 'opacity-40' : ''}`}>
                    <span className="text-[#65706a]">{sec === 'publique' ? 'Publique' : 'Libre'}</span>
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 rounded-sm" style={{ width: `${Math.max(4, (nb / maxArticles) * 100)}%`, background: secteurStyle[sec].couleur }} />
                      <span className="font-bold text-[#17201b]">{nb}</span>
                    </div>
                    <Badge classe={tonaliteStyle[ton]?.badge ?? ''}>{tonaliteStyle[ton]?.label ?? ton}</Badge>
                  </div>
                )
              })}
              <div className="flex flex-wrap gap-1.5">
                <Badge classe={domaineStyle[s.domaineRisque]?.badge ?? ''}>{domaineStyle[s.domaineRisque]?.label}</Badge>
                <Badge classe={niveauStyle[s.niveauRisque]?.badge ?? ''}>Risque {niveauStyle[s.niveauRisque]?.label.toLowerCase()}</Badge>
              </div>
              <p className="m-0 text-xs leading-relaxed text-[#374151]">{s.resume}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-3">
          <div className="px-0.5">
            <h3 className="m-0 text-[15px] text-[#17201b]">Articles et émissions les plus lus ou vus</h3>
            <p className="m-0 mt-0.5 text-xs text-[#65706a]">Contenus résumés · organes décrits par leur type</p>
          </div>
          {articles.length === 0 && <p className="m-0 text-sm text-[#65706a]">Aucun contenu pour ces filtres.</p>}
          {articles.map((a) => (
            <article
              key={a.id}
              className={`grid gap-2 rounded-lg border border-l-4 border-[#d8ded9] bg-white p-3.5 shadow-sm`}
              style={{ borderLeftColor: secteurStyle[a.secteur]?.couleur }}
            >
              <div className="flex flex-wrap items-center gap-1.5">
                <span className={`inline-flex min-h-[22px] items-center rounded-md px-2 text-[11px] font-bold ${secteurStyle[a.secteur]?.badge}`}>
                  {secteurStyle[a.secteur]?.label}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-[#374151]">
                  {supportStyle[a.support]?.icone} {supportStyle[a.support]?.label}
                </span>
                <Badge classe={tonaliteStyle[a.tonalite]?.badge ?? ''}>Ton {tonaliteStyle[a.tonalite]?.label.toLowerCase()}</Badge>
                <Badge classe={domaineStyle[a.domaineRisque]?.badge ?? ''}>{domaineStyle[a.domaineRisque]?.label}</Badge>
                <Badge classe={niveauStyle[a.niveauRisque]?.badge ?? ''}>Risque {niveauStyle[a.niveauRisque]?.label.toLowerCase()}</Badge>
                <span className="ml-auto text-xs text-[#65706a]">{ilYA(a.datePublication)}</span>
              </div>
              <div className="text-xs text-[#65706a]">
                {a.typeOrgane} · {a.langue}
              </div>
              <strong className="text-sm text-[#17201b]">« {a.titre} »</strong>
              <p className="m-0 text-sm leading-relaxed text-[#374151]">{a.resume}</p>
              <div className="flex flex-wrap gap-4 text-xs text-[#374151]">
                <span className="flex items-center gap-1" title="Lectures ou vues">
                  <Eye size={13} /> <strong>{compact(a.audience)}</strong> {a.support === 'television' || a.support === 'radio' ? 'auditeurs / téléspectateurs' : 'lectures'}
                </span>
                <span className="flex items-center gap-1" title="Reprises par d'autres médias et sur les réseaux">
                  <Repeat2 size={13} /> {a.reprises} reprises
                </span>
              </div>
              <div className="rounded-md bg-[#f8faf7] px-2.5 py-2 text-xs text-[#374151]">
                <strong className="text-[#17201b]">Action recommandée : </strong>
                {a.actionRecommandee}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
