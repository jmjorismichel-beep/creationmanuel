import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Save, Eye, ArrowLeft, Plus, Trash2, ChevronDown, ChevronUp, Edit3, ShieldCheck, Loader2 } from 'lucide-react'
import { getManual, saveManual, saveVersion } from '../lib/db.js'
import { applyRevisionToManual, checkManualConsistency } from '../lib/manualUtils.js'
import ExportButtons from '../components/ExportButtons.jsx'
import RevisionAssistant from '../components/RevisionAssistant.jsx'
import VersionHistory from '../components/VersionHistory.jsx'
import OnlineStatus from '../components/OnlineStatus.jsx'
import OfflineQueue from '../components/OfflineQueue.jsx'

function SectionEditor({ section, onChange, onDelete }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden mb-2">
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 cursor-pointer" onClick={() => setOpen(!open)}>
        <span className="text-sm font-medium text-gray-700 truncate">{section.title || 'Section sans titre'}</span>
        <div className="flex items-center gap-1">
          <button
            onClick={e => { e.stopPropagation(); onDelete(section.id) }}
            className="p-1 text-gray-400 hover:text-red-400 transition-colors rounded"
            title="Supprimer"
          >
            <Trash2 size={13} />
          </button>
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </div>
      {open && (
        <div className="p-4 space-y-3 animate-slide-up">
          <div>
            <label className="form-label text-xs">Titre de la section</label>
            <input
              type="text" value={section.title} className="form-input text-sm"
              onChange={e => onChange(section.id, 'title', e.target.value)}
            />
          </div>
          <div>
            <label className="form-label text-xs">Contenu</label>
            <textarea
              rows={8} value={section.content} className="form-input text-sm resize-y"
              onChange={e => onChange(section.id, 'content', e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function ChapterEditorBlock({ chapter, onChange, onDelete, onAddSection }) {
  const [open, setOpen] = useState(false)

  const updateSection = (sectionId, field, value) => {
    const sections = chapter.sections.map(s => s.id === sectionId ? { ...s, [field]: value } : s)
    onChange(chapter.id, 'sections', sections)
  }

  const deleteSection = (sectionId) => {
    onChange(chapter.id, 'sections', chapter.sections.filter(s => s.id !== sectionId))
  }

  return (
    <div className="card mb-4">
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setOpen(!open)}>
        <h3 className="font-semibold text-gray-900">
          Ch. {chapter.order} — {chapter.title}
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={e => { e.stopPropagation(); onDelete(chapter.id) }}
            className="p-1.5 text-gray-400 hover:text-red-400 transition-colors rounded-lg"
            title="Supprimer ce chapitre"
          >
            <Trash2 size={14} />
          </button>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {open && (
        <div className="mt-4 space-y-4 animate-slide-up">
          <div>
            <label className="form-label">Titre du chapitre</label>
            <input
              type="text" value={chapter.title} className="form-input"
              onChange={e => onChange(chapter.id, 'title', e.target.value)}
            />
          </div>
          <div>
            <label className="form-label">Introduction du chapitre</label>
            <textarea
              rows={3} value={chapter.introduction} className="form-input resize-y"
              onChange={e => onChange(chapter.id, 'introduction', e.target.value)}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="form-label mb-0">Sections</label>
              <button onClick={() => onAddSection(chapter.id)} className="btn-ghost text-xs py-1">
                <Plus size={13} /> Ajouter une section
              </button>
            </div>
            {chapter.sections?.map(s => (
              <SectionEditor
                key={s.id}
                section={s}
                onChange={updateSection}
                onDelete={deleteSection}
              />
            ))}
          </div>
          <div>
            <label className="form-label">Résumé du chapitre</label>
            <textarea
              rows={3} value={chapter.summary} className="form-input resize-y"
              onChange={e => onChange(chapter.id, 'summary', e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default function Editor() {
  const { id }   = useParams()
  const navigate = useNavigate()

  const [manual, setManual]       = useState(null)
  const [loading, setLoading]     = useState(true)
  const [saved, setSaved]         = useState(false)
  const [isOnline, setIsOnline]   = useState(navigator.onLine)
  const [checking, setChecking]   = useState(false)
  const [checkAlerts, setCheckAlerts] = useState([])
  const [showCheck, setShowCheck] = useState(false)
  const [activeTab, setActiveTab] = useState('edit') // 'edit' | 'assist' | 'history'

  useEffect(() => {
    const on  = () => setIsOnline(true)
    const off = () => setIsOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  useEffect(() => {
    if (id) {
      getManual(id).then(m => {
        if (m) setManual(m)
        else navigate('/tableau-bord')
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [id])

  const update = (field, value) => {
    setManual(prev => ({ ...prev, [field]: value, updatedAt: new Date().toISOString() }))
    setSaved(false)
  }

  const updateChapter = (chapterId, field, value) => {
    setManual(prev => ({
      ...prev,
      chapters: prev.chapters.map(c => c.id === chapterId ? { ...c, [field]: value } : c),
      updatedAt: new Date().toISOString(),
    }))
    setSaved(false)
  }

  const deleteChapter = (chapterId) => {
    if (!confirm('Supprimer ce chapitre ?')) return
    setManual(prev => ({ ...prev, chapters: prev.chapters.filter(c => c.id !== chapterId) }))
    setSaved(false)
  }

  const addChapter = () => {
    const newChapter = {
      id: crypto.randomUUID(),
      order: (manual.chapters?.length || 0) + 1,
      title: `Nouveau chapitre`,
      introduction: '',
      sections: [],
      reminderTables: [],
      exercises: [],
      corrections: [],
      summary: '',
    }
    setManual(prev => ({ ...prev, chapters: [...(prev.chapters || []), newChapter] }))
    setSaved(false)
  }

  const addSection = (chapterId) => {
    const newSection = {
      id: crypto.randomUUID(),
      order: 1,
      title: 'Nouvelle section',
      content: '',
      type: 'text',
    }
    setManual(prev => ({
      ...prev,
      chapters: prev.chapters.map(c =>
        c.id === chapterId
          ? { ...c, sections: [...(c.sections || []), newSection] }
          : c
      ),
    }))
    setSaved(false)
  }

  const handleSave = async () => {
    await saveVersion(manual.manualId, 'Sauvegarde manuelle', manual)
    await saveManual({ ...manual, updatedAt: new Date().toISOString() })
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleRevisionApply = (scope, data) => {
    setManual(prev => applyRevisionToManual(prev, scope, data))
    setSaved(false)
  }

  const handleRestore = (restoredManual) => {
    setManual(restoredManual)
    setSaved(false)
  }

  const handleCheck = () => {
    setChecking(true)
    setTimeout(() => {
      const alerts = checkManualConsistency(manual)
      setCheckAlerts(alerts)
      setShowCheck(true)
      setChecking(false)
    }, 400)
  }

  if (loading) return <div className="text-center py-20 text-gray-400">Chargement…</div>

  if (!manual) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <p className="text-gray-500 mb-4">Aucun manuel sélectionné.</p>
      <button onClick={() => navigate('/tableau-bord')} className="btn-secondary">
        Retour au tableau de bord
      </button>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">

      {/* Statut en ligne */}
      <div className="mb-4">
        <OnlineStatus />
      </div>

      {/* File d'attente hors ligne */}
      <div className="mb-4">
        <OfflineQueue isOnline={isOnline} />
      </div>

      {/* En-tête */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/tableau-bord')} className="btn-ghost p-2">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Edit3 size={22} className="text-brand" /> Éditeur
            </h1>
            <p className="text-sm text-gray-400 truncate max-w-xs">{manual.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {saved && <span className="text-sm text-green-600 font-medium">✓ Sauvegardé</span>}
          <ExportButtons manual={manual} />
          <button onClick={handleSave} className="btn-primary text-sm">
            <Save size={14} /> Sauvegarder
          </button>
          <button onClick={() => navigate(`/apercu/${manual.manualId}`)} className="btn-secondary text-sm">
            <Eye size={14} /> Aperçu
          </button>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {[
          { key: 'edit',    label: 'Édition' },
          { key: 'assist',  label: 'Assistant IA' },
          { key: 'history', label: 'Historique' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-brand shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── ONGLET ÉDITION ─── */}
      {activeTab === 'edit' && (
        <>
          {/* Informations générales */}
          <div className="card mb-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Informations générales</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Titre</label>
                <input type="text" value={manual.title} onChange={e => update('title', e.target.value)} className="form-input" />
              </div>
              <div>
                <label className="form-label">Sous-titre</label>
                <input type="text" value={manual.subtitle || ''} onChange={e => update('subtitle', e.target.value)} className="form-input" />
              </div>
              <div className="sm:col-span-2">
                <label className="form-label">Introduction</label>
                <textarea rows={5} value={manual.introduction || ''} onChange={e => update('introduction', e.target.value)} className="form-input resize-y" />
              </div>
              <div className="sm:col-span-2">
                <label className="form-label">Prérequis</label>
                <textarea rows={3} value={manual.prerequisites || ''} onChange={e => update('prerequisites', e.target.value)} className="form-input resize-y" />
              </div>
            </div>
          </div>

          {/* Vérification cohérence */}
          <div className="mb-6">
            <button
              onClick={handleCheck}
              disabled={checking}
              className="btn-secondary text-sm w-full"
            >
              {checking ? <><Loader2 size={14} className="animate-spin" /> Vérification…</> : <><ShieldCheck size={14} /> Vérifier la cohérence du manuel</>}
            </button>
            {showCheck && checkAlerts.length > 0 && (
              <div className="mt-3 space-y-2 animate-slide-up">
                {checkAlerts.map((a, i) => (
                  <div key={i} className={`text-sm px-4 py-2 rounded-lg flex items-start gap-2 ${
                    a.type === 'error'   ? 'bg-red-50 text-red-700' :
                    a.type === 'warning' ? 'bg-yellow-50 text-yellow-700' :
                    a.type === 'success' ? 'bg-green-50 text-green-700' :
                    'bg-blue-50 text-blue-700'
                  }`}>
                    <span>{a.type === 'error' ? '✗' : a.type === 'success' ? '✓' : '!'}</span>
                    {a.message}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Chapitres */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">Chapitres ({manual.chapters?.length || 0})</h2>
              <button onClick={addChapter} className="btn-secondary text-sm">
                <Plus size={14} /> Ajouter un chapitre
              </button>
            </div>
            {manual.chapters?.map(ch => (
              <ChapterEditorBlock
                key={ch.id}
                chapter={ch}
                onChange={updateChapter}
                onDelete={deleteChapter}
                onAddSection={addSection}
              />
            ))}
          </div>

          {/* Conclusion */}
          <div className="card mb-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Conclusion</h2>
            <textarea rows={5} value={manual.conclusion || ''} onChange={e => update('conclusion', e.target.value)} className="form-input resize-y" />
          </div>

          {/* Projet final */}
          <div className="card mb-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Projet final</h2>
            <textarea rows={5} value={manual.finalProject || ''} onChange={e => update('finalProject', e.target.value)} className="form-input resize-y" placeholder="Décrivez le projet final à réaliser par les apprenants…" />
          </div>

          {/* Bouton sauvegarde bas */}
          <div className="flex justify-end gap-3">
            <button onClick={handleSave} className="btn-primary">
              <Save size={15} /> Sauvegarder toutes les modifications
            </button>
          </div>
        </>
      )}

      {/* ─── ONGLET ASSISTANT IA ─── */}
      {activeTab === 'assist' && (
        <RevisionAssistant
          manual={manual}
          onApply={handleRevisionApply}
          isOnline={isOnline}
        />
      )}

      {/* ─── ONGLET HISTORIQUE ─── */}
      {activeTab === 'history' && (
        <VersionHistory
          manualId={manual.manualId}
          currentManual={manual}
          onRestore={handleRestore}
        />
      )}
    </div>
  )
}
