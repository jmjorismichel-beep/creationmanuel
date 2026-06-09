import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { getManual } from '../lib/db.js'
import ManualPreview from '../components/ManualPreview.jsx'

export default function Preview() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const [manual, setManual] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      getManual(id).then(m => {
        setManual(m || null)
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [id])

  if (loading) return <div className="text-center py-20 text-gray-400">Chargement…</div>

  if (!manual) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <p className="text-gray-500 mb-4">Manuel introuvable.</p>
      <button onClick={() => navigate('/tableau-bord')} className="btn-secondary">
        Retour au tableau de bord
      </button>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-6 no-print">
        <button onClick={() => navigate(-1)} className="btn-ghost p-2">
          <ArrowLeft size={18} />
        </button>
        <span className="text-sm text-gray-500">Aperçu du manuel</span>
      </div>
      <ManualPreview
        manual={manual}
        onEdit={() => navigate(`/editeur/${manual.manualId}`)}
      />
    </div>
  )
}
