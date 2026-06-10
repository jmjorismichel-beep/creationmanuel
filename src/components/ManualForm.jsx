import React, { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, Sparkles, RotateCcw, Save, FileText, Plus, X, LayoutTemplate, BookOpen } from 'lucide-react'
import { LEVELS, DOMAINS, TONES, MANUAL_TYPES } from '../lib/manualSchema.js'

// ── Clé localStorage pour les domaines personnalisés ─────────────────
const CUSTOM_DOMAINS_KEY = 'manuelia_custom_domains'

function loadCustomDomains() {
  try { return JSON.parse(localStorage.getItem(CUSTOM_DOMAINS_KEY) || '[]') }
  catch { return [] }
}
function saveCustomDomains(list) {
  localStorage.setItem(CUSTOM_DOMAINS_KEY, JSON.stringify(list))
}

// ── Modèles prédéfinis ────────────────────────────────────────────────
const TEMPLATES = [
  {
    id: 'excel',
    label: 'Excel — Débutant',
    icon: '📊',
    color: 'bg-green-50 border-green-200 hover:border-green-400',
    badge: 'Bureautique',
    values: {
      title: 'Maîtriser Excel 2021 — Niveau débutant',
      targetAudience: 'Adultes en insertion professionnelle, débutants en bureautique',
      level: 'A2 — Débutant',
      goals: 'Créer, mettre en forme et exploiter des tableaux simples. Utiliser les fonctions de base (SOMME, MOYENNE). Gérer des classeurs.',
      domain: 'Bureautique',
      manualType: 'Manuel de formation',
      numPages: '35',
      numChapters: '7',
      tone: 'detaille',
      writingStyle: 'pedagogique',
      exercises: true,
      corrections: true,
      reminderTables: true,
    },
  },
  {
    id: 'fle-a1',
    label: 'FLE — Niveau A1',
    icon: '🗣️',
    color: 'bg-blue-50 border-blue-200 hover:border-blue-400',
    badge: 'FLE',
    values: {
      title: 'Français pour débutants — Niveau A1',
      targetAudience: 'Apprenants allophones, primo-arrivants, niveau A1',
      level: 'A1 — Grand débutant',
      goals: 'Se présenter, saluer, comprendre et produire des phrases simples. Maîtriser le vocabulaire courant (famille, chiffres, couleurs).',
      domain: 'Français langue étrangère',
      manualType: 'Manuel de formation',
      numPages: '40',
      numChapters: '8',
      tone: 'simple',
      writingStyle: 'accessible',
      exercises: true,
      corrections: true,
      reminderTables: true,
      pedagogicalGoals: true,
    },
  },
  {
    id: 'word',
    label: 'Word — Débutant',
    icon: '📝',
    color: 'bg-sky-50 border-sky-200 hover:border-sky-400',
    badge: 'Bureautique',
    values: {
      title: 'Traitement de texte avec Word 2021',
      targetAudience: 'Adultes débutants en informatique',
      level: 'Débutant (non scolaire)',
      goals: 'Créer et mettre en page un document. Utiliser les styles, tableaux et en-têtes. Enregistrer et imprimer.',
      domain: 'Bureautique',
      manualType: 'Guide pratique',
      numPages: '30',
      numChapters: '6',
      tone: 'detaille',
      writingStyle: 'pedagogique',
      exercises: true,
      corrections: true,
      reminderTables: true,
    },
  },
  {
    id: 'numerique',
    label: 'Numérique — Base',
    icon: '💻',
    color: 'bg-purple-50 border-purple-200 hover:border-purple-400',
    badge: 'Numérique',
    values: {
      title: 'Les bases du numérique',
      targetAudience: 'Adultes éloignés du numérique, seniors',
      level: 'A1 — Grand débutant',
      goals: 'Allumer un ordinateur, naviguer sur Internet, gérer ses e-mails, utiliser un smartphone de façon autonome.',
      domain: 'Numérique',
      manualType: 'Guide pratique',
      numPages: '25',
      numChapters: '5',
      tone: 'simple',
      writingStyle: 'accessible',
      exercises: true,
      corrections: true,
      reminderTables: false,
    },
  },
  {
    id: 'fle-b1',
    label: 'FLE — Niveau B1',
    icon: '📖',
    color: 'bg-indigo-50 border-indigo-200 hover:border-indigo-400',
    badge: 'FLE',
    values: {
      title: 'Communication professionnelle en français — B1',
      targetAudience: 'Apprenants allophones niveau intermédiaire, en insertion professionnelle',
      level: 'B1 — Intermédiaire',
      goals: 'Rédiger des e-mails professionnels, comprendre des documents administratifs, participer à des réunions.',
      domain: 'Français langue étrangère',
      manualType: 'Support de cours',
      numPages: '50',
      numChapters: '10',
      tone: 'professionnel',
      writingStyle: 'pedagogique',
      exercises: true,
      corrections: true,
      finalProject: true,
    },
  },
  {
    id: 'securite',
    label: 'Sécurité numérique',
    icon: '🔒',
    color: 'bg-orange-50 border-orange-200 hover:border-orange-400',
    badge: 'Numérique',
    values: {
      title: 'Sécurité et bonnes pratiques sur Internet',
      targetAudience: 'Tout public adulte',
      level: 'Débutant (non scolaire)',
      goals: 'Reconnaître les arnaques en ligne, protéger ses données, créer des mots de passe solides, naviguer en sécurité.',
      domain: 'Numérique',
      manualType: 'Guide pratique',
      numPages: '20',
      numChapters: '4',
      tone: 'simple',
      writingStyle: 'accessible',
      exercises: true,
      corrections: true,
    },
  },
]

// ── Defaults formulaire ───────────────────────────────────────────────
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

// ── Sélecteur de domaine avec option "Créer" ──────────────────────────
function DomainSelector({ value, onChange, customDomains, onAddDomain, onDeleteDomain }) {
  const [adding, setAdding]   = useState(false)
  const [newName, setNewName] = useState('')
  const allDomains            = [...DOMAINS, ...customDomains]

  const handleAdd = () => {
    const trimmed = newName.trim()
    if (!trimmed || allDomains.includes(trimmed)) return
    onAddDomain(trimmed)
    onChange(trimmed)
    setNewName('')
    setAdding(false)
  }

  return (
    <div>
      <label className="form-label">
        Domaine
        <span className="ml-2 text-xs text-brand font-normal cursor-pointer hover:underline" onClick={() => setAdding(!adding)}>
          {adding ? '✕ Annuler' : '+ Créer un domaine'}
        </span>
      </label>

      {adding ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="Nom du domaine…"
            className="form-input flex-1"
            autoFocus
          />
          <button type="button" onClick={handleAdd} className="btn-primary px-4 text-sm">
            <Plus size={14} /> Ajouter
          </button>
        </div>
      ) : (
        <div className="relative">
          <select
            name="domain"
            value={value}
            onChange={e => onChange(e.target.value)}
            className="form-select pr-8 appearance-none w-full"
          >
            <optgroup label="Domaines standard">
              {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
            </optgroup>
            {customDomains.length > 0 && (
              <optgroup label="Mes domaines personnalisés">
                {customDomains.map(d => <option key={d} value={d}>{d}</option>)}
              </optgroup>
            )}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      )}

      {/* Badges domaines personnalisés + suppression */}
      {customDomains.length > 0 && !adding && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {customDomains.map(d => (
            <span key={d} className="flex items-center gap-1 text-xs bg-brand/10 text-brand px-2 py-0.5 rounded-full">
              {d}
              <button
                type="button"
                onClick={() => onDeleteDomain(d)}
                className="hover:text-red-500 transition-colors"
                title="Supprimer ce domaine"
              >
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Composant principal ───────────────────────────────────────────────
export default function ManualForm({ onGenerate, onSaveDraft, isGenerating = false }) {
  const [form, setForm]             = useState(DEFAULT_FORM)
  const [showAdvanced, setShowAdv]  = useState(false)
  const [showTemplates, setShowTpl] = useState(true)
  const [customDomains, setCustomDomains] = useState(loadCustomDomains)
  const [appliedTemplate, setAppliedTemplate] = useState(null)

  const set = (name, value) => setForm(prev => ({ ...prev, [name]: value }))
  const handleChange = e => set(e.target.name, e.target.value)
  const handleToggle = (name, value) => set(name, value)
  const handleReset  = () => { setForm(DEFAULT_FORM); setAppliedTemplate(null) }

  const applyTemplate = (tpl) => {
    setForm(prev => ({ ...DEFAULT_FORM, ...prev, ...tpl.values }))
    setAppliedTemplate(tpl.id)
    setShowTpl(false)
    // Scroll vers le formulaire
    setTimeout(() => document.getElementById('title')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100)
  }

  const handleAddDomain = (name) => {
    const updated = [...customDomains, name]
    setCustomDomains(updated)
    saveCustomDomains(updated)
  }

  const handleDeleteDomain = (name) => {
    const updated = customDomains.filter(d => d !== name)
    setCustomDomains(updated)
    saveCustomDomains(updated)
    if (form.domain === name) set('domain', DOMAINS[0])
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onGenerate?.(form)
  }

  const estimWords = parseInt(form.numPages) * 400

  return (
    <div className="space-y-6">

      {/* ─── Modèles prédéfinis ─────────────────────────────────── */}
      <div className="card">
        <button
          type="button"
          onClick={() => setShowTpl(!showTemplates)}
          className="w-full flex items-center justify-between"
        >
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <LayoutTemplate size={17} className="text-brand" />
            Partir d'un modèle
            <span className="text-xs font-normal text-gray-400">({TEMPLATES.length} disponibles)</span>
          </h2>
          {showTemplates ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>

        {showTemplates && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 animate-slide-up">
            {TEMPLATES.map(tpl => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => applyTemplate(tpl)}
                className={`border rounded-xl p-3 text-left transition-all ${tpl.color} ${
                  appliedTemplate === tpl.id ? 'ring-2 ring-brand' : ''
                }`}
              >
                <div className="text-2xl mb-1.5">{tpl.icon}</div>
                <div className="text-sm font-semibold text-gray-800 leading-tight">{tpl.label}</div>
                <div className="text-xs text-gray-400 mt-1">{tpl.badge}</div>
                {appliedTemplate === tpl.id && (
                  <div className="text-xs text-brand font-medium mt-1.5">✓ Appliqué</div>
                )}
              </button>
            ))}
          </div>
        )}

        {appliedTemplate && !showTemplates && (
          <div className="mt-3 flex items-center gap-2 text-sm text-brand">
            <BookOpen size={14} />
            Modèle appliqué : <strong>{TEMPLATES.find(t => t.id === appliedTemplate)?.label}</strong>
            <button type="button" onClick={() => { handleReset(); setShowTpl(true) }} className="ml-auto text-xs text-gray-400 hover:text-gray-600">
              Effacer
            </button>
          </div>
        )}
      </div>

      {/* ─── Formulaire principal ───────────────────────────────── */}
      <form onSubmit={handleSubmit} className="space-y-6">
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
              <div className="relative">
                <select id="level" name="level" value={form.level} onChange={handleChange} className="form-select pr-8 appearance-none w-full">
                  <optgroup label="Niveaux CECRL (FLE)">
                    {LEVELS.slice(0, 6).map(l => <option key={l} value={l}>{l}</option>)}
                  </optgroup>
                  <optgroup label="Niveaux non scolaires">
                    {LEVELS.slice(6).map(l => <option key={l} value={l}>{l}</option>)}
                  </optgroup>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
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

            {/* Domaine avec création personnalisée */}
            <DomainSelector
              value={form.domain}
              onChange={v => set('domain', v)}
              customDomains={customDomains}
              onAddDomain={handleAddDomain}
              onDeleteDomain={handleDeleteDomain}
            />

            <div>
              <label htmlFor="manualType" className="form-label">Type de manuel</label>
              <div className="relative">
                <select id="manualType" name="manualType" value={form.manualType} onChange={handleChange} className="form-select pr-8 appearance-none w-full">
                  {MANUAL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label htmlFor="numPages" className="form-label">
                Nombre de pages
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
              <div className="relative">
                <select id="tone" name="tone" value={form.tone} onChange={handleChange} className="form-select pr-8 appearance-none w-full">
                  {TONES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label htmlFor="writingStyle" className="form-label">Style d'écriture</label>
              <div className="relative">
                <select id="writingStyle" name="writingStyle" value={form.writingStyle} onChange={handleChange} className="form-select pr-8 appearance-none w-full">
                  <option value="pedagogique">Pédagogique</option>
                  <option value="professionnel">Professionnel</option>
                  <option value="accessible">Accessible et simple</option>
                  <option value="academique">Académique</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* ─── Structure ─────────────────────────────────────────── */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Structure du manuel</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 divide-y divide-gray-50">
            {[
              ['coverPage',        'Page de garde'],
              ['tableOfContents',  'Sommaire'],
              ['pedagogicalGoals', 'Objectifs pédagogiques'],
              ['prerequisites',    'Prérequis'],
              ['reminderTables',   'Tableaux de rappel'],
              ['exercises',        'Exercices'],
              ['corrections',      'Corrections détaillées'],
              ['selfEvalGrid',     "Grille d'auto-évaluation"],
              ['finalProject',     'Projet final'],
              ['appendices',       'Annexes'],
            ].map(([name, label]) => (
              <Toggle key={name} name={name} label={label} value={form[name]} onChange={handleToggle} />
            ))}
          </div>
        </div>

        {/* ─── Informations complémentaires ──────────────────────── */}
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

        {/* ─── Estimation ────────────────────────────────────────── */}
        <div className="bg-violet-50 border border-violet-100 rounded-xl p-4 flex flex-wrap gap-4 text-sm">
          <div>
            <span className="text-gray-500">Pages :</span>
            <strong className="ml-2 text-gray-900">{form.numPages}</strong>
          </div>
          <div>
            <span className="text-gray-500">Mots estimés :</span>
            <strong className="ml-2 text-gray-900">~{estimWords.toLocaleString('fr-FR')}</strong>
          </div>
          <div>
            <span className="text-gray-500">Chapitres :</span>
            <strong className="ml-2 text-gray-900">{form.numChapters}</strong>
          </div>
          <div>
            <span className="text-gray-500">Domaine :</span>
            <strong className="ml-2 text-gray-900">{form.domain}</strong>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            <span className="text-green-700 font-medium">Mode démonstration actif</span>
          </div>
        </div>

        {/* ─── Actions ───────────────────────────────────────────── */}
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
    </div>
  )
}
