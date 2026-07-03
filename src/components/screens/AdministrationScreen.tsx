import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import { classificationLabel } from '../../types'
import type { Classification } from '../../types'

type UserRow = Awaited<ReturnType<typeof api.adminUsers>>[number]
type AuditRow = Awaited<ReturnType<typeof api.adminAuditLog>>[number]

const roleLabel: Record<string, string> = {
  commandement: 'Commandement',
  officier_operations: 'Officier opérations',
  officier_renseignement: 'Officier renseignement',
  officier_logistique: 'Officier logistique',
  administrateur: 'Administrateur',
}

const onglets = ['Utilisateurs', 'Rôles & permissions', 'Journal des actions', 'Paramètres système'] as const

export function AdministrationScreen() {
  const [onglet, setOnglet] = useState<(typeof onglets)[number]>('Utilisateurs')
  const [utilisateurs, setUtilisateurs] = useState<UserRow[]>([])
  const [roles, setRoles] = useState<Record<string, string[]>>({})
  const [journal, setJournal] = useState<AuditRow[]>([])
  const [seuils, setSeuils] = useState<Record<string, number>>({})

  useEffect(() => {
    api.adminUsers().then(setUtilisateurs)
    api.adminRoles().then(setRoles)
    api.adminAuditLog().then(setJournal)
    api.logisticsThresholds().then(setSeuils)
  }, [])

  return (
    <section className="grid min-h-0 grid-rows-[auto_1fr] gap-3.5">
      <div className="flex gap-2 border-b border-[#d8ded9]">
        {onglets.map((o) => (
          <button
            key={o}
            onClick={() => setOnglet(o)}
            className={`border-b-2 px-3 py-2 text-sm ${
              onglet === o ? 'border-[#17201b] font-bold text-[#17201b]' : 'border-transparent text-[#65706a]'
            }`}
          >
            {o}
          </button>
        ))}
      </div>

      {onglet === 'Utilisateurs' && (
        <div className="grid min-h-0 grid-rows-[auto_1fr] gap-3">
          <div className="flex justify-end">
            <button className="h-10 rounded-lg border border-[#17201b] bg-[#17201b] px-3.5 text-white">Ajouter un utilisateur</button>
          </div>
          <div className="overflow-auto rounded-lg border border-[#d8ded9] bg-white shadow-sm">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-[#f8faf7] text-xs text-[#65706a]">
                  <th className="border-b border-[#d8ded9] px-3.5 py-3 text-left">Nom</th>
                  <th className="border-b border-[#d8ded9] px-3.5 py-3 text-left">Grade</th>
                  <th className="border-b border-[#d8ded9] px-3.5 py-3 text-left">Rôle</th>
                  <th className="border-b border-[#d8ded9] px-3.5 py-3 text-left">Habilitation</th>
                  <th className="border-b border-[#d8ded9] px-3.5 py-3 text-left">Statut</th>
                </tr>
              </thead>
              <tbody>
                {utilisateurs.map((u) => (
                  <tr key={u.id}>
                    <td className="border-b border-[#d8ded9] px-3.5 py-3">{u.nom_complet}</td>
                    <td className="border-b border-[#d8ded9] px-3.5 py-3">{u.grade}</td>
                    <td className="border-b border-[#d8ded9] px-3.5 py-3">{roleLabel[u.role]}</td>
                    <td className="border-b border-[#d8ded9] px-3.5 py-3">{classificationLabel[u.clearance_level as Classification]}</td>
                    <td className="border-b border-[#d8ded9] px-3.5 py-3">
                      <span className={`inline-flex min-h-[26px] items-center rounded-full px-2.5 text-xs font-bold ${u.actif ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>
                        {u.actif ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {onglet === 'Rôles & permissions' && (
        <div className="grid gap-3 overflow-auto">
          {Object.entries(roles).map(([role, permissions]) => (
            <div key={role} className="rounded-lg border border-[#d8ded9] bg-white p-3.5 shadow-sm">
              <strong className="text-[#17201b]">{roleLabel[role] ?? role}</strong>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {permissions.map((p) => (
                  <span key={p} className="rounded-full bg-[#eef2ed] px-2.5 py-1 text-xs text-[#17201b]">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {onglet === 'Journal des actions' && (
        <div className="overflow-auto rounded-lg border border-[#d8ded9] bg-white shadow-sm">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-[#f8faf7] text-xs text-[#65706a]">
                <th className="border-b border-[#d8ded9] px-3.5 py-3 text-left">Horodatage</th>
                <th className="border-b border-[#d8ded9] px-3.5 py-3 text-left">Action</th>
                <th className="border-b border-[#d8ded9] px-3.5 py-3 text-left">Table cible</th>
              </tr>
            </thead>
            <tbody>
              {journal.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-3.5 py-3 text-sm text-[#65706a]">
                    Aucune action journalisée pour l'instant (table `audit_log` pas encore alimentée par le backend).
                  </td>
                </tr>
              )}
              {journal.map((entree, i) => (
                <tr key={i}>
                  <td className="border-b border-[#d8ded9] px-3.5 py-3">{entree.horodatage}</td>
                  <td className="border-b border-[#d8ded9] px-3.5 py-3">{entree.action}</td>
                  <td className="border-b border-[#d8ded9] px-3.5 py-3">{entree.tableCible}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {onglet === 'Paramètres système' && (
        <div className="grid gap-3.5 rounded-lg border border-[#d8ded9] bg-white p-3.5 shadow-sm">
          <strong className="text-[#17201b]">Seuils d'alerte logistique</strong>
          <div className="grid grid-cols-3 gap-3">
            <label className="grid gap-1 text-sm text-[#65706a]">
              Carburant (%)
              <input type="number" value={seuils.carburant ?? ''} readOnly className="h-10 rounded-lg border border-[#d8ded9] px-2.5" />
            </label>
            <label className="grid gap-1 text-sm text-[#65706a]">
              Munitions (%)
              <input type="number" value={seuils.munitions ?? ''} readOnly className="h-10 rounded-lg border border-[#d8ded9] px-2.5" />
            </label>
            <label className="grid gap-1 text-sm text-[#65706a]">
              Vivres (%)
              <input type="number" value={seuils.vivres ?? ''} readOnly className="h-10 rounded-lg border border-[#d8ded9] px-2.5" />
            </label>
          </div>
          <span className="text-xs text-[#65706a]">Lecture seule pour l'instant — pas encore d'endpoint d'écriture côté API.</span>
        </div>
      )}
    </section>
  )
}
