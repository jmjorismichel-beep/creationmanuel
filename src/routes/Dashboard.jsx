import React, { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, BookOpen, Trash2, Copy, Eye, Edit3, Calendar, FileText,
         Search, X, ChevronDown, Filter, SortAsc, SortDesc, Library } from 'lucide-react'
import { getAllManuals, deleteManual, duplicateManual } from '../lib/db.js'
import { DOMAINS, LEVELS } from '../lib/manualSchema.js'

// ── Carte manuelle ────────────────────────────────────────────────────
function ManualCard({ manual, onDelete, onDuplicate }) {
  const navigate  = useNavigate()
  const updatedAt = manual.updatedAt
    ? new Date(manual.updatedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—'

  const statusColors = {
    brouillon:  'bg-gray-100 text-gray-500',
    'en-cours': 'bg-amber-100 text-amber-600',
    terminé:    'bg-green-100 text-green-600',
  }

  const domainColors = {
    'Bureautique': 'bg-sky-50 text-sky-600',
    'Numérique':   'bg-purple-50 text-purple-600',
    'Français langue étrangère': 'bg-blue-50 text-blue-600',
    'Mathématiques': 'bg-orange-50 text-orange-600',
    'Industrie':   'bg-stone-100 text-stone-600',
  }

  return (
    <div className="card group flex flex-col gap-4 hover:shadow-md transition-shadow">
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

      {/* Tags domaine / niveau */}
      <div className="flex flex-wrap gap-1.5">
        {manual.domain && (
          <span className={`text-xs px-2 py-0.5 rounded-full ${domainColors[manual.domain] || 'bg-gray-100 text-gray-500'}`}>
            {manual.domain}
          </span>
        )}
        {manual.level && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">
            {manual.level}
          </span>
        )}
      </div>

      <div className="text-xs text-gray-400 space-y-1">
        <div className="flex items-center gap-1.5">
          <Edit3 size={11} /> Modifié le {updatedAt}
        </div>
        {manual.estimatedPages && (
          <div className="flex items-center gap-1.5">
            <FileText size={11} /> {manual.estimatedPages} p. · {manual.chapters?.length || 0} chapitres
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-50">
        <button onClick={() => navigate(`/editeur/${manual.manualId}`)} className="btn-ghost text-xs py-1.5 flex-1 justify-center">
          <Edit3 size={13} /> Modifier
        </button>
        <button onClick={() => navigate(`/apercu/${manual.manualId}`)} className="btn-ghost text-xs py-1.5 flex-1 justify-center">
          <Eye size={13} /> Aperçu
        </button>
        <button onClick={() => onDuplicate(manual.manualId)} className="btn-ghost text-xs py-1.5" title="Dupliquer">
          <Copy size={13} />
        </button>
        <button onClick={() => onDelete(manual.manualId)} className="btn-ghost text-xs py-1.5 hover:text-red-500" title="Supprimer">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}

// ── Composant principal ───────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate()
  const [manuals, setManuals]   = useState([])
  const [loading, setLoading]   = useState(true)

  // Recherche & filtres
  const [search,      setSearch]      = useState('')
  const [filterDomain,setFilterDomain]= useState('')
  const [filterLevel, setFilterLevel] = useState('')
  const [filterStatus,setFilterStatus]= useState('')
  const [sortBy,      setSortBy]      = useState('updatedAt') // updatedAt | createdAt | title
  const [sortDir,     setSortDir]     = useState('desc')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => { loadManuals() }, [])

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

  // Domaines et niveaux uniques présents
  const uniqueDomains = useMemo(() => [...new Set(manuals.map(m => m.domain).filter(Boolean))], [manuals])
  const uniqueLevels  = useMemo(() => [...new Set(manuals.map(m => m.level).filter(Boolean))],  [manuals])

  // Filtrage + tri
  const filtered = useMemo(() => {
    let list = [...manuals]

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(m =>
        (m.title || '').toLowerCase().includes(q) ||
        (m.subtitle || '').toLowerCase().includes(q) ||
        (m.domain || '').toLowerCase().includes(q) ||
        (m.targetAudience || '').toLowerCase().includes(q)
      )
    }
    if (filterDomain) list = list.filter(m => m.domain === filterDomain)
    if (filterLevel)  list = list.filter(m => m.level  === filterLevel)
    if (filterStatus) list = list.filter(m => m.status === filterStatus)

    list.sort((a, b) => {
      let va = a[sortBy] || ''
      let vb = b[sortBy] || ''
      if (sortBy === 'title') {
        va = va.toLowerCase(); vb = vb.toLowerCase()
        return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
      }
      return sortDir === 'asc'
        ? new Date(va) - new Date(vb)
        : new Date(vb) - new Date(va)
    })

    return list
  }, [manuals, search, filterDomain, filterLevel, filterStatus, sortBy, sortDir])

  const hasActiveFilters = search || filterDomain || filterLevel || filterStatus

  const clearFilters = () => {
    setSearch(''); setFilterDomain(''); setFilterLevel(''); setFilterStatus('')
  }

  // Stats globales
  const stats = useMemo(() => ({
    total:    manuals.length,
    termine:  manuals.filter(m => m.status === 'terminé').length,
    brouillon:manuals.filter(m => m.status === 'brouillon').length,
    pages:    manuals.reduce((s, m) => s + (parseInt(m.estimatedPages) || 0), 0),
  }), [manuals])

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      {/* En-tête */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-500 mt-1">
            {manuals.length > 0 ? `${manuals.length} manuel${manuals.length > 1 ? 's' : ''} sauvegardé${manuals.length > 1 ? 's' : ''}` : 'Aucun manuel encore'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/bibliotheque')} className="btn-secondary text-sm">
            <Library size={15} /> Bibliothèque d'exercices
          </button>
          <Link to="/generateur" className="btn-primary">
            <Plus size={16} /> Nouveau manuel
          </Link>
        </div>
      </div>

      {/* Stats */}
      {manuals.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Manuels', value: stats.total, color: 'text-brand' },
            { label: 'Terminés', value: stats.termine, color: 'text-green-600' },
            { label: 'Brouillons', value: stats.brouillon, color: 'text-amber-500' },
            { label: 'Pages totales', value: stats.pages, color: 'text-purple-600' },
          ].map(s => (
            <div key={s.label} className="card text-center py-4">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Barre de recherche */}
      {manuals.length > 0 && (
        <div className="mb-5 space-y-3">
          <div className="flex gap-2">
            {/* Recherche */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher par titre, domaine, public…"
                className="form-input pl-9 pr-9"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Bouton filtres */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-secondary text-sm shrink-0 ${showFilters ? 'bg-brand text-white border-brand' : ''}`}
            >
              <Filter size={14} />
              Filtres
              {hasActiveFilters && !search && (
                <span className="w-2 h-2 rounded-full bg-brand ml-1 inline-block" />
              )}
            </button>

            {/* Tri */}
            <div className="relative shrink-0">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="form-select text-sm pr-7 appearance-none"
              >
                <option value="updatedAt">Modifié</option>
                <option value="createdAt">Créé</option>
                <option value="title">Titre A→Z</option>
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            <button
              onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
              className="btn-ghost p-2 shrink-0"
              title={sortDir === 'desc' ? 'Plus récent en premier' : 'Plus ancien en premier'}
            >
              {sortDir === 'desc' ? <SortDesc size={16} /> : <SortAsc size={16} />}
            </button>
          </div>

          {/* Filtres dépliables */}
          {showFilters && (
            <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-xl animate-slide-up">
              {/* Domaine */}
              <div className="relative">
                <select
                  value={filterDomain}
                  onChange={e => setFilterDomain(e.target.value)}
                  className="form-select text-sm pr-7 appearance-none"
                >
                  <option value="">Tous les domaines</option>
                  {uniqueDomains.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              {/* Niveau */}
              <div className="relative">
                <select
                  value={filterLevel}
                  onChange={e => setFilterLevel(e.target.value)}
                  className="form-select text-sm pr-7 appearance-none"
                >
                  <option value="">Tous les niveaux</option>
                  {uniqueLevels.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              {/* Statut */}
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="form-select text-sm pr-7 appearance-none"
                >
                  <option value="">Tous les statuts</option>
                  <option value="brouillon">Brouillon</option>
                  <option value="en-cours">En cours</option>
                  <option value="terminé">Terminé</option>
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              {hasActiveFilters && (
                <button onClick={clearFilters} className="btn-ghost text-xs text-red-500 hover:text-red-600 py-1">
                  <X size={12} /> Effacer les filtres
                </button>
              )}
            </div>
          )}

          {/* Résultat de recherche */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{filtered.length} résultat{filtered.length > 1 ? 's' : ''}</span>
              {filtered.length !== manuals.length && (
                <button onClick={clearFilters} className="text-brand hover:underline text-xs">
                  Tout afficher
                </button>
              )}
            </div>
          )}
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
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Search size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 mb-2">Aucun manuel ne correspond à votre recherche.</p>
          <button onClick={clearFilters} className="btn-secondary text-sm mt-2">
            <X size={14} /> Effacer les filtres
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(m => (
            <ManualCard key={m.manualId} manual={m} onDelete={handleDelete} onDuplicate={handleDuplicate} />
          ))}
        </div>
      )}
    </div>
  )
}
