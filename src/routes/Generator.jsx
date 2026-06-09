import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Info } from 'lucide-react'
import ManualForm from '../components/ManualForm.jsx'
import ProgressSteps from '../components/ProgressSteps.jsx'
import ManualPreview from '../components/ManualPreview.jsx'
import { generateDemoPlan, generateDemoManual } from '../lib/demoGenerator.js'
import { saveManual } from '../lib/db.js'

export default function Generator() {
  const [phase,    setPhase]    = useState('form')    // form | plan | generating | done
  const [progress, setProgress] = useState({ step: 0, label: '', percent: 0 })
  const [plan,     setPlan]     = useState(null)
  const [manual,   setManual]   = useState(null)
  const [formData, setFormData] = useState(null)
  const [error,    setError]    = useState(null)
  const navigate = useNavigate()

  const handleGenerate = async (form) => {
    setFormData(form)
    setError(null)
    setPhase('generating')

    try {
      // Étape 1-3 : Plan
      const generatedPlan = await generateDemoPlan(form, setProgress)
      setPlan(generatedPlan)
      setProgress({ step: 3, label: 'Plan validé', percent: 35 })

      // Étape 4-9 : Manuel complet
      const generatedManual = await generateDemoManual(form, generatedPlan, setProgress)
      setManual(generatedManual)

      // Sauvegarde locale
      await saveManual(generatedManual)

      setPhase('done')
    } catch (err) {
      console.error(err)
      setError('Une erreur est survenue lors de la génération. Veuillez réessayer.')
      setPhase('form')
    }
  }

  const handleSaveDraft = async (form) => {
    // Sauvegarde d'un brouillon minimal
    const draft = {
      manualId: crypto.randomUUID(),
      title: form.title || 'Brouillon sans titre',
      status: 'brouillon',
      formData: form,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      chapters: [],
    }
    await saveManual(draft)
    alert('Brouillon sauvegardé dans votre tableau de bord.')
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <Sparkles size={28} className="text-brand" />
          Générateur de manuel
        </h1>
        <p className="text-gray-500">
          Remplissez le formulaire ci-dessous et laissez Manuelia AI construire votre manuel pédagogique.
        </p>
      </div>

      {/* Bannière mode démo */}
      <div className="flex items-start gap-3 bg-violet-50 border border-violet-100 rounded-xl p-4 mb-8 text-sm">
        <Info size={16} className="text-brand shrink-0 mt-0.5" />
        <div>
          <strong className="text-brand">Mode démonstration actif.</strong>{' '}
          Le contenu généré est simulé mais structuré et réaliste. Vous pouvez tester l'édition, la sauvegarde et l'export sans clé API.
        </div>
      </div>

      {/* Formulaire */}
      {phase === 'form' && (
        <ManualForm onGenerate={handleGenerate} onSaveDraft={handleSaveDraft} />
      )}

      {/* Génération en cours */}
      {phase === 'generating' && (
        <div className="space-y-6">
          <ProgressSteps
            currentStep={progress.step}
            label={progress.label}
            percent={progress.percent}
          />
          <p className="text-center text-sm text-gray-400">
            La génération est en cours… Veuillez patienter.
          </p>
        </div>
      )}

      {/* Résultat */}
      {phase === 'done' && manual && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-xl p-4">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-semibold text-green-800">Manuel généré avec succès !</p>
              <p className="text-sm text-green-600">Sauvegardé localement. Vous pouvez le modifier, l'exporter ou revenir plus tard.</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate(`/editeur/${manual.manualId}`)}
              className="btn-primary"
            >
              Ouvrir l'éditeur
            </button>
            <button
              onClick={() => navigate(`/apercu/${manual.manualId}`)}
              className="btn-secondary"
            >
              Aperçu complet
            </button>
            <button
              onClick={() => { setPhase('form'); setManual(null); setPlan(null) }}
              className="btn-ghost"
            >
              Créer un nouveau manuel
            </button>
          </div>

          <ManualPreview manual={manual} onEdit={() => navigate(`/editeur/${manual.manualId}`)} />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-red-700 text-sm mt-4">
          {error}
        </div>
      )}
    </div>
  )
}
