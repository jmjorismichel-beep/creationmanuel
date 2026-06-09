import React, { useState } from 'react'
import { Eye, SplitSquareHorizontal } from 'lucide-react'

function highlightDiff(original, revised) {
  // Simple diff : découpe en phrases et compare
  const origSentences = original.split(/(?<=[.!?])\s+/)
  const newSentences  = revised.split(/(?<=[.!?])\s+/)
  const added = newSentences.filter(s => !origSentences.includes(s))
  return { origSentences, newSentences, added }
}

export default function DiffViewer({ original, revised }) {
  const [mode, setMode] = useState('split') // 'split' | 'unified'

  if (!original && !revised) return null

  const { newSentences, added } = highlightDiff(original, revised)

  const renderRevised = () =>
    newSentences.map((sentence, i) => (
      <span
        key={i}
        className={added.includes(sentence) ? 'bg-green-100 text-green-900 rounded px-0.5' : ''}
      >
        {sentence}{i < newSentences.length - 1 ? ' ' : ''}
      </span>
    ))

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      {/* Barre outils */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-100">
        <span className="text-xs font-semibold text-gray-600">Comparaison avant / après</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMode('split')}
            className={`p-1.5 rounded text-xs flex items-center gap-1 transition-colors ${mode === 'split' ? 'bg-brand text-white' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <SplitSquareHorizontal size={13} /> Côte à côte
          </button>
          <button
            onClick={() => setMode('unified')}
            className={`p-1.5 rounded text-xs flex items-center gap-1 transition-colors ${mode === 'unified' ? 'bg-brand text-white' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Eye size={13} /> Après seulement
          </button>
        </div>
      </div>

      {mode === 'split' ? (
        <div className="grid grid-cols-2 divide-x divide-gray-100">
          {/* Avant */}
          <div className="p-4">
            <div className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-300 inline-block" />
              Avant
            </div>
            <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed line-clamp-[20]">
              {original || '(vide)'}
            </p>
          </div>
          {/* Après */}
          <div className="p-4">
            <div className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
              Après
            </div>
            <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
              {renderRevised()}
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4">
          <div className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
            Version proposée
          </div>
          <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
            {renderRevised()}
          </p>
          <div className="mt-3 text-xs text-gray-400">
            <span className="bg-green-100 text-green-900 rounded px-1 py-0.5">Texte surligné</span> = ajouts détectés
          </div>
        </div>
      )}
    </div>
  )
}
