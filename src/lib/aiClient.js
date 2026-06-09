// aiClient.js — Client pour les appels IA via Netlify Functions
// La clé API n'est JAMAIS dans ce fichier. Elle est stockée dans les variables
// d'environnement Netlify et n'est utilisée que dans les Netlify Functions.

const BASE = '/.netlify/functions'

/**
 * Appel générique vers une Netlify Function
 */
async function callFunction(name, payload) {
  const res = await fetch(`${BASE}/${name}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `Erreur ${res.status}` }))
    throw new Error(err.error || `Erreur serveur ${res.status}`)
  }

  return res.json()
}

/**
 * Génère un plan pédagogique structuré
 */
export async function generatePlan(params) {
  return callFunction('generate-plan', params)
}

/**
 * Génère un chapitre complet
 */
export async function generateChapter(params) {
  return callFunction('generate-chapter', params)
}

/**
 * Révise ou modifie un passage du manuel
 */
export async function reviseManual(params) {
  return callFunction('revise-manual', params)
}

/**
 * Vérifie la cohérence du manuel
 */
export async function checkManual(params) {
  return callFunction('check-manual', params)
}

/**
 * Vérifie si le serveur IA est disponible
 * Retourne true si une clé API est configurée côté serveur
 */
export async function checkAIAvailability() {
  try {
    const res = await fetch(`${BASE}/check-manual`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ping: true }),
    })
    return res.ok
  } catch {
    return false
  }
}

/**
 * Génère tous les chapitres d'un manuel en séquence
 * Avec progression (callback onProgress)
 */
export async function generateAllChapters({ plan, manualConfig, onProgress, onChapterDone }) {
  const chapters = []

  for (let i = 0; i < plan.chapters.length; i++) {
    const chapterPlan = plan.chapters[i]
    onProgress?.({
      step:    i + 1,
      total:   plan.chapters.length,
      message: `Génération du chapitre ${i + 1} : ${chapterPlan.title}`,
    })

    try {
      const result = await generateChapter({
        chapterTitle:     chapterPlan.title,
        chapterOrder:     chapterPlan.order || i + 1,
        manualTitle:      manualConfig.title,
        audience:         manualConfig.targetAudience,
        level:            manualConfig.level,
        tone:             manualConfig.tone,
        previousChapters: chapters,
      })

      const chapter = {
        id:           crypto.randomUUID(),
        order:        i + 1,
        ...result.chapter,
      }
      chapters.push(chapter)
      onChapterDone?.(chapter, i)
    } catch (err) {
      console.error(`Erreur chapitre ${i + 1}:`, err)
      // En cas d'erreur, on continue avec un chapitre vide
      chapters.push({
        id:           crypto.randomUUID(),
        order:        i + 1,
        title:        chapterPlan.title,
        introduction: '(Erreur lors de la génération — à compléter)',
        sections:     [],
        exercises:    [],
        corrections:  [],
        summary:      '',
      })
    }
  }

  return chapters
}
