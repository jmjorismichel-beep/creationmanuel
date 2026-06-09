// manualUtils.js — fonctions utilitaires pour manipuler les manuels

/**
 * Compte le nombre de mots dans un texte
 */
export function countWords(text = '') {
  return text.trim().split(/\s+/).filter(Boolean).length
}

/**
 * Calcule le nombre total de mots dans un manuel
 */
export function countManualWords(manual) {
  if (!manual) return 0
  let total = 0
  const add = (str) => { total += countWords(str || '') }

  add(manual.introduction)
  add(manual.prerequisites)
  add(manual.conclusion)

  manual.chapters?.forEach(ch => {
    add(ch.title)
    add(ch.introduction)
    add(ch.summary)
    ch.sections?.forEach(s => add(s.content))
    ch.exercises?.forEach(e => add(typeof e === 'string' ? e : e.question))
    ch.corrections?.forEach(c => add(typeof c === 'string' ? c : c.answer))
  })

  manual.appendices?.forEach(a => add(typeof a === 'string' ? a : a.content))
  add(manual.finalProject)

  return total
}

/**
 * Estime le nombre de pages à partir du nombre de mots
 * Base : ~400 mots/page A4
 */
export function estimatePages(wordCount) {
  return Math.ceil(wordCount / 400)
}

/**
 * Formate la durée estimée de lecture
 */
export function estimateReadTime(wordCount) {
  const minutes = Math.ceil(wordCount / 200) // 200 mots/min
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const rem   = minutes % 60
  return rem > 0 ? `${hours}h${rem}` : `${hours}h`
}

/**
 * Génère un titre court de version à partir d'un type de modification
 */
export function buildVersionLabel(modificationType, target = '') {
  const labels = {
    'edit':       `Modification${target ? ` — ${target}` : ''}`,
    'ai':         `Modification IA${target ? ` — ${target}` : ''}`,
    'add':        `Ajout${target ? ` — ${target}` : ''}`,
    'delete':     `Suppression${target ? ` — ${target}` : ''}`,
    'restore':    'Restauration de version',
    'initial':    'Génération initiale',
    'import':     'Import',
    'save':       'Sauvegarde manuelle',
  }
  return labels[modificationType] || `Modification${target ? ` — ${target}` : ''}`
}

/**
 * Fusionne deux manuels — utile pour appliquer une révision IA
 * à une partie précise sans écraser le reste
 */
export function applyRevisionToManual(manual, scope, data) {
  if (scope === 'introduction') {
    return { ...manual, introduction: data }
  }
  if (scope === 'conclusion') {
    return { ...manual, conclusion: data }
  }
  if (scope === 'chapter' && data?.chapterId) {
    return {
      ...manual,
      chapters: manual.chapters.map(ch =>
        ch.id === data.chapterId
          ? { ...ch, introduction: data.text }
          : ch
      ),
    }
  }
  if (scope === 'manual') {
    // On remplace l'introduction du manuel par le texte révisé
    return { ...manual, introduction: data }
  }
  return manual
}

/**
 * Cherche des incohérences basiques dans le manuel
 * Retourne un tableau d'alertes
 */
export function checkManualConsistency(manual) {
  const alerts = []
  if (!manual) return alerts

  if (!manual.title || manual.title.trim().length < 3) {
    alerts.push({ type: 'error', message: 'Le titre du manuel est manquant ou trop court.' })
  }
  if (!manual.introduction || manual.introduction.trim().length < 50) {
    alerts.push({ type: 'warning', message: 'L\'introduction est absente ou trop courte.' })
  }
  if (!manual.chapters || manual.chapters.length === 0) {
    alerts.push({ type: 'error', message: 'Le manuel ne contient aucun chapitre.' })
  }

  manual.chapters?.forEach((ch, i) => {
    if (!ch.title || ch.title.trim().length < 2) {
      alerts.push({ type: 'warning', message: `Le chapitre ${i + 1} n'a pas de titre.` })
    }
    if (!ch.sections || ch.sections.length === 0) {
      alerts.push({ type: 'info', message: `Le chapitre "${ch.title}" ne contient aucune section.` })
    }
  })

  const words = countManualWords(manual)
  if (words < 200) {
    alerts.push({ type: 'warning', message: 'Le contenu du manuel semble très court (moins de 200 mots).' })
  }

  if (alerts.length === 0) {
    alerts.push({ type: 'success', message: 'Aucune incohérence majeure détectée.' })
  }

  return alerts
}

/**
 * Extrait le texte brut d'un chapitre pour la révision IA
 */
export function chapterToText(chapter) {
  if (!chapter) return ''
  const parts = [
    `# ${chapter.title}`,
    chapter.introduction,
    ...(chapter.sections?.map(s => `## ${s.title}\n${s.content}`) || []),
    chapter.exercises?.length ? `\n### Exercices\n${chapter.exercises.map(e =>
      typeof e === 'string' ? e : `${e.question}`).join('\n')}` : '',
    chapter.corrections?.length ? `\n### Corrections\n${chapter.corrections.map(c =>
      typeof c === 'string' ? c : `${c.answer}`).join('\n')}` : '',
    chapter.summary ? `\n### Résumé\n${chapter.summary}` : '',
  ]
  return parts.filter(Boolean).join('\n\n')
}

/**
 * Duplique un manuel avec un nouvel identifiant
 */
export function duplicateManual(manual) {
  return {
    ...manual,
    manualId:  crypto.randomUUID(),
    title:     `${manual.title} (copie)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

/**
 * Tronque un texte à n caractères
 */
export function truncate(str = '', n = 100) {
  if (str.length <= n) return str
  return str.slice(0, n).trimEnd() + '…'
}
