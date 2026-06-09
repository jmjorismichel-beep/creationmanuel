import React, { useState } from 'react'
import { Wand2, RefreshCw, Check, X, ChevronDown, Loader2, WifiOff } from 'lucide-react'
import { addToOfflineQueue } from '../lib/db.js'
import DiffViewer from './DiffViewer.jsx'

const REVISION_TYPES = [
  { value: 'correct', label: 'Corriger les fautes' },
  { value: 'simplify', label: 'Simplifier' },
  { value: 'develop', label: 'Développer' },
  { value: 'rephrase', label: 'Reformuler' },
  { value: 'professional', label: 'Rendre plus professionnel' },
  { value: 'beginner', label: 'Adapter pour débutant' },
  { value: 'exercises', label: 'Ajouter des exercices' },
  { value: 'check', label: 'Vérifier la cohérence' },
  { value: 'custom', label: 'Consigne personnalisée' },
]

const SCOPE_OPTIONS = [
  { value: 'manual', label: 'Manuel complet' },
  { value: 'chapter', label: 'Chapitre' },
  { value: 'section', label: 'Section' },
  { value: 'introduction', label: 'Introduction' },
  { value: 'conclusion', label: 'Conclusion' },
]

export default function RevisionAssistant({ manual, onApply, isOnline = true }) {
  const [scope, setScope]               = useState('manual')
  const [selectedChapter, setSelectedChapter] = useState('')
  const [revisionType, setRevisionType] = useState('correct')
  const [customInstruction, setCustomInstruction] = useState('')
  const [loading, setLoading]           = useState(false)
  const [proposal, setProposal]         = useState(null)
  const [originalText, setOriginalText] = useState('')
  const [error, setError]               = useState('')
  const [queued, setQueued]             = useState(false)

  const getTargetText = () => {
    if (scope === 'manual') {
      return manual.chapters?.map(c =>
        `# ${c.title}\n${c.introduction}\n${c.sections?.map(s => s.content).join('\n')}`
      ).join('\n\n') || ''
    }
    if (scope === 'introduction') return manual.introduction || ''
    if (scope === 'conclusion') return manual.conclusion || ''
    if (scope === 'chapter' && selectedChapter) {
      const ch = manual.chapters?.find(c => c.id === selectedChapter)
      return ch ? `# ${ch.title}\n${ch.introduction}\n${ch.sections?.map(s => s.content).join('\n')}` : ''
    }
    return ''
  }

  const buildInstruction = () => {
    const found = REVISION_TYPES.find(r => r.value === revisionType)
    if (revisionType === 'custom') return customInstruction
    return found?.label || ''
  }

  const handleRevise = async () => {
    if (!isOnline) {
      // File d'attente hors ligne
      await addToOfflineQueue({
        type: 'revision',
        manualId: manual.manualId,
        scope,
        chapterId: selectedChapter,
        instruction: buildInstruction(),
        revisionType,
        createdAt: new Date().toISOString(),
      })
      setQueued(true)
      return
    }

    setError('')
    setProposal(null)
    setLoading(true)

    const text = getTargetText()
    setOriginalText(text)

    try {
      const res = await fetch('/.netlify/functions/revise-manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          instruction: buildInstruction(),
          scope,
          manualTitle: manual.title,
        }),
      })

      if (!res.ok) {
        // Fallback démo
        setProposal(simulateRevision(text, revisionType))
        return
      }

      const data = await res.json()
      setProposal(data.revised || simulateRevision(text, revisionType))
    } catch {
      setProposal(simulateRevision(text, revisionType))
    } finally {
      setLoading(false)
    }
  }

  const simulateRevision = (text, type) => {
    const prefix = {
      correct:      '✓ [Texte corrigé — mode démo]\n\n',
      simplify:     '✓ [Texte simplifié — mode démo]\n\n',
      develop:      '✓ [Texte développé — mode démo]\n\n',
      rephrase:     '✓ [Texte reformulé — mode démo]\n\n',
      professional: '✓ [Texte professionnel — mode démo]\n\n',
      beginner:     '✓ [Texte adapté débutant — mode démo]\n\n',
      exercises:    '✓ [Exercices ajoutés — mode démo]\n\nExercice 1 : ...\nExercice 2 : ...\n\n',
      check:        '✓ [Cohérence vérifiée — mode démo]\n\nAucune incohérence majeure détectée.\n\n',
      custom:       '✓ [Modification appliquée — mode démo]\n\n',
    }
    return (prefix[type] || '') + text
  }

  const handleApply = () => {
    if (!proposal) return
    if (scope === 'introduction') onApply('introduction', proposal)
    else if (scope === 'conclusion') onApply('conclusion', proposal)
    else if (scope === 'chapter' && selectedChapter) {
      onApply('chapter', { chapterId: selectedChapter, text: proposal })
    } else {
      onApply('manual', proposal)
    }
    setProposal(null)
    setOriginalText('')
  }

  const handleRefuse = () => {
    setProposal(null)
    setOriginalText('')
  }

  if (queued) return (
    <div className="card text-center py-8">
      <WifiOff size={32} className="mx-auto text-gray-400 mb-3" />
      <p className="font-semibold text-gray-700 mb-1">Demande enregistrée hors ligne</p>
      <p className="text-sm text-gray-500 mb-4">
        Votre demande de révision sera appliquée automatiquement lorsque la connexion sera rétablie.
      </p>
      <button onClick={() => setQueued(false)} className="btn-secondary text-sm">Nouvelle demande</button>
    </div>
  )

  return (
    <div className="card">
      <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Wand2 size={18} className="text-brand" />
        Assistant de correction et modification
        {!isOnline && (
          <span className="ml-auto flex items-center gap-1 text-xs text-orange-500 font-normal">
            <WifiOff size={13} /> Hors ligne (file d'attente)
          </span>
        )}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {/* Portée */}
        <div>
          <label className="form-label">Portée de la modification</label>
          <div className="relative">
            <select
              value={scope}
              onChange={e => { setScope(e.target.value); setSelectedChapter('') }}
              className="form-select pr-8 appearance-none"
            >
              {SCOPE_OPTIONS.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Chapitre si applicable */}
        {scope === 'chapter' && (
          <div>
            <label className="form-label">Sélectionner le chapitre</label>
            <div className="relative">
              <select
                value={selectedChapter}
                onChange={e => setSelectedChapter(e.target.value)}
                className="form-select pr-8 appearance-none"
              >
                <option value="">— Choisir —</option>
                {manual.chapters?.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        )}

        {/* Type de révision */}
        <div className={scope === 'chapter' ? '' : 'sm:col-span-2'}>
          <label className="form-label">Type de modification</label>
          <div className="relative">
            <select
              value={revisionType}
              onChange={e => setRevisionType(e.target.value)}
              className="form-select pr-8 appearance-none"
            >
              {REVISION_TYPES.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Consigne personnalisée */}
      {revisionType === 'custom' && (
        <div className="mb-4">
          <label className="form-label">Votre consigne</label>
          <textarea
            rows={3}
            value={customInstruction}
            onChange={e => setCustomInstruction(e.target.value)}
            placeholder="Ex : Ajoute un tableau de rappel sur les raccourcis clavier à la fin du chapitre 2."
            className="form-input resize-none"
          />
        </div>
      )}

      {error && (
        <div className="text-sm text-red-500 bg-red-50 rounded-lg px-4 py-2 mb-4">{error}</div>
      )}

      {/* Bouton lancer */}
      {!proposal && (
        <button
          onClick={handleRevise}
          disabled={loading || (scope === 'chapter' && !selectedChapter) || (revisionType === 'custom' && !customInstruction.trim())}
          className="btn-primary w-full"
        >
          {loading
            ? <><Loader2 size={16} className="animate-spin" /> Analyse en cours…</>
            : isOnline
              ? <><Wand2 size={16} /> Lancer la modification</>
              : <><WifiOff size={16} /> Enregistrer pour plus tard</>
          }
        </button>
      )}

      {/* Vue avant/après */}
      {proposal && (
        <div className="mt-4 space-y-4">
          <DiffViewer original={originalText} revised={proposal} />
          <div className="flex items-center gap-3 flex-wrap">
            <button onClick={handleApply} className="btn-primary text-sm">
              <Check size={14} /> Appliquer la modification
            </button>
            <button onClick={handleRevise} disabled={loading} className="btn-secondary text-sm">
              <RefreshCw size={14} /> Regénérer une proposition
            </button>
            <button onClick={handleRefuse} className="btn-ghost text-sm text-red-500 hover:text-red-600">
              <X size={14} /> Refuser
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
