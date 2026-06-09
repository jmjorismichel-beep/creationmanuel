// manualVersions.js — Gestion des versions du manuel
import { saveVersion, getVersions } from './db.js'

/**
 * Crée une snapshot de version et la sauvegarde
 */
export async function createVersion(manual, description = 'Sauvegarde manuelle') {
  if (!manual?.manualId) return null
  return saveVersion(manual.manualId, description, manual)
}

/**
 * Récupère l'historique des versions d'un manuel
 */
export async function getManualVersions(manualId) {
  if (!manualId) return []
  const versions = await getVersions(manualId)
  return versions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

/**
 * Compare deux versions — retourne un résumé des différences
 */
export function compareVersions(versionA, versionB) {
  if (!versionA?.data || !versionB?.data) return null

  const a = versionA.data
  const b = versionB.data

  const changes = []

  if (a.title !== b.title) {
    changes.push({ field: 'Titre', from: a.title, to: b.title })
  }
  if (a.introduction !== b.introduction) {
    changes.push({ field: 'Introduction', from: truncate(a.introduction), to: truncate(b.introduction) })
  }
  if (a.conclusion !== b.conclusion) {
    changes.push({ field: 'Conclusion', from: truncate(a.conclusion), to: truncate(b.conclusion) })
  }

  const chA = a.chapters || []
  const chB = b.chapters || []

  if (chA.length !== chB.length) {
    changes.push({ field: 'Nombre de chapitres', from: chA.length, to: chB.length })
  }

  chB.forEach((ch, i) => {
    const original = chA.find(c => c.id === ch.id)
    if (!original) {
      changes.push({ field: `Chapitre ${i + 1}`, from: '(nouveau)', to: ch.title })
      return
    }
    if (original.title !== ch.title) {
      changes.push({ field: `Chapitre ${i + 1} — titre`, from: original.title, to: ch.title })
    }
    if ((original.sections?.length || 0) !== (ch.sections?.length || 0)) {
      changes.push({
        field: `Chapitre ${i + 1} — sections`,
        from: original.sections?.length || 0,
        to: ch.sections?.length || 0,
      })
    }
  })

  return {
    changesCount: changes.length,
    changes,
    summary: changes.length === 0
      ? 'Aucune différence détectée'
      : `${changes.length} modification(s) détectée(s)`,
  }
}

function truncate(str = '', n = 60) {
  if (!str) return '(vide)'
  const s = String(str)
  return s.length > n ? s.slice(0, n) + '…' : s
}

/**
 * Détermine automatiquement le type de modification
 * en comparant l'état actuel à la dernière version
 */
export function detectChangeType(previous, current) {
  if (!previous) return 'Génération initiale'

  const chapPrev = previous.chapters?.length || 0
  const chapCurr = current.chapters?.length  || 0

  if (chapCurr > chapPrev) return 'Ajout de chapitre(s)'
  if (chapCurr < chapPrev) return 'Suppression de chapitre(s)'
  if (previous.title !== current.title) return 'Modification du titre'
  if (previous.introduction !== current.introduction) return 'Modification de l\'introduction'
  if (previous.conclusion !== current.conclusion) return 'Modification de la conclusion'

  return 'Modification du contenu'
}
