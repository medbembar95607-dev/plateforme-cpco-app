import { useState } from 'react'
import { utilisateursAdmin } from '../../data/mockData'
import { classificationLabel } from '../../types'

const roleLabel = {
  commandement: 'Commandement',
  officier_operations: 'Officier opérations',
  officier_renseignement: 'Officier renseignement',
  officier_logistique: 'Officier logistique',
  administrateur: 'Administrateur',
}

const onglets = ['Utilisateurs', 'Rôles & permissions', 'Journal des actions', 'Paramètres système'] as const

const permissionsParRole: Record<string, string[]> = {
  Commandement: ['*.read', 'orders.validate', 'orders.sign', 'intelligence.read_secret'],
  'Officier opérations': ['orders.create', 'orders.diffuse', 'operations.write', 'incidents.write'],
  'Officier renseignement': ['intelligence.write', 'intelligence.read_secret', 'threats.write'],
  'Officier logistique': ['logistics.write', 'alert_thresholds.write'],
  Administrateur: ['users.write', 'roles.write', 'audit_log.read'],
}

const journalAudit = [
  { horodatage: '2026-07-03 12:38', utilisateur: 'Cne Diop', action: 'update', cible: 'threats' },
  { horodatage: '2026-07-03 09:15', utilisateur: 'Cdt Sy', action: 'create', cible: 'orders' },
  { horodatage: '2026-07-02 16:20', utilisateur: 'Lt Kane', action: 'update', cible: 'incidents' },
]

export function AdministrationScreen() {
  const [onglet, setOnglet] = useState<(typeof onglets)[number]>('Utilisateurs')

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
                  <th className="border-b border-[#d8ded9] px-3.5 py-3 text-left">Unité</th>
                  <th className="border-b border-[#d8ded9] px-3.5 py-3 text-left">Rôle</th>
                  <th className="border-b border-[#d8ded9] px-3.5 py-3 text-left">Habilitation</th>
                  <th className="border-b border-[#d8ded9] px-3.5 py-3 text-left">Statut</th>
                </tr>
              </thead>
              <tbody>
                {utilisateursAdmin.map((u) => (
                  <tr key={u.id}>
                    <td className="border-b border-[#d8ded9] px-3.5 py-3">{u.nomComplet}</td>
                    <td className="border-b border-[#d8ded9] px-3.5 py-3">{u.grade}</td>
                    <td className="border-b border-[#d8ded9] px-3.5 py-3">{u.unite}</td>
                    <td className="border-b border-[#d8ded9] px-3.5 py-3">{roleLabel[u.role]}</td>
                    <td className="border-b border-[#d8ded9] px-3.5 py-3">{classificationLabel[u.habilitation]}</td>
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
          {Object.entries(permissionsParRole).map(([role, permissions]) => (
            <div key={role} className="rounded-lg border border-[#d8ded9] bg-white p-3.5 shadow-sm">
              <strong className="text-[#17201b]">{role}</strong>
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
                <th className="border-b border-[#d8ded9] px-3.5 py-3 text-left">Utilisateur</th>
                <th className="border-b border-[#d8ded9] px-3.5 py-3 text-left">Action</th>
                <th className="border-b border-[#d8ded9] px-3.5 py-3 text-left">Table cible</th>
              </tr>
            </thead>
            <tbody>
              {journalAudit.map((entree) => (
                <tr key={entree.horodatage + entree.cible}>
                  <td className="border-b border-[#d8ded9] px-3.5 py-3">{entree.horodatage}</td>
                  <td className="border-b border-[#d8ded9] px-3.5 py-3">{entree.utilisateur}</td>
                  <td className="border-b border-[#d8ded9] px-3.5 py-3">{entree.action}</td>
                  <td className="border-b border-[#d8ded9] px-3.5 py-3">{entree.cible}</td>
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
              <input type="number" defaultValue={40} className="h-10 rounded-lg border border-[#d8ded9] px-2.5" />
            </label>
            <label className="grid gap-1 text-sm text-[#65706a]">
              Munitions (%)
              <input type="number" defaultValue={50} className="h-10 rounded-lg border border-[#d8ded9] px-2.5" />
            </label>
            <label className="grid gap-1 text-sm text-[#65706a]">
              Vivres (%)
              <input type="number" defaultValue={30} className="h-10 rounded-lg border border-[#d8ded9] px-2.5" />
            </label>
          </div>
        </div>
      )}
    </section>
  )
}
