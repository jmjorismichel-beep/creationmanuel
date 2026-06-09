import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, BookOpen, Trash2, Copy, Eye, Edit3, Calendar, FileText } from 'lucide-react'
import { getAllManuals, deleteManual, duplicateManual } from '../lib/db.js'

function ManualCard({ manual, onDelete, onDuplicate }) {
  const navigate = useNavigate()
  const updatedAt = manual.updatedAt
    ? new Date(manual.updatedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—'
  const createdAt = manual.createdAt
    ? new Date(manual.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—'

  const statusColors = {
    brouillon:  'bg-gray-100 text-gray-500',
    'en-cours': 'bg-amber-100 text-amber-600',
    terminé:    'bg-green-100 text-green-600',
  }

  return (
    <div className="card group flex flex-col gap-4">
      {/* Icône + titre */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center shrink-0">
          <BookOpen size={18} className="text-brand" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{manual.title || 'Manuel sans titre'}</h3>
          {manual.subtitle && <p className="text-sm text-gray-400 truncate">{manual.subtitle}</p>}
        </div>
        {manual.status && (
          <span className={`badge text-xs shrink-0 ${statusColors[manual.status] || 'bg-gray-100 text-gray-500'}`}>
            {manual.status}
          </span>
        )}
      </div>

      {/* Métadonnées */}
      <div className="text-xs text-gray-400 space-y-1">
        <div className="flex items-center gap-1.5">
          <Calendar size={11} /> Créé le {createdAt}
        </div>
        <div className="flex items-center gap-1.5">
          <Edit3 size={11} /> Modifié le {updatedAt}
        </div>
        {manual.estimatedPages && (
          <div className="flex items-center gap-1.5">
            <FileText size={11} /> {manual.estimatedPages} pages · {manual.chapters?.length || 0} chapitres
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-50">
        <button
          onClick={() => navigate(`/editeur/${manual.manualId}`)}
          className="btn-ghost text-xs py-1.5 flex-1 justify-center"
        >
          <Edit3 size={13} /> Modifier
        </button>
        <button
          onClick={() => navigate(`/apercu/${manual.manualId}`)}
          className="btn-ghost text-xs py-1.5 flex-1 justify-center"
        >
          <Eye size={13} /> Aperçu
        </button>
        <button
          onClick={() => onDuplicate(manual.manualId)}
          className="btn-ghost text-xs py-1.5"
          title="Dupliquer"
        >
          <Copy size={13} />
        </button>
        <button
          onClick={() => onDelete(manual.manualId)}
          className="btn-ghost text-xs py-1.5 hover:text-red-500"
          title="Supprimer"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [manuals, setManuals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadManuals()
  }, [])

  async function loadManuals() {
    setLoading(true)
    const list = await getAllManuals()
    setManuals(list)
    setLoading(false)
  }

  async function handleDelete(id) {
    if (!confirm('Supprimer ce manuel définitivement ?')) return
    await deleteManual(id)
    loadManuals()
  }

  async function handleDuplicate(id) {
    await duplicateManual(id)
    loadManuals()
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-500 mt-1">Vos manuels sauvegardés localement.</p>
        </div>
        <Link to="/generateur" className="btn-primary">
          <Plus size={16} /> Nouveau manuel
        </Link>
      </div>

      {/* Statistiques rapides */}
      {manuals.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Manuels', value: manuals.length },
            { label: 'Terminés', value: manuals.filter(m => m.status === 'terminé').length },
            { label: 'Brouillons', value: manuals.filter(m => m.status === 'brouillon').length },
            { label: 'Pages totales', value: manuals.reduce((s, m) => s + (m.estimatedPages || 0), 0) },
          ].map(stat => (
            <div key={stat.label} className="card text-center py-4">
              <div className="text-2xl font-bold text-brand">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Liste */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Chargement…</div>
      ) : manuals.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen size={28} className="text-gray-300" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Aucun manuel pour l'instant</h2>
          <p className="text-gray-500 mb-6">Créez votre premier manuel pédagogique en quelques minutes.</p>
          <Link to="/generateur" className="btn-primary">
            <Plus size={16} /> Créer mon premier manuel
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {manuals.map(m => (
            <ManualCard key={m.manualId} manual={m} onDelete={handleDelete} onDuplicate={handleDuplicate} />
          ))}
        </div>
      )}
    </div>
  )
}
