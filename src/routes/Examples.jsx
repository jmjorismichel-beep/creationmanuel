import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, ArrowRight, Sparkles } from 'lucide-react'
import { generateDemoManual, generateDemoPlan } from '../lib/demoGenerator.js'
import { saveManual } from '../lib/db.js'

const EXAMPLES = [
  {
    id: 'excel',
    title: 'Manuel Excel 2021 pour débutants',
    subtitle: 'Formation bureautique A1',
    domain: 'Bureautique',
    level: 'A1 — Grand débutant',
    pages: 50,
    tone: 'simple',
    numChapters: '8',
    color: 'green',
    description: 'Un manuel complet de 50 pages pour apprendre Excel 2021 de zéro. Idéal pour des stagiaires n\'ayant jamais utilisé de tableur.',
    tags: ['Excel', 'Formules', 'Tableaux', 'Mise en forme', 'Impression'],
    formData: { title: 'Manuel Excel 2021', targetAudience: 'Stagiaires débutants', level: 'A1 — Grand débutant', domain: 'Bureautique', tone: 'simple', numPages: '50', numChapters: '8', exercises: true, corrections: true, reminderTables: true, coverPage: true, tableOfContents: true },
  },
  {
    id: 'fle',
    title: 'Français B1 vers B2',
    subtitle: 'FLE — Niveau intermédiaire',
    domain: 'Français langue étrangère',
    level: 'B1 → B2',
    pages: 60,
    tone: 'pedagogique',
    numChapters: '10',
    color: 'blue',
    description: 'Support de cours pour consolider le niveau B1 et progresser vers le B2. Grammaire avancée, expression écrite et orale, compréhension.',
    tags: ['Grammaire', 'Expression écrite', 'Vocabulaire', 'Conjugaison', 'Compréhension'],
    formData: { title: 'Français B1 vers B2', targetAudience: 'Apprenants FLE intermédiaires', level: 'B1 — Intermédiaire', domain: 'Français langue étrangère', tone: 'pedagogique', numPages: '60', numChapters: '10', exercises: true, corrections: true, coverPage: true, tableOfContents: true },
  },
  {
    id: 'industrie',
    title: 'Conversion des unités — Industrie',
    subtitle: 'Formation technique',
    domain: 'Industrie',
    level: 'Intermédiaire',
    pages: 35,
    tone: 'professionnel',
    numChapters: '6',
    color: 'orange',
    description: 'Guide pratique de la conversion des unités pour les opérateurs industriels : métriques, impériales, pressions, températures, volumes.',
    tags: ['Unités SI', 'Conversions', 'Tableaux de référence', 'Calculs industriels'],
    formData: { title: 'Conversion des unités — Industrie', targetAudience: 'Opérateurs industriels', level: 'Intermédiaire (non scolaire)', domain: 'Industrie', tone: 'professionnel', numPages: '35', numChapters: '6', exercises: true, corrections: true, reminderTables: true, coverPage: true },
  },
]

export default function Examples() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(null)

  const handleTryExample = async (example) => {
    setLoading(example.id)
    try {
      const plan = await generateDemoPlan(example.formData, () => {})
      const manual = await generateDemoManual(example.formData, plan, () => {})
      await saveManual(manual)
      navigate(`/apercu/${manual.manualId}`)
    } catch (err) {
      console.error(err)
      alert('Erreur lors de la génération de l\'exemple.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Exemples de manuels</h1>
        <p className="text-gray-500">Découvrez ce que Manuelia AI peut générer. Cliquez sur un exemple pour le créer et l'explorer.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {EXAMPLES.map(ex => (
          <div key={ex.id} className="card flex flex-col gap-4 hover:border-brand/30 transition-all">
            <div className={`w-full h-36 rounded-xl flex items-center justify-center bg-gradient-to-br ${
              ex.color === 'green'  ? 'from-green-100 to-emerald-100'  :
              ex.color === 'blue'   ? 'from-blue-100 to-indigo-100'    :
                                      'from-orange-100 to-amber-100'
            }`}>
              <BookOpen size={40} className={`opacity-30 ${
                ex.color === 'green'  ? 'text-green-700'  :
                ex.color === 'blue'   ? 'text-blue-700'   :
                                        'text-orange-700'
              }`} />
            </div>

            <div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                <span className={`badge ${
                  ex.color === 'green'  ? 'bg-green-100 text-green-700'   :
                  ex.color === 'blue'   ? 'bg-blue-100 text-blue-700'     :
                                          'bg-orange-100 text-orange-700'
                }`}>{ex.domain}</span>
                <span className="badge bg-gray-100 text-gray-600">{ex.level}</span>
              </div>
              <h2 className="font-semibold text-gray-900 mb-1">{ex.title}</h2>
              <p className="text-sm text-gray-500 leading-relaxed mb-3">{ex.description}</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {ex.tags.map(tag => (
                  <span key={tag} className="text-xs px-2 py-0.5 bg-gray-50 text-gray-500 rounded-full">{tag}</span>
                ))}
              </div>
              <p className="text-xs text-gray-400">{ex.pages} pages · {ex.numChapters} chapitres</p>
            </div>

            <button
              onClick={() => handleTryExample(ex)}
              disabled={loading === ex.id}
              className="btn-primary mt-auto justify-center"
            >
              {loading === ex.id ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Génération…</>
              ) : (
                <><Sparkles size={14} /> Essayer cet exemple</>
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <p className="text-gray-500 mb-4">Vous avez un autre sujet en tête ?</p>
        <button onClick={() => navigate('/generateur')} className="btn-primary">
          Créer mon propre manuel <ArrowRight size={15} />
        </button>
      </div>
    </div>
  )
}
