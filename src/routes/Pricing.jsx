import React from 'react'
import PricingCards from '../components/PricingCards.jsx'
import { CheckCircle } from 'lucide-react'

const COMPARE = [
  { feature: 'Manuels créés',             free: '3', std: 'Illimités', pro: 'Illimités' },
  { feature: 'Pages par manuel',           free: '20', std: '40', pro: '75' },
  { feature: 'Export Markdown',            free: '✓',  std: '✓',  pro: '✓' },
  { feature: 'Export PDF',                 free: '—',  std: '✓',  pro: '✓' },
  { feature: 'Export DOCX',                free: '—',  std: '✓',  pro: '✓' },
  { feature: 'Génération IA',              free: 'Démo', std: '✓', pro: '✓' },
  { feature: 'Assistant de correction',    free: '—',  std: '✓',  pro: '✓' },
  { feature: 'Historique des versions',    free: 'Local', std: 'Cloud', pro: 'Cloud' },
  { feature: 'Génération longue 75 pages', free: '—', std: '—', pro: '✓' },
  { feature: 'Multi-utilisateurs',         free: '—',  std: '—',  pro: '✓' },
]

export default function Pricing() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-14">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Tarifs simples</h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          Commencez gratuitement. Aucune carte bancaire requise. Passez au niveau supérieur quand vous en avez besoin.
        </p>
      </div>

      <PricingCards />

      {/* Tableau comparatif */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Comparaison détaillée</h2>
        <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 font-semibold text-gray-700 w-1/2">Fonctionnalité</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-700">Gratuit</th>
                <th className="text-center px-4 py-3 font-semibold text-brand">Standard</th>
                <th className="text-center px-4 py-3 font-semibold text-violet-600">Pro</th>
              </tr>
            </thead>
            <tbody>
              {COMPARE.map((row, i) => (
                <tr key={row.feature} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}>
                  <td className="px-5 py-3 text-gray-700">{row.feature}</td>
                  <td className="px-4 py-3 text-center text-gray-500">{row.free}</td>
                  <td className="px-4 py-3 text-center text-brand font-medium">{row.std}</td>
                  <td className="px-4 py-3 text-center text-violet-600 font-medium">{row.pro}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Garantie */}
      <div className="mt-12 text-center">
        <div className="inline-flex items-center gap-2 text-sm text-gray-500">
          <CheckCircle size={16} className="text-green-500" />
          Paiement sécurisé — Annulation à tout moment — Sans engagement
        </div>
      </div>
    </div>
  )
}
