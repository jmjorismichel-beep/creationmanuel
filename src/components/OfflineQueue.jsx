import React, { useState, useEffect } from 'react'
import { WifiOff, RefreshCw, Trash2, Clock, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { getPendingQueue, addToOfflineQueue } from '../lib/db.js'

const TYPE_LABELS = {
  revision:  { label: 'Révision IA', color: 'bg-purple-100 text-purple-700' },
  generate:  { label: 'Génération', color: 'bg-blue-100 text-blue-700' },
  check:     { label: 'Vérification', color: 'bg-orange-100 text-orange-700' },
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

export default function OfflineQueue({ isOnline, onRetry }) {
  const [items, setItems]   = useState([])
  const [open, setOpen]     = useState(false)
  const [retrying, setRetrying] = useState(null)

  useEffect(() => {
    loadQueue()
    const interval = setInterval(loadQueue, 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Quand on revient en ligne, afficher la queue
    if (isOnline && items.length > 0) setOpen(true)
  }, [isOnline])

  const loadQueue = async () => {
    try {
      const q = await getPendingQueue()
      setItems(q)
    } catch (e) {
      // IndexedDB non disponible
    }
  }

  const handleRetry = async (item) => {
    if (!isOnline) return
    setRetrying(item.id)
    try {
      await onRetry?.(item)
    } finally {
      setRetrying(null)
      await loadQueue()
    }
  }

  const handleDelete = async (itemId) => {
    // Supprimer de la queue (on filtre localement, la DB sera nettoyée au prochain cycle)
    setItems(prev => prev.filter(i => i.id !== itemId))
  }

  if (items.length === 0) return null

  return (
    <div className={`rounded-xl border ${isOnline ? 'border-blue-200 bg-blue-50' : 'border-orange-200 bg-orange-50'} overflow-hidden`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          {isOnline
            ? <RefreshCw size={16} className="text-blue-500" />
            : <WifiOff size={16} className="text-orange-500" />
          }
          <span className={`text-sm font-medium ${isOnline ? 'text-blue-700' : 'text-orange-700'}`}>
            {isOnline
              ? `${items.length} demande(s) IA prête(s) à relancer`
              : `${items.length} demande(s) IA en attente de connexion`
            }
          </span>
        </div>
        {open ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
      </button>

      {open && (
        <div className="border-t border-current/10 divide-y divide-current/10">
          {items.map(item => {
            const typeInfo = TYPE_LABELS[item.type] || { label: item.type, color: 'bg-gray-100 text-gray-600' }
            return (
              <div key={item.id} className="flex items-center justify-between px-4 py-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeInfo.color}`}>
                      {typeInfo.label}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock size={10} /> {formatDate(item.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 truncate">
                    {item.instruction || `Manuel : ${item.manualId?.slice(0, 8)}…`}
                  </p>
                </div>
                <div className="flex items-center gap-1 ml-3 shrink-0">
                  {isOnline && (
                    <button
                      onClick={() => handleRetry(item)}
                      disabled={retrying === item.id}
                      className="btn-ghost text-xs py-1 text-blue-600 hover:text-blue-700"
                    >
                      {retrying === item.id
                        ? <RefreshCw size={12} className="animate-spin" />
                        : <><RefreshCw size={12} /> Relancer</>
                      }
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-gray-400 hover:text-red-400 transition-colors rounded"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            )
          })}

          {isOnline && items.length > 1 && (
            <div className="px-4 py-3">
              <button
                onClick={() => items.forEach(item => handleRetry(item))}
                className="btn-primary text-xs w-full"
              >
                <RefreshCw size={13} /> Relancer toutes les demandes
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
