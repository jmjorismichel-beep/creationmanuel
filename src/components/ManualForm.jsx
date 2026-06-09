import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Sparkles, RotateCcw, Save, FileText } from 'lucide-react'
import { LEVELS, DOMAINS, TONES, MANUAL_TYPES } from '../lib/manualSchema.js'

const DEFAULT_FORM = {
  title: '',
  subject: '',
  targetAudience: '',
  level: 'A2 — Débutant',
  goals: '',
  manualType: 'Manuel de formation',
  numPages: '20',
  numChapters: '5',
  writingStyle: 'pédagogique',
  tone: 'simple',
  domain: 'Numérique',
  author: '',
  organization: '',
  coverPage: true,
  tableOfContents: true,
  pedagogicalGoals: true,
  prerequisites: true,
  reminderTables: true,
  exercises: true,
  corrections: true,
  selfEvalGrid: false,
  finalProject: false,
  appendices: false,
}

function Toggle({ label, name, value, onChange }) {
  return (
    <label className="flex items-center justify-between py-2 cursor-pointer group">
      <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(name, !value)}
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 ${
          value ? 'bg-brand' : 'bg-gray-200'
        }`}
      >
        <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200 mt-0.5 ${
          value ? 'translate-x-5' : 'translate-x-0.5'
        }`} />
      </button>
    </label>
  )
}

export default function ManualForm({ onGenerate, onSaveDraft, isGenerating = false }) {
  const [form, setForm]             = useState(DEFAULT_FORM)
  const [showAdvanced, setShowAdv]  = useState(false)

  const set = (name, value) => setForm(prev => ({ ...prev, [name]: value }))
  const handleChange = e => set(e.target.name, e.target.value)
  const handleToggle = (name, value) => set(name, value)
  const handleReset  = () => setForm(DEFAULT_FORM)

  const handleSubmit = (e) => {
    e.preventDefault()
    onGenerate?.(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Section principale */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
          <FileText size={18} className="text-brand" />
          Informations du manuel
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label htmlFor="title" className="form-label">Titre ou sujet du manuel *</label>
            <input
              id="title" name="title" type="text"
              value={form.title} onChange={handleChange}
              placeholder="Ex. : Manuel Excel 2021 pour débutants"
              className="form-input" required
            />
          </div>

          <div>
            <label htmlFor="targetAudience" className="form-label">Public cible *</label>
            <input
              id="targetAudience" name="targetAudience" type="text"
              value={form.targetAudience} onChange={handleChange}
              placeholder="Ex. : Stagiaires débutants en numérique"
              className="form-input" required
            />
          </div>

          <div>
            <label htmlFor="level" className="form-label">Niveau du public</label>
            <select id="level" name="level" value={form.level} onChange={handleChange} className="form-select">
              {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="goals" className="form-label">Objectifs pédagogiques</label>
            <textarea
              id="goals" name="goals" rows={2}
              value={form.goals} onChange={handleChange}
              placeholder="Ex. : Être capable de créer et mettre en forme un tableau Excel simple…"
              className="form-input resize-none"
            />
          </div>

          <div>
            <label htmlFor="domain" className="form-label">Domaine</label>
            <select id="domain" name="domain" value={form.domain} onChange={handleChange} className="form-select">
              {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="manualType" className="form-label">Type de manuel</label>
            <select id="manualType" name="manualType" value={form.manualType} onChange={handleChange} className="form-select">
              {MANUAL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="numPages" className="form-label">
              Nombre de pages souhaitées
              <span className="ml-2 font-semibold text-brand">{form.numPages} p.</span>
            </label>
            <input
              id="numPages" name="numPages" type="range"
              min="5" max="75" step="5"
              value={form.numPages} onChange={handleChange}
              className="w-full accent-brand"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>5 p.</span><span>75 p. max</span>
            </div>
          </div>

          <div>
            <label htmlFor="numChapters" className="form-label">
              Nombre de chapitres
              <span className="ml-2 font-semibold text-brand">{form.numChapters} ch.</span>
            </label>
            <input
              id="numChapters" name="numChapters" type="range"
              min="2" max="12" step="1"
              value={form.numChapters} onChange={handleChange}
              className="w-full accent-brand"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>2</span><span>12 max</span>
            </div>
          </div>

          <div>
            <label htmlFor="tone" className="form-label">Ton souhaité</label>
            <select id="tone" name="tone" value={form.tone} onChange={handleChange} className="form-select">
              {TONES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="writingStyle" className="form-label">Style d'écriture</label>
            <select id="writingStyle" name="writingStyle" value={form.writingStyle} onChange={handleChange} className="form-select">
              <option value="pedagogique">Pédagogique</option>
              <option value="professionnel">Professionnel</option>
              <option value="accessible">Accessible et simple</option>
              <option value="academique">Académique</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section structure */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Structure du manuel</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 divide-y divide-gray-50">
          {[
            ['coverPage',         'Page de garde'],
            ['tableOfContents',   'Sommaire'],
            ['pedagogicalGoals',  'Objectifs pédagogiques'],
            ['prerequisites',     'Prérequis'],
            ['reminderTables',    'Tableaux de rappel'],
            ['exercises',         'Exercices'],
            ['corrections',       'Corrections détaillées'],
            ['selfEvalGrid',      'Grille d\'auto-évaluation'],
            ['finalProject',      'Projet final'],
            ['appendices',        'Annexes'],
          ].map(([name, label]) => (
            <Toggle key={name} name={name} label={label} value={form[name]} onChange={handleToggle} />
          ))}
        </div>
      </div>

      {/* Section avancée */}
      <div className="card">
        <button
          type="button"
          onClick={() => setShowAdv(!showAdvanced)}
          className="w-full flex items-center justify-between text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          Informations complémentaires (optionnel)
          {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showAdvanced && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-50 animate-slide-up">
            <div>
              <label htmlFor="author" className="form-label">Auteur / Formateur</label>
              <input id="author" name="author" type="text" value={form.author} onChange={handleChange}
                placeholder="Prénom Nom" className="form-input" />
            </div>
            <div>
              <label htmlFor="organization" className="form-label">Organisme / Structure</label>
              <input id="organization" name="organization" type="text" value={form.organization} onChange={handleChange}
                placeholder="Centre de formation, Association…" className="form-input" />
            </div>
          </div>
        )}
      </div>

      {/* Estimation */}
      <div className="bg-violet-50 border border-violet-100 rounded-xl p-4 flex flex-wrap gap-4 text-sm">
        <div>
          <span className="text-gray-500">Pages estimées :</span>
          <strong className="ml-2 text-gray-900">{form.numPages} pages</strong>
        </div>
        <div>
          <span className="text-gray-500">Mots estimés :</span>
          <strong className="ml-2 text-gray-900">~{(parseInt(form.numPages) * 400).toLocaleString('fr-FR')} mots</strong>
        </div>
        <div>
          <span className="text-gray-500">Chapitres :</span>
          <strong className="ml-2 text-gray-900">{form.numChapters}</strong>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-green-400 rounded-full"></span>
          <span className="text-green-700 font-medium">Mode démonstration actif</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={isGenerating} className="btn-primary flex-1 justify-center">
          {isGenerating ? (
            <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Génération…</>
          ) : (
            <><Sparkles size={16} /> Générer le manuel</>
          )}
        </button>
        <button
          type="button"
          onClick={() => onSaveDraft?.(form)}
          className="btn-secondary"
        >
          <Save size={15} /> Sauvegarder le brouillon
        </button>
        <button type="button" onClick={handleReset} className="btn-ghost">
          <RotateCcw size={15} /> Réinitialiser
        </button>
      </div>
    </form>
  )
}
