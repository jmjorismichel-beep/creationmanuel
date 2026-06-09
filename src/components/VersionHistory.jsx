import React, { useState, useEffect } from 'react'
import { History, RotateCcw, ChevronDown, ChevronUp, Clock } from 'lucide-react'
import { getVersions, restoreVersion, saveVersion } from '../lib/db.js'

function formatDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const TYPE_LABELS = {
  'Sauvegarde manuelle':    { color: 'bg-blue-100 text-blue-700',   icon: '💾' },
  'Génération initiale':    { color: 'bg-green-100 text-green-700', icon: '✨' },
  'Modification IA':        { color: 'bg-purple-100 text-purple-700', icon: '🤖' },
  'Import':                 { color: 'bg-orange-100 text-orange-700', icon: '📥' },
  default:                  { color: 'bg-gray-100 text-gray-600',   icon: '📝' },
}

function VersionBadge({ type }) {
  const { color, icon } = TYPE_LABELS[type] || TYPE_LABELS.default
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>
      {icon} {type}
    </span>
  )
}

export default function VersionHistory({ manualId, currentManual, onRestore }) {
  const [versions, setVersions] = useState([])
  const [loading, setLoading]   = useState(true)
  const [open, setOpen]         = useState(false)
  const [restoring, setRestoring] = useState(null)
  const [expanded, setExpanded]   = useState(null)

  useEffect(() => {
    if (!manualId) return
    loadVersions()
  }, [manualId])

  const loadVersions = async () => {
    setLoading(true)
    try {
      const v = await getVersions(manualId)
      setVersions(v.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = async (version) => {
    if (!confirm(`Restaurer la version du ${formatDate(version.createdAt)} ?\nLes modifications non sauvegardées seront perdues.`)) return
    setRestoring(version.id)
    try {
      await saveVersion(manualId, 'Sauvegarde avant restauration', currentManual)
      onRestore(version.data)
      await loadVersions()
    } finally {
      setRestoring(null)
    }
  }

  const handleUndoLast = async () => {
    if (versions.length < 2) {
      alert('Aucune version précédente disponible.')
      return
    }
    const previous = versions[1] // Le plus récent est [0], le précédent est [1]
    await handleRestore(previous)
  }

  return (
    <div className="card">
      {/* En-tête cliquable */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-left"
      >
        <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <History size={18} className="text-brand" />
          Historique des versions
          {versions.length > 0 && (
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
              {versions.length}
            </span>
          )}
        </h2>
        <div className="flex items-center gap-2">
          {versions.length >= 2 && (
            <button
              onClick={e => { e.stopPropagation(); handleUndoLast() }}
              className="btn-ghost text-xs py-1 text-gray-500 hover:text-brand"
              title="Annuler la dernière modification"
            >
              <RotateCcw size={13} /> Annuler la dernière
            </button>
          )}
          {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </button>

      {open && (
        <div className="mt-4 animate-slide-up">
          {loading ? (
            <p className="text-sm text-gray-400 text-center py-4">Chargement…</p>
          ) : versions.length === 0 ? (
            <div className="text-center py-6 text-sm text-gray-400">
              <Clock size={28} className="mx-auto mb-2 opacity-40" />
              Aucune version sauvegardée.
              <br />Les sauvegardes apparaîtront ici.
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {versions.map((v, i) => (
                <div
                  key={v.id}
                  className={`rounded-xl border transition-colors ${
                    i === 0 ? 'border-brand/30 bg-brand/5' : 'border-gray-100 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <VersionBadge type={v.description || 'Sauvegarde manuelle'} />
                          {i === 0 && (
                            <span className="text-xs text-brand font-semibold">Actuelle</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                          <Clock size={11} /> {formatDate(v.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <button
                        onClick={() => setExpanded(expanded === v.id ? null : v.id)}
                        className="btn-ghost text-xs py-1"
                      >
                        {expanded === v.id ? 'Masquer' : 'Aperçu'}
                      </button>
                      {i > 0 && (
                        <button
                          onClick={() => handleRestore(v)}
                          disabled={restoring === v.id}
                          className="btn-secondary text-xs py-1"
                        >
                          {restoring === v.id ? '…' : <><RotateCcw size={12} /> Restaurer</>}
                        </button>
                      )}
                    </div>
                  </div>

                  {expanded === v.id && v.data && (
                    <div className="px-4 pb-3 border-t border-gray-100 mt-1 pt-3">
                      <p className="text-xs text-gray-600 font-medium mb-1">
                        Titre : {v.data.title || '—'}
                      </p>
                      <p className="text-xs text-gray-400">
                        Chapitres : {v.data.chapters?.length || 0} —
                        Mots estimés : {v.data.estimatedWords || '—'}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
