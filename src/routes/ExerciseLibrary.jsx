import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Library, Plus, Search, X, Trash2, Copy, ChevronDown,
         BookOpen, Tag, Filter, CheckCircle, Edit3, ArrowLeft } from 'lucide-react'
import { getAllExercises, deleteExercise, saveExercise, getAllManuals, importExercisesFromManual } from '../lib/db.js'
import { DOMAINS, LEVELS } from '../lib/manualSchema.js'

const TYPE_OPTIONS = ['pratique', 'QCM', 'vrai/faux', 'rédaction', 'mise en situation', 'autre']

const TYPE_COLORS = {
  'pratique':          'bg-blue-50 text-blue-600',
  'QCM':               'bg-purple-50 text-purple-600',
  'vrai/faux':         'bg-cyan-50 text-cyan-600',
  'rédaction':         'bg-amber-50 text-amber-700',
  'mise en situation': 'bg-green-50 text-green-700',
  'autre':             'bg-gray-100 text-gray-600',
}

// ── Carte exercice ───────────────────────────────────────────────────
function ExerciseCard({ ex, onDelete, onCopy, onEdit }) {
  const [showAnswer, setShowAnswer] = useState(false)

  return (
    <div className="card flex flex-col gap-3">
      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {ex.type && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[ex.type] || TYPE_COLORS.autre}`}>
            {ex.type}
          </span>
        )}
        {ex.level && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">{ex.level}</span>
        )}
        {ex.domain && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-violet-50 text-violet-600">{ex.domain}</span>
        )}
      </div>

      {/* Question */}
      <p className="text-sm text-gray-800 font-medium leading-snug">
        {ex.question || '(sans question)'}
      </p>

      {/* Indice */}
      {ex.hint && (
        <p className="text-xs text-brand/80 bg-brand/5 px-3 py-1.5 rounded-lg">
          💡 {ex.hint}
        </p>
      )}

      {/* Réponse toggle */}
      {ex.answer && (
        <button
          onClick={() => setShowAnswer(!showAnswer)}
          className="text-xs text-gray-400 hover:text-brand text-left flex items-center gap-1 transition-colors"
        >
          <CheckCircle size={12} />
          {showAnswer ? 'Masquer la correction' : 'Voir la correction'}
        </button>
      )}
      {showAnswer && ex.answer && (
        <div className="text-xs text-gray-600 bg-green-50 border border-green-100 px-3 py-2 rounded-lg animate-slide-up">
          <strong className="text-green-700">Correction : </strong>{ex.answer}
          {ex.explanation && (
            <p className="mt-1 text-green-600 italic">{ex.explanation}</p>
          )}
        </div>
      )}

      {/* Source */}
      {ex.manualTitle && (
        <p className="text-xs text-gray-400 flex items-center gap-1">
          <BookOpen size={10} /> {ex.manualTitle}{ex.chapterTitle ? ` — ${ex.chapterTitle}` : ''}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
        <button onClick={() => onCopy(ex)} className="btn-ghost text-xs py-1 flex-1 justify-center">
          <Copy size={12} /> Copier
        </button>
        <button onClick={() => onEdit(ex)} className="btn-ghost text-xs py-1 flex-1 justify-center">
          <Edit3 size={12} /> Modifier
        </button>
        <button onClick={() => onDelete(ex.id)} className="btn-ghost text-xs py-1 hover:text-red-500">
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  )
}

// ── Modale ajout/édition ─────────────────────────────────────────────
function ExerciseModal({ exercise, onSave, onClose }) {
  const [form, setForm] = useState({
    question:    '',
    hint:        '',
    answer:      '',
    explanation: '',
    domain:      '',
    level:       '',
    type:        'pratique',
    tags:        '',
    ...exercise,
    tags: Array.isArray(exercise?.tags) ? exercise.tags.join(', ') : (exercise?.tags || ''),
  })

  const handleSubmit = async () => {
    if (!form.question.trim()) return
    await onSave({
      ...form,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">
            {exercise?.id ? 'Modifier l\'exercice' : 'Créer un exercice'}
          </h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="form-label">Question *</label>
            <textarea rows={3} value={form.question}
              onChange={e => setForm(p => ({ ...p, question: e.target.value }))}
              placeholder="Énoncé de l'exercice…" className="form-input resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Type</label>
              <select value={form.type}
                onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                className="form-select">
                {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Domaine</label>
              <select value={form.domain}
                onChange={e => setForm(p => ({ ...p, domain: e.target.value }))}
                className="form-select">
                <option value="">—</option>
                {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="form-label">Niveau</label>
              <select value={form.level}
                onChange={e => setForm(p => ({ ...p, level: e.target.value }))}
                className="form-select">
                <option value="">—</option>
                {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="form-label">Indice (optionnel)</label>
            <input type="text" value={form.hint}
              onChange={e => setForm(p => ({ ...p, hint: e.target.value }))}
              placeholder="Un indice pour guider l'apprenant…" className="form-input" />
          </div>

          <div>
            <label className="form-label">Correction</label>
            <textarea rows={3} value={form.answer}
              onChange={e => setForm(p => ({ ...p, answer: e.target.value }))}
              placeholder="Réponse correcte…" className="form-input resize-none" />
          </div>

          <div>
            <label className="form-label">Explication (optionnel)</label>
            <textarea rows={2} value={form.explanation}
              onChange={e => setForm(p => ({ ...p, explanation: e.target.value }))}
              placeholder="Pourquoi cette réponse est correcte…" className="form-input resize-none" />
          </div>

          <div>
            <label className="form-label">Tags (séparés par des virgules)</label>
            <input type="text" value={form.tags}
              onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
              placeholder="tableur, formule, débutant…" className="form-input" />
          </div>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={handleSubmit} className="btn-primary flex-1">
            {exercise?.id ? 'Enregistrer' : 'Créer l\'exercice'}
          </button>
          <button onClick={onClose} className="btn-secondary">Annuler</button>
        </div>
      </div>
    </div>
  )
}

// ── Page principale ──────────────────────────────────────────────────
export default function ExerciseLibrary() {
  const navigate      = useNavigate()
  const [exercises, setExercises]     = useState([])
  const [loading, setLoading]         = useState(true)
  const [manuals, setManuals]         = useState([])
  const [importing, setImporting]     = useState(false)
  const [importCount, setImportCount] = useState(null)
  const [modal, setModal]             = useState(null) // null | 'new' | exercise object
  const [search, setSearch]           = useState('')
  const [filterDomain, setFilterDomain] = useState('')
  const [filterLevel,  setFilterLevel]  = useState('')
  const [filterType,   setFilterType]   = useState('')
  const [showFilters, setShowFilters]   = useState(false)
  const [copied, setCopied]             = useState(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const [exList, manList] = await Promise.all([getAllExercises(), getAllManuals()])
    setExercises(exList)
    setManuals(manList)
    setLoading(false)
  }

  async function handleDelete(id) {
    if (!confirm('Supprimer cet exercice ?')) return
    await deleteExercise(id)
    setExercises(prev => prev.filter(e => e.id !== id))
  }

  async function handleSave(ex) {
    const saved = await saveExercise({ ...ex, id: ex.id || crypto.randomUUID() })
    setExercises(prev => {
      const idx = prev.findIndex(e => e.id === saved.id)
      return idx >= 0 ? prev.map(e => e.id === saved.id ? saved : e) : [saved, ...prev]
    })
  }

  async function handleImport(manualId) {
    const manual = manuals.find(m => m.manualId === manualId)
    if (!manual) return
    setImporting(true)
    const added = await importExercisesFromManual(manual)
    setImportCount(added.length)
    await load()
    setImporting(false)
    setTimeout(() => setImportCount(null), 4000)
  }

  function handleCopy(ex) {
    const text = `Question : ${ex.question}\n${ex.hint ? `Indice : ${ex.hint}\n` : ''}${ex.answer ? `Correction : ${ex.answer}` : ''}`
    navigator.clipboard.writeText(text).then(() => {
      setCopied(ex.id)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  // Valeurs uniques pour les filtres
  const uniqueDomains = useMemo(() => [...new Set(exercises.map(e => e.domain).filter(Boolean))], [exercises])
  const uniqueLevels  = useMemo(() => [...new Set(exercises.map(e => e.level).filter(Boolean))],  [exercises])
  const uniqueTypes   = useMemo(() => [...new Set(exercises.map(e => e.type).filter(Boolean))],   [exercises])

  const filtered = useMemo(() => {
    return exercises.filter(ex => {
      if (filterDomain && ex.domain !== filterDomain) return false
      if (filterLevel  && ex.level  !== filterLevel)  return false
      if (filterType   && ex.type   !== filterType)   return false
      if (search.trim()) {
        const q = search.toLowerCase()
        const hay = `${ex.question} ${ex.tags?.join(' ')} ${ex.domain} ${ex.level} ${ex.manualTitle}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [exercises, search, filterDomain, filterLevel, filterType])

  const hasFilters = search || filterDomain || filterLevel || filterType

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      {/* En-tête */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/tableau-bord')} className="btn-ghost p-2">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Library size={26} className="text-brand" /> Bibliothèque d'exercices
            </h1>
            <p className="text-gray-500 mt-1">{exercises.length} exercice{exercises.length > 1 ? 's' : ''} sauvegardé{exercises.length > 1 ? 's' : ''}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Import depuis un manuel */}
          {manuals.length > 0 && (
            <div className="relative">
              <select
                defaultValue=""
                onChange={e => { if (e.target.value) handleImport(e.target.value); e.target.value = '' }}
                className="form-select text-sm pr-8 appearance-none"
                disabled={importing}
              >
                <option value="" disabled>Importer depuis un manuel…</option>
                {manuals.map(m => (
                  <option key={m.manualId} value={m.manualId}>{m.title}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          )}

          <button onClick={() => setModal('new')} className="btn-primary text-sm">
            <Plus size={15} /> Créer un exercice
          </button>
        </div>
      </div>

      {/* Feedback import */}
      {importCount !== null && (
        <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 flex items-center gap-2 animate-slide-up">
          <CheckCircle size={16} />
          {importCount > 0
            ? `${importCount} exercice${importCount > 1 ? 's' : ''} importé${importCount > 1 ? 's' : ''} depuis le manuel.`
            : 'Aucun exercice trouvé dans ce manuel.'}
        </div>
      )}

      {/* Recherche + filtres */}
      {exercises.length > 0 && (
        <div className="mb-6 space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher dans les exercices…"
                className="form-input pl-9 pr-9"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-secondary text-sm shrink-0 ${showFilters ? 'bg-brand text-white border-brand' : ''}`}
            >
              <Filter size={14} /> Filtres
            </button>
          </div>

          {showFilters && (
            <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-xl animate-slide-up">
              {[
                { label: 'Tous les domaines', value: filterDomain, set: setFilterDomain, options: uniqueDomains },
                { label: 'Tous les niveaux',  value: filterLevel,  set: setFilterLevel,  options: uniqueLevels },
                { label: 'Tous les types',    value: filterType,   set: setFilterType,   options: uniqueTypes },
              ].map(f => (
                <div key={f.label} className="relative">
                  <select value={f.value} onChange={e => f.set(e.target.value)} className="form-select text-sm pr-7 appearance-none">
                    <option value="">{f.label}</option>
                    {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              ))}
              {hasFilters && (
                <button onClick={() => { setSearch(''); setFilterDomain(''); setFilterLevel(''); setFilterType('') }}
                  className="btn-ghost text-xs text-red-500 py-1">
                  <X size={12} /> Effacer
                </button>
              )}
            </div>
          )}

          {hasFilters && (
            <p className="text-sm text-gray-500">{filtered.length} résultat{filtered.length > 1 ? 's' : ''}</p>
          )}
        </div>
      )}

      {/* Grille d'exercices */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Chargement…</div>
      ) : exercises.length === 0 ? (
        <div className="text-center py-20">
          <Library size={40} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Bibliothèque vide</h2>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            Créez des exercices manuellement ou importez-les depuis un manuel existant.
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <button onClick={() => setModal('new')} className="btn-primary">
              <Plus size={15} /> Créer un exercice
            </button>
            {manuals.length > 0 && (
              <select
                defaultValue=""
                onChange={e => { if (e.target.value) handleImport(e.target.value); e.target.value = '' }}
                className="form-select text-sm"
              >
                <option value="" disabled>Importer depuis un manuel…</option>
                {manuals.map(m => <option key={m.manualId} value={m.manualId}>{m.title}</option>)}
              </select>
            )}
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Search size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">Aucun exercice ne correspond à votre recherche.</p>
          <button onClick={() => { setSearch(''); setFilterDomain(''); setFilterLevel(''); setFilterType('') }}
            className="btn-secondary text-sm mt-3">
            <X size={14} /> Effacer les filtres
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(ex => (
            <ExerciseCard
              key={ex.id}
              ex={{ ...ex, _copied: copied === ex.id }}
              onDelete={handleDelete}
              onCopy={handleCopy}
              onEdit={(e) => setModal(e)}
            />
          ))}
        </div>
      )}

      {/* Modale */}
      {modal && (
        <ExerciseModal
          exercise={modal === 'new' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
