import { useEffect, useState } from 'react'
import { Eye, Info, MessageCircle, Repeat2, TrendingDown, TrendingUp, Users } from 'lucide-react'
import { api, type SocialMediaDTO } from '../api/client'

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

const verificationStyle: Record<string, { label: string; badge: string }> = {
  faux_avere: { label: 'Désinformation avérée', badge: 'bg-red-600 text-white' },
  non_verifie: { label: 'Non vérifié', badge: 'bg-[#eef1ee] text-[#65706a]' },
  verifie: { label: 'Authentifié', badge: 'bg-emerald-50 text-emerald-700' },
}

const plateformeStyle: Record<string, { label: string; couleur: string }> = {
  facebook: { label: 'Facebook', couleur: '#1877f2' },
  tiktok: { label: 'TikTok', couleur: '#111111' },
  x: { label: 'X', couleur: '#111111' },
  youtube: { label: 'YouTube', couleur: '#e62117' },
  whatsapp: { label: 'WhatsApp', couleur: '#1fa855' },
}

const rangNiveau: Record<string, number> = { critique: 0, eleve: 1, modere: 2, faible: 3 }

// 1 250 000 -> « 1,25 M » ; 48 200 -> « 48,2 k »
function compact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toLocaleString('fr-FR', { maximumFractionDigits: 2 })} M`
  if (n >= 1_000) return `${(n / 1_000).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} k`
  return n.toLocaleString('fr-FR')
}

function ilYA(iso: string): string {
  const heures = Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 3_600_000))
  return heures < 24 ? `il y a ${heures} h` : `il y a ${Math.round(heures / 24)} j`
}

export function SocialMediaPanel() {
  const [donnees, setDonnees] = useState<SocialMediaDTO | null>(null)
  const [domaine, setDomaine] = useState('')

  useEffect(() => {
    api.veilleSocialMedia().then(setDonnees)
  }, [])

  if (!donnees) return <p className="text-sm text-[#65706a]">Chargement de la veille des réseaux sociaux…</p>

  const tendances = donnees.tendances.filter((t) => !domaine || t.domaineRisque === domaine)
  const publications = donnees.publications.filter((p) => !domaine || p.domaineRisque === domaine)
  const ind = donnees.indicateurs

  const kpis = [
    { label: 'Mentions (24 h)', valeur: compact(ind.mentions24h), note: 'sur les sujets suivis', classe: 'border-sky-200 bg-sky-50 text-sky-800' },
    { label: 'Tendances en hausse', valeur: String(ind.tendancesEnHausse), note: `sur ${donnees.tendances.length} suivies`, classe: 'border-orange-200 bg-orange-50 text-orange-800' },
    { label: 'Publications à risque élevé', valeur: String(ind.publicationsRisqueEleve), note: `${compact(ind.vuesCumulees)} vues cumulées`, classe: 'border-red-200 bg-red-50 text-red-800' },
    { label: 'Désinformations avérées', valeur: String(ind.desinformationsAverees), note: 'à contrer en priorité', classe: 'border-red-300 bg-red-100 text-red-900' },
  ]

  return (
    <div className="grid min-h-0 auto-rows-min gap-3.5 overflow-auto">
      {donnees.donneesSimulees && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          <Info size={15} className="mt-0.5 shrink-0" />
          <span>
            <strong>Données simulées pour la démonstration.</strong> Aucune collecte réelle des réseaux sociaux n'est branchée : sujets, audiences et publications
            sont fictifs et ne désignent aucun compte ni aucune personne réels.
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
        <span className="mr-1 text-xs font-bold uppercase tracking-wide text-[#65706a]">Risque</span>
        {[['', 'Tous'], ...Object.entries(domaineStyle).map(([v, s]) => [v, s.label])].map(([valeur, label]) => (
          <button
            key={valeur}
            onClick={() => setDomaine(valeur)}
            className={`h-8 rounded-lg px-3 text-sm ${domaine === valeur ? 'bg-[#17201b] text-white' : 'border border-[#d8ded9] bg-white text-[#17201b]'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] items-start gap-3.5">
        <div className="rounded-lg border border-[#d8ded9] bg-white shadow-sm">
          <div className="border-b border-[#d8ded9] px-3.5 py-3">
            <h3 className="m-0 text-[15px] text-[#17201b]">Tendances en Mauritanie</h3>
            <p className="m-0 mt-0.5 text-xs text-[#65706a]">Classées par volume de mentions sur 24 h</p>
          </div>
          {tendances.length === 0 && <p className="m-0 px-3.5 py-3 text-sm text-[#65706a]">Aucune tendance pour ce domaine.</p>}
          {tendances.map((t, i) => (
            <div key={t.id} className="grid gap-1.5 border-b border-[#eef1ee] px-3.5 py-3 last:border-b-0">
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 w-5 shrink-0 text-sm font-bold text-[#65706a]">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-[#17201b]">{t.libelle}</div>
                  <div className="text-xs text-[#65706a]">
                    {t.plateformes} · {t.langues}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-sm font-bold text-[#17201b]">{compact(t.volumeMentions24h)}</div>
                  <div className={`flex items-center justify-end gap-0.5 text-xs font-bold ${t.evolutionPct > 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                    {t.evolutionPct > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {t.evolutionPct > 0 ? '+' : ''}
                    {t.evolutionPct} %
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 pl-7">
                <span className={`inline-flex min-h-[22px] items-center rounded-full px-2 text-[11px] font-bold ${domaineStyle[t.domaineRisque]?.badge}`}>
                  {domaineStyle[t.domaineRisque]?.label}
                </span>
                <span className={`inline-flex min-h-[22px] items-center rounded-full px-2 text-[11px] font-bold ${niveauStyle[t.niveauRisque]?.badge}`}>
                  Risque {niveauStyle[t.niveauRisque]?.label.toLowerCase()}
                </span>
              </div>
              <p className="m-0 pl-7 text-xs leading-relaxed text-[#374151]">{t.resume}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-3">
          <div className="px-0.5">
            <h3 className="m-0 text-[15px] text-[#17201b]">Publications les plus vues à risque</h3>
            <p className="m-0 mt-0.5 text-xs text-[#65706a]">Contenus résumés · auteurs décrits par leur type</p>
          </div>
          {publications.length === 0 && <p className="m-0 text-sm text-[#65706a]">Aucune publication pour ce domaine.</p>}
          {[...publications]
            .sort((a, b) => b.vues - a.vues || rangNiveau[a.niveauRisque] - rangNiveau[b.niveauRisque])
            .map((p) => {
              const plateforme = plateformeStyle[p.plateforme] ?? { label: p.plateforme, couleur: '#65706a' }
              return (
                <article
                  key={p.id}
                  className={`grid gap-2 rounded-lg border border-l-4 bg-white p-3.5 shadow-sm ${
                    p.niveauRisque === 'critique' ? 'border-[#d8ded9] border-l-red-600' : p.niveauRisque === 'eleve' ? 'border-[#d8ded9] border-l-orange-500' : 'border-[#d8ded9] border-l-amber-400'
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex min-h-[22px] items-center rounded-md px-2 text-[11px] font-bold text-white" style={{ background: plateforme.couleur }}>
                      {plateforme.label}
                    </span>
                    <span className={`inline-flex min-h-[22px] items-center rounded-full px-2 text-[11px] font-bold ${domaineStyle[p.domaineRisque]?.badge}`}>
                      {domaineStyle[p.domaineRisque]?.label}
                    </span>
                    <span className={`inline-flex min-h-[22px] items-center rounded-full px-2 text-[11px] font-bold ${niveauStyle[p.niveauRisque]?.badge}`}>
                      Risque {niveauStyle[p.niveauRisque]?.label.toLowerCase()}
                    </span>
                    <span className={`inline-flex min-h-[22px] items-center rounded-full px-2 text-[11px] font-bold ${verificationStyle[p.verification]?.badge}`}>
                      {verificationStyle[p.verification]?.label}
                    </span>
                    <span className="ml-auto text-xs text-[#65706a]">{ilYA(p.datePublication)}</span>
                  </div>
                  <div className="text-xs text-[#65706a]">
                    {p.typeAuteur} · {p.langue}
                  </div>
                  <p className="m-0 text-sm leading-relaxed text-[#17201b]">{p.resume}</p>
                  <div className="flex flex-wrap gap-4 text-xs text-[#374151]">
                    <span className="flex items-center gap-1" title="Vues">
                      <Eye size={13} /> <strong>{compact(p.vues)}</strong> vues
                    </span>
                    <span className="flex items-center gap-1" title="Partages">
                      <Repeat2 size={13} /> {compact(p.partages)} partages
                    </span>
                    {p.commentaires > 0 && (
                      <span className="flex items-center gap-1" title="Commentaires">
                        <MessageCircle size={13} /> {compact(p.commentaires)}
                      </span>
                    )}
                    {p.abonnes > 0 && (
                      <span className="flex items-center gap-1" title="Audience de l'auteur">
                        <Users size={13} /> {compact(p.abonnes)} abonnés
                      </span>
                    )}
                  </div>
                  <div className="rounded-md bg-[#f8faf7] px-2.5 py-2 text-xs text-[#374151]">
                    <strong className="text-[#17201b]">Action recommandée : </strong>
                    {p.actionRecommandee}
                  </div>
                </article>
              )
            })}
        </div>
      </div>
    </div>
  )
}
