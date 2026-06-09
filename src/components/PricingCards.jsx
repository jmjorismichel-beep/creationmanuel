import React from 'react'
import { Check, Zap, Star, Rocket } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const PLANS = [
  {
    name: 'Gratuit',
    icon: Zap,
    price: 0,
    period: '',
    color: 'gray',
    description: 'Pour découvrir Manuelia AI et créer vos premiers manuels.',
    features: [
      '3 manuels maximum',
      'Jusqu\'à 20 pages par manuel',
      'Export Markdown uniquement',
      'Mode démonstration',
      'Sauvegarde locale',
      'Accès à l\'éditeur de base',
    ],
    cta: 'Commencer gratuitement',
    ctaPath: '/generateur',
    highlighted: false,
  },
  {
    name: 'Standard',
    icon: Star,
    price: 9,
    period: '/mois',
    color: 'brand',
    description: 'Pour les formateurs qui créent régulièrement des supports.',
    features: [
      'Manuels illimités',
      'Jusqu\'à 40 pages par manuel',
      'Export PDF, DOCX et Markdown',
      'Génération IA complète',
      'Historique des versions',
      'Assistant de correction',
      'Sauvegarde cloud',
      'Support par email',
    ],
    cta: 'Choisir Standard',
    ctaPath: '/contact',
    highlighted: true,
    badge: 'Le plus populaire',
  },
  {
    name: 'Pro',
    icon: Rocket,
    price: 19,
    period: '/mois',
    color: 'violet',
    description: 'Pour les organismes de formation et équipes pédagogiques.',
    features: [
      'Tout le plan Standard',
      'Jusqu\'à 75 pages par manuel',
      'Génération longue par chapitres',
      'Vérification de cohérence',
      'Adaptation multi-niveaux (A1–C2)',
      'Modèles personnalisés',
      'Accès multi-utilisateurs',
      'Support prioritaire',
      'API d\'intégration (bientôt)',
    ],
    cta: 'Choisir Pro',
    ctaPath: '/contact',
    highlighted: false,
  },
]

export default function PricingCards() {
  const navigate = useNavigate()

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
      {PLANS.map(plan => (
        <div
          key={plan.name}
          className={`relative rounded-2xl border p-6 flex flex-col ${
            plan.highlighted
              ? 'border-brand bg-gradient-to-b from-brand to-violet-600 text-white shadow-xl shadow-brand/20 scale-105'
              : 'border-gray-200 bg-white hover:border-brand/40 hover:shadow-md transition-all'
          }`}
        >
          {plan.badge && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="px-3 py-1 bg-amber-400 text-amber-900 text-xs font-bold rounded-full shadow">
                {plan.badge}
              </span>
            </div>
          )}

          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
            plan.highlighted ? 'bg-white/20' : 'bg-brand-light'
          }`}>
            <plan.icon size={20} className={plan.highlighted ? 'text-white' : 'text-brand'} />
          </div>

          <h3 className={`text-xl font-bold mb-1 ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
            {plan.name}
          </h3>
          <p className={`text-sm mb-4 ${plan.highlighted ? 'text-white/80' : 'text-gray-500'}`}>
            {plan.description}
          </p>

          <div className="mb-6">
            <span className={`text-4xl font-extrabold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
              {plan.price === 0 ? 'Gratuit' : `${plan.price} €`}
            </span>
            {plan.period && (
              <span className={`text-sm ml-1 ${plan.highlighted ? 'text-white/70' : 'text-gray-500'}`}>
                {plan.period}
              </span>
            )}
          </div>

          <ul className="space-y-2.5 mb-8 flex-1">
            {plan.features.map(f => (
              <li key={f} className="flex items-start gap-2 text-sm">
                <Check size={14} className={`mt-0.5 shrink-0 ${plan.highlighted ? 'text-white' : 'text-green-500'}`} strokeWidth={2.5} />
                <span className={plan.highlighted ? 'text-white/90' : 'text-gray-700'}>{f}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={() => navigate(plan.ctaPath)}
            className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all ${
              plan.highlighted
                ? 'bg-white text-brand hover:bg-gray-50 shadow-sm'
                : 'bg-brand text-white hover:bg-brand-dark shadow-sm hover:shadow-md'
            }`}
          >
            {plan.cta}
          </button>
        </div>
      ))}
    </div>
  )
}
