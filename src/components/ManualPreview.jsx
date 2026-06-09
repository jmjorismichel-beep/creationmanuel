import React, { useState } from 'react'
import { ChevronDown, ChevronUp, BookOpen, CheckSquare, ListOrdered, Pencil } from 'lucide-react'
import ExportButtons from './ExportButtons.jsx'

function SectionBlock({ section }) {
  return (
    <div className="mb-4">
      <h4 className="text-base font-semibold text-gray-800 mb-2">{section.title}</h4>
      <div className="manual-prose text-sm whitespace-pre-line">{section.content}</div>
    </div>
  )
}

function ReminderTable({ table }) {
  return (
    <div className="my-4 overflow-x-auto">
      <h5 className="text-sm font-semibold text-violet-700 mb-2">📋 {table.title}</h5>
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr>
            {table.headers?.map((h, i) => (
              <th key={i} className="bg-violet-50 border border-violet-100 px-3 py-2 text-left font-semibold text-violet-700">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows?.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? '' : 'bg-gray-50'}>
              {row.map((cell, j) => (
                <td key={j} className="border border-gray-100 px-3 py-2 text-gray-700">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ChapterBlock({ chapter }) {
  const [open, setOpen] = useState(true)

  return (
    <div className="mb-6 border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <h3 className="text-base font-semibold text-gray-900">
          Chapitre {chapter.order} — {chapter.title}
        </h3>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {open && (
        <div className="px-5 py-4 space-y-4">
          {chapter.introduction && (
            <p className="text-sm text-gray-600 italic border-l-4 border-brand/20 pl-4">{chapter.introduction}</p>
          )}

          {chapter.sections?.map(s => <SectionBlock key={s.id} section={s} />)}

          {chapter.reminderTables?.map(t => <ReminderTable key={t.id} table={t} />)}

          {chapter.exercises?.length > 0 && (
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-amber-700 mb-3 flex items-center gap-1.5">
                <Pencil size={14} /> Exercices
              </h4>
              {chapter.exercises.map(ex => (
                <div key={ex.id} className="mb-3">
                  <p className="text-sm font-medium text-gray-800">{ex.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 italic">{ex.instructions}</p>
                  <div className="text-sm text-gray-700 mt-2 whitespace-pre-line">{ex.content}</div>
                </div>
              ))}
            </div>
          )}

          {chapter.corrections?.length > 0 && (
            <div className="bg-green-50 border border-green-100 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-green-700 mb-3 flex items-center gap-1.5">
                <CheckSquare size={14} /> Corrections
              </h4>
              {chapter.corrections.map(corr => (
                <div key={corr.exerciseId} className="mb-3">
                  <p className="text-sm font-medium text-gray-800">{corr.title}</p>
                  <div className="text-sm text-gray-700 mt-1 whitespace-pre-line">{corr.content}</div>
                </div>
              ))}
            </div>
          )}

          {chapter.summary && (
            <div className="bg-violet-50 border border-violet-100 rounded-lg p-4">
              <div className="text-sm text-gray-700 whitespace-pre-line">{chapter.summary}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function ManualPreview({ manual, onEdit }) {
  if (!manual) return (
    <div className="text-center py-16 text-gray-400">
      <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
      <p>Aucun manuel à afficher.</p>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto">
      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 no-print">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{manual.title}</h1>
          {manual.subtitle && <p className="text-gray-500">{manual.subtitle}</p>}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {onEdit && (
            <button onClick={onEdit} className="btn-secondary text-sm">
              <Pencil size={14} /> Modifier
            </button>
          )}
          <ExportButtons manual={manual} />
        </div>
      </div>

      {/* Contenu */}
      <div id="manual-content" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-10 space-y-8">
        {/* Page de garde */}
        {manual.coverPage?.title && (
          <div className="text-center py-8 border-b border-gray-100">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-light text-brand rounded-full text-sm font-medium mb-6">
              <BookOpen size={14} /> Manuel pédagogique
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">{manual.coverPage.title}</h1>
            {manual.coverPage.subtitle && <p className="text-lg text-gray-500 mb-6">{manual.coverPage.subtitle}</p>}
            <div className="text-sm text-gray-500 space-y-1">
              {manual.coverPage.author       && <p><strong>Auteur :</strong> {manual.coverPage.author}</p>}
              {manual.coverPage.organization && <p><strong>Organisation :</strong> {manual.coverPage.organization}</p>}
              {manual.coverPage.date         && <p><strong>Date :</strong> {manual.coverPage.date}</p>}
              {manual.coverPage.version      && <p><strong>Version :</strong> {manual.coverPage.version}</p>}
            </div>
          </div>
        )}

        {/* Métadonnées */}
        <div className="flex flex-wrap gap-3">
          {manual.targetAudience && <span className="badge badge-violet">Public : {manual.targetAudience}</span>}
          {manual.level          && <span className="badge badge-violet">Niveau : {manual.level}</span>}
          {manual.domain         && <span className="badge badge-green">{manual.domain}</span>}
          {manual.estimatedPages && <span className="badge bg-gray-100 text-gray-700">{manual.estimatedPages} pages</span>}
        </div>

        {/* Sommaire */}
        {manual.tableOfContents?.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ListOrdered size={18} className="text-brand" /> Sommaire
            </h2>
            <div className="space-y-1">
              {manual.tableOfContents.map((item, i) => (
                <div key={i} className={`flex items-baseline justify-between text-sm ${item.level === 2 ? 'pl-5 text-gray-500' : 'text-gray-700'}`}>
                  <span>{item.title}</span>
                  <span className="ml-3 text-gray-400 tabular-nums">p. {item.page}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Introduction */}
        {manual.introduction && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Introduction</h2>
            <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{manual.introduction}</div>
          </div>
        )}

        {/* Prérequis */}
        {manual.prerequisites && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Prérequis</h2>
            <div className="text-sm text-gray-700 whitespace-pre-line">{manual.prerequisites}</div>
          </div>
        )}

        {/* Chapitres */}
        {manual.chapters?.map(chapter => (
          <ChapterBlock key={chapter.id} chapter={chapter} />
        ))}

        {/* Projet final */}
        {manual.finalProject && (
          <div className="border-2 border-brand/20 rounded-xl p-6 bg-violet-50">
            <h2 className="text-xl font-bold text-gray-900 mb-2">🎯 {manual.finalProject.title}</h2>
            <p className="text-sm text-gray-600 mb-3 whitespace-pre-line">{manual.finalProject.description}</p>
            <div className="text-sm text-gray-700 whitespace-pre-line">{manual.finalProject.instructions}</div>
            {manual.finalProject.evaluationCriteria?.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-semibold text-gray-800 mb-2">Critères d'évaluation :</p>
                <ul className="space-y-1">
                  {manual.finalProject.evaluationCriteria.map((c, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2"><span className="text-brand">✓</span>{c}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Conclusion */}
        {manual.conclusion && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Conclusion</h2>
            <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{manual.conclusion}</div>
          </div>
        )}

        {/* Annexes */}
        {manual.appendices?.map((appendix, i) => (
          <div key={appendix.id}>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Annexe {i + 1} — {appendix.title}</h2>
            <div className="text-sm text-gray-700 whitespace-pre-line">{appendix.content}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
