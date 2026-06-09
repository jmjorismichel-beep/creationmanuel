// offlineQueue.js — Gestion de la file d'attente hors ligne
import { addToOfflineQueue, getPendingQueue } from './db.js'

/**
 * Ajoute une demande IA à la file d'attente
 */
export async function queueRevision({ manualId, scope, chapterId, instruction, revisionType }) {
  return addToOfflineQueue({
    type:        'revision',
    manualId,
    scope,
    chapterId,
    instruction,
    revisionType,
    createdAt:   new Date().toISOString(),
  })
}

/**
 * Ajoute une génération à la file d'attente
 */
export async function queueGeneration({ manualId, chapterIndex, chapterTitle }) {
  return addToOfflineQueue({
    type:         'generate',
    manualId,
    chapterIndex,
    instruction:  `Générer : ${chapterTitle}`,
    createdAt:    new Date().toISOString(),
  })
}

/**
 * Récupère toutes les demandes en attente
 */
export async function getAllPending() {
  return getPendingQueue()
}

/**
 * Retourne le nombre de demandes en attente
 */
export async function getPendingCount() {
  try {
    const queue = await getPendingQueue()
    return queue.length
  } catch {
    return 0
  }
}
