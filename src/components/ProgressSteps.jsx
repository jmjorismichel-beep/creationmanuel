import React from 'react'
import { Check, Loader2 } from 'lucide-react'

const STEPS = [
  { id: 1, label: 'Analyse du prompt' },
  { id: 2, label: 'Création du plan' },
  { id: 3, label: 'Validation du plan' },
  { id: 4, label: 'Génération des chapitres' },
  { id: 5, label: 'Génération des exercices' },
  { id: 6, label: 'Génération des corrections' },
  { id: 7, label: 'Assemblage du manuel' },
  { id: 8, label: 'Sauvegarde' },
  { id: 9, label: 'Préparation de l\'export' },
]

export default function ProgressSteps({ currentStep = 0, label = '', percent = 0 }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
      {/* Barre de progression */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">{label || 'Génération en cours…'}</span>
          <span className="text-sm font-semibold text-brand">{percent}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand to-violet-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Étapes */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-9">
        {STEPS.map(step => {
          const done    = step.id < currentStep
          const current = step.id === currentStep
          const pending = step.id > currentStep
          return (
            <div key={step.id} className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                done    ? 'bg-green-100 text-green-600'  :
                current ? 'bg-brand text-white shadow-md shadow-brand/30' :
                          'bg-gray-100 text-gray-400'
              }`}>
                {done    ? <Check size={14} strokeWidth={2.5} /> :
                 current ? <Loader2 size={14} className="animate-spin" /> :
                           step.id}
              </div>
              <span className={`text-[10px] text-center leading-tight hidden sm:block ${
                done ? 'text-green-600' : current ? 'text-brand font-medium' : 'text-gray-400'
              }`}>
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
