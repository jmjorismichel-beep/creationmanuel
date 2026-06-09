/**
 * exportMarkdown.js — Export d'un manuel en fichier Markdown
 * Fonctionne entièrement hors ligne.
 */

export function manualToMarkdown(manual) {
  const lines = []

  // Page de garde
  if (manual.coverPage?.title) {
    lines.push(`# ${manual.coverPage.title}`)
    if (manual.coverPage.subtitle) lines.push(`\n*${manual.coverPage.subtitle}*`)
    if (manual.coverPage.author) lines.push(`\n**Auteur :** ${manual.coverPage.author}`)
    if (manual.coverPage.organization) lines.push(`**Organisation :** ${manual.coverPage.organization}`)
    if (manual.coverPage.date) lines.push(`**Date :** ${manual.coverPage.date}`)
    lines.push('\n---\n')
  } else {
    lines.push(`# ${manual.title || 'Manuel sans titre'}`)
    if (manual.subtitle) lines.push(`\n*${manual.subtitle}*\n`)
    lines.push('\n---\n')
  }

  // Sommaire
  if (manual.tableOfContents?.length) {
    lines.push('## Sommaire\n')
    manual.tableOfContents.forEach(item => {
      const indent = item.level === 2 ? '  ' : ''
      lines.push(`${indent}- ${item.title} .................. p. ${item.page}`)
    })
    lines.push('\n---\n')
  }

  // Introduction
  if (manual.introduction) {
    lines.push('## Introduction\n')
    lines.push(manual.introduction)
    lines.push('\n')
  }

  // Prérequis
  if (manual.prerequisites) {
    lines.push('## Prérequis\n')
    lines.push(manual.prerequisites)
    lines.push('\n')
  }

  // Chapitres
  manual.chapters?.forEach((chapter, chIdx) => {
    lines.push(`## Chapitre ${chapter.order} — ${chapter.title}\n`)

    if (chapter.introduction) {
      lines.push(chapter.introduction)
      lines.push('\n')
    }

    // Sections
    chapter.sections?.forEach((section, sIdx) => {
      lines.push(`### ${section.title}\n`)
      lines.push(section.content || '')
      lines.push('\n')
    })

    // Tableaux de rappel
    chapter.reminderTables?.forEach(table => {
      lines.push(`### 📋 ${table.title}\n`)
      if (table.headers?.length) {
        lines.push('| ' + table.headers.join(' | ') + ' |')
        lines.push('| ' + table.headers.map(() => '---').join(' | ') + ' |')
        table.rows?.forEach(row => {
          lines.push('| ' + row.join(' | ') + ' |')
        })
      }
      lines.push('\n')
    })

    // Exercices
    if (chapter.exercises?.length) {
      lines.push('### ✏️ Exercices\n')
      chapter.exercises.forEach((ex, eIdx) => {
        lines.push(`#### ${ex.title}\n`)
        if (ex.instructions) lines.push(`*${ex.instructions}*\n`)
        lines.push(ex.content || '')
        lines.push('\n')
      })
    }

    // Corrections
    if (chapter.corrections?.length) {
      lines.push('### ✅ Corrections\n')
      chapter.corrections.forEach(corr => {
        lines.push(`#### ${corr.title}\n`)
        lines.push(corr.content || '')
        lines.push('\n')
      })
    }

    // Résumé
    if (chapter.summary) {
      lines.push('### 📝 Résumé du chapitre\n')
      lines.push(chapter.summary)
      lines.push('\n')
    }

    lines.push('\n---\n')
  })

  // Projet final
  if (manual.finalProject) {
    lines.push('## 🎯 Projet final\n')
    lines.push(`### ${manual.finalProject.title}\n`)
    lines.push(manual.finalProject.description || '')
    lines.push('\n')
    lines.push(manual.finalProject.instructions || '')
    if (manual.finalProject.evaluationCriteria?.length) {
      lines.push('\n**Critères d\'évaluation :**\n')
      manual.finalProject.evaluationCriteria.forEach(c => lines.push(`- ${c}`))
    }
    lines.push('\n---\n')
  }

  // Conclusion
  if (manual.conclusion) {
    lines.push('## Conclusion\n')
    lines.push(manual.conclusion)
    lines.push('\n---\n')
  }

  // Annexes
  manual.appendices?.forEach((appendix, aIdx) => {
    lines.push(`## Annexe ${aIdx + 1} — ${appendix.title}\n`)
    lines.push(appendix.content || '')
    lines.push('\n')
  })

  return lines.join('\n')
}

export function downloadMarkdown(manual) {
  const content = manualToMarkdown(manual)
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${sanitizeFilename(manual.title || 'manuel')}.md`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9-_àâçéèêëîïôûùüÿæœÀÂÇÉÈÊËÎÏÔÛÙÜŸÆŒ ]/g, '').replace(/\s+/g, '-').toLowerCase()
}
